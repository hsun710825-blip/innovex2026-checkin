export const ORGANIZATION_OPTIONS = [
  "基隆市政府產業發展處",
  "茁思科技",
  "台續",
  "萌老大(森田生技)",
  "和平島地質公園",
  "佳音醫療器材",
  "杭特電子",
  "智慧光科技",
  "順易利實業",
  "蔡技企業",
  "嘉澄股份有限公司",
  "其他",
] as const;

export type OrganizationOption = (typeof ORGANIZATION_OPTIONS)[number];

/** 第二順位：9 家廠商（固定順序） */
export const VENDOR_ORGANIZATIONS: OrganizationOption[] = [
  "茁思科技",
  "台續",
  "萌老大(森田生技)",
  "和平島地質公園",
  "佳音醫療器材",
  "杭特電子",
  "智慧光科技",
  "順易利實業",
  "蔡技企業",
];

export const KV_CHECKINS_KEY = "innovex2026:checkins";

export const PDF_FILENAME = "InnoVex2026基隆主題館開幕儀式簽到表.pdf";

export const EVENT_INFO = {
  title: "InnoVex2026基隆主題館開幕儀式簽到",
  date: "115年6月2日",
  time: "上午10:20-14:30",
  location: "南港展覽館二館4樓",
} as const;
