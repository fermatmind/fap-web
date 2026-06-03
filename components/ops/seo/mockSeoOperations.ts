export type SeoContentType = "all" | "article" | "career_job" | "career_guide" | "landing_surface" | "content_page";
export type SeoIssueFocus = "all" | "metadata" | "canonical" | "robots" | "social" | "growth";
export type SeoSeverity = "critical" | "high" | "medium" | "low";
export type SeoTaskStatus = "queued" | "in_review" | "blocked" | "ready";

export type SeoKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  trend: string;
  direction: "up" | "down" | "flat";
  tone: "neutral" | "success" | "warning" | "danger" | "info";
};

export type TrafficPoint = {
  label: string;
  clicks: number;
  impressions: number;
  indexed: number;
};

export type KeywordRow = {
  term: string;
  intent: string;
  volume: number;
  position: number;
  clicks: number;
  type: Exclude<SeoContentType, "all">;
  status: "winning" | "watch" | "blocked";
  primaryUrl: string;
};

export type PagePerformanceRow = {
  id: string;
  title: string;
  path: string;
  type: Exclude<SeoContentType, "all">;
  impressions: number;
  clicks: number;
  ctr: number;
  readiness: number;
  indexState: "indexable" | "noindex" | "blocked";
  issues: SeoIssueFocus[];
  lastSeen: string;
};

export type SeoIssueTask = {
  id: string;
  title: string;
  surface: string;
  path: string;
  type: Exclude<SeoContentType, "all">;
  severity: SeoSeverity;
  focus: Exclude<SeoIssueFocus, "all">;
  status: SeoTaskStatus;
  owner: string;
  due: string;
  source: "seo_intel_mock" | "cms_api_mock";
};

export type SeoOperationsData = {
  generatedAt: string;
  kpis: SeoKpi[];
  traffic: TrafficPoint[];
  keywords: KeywordRow[];
  pages: PagePerformanceRow[];
  tasks: SeoIssueTask[];
};

// TODO(seo_intel): Replace this mock with read-only issue, keyword and trend summaries from seo_intel.
// TODO(CMS API): Replace CMS-facing rows with /v0.5/internal CMS resource summaries; writes must remain backend job submissions.
export const mockSeoOperationsData: SeoOperationsData = {
  generatedAt: "2026-06-03 10:30 CST",
  kpis: [
    {
      id: "readiness",
      label: "SEO 就绪率",
      value: "82%",
      detail: "公开且可索引页面中，metadata、canonical、robots、社交预览均完整的比例。",
      trend: "+6.4%",
      direction: "up",
      tone: "success",
    },
    {
      id: "indexed",
      label: "可索引足迹",
      value: "1,248",
      detail: "来自后端 sitemap-source 与前端 indexability gate 的可索引 URL 估算。",
      trend: "+34",
      direction: "up",
      tone: "info",
    },
    {
      id: "issues",
      label: "问题队列",
      value: "43",
      detail: "待审核的 canonical、metadata、robots、社交预览与增长阻断项。",
      trend: "-12",
      direction: "down",
      tone: "warning",
    },
    {
      id: "blocked",
      label: "发布阻断",
      value: "9",
      detail: "不允许前端自行修复，必须进入 CMS/SEO 后端审核任务。",
      trend: "持平",
      direction: "flat",
      tone: "danger",
    },
  ],
  traffic: [
    { label: "05/22", clicks: 1180, impressions: 28400, indexed: 1168 },
    { label: "05/23", clicks: 1248, impressions: 29680, indexed: 1172 },
    { label: "05/24", clicks: 1312, impressions: 30320, indexed: 1188 },
    { label: "05/25", clicks: 1260, impressions: 29840, indexed: 1196 },
    { label: "05/26", clicks: 1394, impressions: 31720, indexed: 1210 },
    { label: "05/27", clicks: 1468, impressions: 33580, indexed: 1224 },
    { label: "05/28", clicks: 1526, impressions: 34840, indexed: 1231 },
    { label: "05/29", clicks: 1492, impressions: 34220, indexed: 1238 },
    { label: "05/30", clicks: 1578, impressions: 35640, indexed: 1242 },
    { label: "05/31", clicks: 1646, impressions: 36520, indexed: 1248 },
  ],
  keywords: [
    {
      term: "holland career interest test",
      intent: "测试入口",
      volume: 18300,
      position: 5.4,
      clicks: 842,
      type: "career_job",
      status: "winning",
      primaryUrl: "/tests/holland-career-interest-test-riasec",
    },
    {
      term: "big five personality test vs mbti",
      intent: "对比研究",
      volume: 9100,
      position: 8.8,
      clicks: 496,
      type: "article",
      status: "watch",
      primaryUrl: "/articles/big-five-personality-test-vs-mbti",
    },
    {
      term: "INTJ career paths",
      intent: "职业推荐",
      volume: 12100,
      position: 11.2,
      clicks: 334,
      type: "career_guide",
      status: "blocked",
      primaryUrl: "/career/guides/intj-career-paths",
    },
    {
      term: "enneagram test free",
      intent: "测试入口",
      volume: 22600,
      position: 7.6,
      clicks: 732,
      type: "landing_surface",
      status: "watch",
      primaryUrl: "/tests/enneagram-test",
    },
  ],
  pages: [
    {
      id: "page-riasec",
      title: "Holland Career Interest Test RIASEC",
      path: "/tests/holland-career-interest-test-riasec",
      type: "landing_surface",
      impressions: 74400,
      clicks: 3842,
      ctr: 5.16,
      readiness: 96,
      indexState: "indexable",
      issues: [],
      lastSeen: "8 分钟前",
    },
    {
      id: "page-big5-mbti",
      title: "Big Five Personality Test vs MBTI",
      path: "/articles/big-five-personality-test-vs-mbti",
      type: "article",
      impressions: 21200,
      clicks: 914,
      ctr: 4.31,
      readiness: 78,
      indexState: "indexable",
      issues: ["social"],
      lastSeen: "18 分钟前",
    },
    {
      id: "page-intj-career",
      title: "INTJ Career Paths",
      path: "/career/guides/intj-career-paths",
      type: "career_guide",
      impressions: 18400,
      clicks: 512,
      ctr: 2.78,
      readiness: 58,
      indexState: "noindex",
      issues: ["canonical", "growth"],
      lastSeen: "36 分钟前",
    },
    {
      id: "page-support-refund",
      title: "Refund Policy",
      path: "/refund",
      type: "content_page",
      impressions: 4200,
      clicks: 110,
      ctr: 2.62,
      readiness: 88,
      indexState: "indexable",
      issues: ["metadata"],
      lastSeen: "1 小时前",
    },
  ],
  tasks: [
    {
      id: "task-001",
      title: "补齐 INTJ 职业指南 canonical 与可索引状态",
      surface: "Career Guide",
      path: "/career/guides/intj-career-paths",
      type: "career_guide",
      severity: "critical",
      focus: "canonical",
      status: "blocked",
      owner: "SEO Ops",
      due: "今天",
      source: "seo_intel_mock",
    },
    {
      id: "task-002",
      title: "为 Big Five vs MBTI 同步 OG/Twitter 图片元数据",
      surface: "Article",
      path: "/articles/big-five-personality-test-vs-mbti",
      type: "article",
      severity: "high",
      focus: "social",
      status: "queued",
      owner: "Content Ops",
      due: "明天",
      source: "cms_api_mock",
    },
    {
      id: "task-003",
      title: "核对 Enneagram 测试页 robots 策略漂移",
      surface: "Landing Surface",
      path: "/tests/enneagram-test",
      type: "landing_surface",
      severity: "medium",
      focus: "robots",
      status: "in_review",
      owner: "SEO Ops",
      due: "本周",
      source: "seo_intel_mock",
    },
    {
      id: "task-004",
      title: "补齐 Refund Policy meta description",
      surface: "Content Page",
      path: "/refund",
      type: "content_page",
      severity: "low",
      focus: "metadata",
      status: "ready",
      owner: "CMS Ops",
      due: "本周",
      source: "cms_api_mock",
    },
    {
      id: "task-005",
      title: "检查 RIASEC 入口增长归因异常回落",
      surface: "Landing Surface",
      path: "/tests/holland-career-interest-test-riasec",
      type: "landing_surface",
      severity: "high",
      focus: "growth",
      status: "queued",
      owner: "Growth Ops",
      due: "今天",
      source: "seo_intel_mock",
    },
  ],
};
