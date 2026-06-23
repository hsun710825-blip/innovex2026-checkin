"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { PDF_FILENAME } from "@/lib/constants";
import { getDisplayOrganization } from "@/lib/sort-checkins";
import type { CheckInRecord, ExportSheet } from "@/lib/types";

const ROWS_PER_PAGE = 16;
const PDF_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

/** 中文標楷體、英文 Times New Roman */
const PDF_FONT_FAMILY =
  '"Times New Roman", "DFKai-SB", "BiauKai", "標楷體", "KaiTi", serif';

const PDF_STYLES = {
  title: {
    textAlign: "center" as const,
    fontSize: "20pt",
    fontWeight: 700,
    marginBottom: "16px",
    lineHeight: 1,
  },
  subtitle: {
    fontSize: "16pt",
    lineHeight: 1,
    marginBottom: "12px",
  },
  subtitleLine: {
    margin: 0,
    lineHeight: 1,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "14pt",
    tableLayout: "fixed" as const,
    lineHeight: 1,
  },
  cell: {
    border: "1px solid #333",
    padding: "6px 4px",
    verticalAlign: "middle" as const,
    textAlign: "center" as const,
    lineHeight: 1,
  },
  headerCell: {
    border: "1px solid #333",
    padding: "6px 4px",
    backgroundColor: "#e0f2fe",
    textAlign: "center" as const,
    fontWeight: 600,
    fontSize: "14pt",
    lineHeight: 1,
  },
  signatureCell: {
    border: "1px solid #333",
    padding: "4px",
    verticalAlign: "middle" as const,
    textAlign: "center" as const,
    height: "52px",
    lineHeight: 1,
  },
};

function PdfTable({
  records,
  showHeader,
}: {
  records: CheckInRecord[];
  showHeader: boolean;
}) {
  return (
    <table style={PDF_STYLES.table}>
      {showHeader && (
        <thead>
          <tr>
            {["單位", "姓名", "職稱", "簽名"].map((header) => (
              <th key={header} style={PDF_STYLES.headerCell}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td style={{ ...PDF_STYLES.cell, wordBreak: "break-word" }}>
              {getDisplayOrganization(record)}
            </td>
            <td style={PDF_STYLES.cell}>{record.name}</td>
            <td style={PDF_STYLES.cell}>{record.title}</td>
            <td style={PDF_STYLES.signatureCell}>
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

function chunkRecords<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks.length > 0 ? chunks : [[]];
}

interface PageRenderProps {
  sheet: ExportSheet;
  rows: CheckInRecord[];
  pageIndex: number;
  isFirstPageOfSheet: boolean;
}

function PdfPageContent({
  sheet,
  rows,
  pageIndex,
  isFirstPageOfSheet,
}: PageRenderProps) {
  return (
    <div
      style={{
        padding: "40px 36px",
        backgroundColor: "#ffffff",
        fontFamily: PDF_FONT_FAMILY,
        lineHeight: 1,
      }}
    >
      {isFirstPageOfSheet && (
        <>
          <h1 style={PDF_STYLES.title}>{sheet.title}</h1>
          <div style={PDF_STYLES.subtitle}>
            <p style={PDF_STYLES.subtitleLine}>日期：{sheet.dateLabel}</p>
            <p style={PDF_STYLES.subtitleLine}>時間：{sheet.timeLabel}</p>
            <p style={PDF_STYLES.subtitleLine}>地點：{sheet.location}</p>
          </div>
        </>
      )}
      {!isFirstPageOfSheet && (
        <p
          style={{
            fontSize: "14pt",
            color: "#666",
            marginBottom: "12px",
            textAlign: "right",
            lineHeight: 1,
          }}
        >
          {sheet.dateLabel}（續第 {pageIndex + 1} 頁）
        </p>
      )}
      <PdfTable records={rows} showHeader />
    </div>
  );
}

export default function AdminPage() {
  const renderRootRef = useRef<HTMLDivElement>(null);
  const [sheets, setSheets] = useState<ExportSheet[]>([]);
  const [renderQueue, setRenderQueue] = useState<PageRenderProps[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const buildPageQueue = (exportSheets: ExportSheet[]): PageRenderProps[] => {
    const queue: PageRenderProps[] = [];

    for (const sheet of exportSheets) {
      const chunks = chunkRecords(sheet.records, ROWS_PER_PAGE);
      chunks.forEach((rows, pageIndex) => {
        queue.push({
          sheet,
          rows,
          pageIndex,
          isFirstPageOfSheet: pageIndex === 0,
        });
      });
    }

    return queue;
  };

  const renderPageToPdf = async (
    pdf: jsPDF,
    props: PageRenderProps,
    isFirstPdfPage: boolean,
  ) => {
    const root = renderRootRef.current;
    if (!root) throw new Error("PDF 渲染區域未就緒");

    flushSync(() => {
      setRenderQueue([props]);
    });

    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pageEl = root.firstElementChild as HTMLElement | null;
    if (!pageEl) throw new Error("頁面渲染失敗");

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgHeight = (canvas.height * PDF_WIDTH_MM) / canvas.width;

    if (!isFirstPdfPage) pdf.addPage();

    if (imgHeight <= PAGE_HEIGHT_MM) {
      pdf.addImage(imgData, "PNG", 0, 0, PDF_WIDTH_MM, imgHeight);
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, PDF_WIDTH_MM, PAGE_HEIGHT_MM);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError("");
    setStatus("正在載入簽到資料…");

    try {
      const response = await fetch("/api/checkin/export");
      const data = (await response.json()) as {
        sheets?: ExportSheet[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "無法取得簽到資料");
      }

      const exportSheets = data.sheets ?? [];
      const totalRecords = exportSheets.reduce(
        (sum, s) => sum + s.records.length,
        0,
      );

      flushSync(() => {
        setSheets(exportSheets);
      });

      const queue = buildPageQueue(exportSheets);
      setStatus(
        `共 ${exportSheets.length} 份簽到表、${totalRecords} 筆紀錄，正在產生 PDF…`,
      );

      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < queue.length; i++) {
        setStatus(`正在產生 PDF…（${i + 1}/${queue.length} 頁）`);
        await renderPageToPdf(pdf, queue[i], i === 0);
      }

      pdf.save(PDF_FILENAME);
      setStatus(
        `已匯出 ${exportSheets.length} 份簽到表，共 ${totalRecords} 筆紀錄`,
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "PDF 匯出失敗",
      );
      setStatus("");
    } finally {
      setIsExporting(false);
      setRenderQueue([]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-ocean-950 to-slate-900 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-white">後台管理</h1>
          <p className="mt-2 text-sm text-ocean-300/70">
            InnoVex2026 基隆主題館簽到表（6/2～6/5）
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

        {status && <p className="text-sm text-teal-300">{status}</p>}

        {error && (
          <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {sheets.length > 0 && !isExporting && (
          <div className="text-left text-xs text-ocean-300/60">
            {sheets.map((s) => (
              <p key={s.key}>
                {s.dateLabel}：{s.records.length} 筆
              </p>
            ))}
          </div>
        )}
      </div>

      <div
        aria-hidden
        ref={renderRootRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "794px",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: PDF_FONT_FAMILY,
          lineHeight: 1,
        }}
      >
        {renderQueue.map((props) => (
          <PdfPageContent
            key={`${props.sheet.key}-${props.pageIndex}`}
            {...props}
          />
        ))}
      </div>
    </main>
  );
}
