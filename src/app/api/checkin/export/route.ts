import { NextResponse } from "next/server";
import { sortCheckIns } from "@/lib/sort-checkins";
import { getAllCheckIns } from "@/lib/storage";

export async function GET() {
  try {
    const records = await getAllCheckIns();
    const sorted = sortCheckIns(records);

    return NextResponse.json({ records: sorted, total: sorted.length });
  } catch (error) {
    console.error("Export fetch failed:", error);
    return NextResponse.json({ error: "無法取得簽到資料" }, { status: 500 });
  }
}
