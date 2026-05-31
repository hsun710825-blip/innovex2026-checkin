"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { EVENT_INFO, PDF_FILENAME } from "@/lib/constants";
import { getDisplayOrganization } from "@/lib/sort-checkins";
import type { CheckInRecord } from "@/lib/types";

function PdfTable({ records }: { records: CheckInRecord[] }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px",
        marginTop: "16px",
      }}
    >
      <thead>
        <tr>
          {["單位", "姓名", "職稱", "簽名"].map((header) => (
            <th
              key={header}
              style={{
                border: "1px solid #333",
                padding: "8px 6px",
                backgroundColor: "#e0f2fe",
                textAlign: "left",
                fontWeight: 600,
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td
              style={{
                border: "1px solid #333",
                padding: "8px 6px",
                verticalAlign: "middle",
                maxWidth: "140px",
              }}
            >
              {getDisplayOrganization(record)}
            </td>
            <td
              style={{
                border: "1px solid #333",
                padding: "8px 6px",
                verticalAlign: "middle",
              }}
            >
              {record.name}
            </td>
            <td
              style={{
                border: "1px solid #333",
                padding: "8px 6px",
                verticalAlign: "middle",
              }}
            >
              {record.title}
            </td>
            <td
              style={{
                border: "1px solid #333",
                padding: "4px",
                verticalAlign: "middle",
                textAlign: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.signature}
                alt={`${record.name} 簽名`}
                style={{
                  maxHeight: "48px",
                  maxWidth: "120px",
                  objectFit: "contain",
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminPage() {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setError("");
    setStatus("正在載入簽到資料…");

    try {
      const response = await fetch("/api/checkin/export");
      const data = (await response.json()) as {
        records?: CheckInRecord[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "無法取得簽到資料");
      }

      const fetchedRecords = data.records ?? [];
      flushSync(() => {
        setRecords(fetchedRecords);
      });
      setStatus(`共 ${fetchedRecords.length} 筆資料，正在產生 PDF…`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const element = pdfRef.current;
      if (!element) {
        throw new Error("PDF 渲染區域未就緒");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(PDF_FILENAME);
      setStatus(`已匯出 ${fetchedRecords.length} 筆簽到紀錄`);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "PDF 匯出失敗",
      );
      setStatus("");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-ocean-950 to-slate-900 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-white">後台管理</h1>
          <p className="mt-2 text-sm text-ocean-300/70">
            InnoVex2026 基隆主題館開幕儀式簽到表
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="btn-primary w-full py-4 text-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? "匯出中…" : "匯出簽到表 PDF"}
        </button>

        {status && (
          <p className="text-sm text-teal-300">{status}</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      {/* Hidden A4 PDF render area */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "794px",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: "var(--font-noto-sans-tc), 'Noto Sans TC', sans-serif",
        }}
      >
        <div ref={pdfRef} style={{ padding: "40px 36px" }}>
          <h1
            style={{
              textAlign: "center",
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "24px",
              letterSpacing: "0.05em",
            }}
          >
            {EVENT_INFO.title}
          </h1>

          <div style={{ fontSize: "14px", lineHeight: 1.8, marginBottom: "8px" }}>
            <p>日期：{EVENT_INFO.date}</p>
            <p>時間：{EVENT_INFO.time}</p>
            <p>地點：{EVENT_INFO.location}</p>
          </div>

          <PdfTable records={records} />
        </div>
      </div>
    </main>
  );
}
