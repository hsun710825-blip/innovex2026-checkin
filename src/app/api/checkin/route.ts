import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { ORGANIZATION_OPTIONS } from "@/lib/constants";
import { saveCheckIn } from "@/lib/storage";
import type { CheckInPayload } from "@/lib/types";

function isValidOrganization(value: unknown): value is CheckInPayload["organization"] {
  return (
    typeof value === "string" &&
    ORGANIZATION_OPTIONS.includes(value as CheckInPayload["organization"])
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckInPayload>;

    if (!isValidOrganization(body.organization)) {
      return NextResponse.json({ error: "請選擇有效單位" }, { status: 400 });
    }

    const name = body.name?.trim();
    const title = body.title?.trim();
    const signature = body.signature?.trim();
    const otherOrganization = body.otherOrganization?.trim();

    if (!name) {
      return NextResponse.json({ error: "請填寫姓名" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "請填寫職稱" }, { status: 400 });
    }

    if (!signature) {
      return NextResponse.json({ error: "請完成簽名" }, { status: 400 });
    }

    if (body.organization === "其他" && !otherOrganization) {
      return NextResponse.json({ error: "請填寫其他單位名稱" }, { status: 400 });
    }

    const record = {
      id: randomUUID(),
      organization: body.organization,
      otherOrganization:
        body.organization === "其他" ? otherOrganization : undefined,
      name,
      title,
      signature,
      createdAt: new Date().toISOString(),
    };

    await saveCheckIn(record);

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error("Check-in failed:", error);
    return NextResponse.json({ error: "簽到失敗，請稍後再試" }, { status: 500 });
  }
}
