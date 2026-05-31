import type { OrganizationOption } from "./constants";

export interface CheckInRecord {
  id: string;
  organization: OrganizationOption;
  otherOrganization?: string;
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
