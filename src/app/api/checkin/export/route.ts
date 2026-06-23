import { NextResponse } from "next/server";
import { getAllCheckIns } from "@/lib/storage";
import { transformToExportSheets } from "@/lib/transform-checkins";

export async function GET() {
  try {
    const raw = await getAllCheckIns();
    const result = transformToExportSheets(raw);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Export fetch failed:", error);
    return NextResponse.json({ error: "無法取得簽到資料" }, { status: 500 });
  }
}
