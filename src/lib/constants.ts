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

/** 單位排序（政府要員之後）；蔡技在茁思前 */
export const ORGANIZATION_SORT_ORDER: string[] = [
  "智慧光科技",
  "杭特電子",
  "順易利實業",
  "佳音醫療器材",
  "和平島地質公園",
  "萌老大(森田生技)",
  "台續",
  "蔡技企業",
  "茁思科技",
  "明新科技大學",
  "嘉澄股份有限公司",
];

export type EventDateKey =
  | "2026-06-02"
  | "2026-06-03"
  | "2026-06-04"
  | "2026-06-05";

export const ALL_EVENT_DATES: EventDateKey[] = [
  "2026-06-02",
  "2026-06-03",
  "2026-06-04",
  "2026-06-05",
];

export interface EventSheetConfig {
  key: EventDateKey;
  title: string;
  dateLabel: string;
  timeLabel: string;
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
  },
  {
    key: "2026-06-04",
    title: "InnoVex2026基隆主題館展期簽到",
    dateLabel: "115年6月4日",
    timeLabel: "上午9:00-下午17:00",
    pinnedFirst: "蔡馥嚀",
  },
  {
    key: "2026-06-05",
    title: "InnoVex2026基隆主題館展期簽到",
    dateLabel: "115年6月5日",
    timeLabel: "上午9:00-下午15:30",
    pinnedFirst: "潘祖德",
  },
];

export function normalizeName(name: string): string {
  return name.trim().replace(/啓/g, "啟");
}

export const RECORD_OVERRIDES: Record<
  string,
  { organization?: string; title?: string; otherOrganization?: string }
> = {
  方定安: { organization: "基隆市政府", title: "副市長" },
  袁碧蓮: { organization: "智慧光科技" },
  張軒慈: { organization: "台續" },
  鍾政偉: { organization: "明新科技大學", otherOrganization: "明新科技大學" },
};

export const OPENING_GOVERNMENT_ORDER = ["方定安", "黃毅維", "潘祖德"];

/** 6/2 導演／攝影人員，劉人傑在前 */
export const OPENING_MEDIA_CREW_ORDER = ["劉人傑", "周敬淳"];

/**
 * 僅出現在指定日期（不適用四天預設）
 * 其餘資料庫人員（含新簽到／補簽）預設四天皆有
 */
export const DAY_ONLY: Record<Exclude<EventDateKey, "2026-06-02">, string[]> = {
  "2026-06-03": ["李凱笙", "郭宏達"],
  "2026-06-04": ["蔡馥嚀", "孔麗玲", "黃麗玉", "林慶其", "黃淑華"],
  "2026-06-05": ["何東明"],
};

/** 從特定日期排除（其餘日期仍保留） */
export const EXCLUDE_FROM_DAY: Partial<Record<EventDateKey, string[]>> = {
  "2026-06-04": ["范秀玲"],
};

/** 6/5 額外確保出現（6/2 等日仍保留） */
export const COPIED_TO_605 = ["潘祖德", "曾千豪"];

/** 四天固定班底（文件用；邏輯上與預設四天相同） */
export const ALL_DAYS_ROSTER: { org: string; names: string[] }[] = [
  { org: "基隆市政府產業發展處", names: ["范秀玲", "王倫壕"] },
  { org: "茁思科技", names: ["陳巧芸", "阮紹倫"] },
  { org: "台續", names: ["吳啟弘", "施佑佳"] },
  { org: "智慧光科技", names: ["Stacy Lee", "袁碧蓮"] },
  { org: "順易利實業", names: ["江文婷", "黃柏霖"] },
  { org: "蔡技企業", names: ["張凱琳"] },
  { org: "嘉澄股份有限公司", names: ["王貞文", "陳毓琳"] },
];

export function getDaysForPerson(name: string): EventDateKey[] {
  const normalized = normalizeName(name);

  for (const [day, names] of Object.entries(DAY_ONLY) as [
    Exclude<EventDateKey, "2026-06-02">,
    string[],
  ][]) {
    if (names.some((n) => normalizeName(n) === normalized)) {
      return [day];
    }
  }

  return ALL_EVENT_DATES.filter((day) => {
    const excluded = EXCLUDE_FROM_DAY[day] ?? [];
    return !excluded.some((n) => normalizeName(n) === normalized);
  });
}
