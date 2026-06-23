import {
  ALL_DAYS_ROSTER,
  COPIED_TO_605,
  EVENT_LOCATION,
  EVENT_SHEETS,
  MOVED_TO_EXHIBITION,
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
      corrected.signature.length + new Date(corrected.createdAt).getTime() / 1e15;

    if (currentScore > existingScore) {
      map.set(key, corrected);
    }
  }

  return Array.from(map.values());
}

function findRecordByName(
  pool: CheckInRecord[],
  name: string,
): CheckInRecord | undefined {
  const target = normalizeName(name);
  return pool.find((r) => normalizeName(r.name) === target);
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

function buildAllDaysRecords(pool: CheckInRecord[]): CheckInRecord[] {
  const result: CheckInRecord[] = [];

  for (const group of ALL_DAYS_ROSTER) {
    for (const name of group.names) {
      const found = findRecordByName(pool, name);
      if (found) result.push(found);
    }
  }

  return result;
}

function getMovedNames(): Set<string> {
  const names = new Set<string>();
  for (const dayNames of Object.values(MOVED_TO_EXHIBITION)) {
    for (const name of dayNames) {
      names.add(normalizeName(name));
    }
  }
  return names;
}

function buildOpeningSheet(
  pool: CheckInRecord[],
  movedNames: Set<string>,
): CheckInRecord[] {
  return pool.filter((r) => !movedNames.has(normalizeName(r.name)));
}

function buildExhibitionSheet(
  pool: CheckInRecord[],
  dateKey: Exclude<EventDateKey, "2026-06-02">,
): CheckInRecord[] {
  const records: CheckInRecord[] = [];

  for (const rec of buildAllDaysRecords(pool)) {
    records.push(cloneForDate(rec, dateKey));
  }

  for (const name of MOVED_TO_EXHIBITION[dateKey]) {
    const found = findRecordByName(pool, name);
    if (found) records.push(cloneForDate(found, dateKey));
  }

  if (dateKey === "2026-06-05") {
    for (const name of COPIED_TO_605) {
      const found = findRecordByName(pool, name);
      if (found && !records.some((r) => normalizeName(r.name) === normalizeName(name))) {
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
  const movedNames = getMovedNames();

  const sheets: ExportSheet[] = EVENT_SHEETS.map((config) => {
    let records: CheckInRecord[];

    if (config.key === "2026-06-02") {
      records = buildOpeningSheet(pool, movedNames);
    } else {
      records = buildExhibitionSheet(pool, config.key);
    }

    records = sortSheetRecords(records, config.key);

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

/** 新簽到是否應寫入四天名單 */
export function shouldPropagateToAllDays(name: string): boolean {
  return ALL_DAYS_ROSTER.flatMap((g) => g.names).some(
    (n) => normalizeName(n) === normalizeName(name),
  );
}
