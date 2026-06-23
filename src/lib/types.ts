import type { OrganizationOption } from "./constants";
import type { EventDateKey } from "./constants";

export interface CheckInRecord {
  id: string;
  organization: OrganizationOption | string;
  otherOrganization?: string;
  /** 展期多日簽到時標記日期；原始紀錄無此欄位視為 6/2 */
  eventDate?: EventDateKey;
  name: string;
  title: string;
  signature: string;
  createdAt: string;
}

export interface CheckInPayload {
  organization: OrganizationOption;
  otherOrganization?: string;
  name: string;
  title: string;
  signature: string;
}

export interface ExportSheet {
  key: EventDateKey;
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  records: CheckInRecord[];
}

export interface ExportResult {
  sheets: ExportSheet[];
  totalRaw: number;
}
