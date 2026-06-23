import {
  EVENT_SHEETS,
  normalizeName,
  OPENING_GOVERNMENT_ORDER,
  OPENING_MEDIA_CREW_ORDER,
  ORGANIZATION_SORT_ORDER,
  RECORD_OVERRIDES,
  type EventDateKey,
} from "./constants";
import type { CheckInRecord } from "./types";

export function getDisplayOrganization(record: CheckInRecord): string {
  const override = RECORD_OVERRIDES[normalizeName(record.name)];
  if (override?.organization) return override.organization;

  if (record.organization === "其他") {
    return record.otherOrganization?.trim() || "其他";
  }
  return String(record.organization);
}

function getOrgSortIndex(displayOrg: string): number {
  const idx = ORGANIZATION_SORT_ORDER.indexOf(displayOrg);
  if (idx >= 0) return idx;
  if (displayOrg === "基隆市政府" || displayOrg === "基隆市政府產業發展處") {
    return -1;
  }
  return ORGANIZATION_SORT_ORDER.length;
}

type SortKey = [
  govRank: number,
  orgIndex: number,
  mediaGroup: number,
  nameOrder: number,
  name: string,
];

function getSortKey(record: CheckInRecord, dateKey: EventDateKey): SortKey {
  const displayOrg = getDisplayOrganization(record);
  const normalized = normalizeName(record.name);

  let govRank = 99;
  const sheet = EVENT_SHEETS.find((s) => s.key === dateKey);

  if (sheet?.pinnedFirst && normalizeName(sheet.pinnedFirst) === normalized) {
    govRank = 0;
  } else if (dateKey === "2026-06-02") {
    const idx = OPENING_GOVERNMENT_ORDER.findIndex(
      (n) => normalizeName(n) === normalized,
    );
    if (idx >= 0) govRank = idx + 1;
    else if (
      displayOrg === "基隆市政府" ||
      displayOrg === "基隆市政府產業發展處"
    ) {
      govRank = 50;
    }
  } else if (
    dateKey === "2026-06-05" &&
    normalized === normalizeName("潘祖德")
  ) {
    govRank = 0;
  } else if (
    displayOrg === "基隆市政府" ||
    displayOrg === "基隆市政府產業發展處"
  ) {
    govRank = 50;
  }

  const orgIndex = getOrgSortIndex(displayOrg);

  let mediaGroup = 1;
  let nameOrder = 0;

  if (dateKey === "2026-06-02") {
    const mediaIdx = OPENING_MEDIA_CREW_ORDER.findIndex(
      (n) => normalizeName(n) === normalized,
    );
    if (mediaIdx >= 0) {
      mediaGroup = 0;
      nameOrder = mediaIdx;
    }
  }

  if (displayOrg === "智慧光科技") {
    if (normalized === normalizeName("Stacy Lee")) nameOrder = 0;
    else if (normalized === normalizeName("袁碧蓮")) nameOrder = 1;
    else nameOrder = 2;
  }

  return [govRank, orgIndex, mediaGroup, nameOrder, normalized];
}

function compareSortKeys(a: SortKey, b: SortKey): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  if (a[2] !== b[2]) return a[2] - b[2];
  if (a[3] !== b[3]) return a[3] - b[3];
  return a[4].localeCompare(b[4], "zh-TW");
}

export function sortSheetRecords(
  records: CheckInRecord[],
  dateKey: EventDateKey,
): CheckInRecord[] {
  return [...records].sort((a, b) =>
    compareSortKeys(getSortKey(a, dateKey), getSortKey(b, dateKey)),
  );
}

export function sortCheckIns(records: CheckInRecord[]): CheckInRecord[] {
  return sortSheetRecords(records, "2026-06-02");
}
