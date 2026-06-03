import issueQueueArtifact from "@/docs/seo/generated/seo-issue-queue.v1.json";
import {
  mockSeoOperationsData,
  type SeoContentType,
  type SeoIssueFocus,
  type SeoIssueTask,
  type SeoKpi,
  type SeoOperationsData,
  type SeoSeverity,
  type SeoTaskStatus,
} from "@/components/ops/seo/mockSeoOperations";

type ArtifactIssue = (typeof issueQueueArtifact.sample_issues)[number];

const sourceLabel: Record<ArtifactIssue["source_signal"], string> = {
  url_truth: "URL truth",
  competitor_url_inventory: "Competitor inventory",
  cms_draft: "CMS draft sample",
  cms_release: "CMS release sample",
  gsc: "GSC sample",
  baidu: "Baidu sample",
  ga4: "GA4 sample",
};

const ownerLabel: Record<ArtifactIssue["owner_role"], string> = {
  seo_operator: "SEO Ops",
  cms_editor: "CMS Ops",
  growth_operator: "Growth Ops",
  platform_engineer: "Platform",
};

const issueTitle: Record<ArtifactIssue["issue_type"], string> = {
  missing_metadata: "补齐 metadata 合约缺口",
  canonical_mismatch: "核对 canonical 漂移",
  noindex_public_mismatch: "核对 noindex 与公开状态",
  sitemap_presence_mismatch: "核对 sitemap 收录状态",
  missing_from_sitemap: "核对缺失 sitemap 的公开 URL",
  llms_exposure_gap: "复核 llms 暴露策略",
  competitor_gap_candidate: "评估竞品 URL 差距机会",
  draft_public_leak: "排查 draft 公开泄漏风险",
  post_publish_smoke_failure: "复核发布后 smoke 失败项",
  tracking_gap: "补齐增长追踪缺口",
};

function mapEntityType(entityType: ArtifactIssue["page_entity_type"]): Exclude<SeoContentType, "all"> {
  if (entityType === "article") return "article";
  if (entityType === "career_job") return "career_job";
  if (entityType === "career_guide") return "career_guide";
  if (entityType === "content_page" || entityType === "support_page") return "content_page";
  return "landing_surface";
}

function mapFocus(issueType: ArtifactIssue["issue_type"]): Exclude<SeoIssueFocus, "all"> {
  if (issueType.includes("canonical")) return "canonical";
  if (issueType.includes("noindex") || issueType.includes("draft")) return "robots";
  if (issueType.includes("metadata")) return "metadata";
  return "growth";
}

function mapSeverity(severity: ArtifactIssue["severity"]): SeoSeverity {
  if (severity === "critical" || severity === "high" || severity === "medium") return severity;
  return "low";
}

function mapStatus(issue: ArtifactIssue): SeoTaskStatus {
  if (issue.issue_type === "draft_public_leak") return "blocked";
  if (issue.severity === "high") return "blocked";
  if (issue.severity === "medium") return "in_review";
  return "queued";
}

function pathFromCanonicalUrl(canonicalUrl: string): string {
  try {
    return new URL(canonicalUrl).pathname || "/";
  } catch {
    return canonicalUrl;
  }
}

function buildArtifactTasks(): SeoIssueTask[] {
  return issueQueueArtifact.sample_issues.map((issue) => {
    const path = pathFromCanonicalUrl(issue.canonical_url);
    const title = issueTitle[issue.issue_type] ?? "复核 SEO issue queue 项";

    return {
      id: issue.issue_id,
      title: `${title}: ${issue.entity_id_or_slug}`,
      surface: sourceLabel[issue.source_signal] ?? issue.source_signal,
      path,
      type: mapEntityType(issue.page_entity_type),
      severity: mapSeverity(issue.severity),
      focus: mapFocus(issue.issue_type),
      status: mapStatus(issue),
      owner: ownerLabel[issue.owner_role] ?? issue.owner_role,
      due: issue.severity === "high" ? "今天" : issue.severity === "medium" ? "本周" : "观察",
      source: "issue_queue_artifact",
    };
  });
}

function buildArtifactKpis(tasks: SeoIssueTask[]): SeoKpi[] {
  const summary = issueQueueArtifact.generated_queue.summary;
  const blockedCount = tasks.filter((task) => task.status === "blocked").length;

  return mockSeoOperationsData.kpis.map((kpi) => {
    if (kpi.id === "issues") {
      return {
        ...kpi,
        value: String(summary.total_issues),
        detail: "来自 docs/seo/generated/seo-issue-queue.v1.json 的 sample-only read model。",
        trend: "artifact",
        direction: "flat",
        tone: "info",
      };
    }

    if (kpi.id === "blocked") {
      return {
        ...kpi,
        value: String(blockedCount),
        detail: "由 issue queue artifact severity/status 映射，仍只提交后台任务意图。",
        trend: "只读",
        direction: "flat",
        tone: blockedCount > 0 ? "danger" : "success",
      };
    }

    return kpi;
  });
}

const artifactTasks = buildArtifactTasks();

// TODO(seo_intel/CMS API): Replace this local artifact adapter with read-only
// seo_intel issue summary and CMS release task endpoints. This dashboard must
// stay an ops shell and must not write CMS content, publish, revalidate, or
// submit search-platform URLs from fap-web.
export const seoIssueQueueArtifactOperationsData: SeoOperationsData = {
  ...mockSeoOperationsData,
  generatedAt: "SEO-ISSUE-QUEUE-01 artifact",
  kpis: buildArtifactKpis(artifactTasks),
  tasks: artifactTasks,
};
