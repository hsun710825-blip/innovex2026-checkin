"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { PDF_FILENAME } from "@/lib/constants";
import {
  getDisplayOrganization,
  isKeelungDevDeptTwoLine,
} from "@/lib/sort-checkins";
import type { CheckInRecord, ExportSheet } from "@/lib/types";

const ROWS_PER_PAGE_FIRST = 12;
const ROWS_PER_PAGE_CONT = 15;
const PDF_PAGE_WIDTH_PX = 794;
const PDF_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_HEIGHT_PX = Math.round((PDF_PAGE_WIDTH_PX * PAGE_HEIGHT_MM) / PDF_WIDTH_MM);
const PAGE_FOOTER_MM = 15;
const TABLE_ROW_HEIGHT_PX = 52;
const SIGNATURE_MAX_HEIGHT_PX = 44;
const SIGNATURE_MAX_WIDTH_PX = 110;

const PDF_FONT_FAMILY =
  '"Microsoft JhengHei", "微軟正黑體", "PingFang TC", "Heiti TC", "Noto Sans TC", sans-serif';

/** html2canvas 對 table-cell 垂直置中較穩定 */
function CenteredCell({
  children,
  height = TABLE_ROW_HEIGHT_PX,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div
      style={{
        display: "table",
        width: "100%",
        height: `${height}px`,
        tableLayout: "fixed",
      }}
    >
      <div
        style={{
          display: "table-cell",
          width: "100%",
          height: `${height}px`,
          verticalAlign: "middle",
          textAlign: "center",
          padding: "4px 6px",
          boxSizing: "border-box",
          fontSize: "15pt",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SignatureImage({ src, name }: { src: string; name: string }) {
  return (
    <div
      style={{
        display: "table",
        width: "100%",
        height: `${TABLE_ROW_HEIGHT_PX}px`,
      }}
    >
      <div
        style={{
          display: "table-cell",
          width: "100%",
          height: `${TABLE_ROW_HEIGHT_PX}px`,
          verticalAlign: "middle",
          textAlign: "center",
          padding: "3px 4px",
          boxSizing: "border-box",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${name} 簽名`}
          style={{
            display: "inline-block",
            maxHeight: `${SIGNATURE_MAX_HEIGHT_PX}px`,
            maxWidth: `${SIGNATURE_MAX_WIDTH_PX}px`,
            width: "auto",
            height: "auto",
            objectFit: "contain",
            verticalAlign: "middle",
          }}
        />
      </div>
    </div>
  );
}

const PDF_STYLES = {
  title: {
    textAlign: "center" as const,
    fontSize: "20pt",
    fontWeight: 700,
    marginBottom: "14px",
    lineHeight: 1,
    fontFamily: PDF_FONT_FAMILY,
  },
  subtitle: {
    fontSize: "16pt",
    lineHeight: 1.5,
    marginBottom: "14px",
    fontFamily: PDF_FONT_FAMILY,
  },
  subtitleLine: {
    margin: 0,
    lineHeight: 1.5,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "15pt",
    tableLayout: "fixed" as const,
    fontFamily: PDF_FONT_FAMILY,
  },
  cell: {
    border: "1px solid #333",
    padding: 0,
    verticalAlign: "middle" as const,
    textAlign: "center" as const,
    fontSize: "15pt",
    height: `${TABLE_ROW_HEIGHT_PX}px`,
  },
  headerCell: {
    border: "1px solid #333",
    padding: 0,
    backgroundColor: "#e0f2fe",
    textAlign: "center" as const,
    fontWeight: 600,
    fontSize: "15pt",
    verticalAlign: "middle" as const,
    height: "40px",
  },
  signatureCell: {
    border: "1px solid #333",
    padding: 0,
    verticalAlign: "middle" as const,
    textAlign: "center" as const,
    height: `${TABLE_ROW_HEIGHT_PX}px`,
  },
};

function OrganizationCell({ record }: { record: CheckInRecord }) {
  if (isKeelungDevDeptTwoLine(record)) {
    return (
      <>
        <span style={{ display: "block" }}>基隆市政府</span>
        <span style={{ display: "block" }}>產業發展處</span>
      </>
    );
  }
  return <>{getDisplayOrganization(record)}</>;
}

function PdfTable({
  records,
  showHeader,
}: {
  records: CheckInRecord[];
  showHeader: boolean;
}) {
  return (
    <table style={PDF_STYLES.table}>
      <colgroup>
        <col style={{ width: "28%" }} />
        <col style={{ width: "18%" }} />
        <col style={{ width: "22%" }} />
        <col style={{ width: "32%" }} />
      </colgroup>
      {showHeader && (
        <thead>
          <tr>
            {["單位", "姓名", "職稱", "簽名"].map((header) => (
              <th key={header} style={PDF_STYLES.headerCell}>
                <CenteredCell height={40}>
                  <span style={{ fontWeight: 600 }}>{header}</span>
                </CenteredCell>
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td style={PDF_STYLES.cell}>
              <CenteredCell>
                <OrganizationCell record={record} />
              </CenteredCell>
            </td>
            <td style={PDF_STYLES.cell}>
              <CenteredCell>{record.name}</CenteredCell>
            </td>
            <td style={PDF_STYLES.cell}>
              <CenteredCell>{record.title}</CenteredCell>
            </td>
            <td style={PDF_STYLES.signatureCell}>
              <SignatureImage src={record.signature} name={record.name} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function chunkSheetRecords(records: CheckInRecord[]): CheckInRecord[][] {
  if (records.length === 0) return [[]];

  const chunks: CheckInRecord[][] = [];
  let offset = 0;
  let pageIndex = 0;

  while (offset < records.length) {
    const size = pageIndex === 0 ? ROWS_PER_PAGE_FIRST : ROWS_PER_PAGE_CONT;
    chunks.push(records.slice(offset, offset + size));
    offset += size;
    pageIndex += 1;
  }

  return chunks;
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
        width: `${PDF_PAGE_WIDTH_PX}px`,
        height: `${PAGE_HEIGHT_PX}px`,
        padding: "36px 32px",
        paddingBottom: `${PAGE_FOOTER_MM}mm`,
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        fontFamily: PDF_FONT_FAMILY,
        lineHeight: 1,
        overflow: "hidden",
      }}
    >
      {isFirstPageOfSheet && (
        <>
          <h1 style={PDF_STYLES.title}>{sheet.title}</h1>
          <div style={PDF_STYLES.subtitle}>
            <p style={PDF_STYLES.subtitleLine}>
              一、日期：{sheet.dateLabel}
            </p>
            <p style={PDF_STYLES.subtitleLine}>
              二、時間：{sheet.timeLabel}
            </p>
            <p style={PDF_STYLES.subtitleLine}>
              三、地點：{sheet.location}
            </p>
            <p style={PDF_STYLES.subtitleLine}>四、簽到</p>
          </div>
        </>
      )}
      {!isFirstPageOfSheet && (
        <p
          style={{
            fontSize: "15pt",
            color: "#666",
            margin: "0 0 10px",
            textAlign: "right",
            lineHeight: 1.5,
            fontFamily: PDF_FONT_FAMILY,
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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleDownloadPdf = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = PDF_FILENAME;
    link.click();
  };

  const buildPageQueue = (exportSheets: ExportSheet[]): PageRenderProps[] => {
    const queue: PageRenderProps[] = [];

    for (const sheet of exportSheets) {
      const chunks = chunkSheetRecords(sheet.records);
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
      width: PDF_PAGE_WIDTH_PX,
      height: PAGE_HEIGHT_PX,
      windowWidth: PDF_PAGE_WIDTH_PX,
      windowHeight: PAGE_HEIGHT_PX,
    });

    const imgData = canvas.toDataURL("image/png");

    if (!isFirstPdfPage) pdf.addPage();

    pdf.addImage(imgData, "PNG", 0, 0, PDF_WIDTH_MM, PAGE_HEIGHT_MM);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError("");
    setStatus("正在載入簽到資料…");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

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

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus(
        `PDF 已產生完成（${exportSheets.length} 份簽到表、${totalRecords} 筆紀錄），請點「下載 PDF」`,
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

        {downloadUrl && !isExporting && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full rounded-xl border border-teal-400/50 bg-teal-500/20 py-3.5 text-base font-semibold text-teal-200 transition hover:bg-teal-500/30"
          >
            下載 PDF
          </button>
        )}

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
          width: `${PDF_PAGE_WIDTH_PX}px`,
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
