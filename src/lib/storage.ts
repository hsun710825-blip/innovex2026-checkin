import { kv } from "@vercel/kv";
import { KV_CHECKINS_KEY } from "./constants";
import type { CheckInRecord } from "./types";

const memoryStore: CheckInRecord[] = [];

function isKvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
}

function parseRecord(raw: unknown): CheckInRecord {
  if (typeof raw === "string") {
    return JSON.parse(raw) as CheckInRecord;
  }
  return raw as CheckInRecord;
}

export async function saveCheckIn(record: CheckInRecord): Promise<void> {
  if (isKvConfigured()) {
    await kv.lpush(KV_CHECKINS_KEY, JSON.stringify(record));
    return;
  }

  memoryStore.unshift(record);
}

export async function getAllCheckIns(): Promise<CheckInRecord[]> {
  if (isKvConfigured()) {
    const items = await kv.lrange<string>(KV_CHECKINS_KEY, 0, -1);
    return items.map(parseRecord);
  }

  return [...memoryStore];
}
