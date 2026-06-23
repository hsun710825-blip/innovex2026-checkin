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

export const KV_CHECKINS_KEY = "innovex2026:checkins";

export const PDF_FILENAME = "InnoVex2026基隆主題館簽到表.pdf";

export const EVENT_LOCATION = "南港展覽館二館4樓";

/** 單位排序（政府要員之後） */
export const ORGANIZATION_SORT_ORDER: string[] = [
  "智慧光科技",
  "杭特電子",
  "順易利實業",
  "佳音醫療器材",
  "和平島地質公園",
  "萌老大(森田生技)",
  "台續",
  "茁思科技",
  "明新科技大學",
  "嘉澄股份有限公司",
];

export type EventDateKey = "2026-06-02" | "2026-06-03" | "2026-06-04" | "2026-06-05";

export interface EventSheetConfig {
  key: EventDateKey;
  title: string;
  dateLabel: string;
  timeLabel: string;
  /** 該日第一順位人員（姓名） */
  pinnedFirst?: string;
}

export const EVENT_SHEETS: EventSheetConfig[] = [
  {
    key: "2026-06-02",
    title: "InnoVex2026基隆主題館開幕儀式簽到",
    dateLabel: "115年6月2日",
    timeLabel: "上午10:20-14:30",
  },
  {
    key: "2026-06-03",
    title: "InnoVex2026基隆主題館展期簽到",
    dateLabel: "115年6月3日",
    timeLabel: "上午9:00-下午17:00",
    pinnedFirst: "蔡馥嚀",
  },
  {
    key: "2026-06-04",
    title: "InnoVex2026基隆主題館展期簽到",
    dateLabel: "115年6月4日",
    timeLabel: "上午9:00-下午17:00",
  },
  {
    key: "2026-06-05",
    title: "InnoVex2026基隆主題館展期簽到",
    dateLabel: "115年6月5日",
    timeLabel: "上午9:00-下午15:30",
    pinnedFirst: "潘祖德",
  },
];

/** 姓名正規化（處理異體字） */
export function normalizeName(name: string): string {
  return name.trim().replace(/啓/g, "啟");
}

/** 資料覆寫：單位、職稱 */
export const RECORD_OVERRIDES: Record<
  string,
  { organization?: string; title?: string; otherOrganization?: string }
> = {
  方定安: { organization: "基隆市政府", title: "副市長" },
  袁碧蓮: { organization: "智慧光科技" },
  張軒慈: { organization: "台續" },
  鍾政偉: { organization: "明新科技大學", otherOrganization: "明新科技大學" },
};

/** 6/2 開幕：政府要員固定前三順位 */
export const OPENING_GOVERNMENT_ORDER = ["方定安", "黃毅維", "潘祖德"];

/** 四天皆需出現的人員（姓名，支援異體字比對） */
export const ALL_DAYS_ROSTER: { org: string; names: string[] }[] = [
  { org: "基隆市政府產業發展處", names: ["范秀玲", "王倫壕"] },
  { org: "茁思科技", names: ["陳巧芸", "阮紹倫"] },
  { org: "台續", names: ["吳啟弘", "施佑佳"] },
  { org: "智慧光科技", names: ["Stacy Lee", "袁碧蓮"] },
  { org: "順易利實業", names: ["江文婷", "黃柏霖"] },
  { org: "蔡技企業", names: ["張凱琳"] },
  { org: "嘉澄股份有限公司", names: ["王貞文"] },
];

/** 從 6/2 移至展期特定日期（6/2 不再顯示） */
export const MOVED_TO_EXHIBITION: Record<
  Exclude<EventDateKey, "2026-06-02">,
  string[]
> = {
  "2026-06-03": ["蔡馥嚀", "李凱笙", "郭宏達"],
  "2026-06-04": ["林慶其", "黃淑華"],
  "2026-06-05": ["何東明"],
};

/** 6/5 額外複製（6/2 仍保留） */
export const COPIED_TO_605 = ["潘祖德"];

export const ALL_DAYS_ROSTER_NAMES = ALL_DAYS_ROSTER.flatMap((g) =>
  g.names.map(normalizeName),
);

export function isAllDaysRosterName(name: string): boolean {
  return ALL_DAYS_ROSTER_NAMES.includes(normalizeName(name));
}
