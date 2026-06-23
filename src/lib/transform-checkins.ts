import {
  COPIED_TO_605,
  EVENT_LOCATION,
  EVENT_SHEETS,
  getDaysForPerson,
  normalizeName,
  RECORD_OVERRIDES,
  type EventDateKey,
} from "./constants";
import { sortSheetRecords } from "./sort-checkins";
import type { CheckInRecord, ExportResult, ExportSheet } from "./types";

const MIN_SIGNATURE_LENGTH = 200;

function isValidSignature(signature: string): boolean {
  return Boolean(signature?.trim() && signature.length >= MIN_SIGNATURE_LENGTH);
}

function applyOverrides(record: CheckInRecord): CheckInRecord {
  const key = normalizeName(record.name);
  const override = RECORD_OVERRIDES[key] ?? RECORD_OVERRIDES[record.name.trim()];
  if (!override) return { ...record };

  const organization = override.organization ?? record.organization;
  const isOther = organization === "其他" || organization === "明新科技大學";

  return {
    ...record,
    organization,
    title: override.title ?? record.title,
    otherOrganization: override.otherOrganization ?? record.otherOrganization,
    ...(isOther && organization !== "其他"
      ? { organization: "其他", otherOrganization: organization }
      : {}),
  };
}

/** 去重：同一人保留簽名最完整、最新的一筆 */
function deduplicateRecords(records: CheckInRecord[]): CheckInRecord[] {
  const map = new Map<string, CheckInRecord>();

  for (const raw of records) {
    if (!isValidSignature(raw.signature)) continue;

    const corrected = applyOverrides(raw);
    const key = normalizeName(corrected.name);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, corrected);
      continue;
    }

    const existingScore =
      existing.signature.length + new Date(existing.createdAt).getTime() / 1e15;
    const currentScore =
      corrected.signature.length +
      new Date(corrected.createdAt).getTime() / 1e15;

    if (currentScore > existingScore) {
      map.set(key, corrected);
    }
  }

  return Array.from(map.values());
}

function cloneForDate(
  record: CheckInRecord,
  eventDate: EventDateKey,
): CheckInRecord {
  return {
    ...record,
    id: `${record.id}:${eventDate}`,
    eventDate,
  };
}

function buildSheet(pool: CheckInRecord[], dateKey: EventDateKey): CheckInRecord[] {
  const records: CheckInRecord[] = [];

  for (const person of pool) {
    const days = getDaysForPerson(person.name);
    if (!days.includes(dateKey)) continue;
    records.push(cloneForDate(person, dateKey));
  }

  if (dateKey === "2026-06-05") {
    for (const name of COPIED_TO_605) {
      const found = pool.find((r) => normalizeName(r.name) === normalizeName(name));
      if (
        found &&
        !records.some((r) => normalizeName(r.name) === normalizeName(name))
      ) {
        records.push(cloneForDate(found, dateKey));
      }
    }
  }

  return records;
}

export function transformToExportSheets(
  rawRecords: CheckInRecord[],
): ExportResult {
  const pool = deduplicateRecords(rawRecords);

  const sheets: ExportSheet[] = EVENT_SHEETS.map((config) => {
    const records = sortSheetRecords(buildSheet(pool, config.key), config.key);

    return {
      key: config.key,
      title: config.title,
      dateLabel: config.dateLabel,
      timeLabel: config.timeLabel,
      location: EVENT_LOCATION,
      records,
    };
  });

  return { sheets, totalRaw: rawRecords.length };
}
