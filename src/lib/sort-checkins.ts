import { VENDOR_ORGANIZATIONS } from "./constants";
import type { CheckInRecord } from "./types";

export function getDisplayOrganization(record: CheckInRecord): string {
  if (record.organization === "其他") {
    return record.otherOrganization?.trim() || "其他";
  }
  return record.organization;
}

type SortKey = [tier: number, subOrder: number, tieBreaker: string];

function getSortKey(record: CheckInRecord): SortKey {
  const org = record.organization;
  const displayOrg = getDisplayOrganization(record);

  if (org === "基隆市政府產業發展處") {
    return [0, 0, record.name];
  }

  const vendorIndex = VENDOR_ORGANIZATIONS.indexOf(org);
  if (vendorIndex >= 0) {
    return [1, vendorIndex, record.name];
  }

  if (org === "嘉澄股份有限公司") {
    return [2, 0, record.name];
  }

  return [3, 0, displayOrg];
}

function compareSortKeys(a: SortKey, b: SortKey): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2].localeCompare(b[2], "zh-TW");
}

export function sortCheckIns(records: CheckInRecord[]): CheckInRecord[] {
  return [...records].sort((a, b) =>
    compareSortKeys(getSortKey(a), getSortKey(b)),
  );
}
