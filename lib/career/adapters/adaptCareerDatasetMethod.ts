import type { CareerDatasetMethodResponseRaw } from "@/lib/career/api/types";
import type { CareerDatasetMethodAdapter, CareerDatasetMethodGuide } from "@/lib/career/adapters/types";

type AdaptCareerDatasetMethodInput = {
  payload: CareerDatasetMethodResponseRaw | null;
};

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => normalizeString(item)).filter((item) => item.length > 0);
}

function normalizeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeRecordOfNumbers(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalized: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      normalized[key] = raw;
    }
  }

  return normalized;
}

function normalizeDatasetPublicationUrl(value: unknown): string {
  const url = normalizeString(value);
  if (!url) {
    return "";
  }

  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

const GUIDE_SECTION_IDS = [
  "career-task-evidence",
  "riasec-free-results",
  "interest-and-work-style",
  "try-a-task",
];

function adaptReaderGuide(raw: unknown): CareerDatasetMethodGuide | null {
  const guide = normalizeObject(raw);
  const intro = normalizeString(guide.intro);
  if (!intro || !Array.isArray(guide.sections)) return null;

  const sections = guide.sections.map((value) => {
    const section = normalizeObject(value);
    const sources = Array.isArray(section.sources) ? section.sources.flatMap((value) => {
      const source = normalizeObject(value);
      const label = normalizeString(source.label);
      const href = normalizeDatasetPublicationUrl(source.href);
      return label && href ? [{ label, href }] : [];
    }) : [];
    return {
      id: normalizeString(section.id),
      title: normalizeString(section.title),
      body: normalizeString(section.body),
      sources,
    };
  });
  if (sections.length !== GUIDE_SECTION_IDS.length ||
      !sections.every((section, index) =>
        section.id === GUIDE_SECTION_IDS[index] && section.title && section.body && section.sources.length > 0
      )) return null;

  return { intro, sections };
}

export function adaptCareerDatasetMethod(
  input: AdaptCareerDatasetMethodInput
): CareerDatasetMethodAdapter | null {
  const root = normalizeObject(input.payload);
  if (Object.keys(root).length === 0) {
    return null;
  }

  const scopeSummary = normalizeObject(root.scope_summary);
  const publication = normalizeObject(root.publication);
  const publisher = normalizeObject(publication.publisher);
  const license = normalizeObject(publication.license);
  const usage = normalizeObject(publication.usage);
  const distribution = normalizeObject(publication.distribution);
  const structuredData = normalizeObject(root.structured_data);

  return {
    readerGuide: adaptReaderGuide(root.reader_guide),
    datasetKey: normalizeString(root.dataset_key),
    datasetScope: normalizeString(root.dataset_scope),
    methodUrl: normalizeString(root.method_url),
    hubUrl: normalizeString(root.hub_url),
    title: normalizeString(root.title, "Dataset method"),
    summary: normalizeString(root.summary),
    sourceSummary: normalizeString(root.source_summary),
    reviewDisciplineSummary: normalizeString(root.review_discipline_summary),
    included: normalizeStringArray(root.included),
    excluded: normalizeStringArray(root.excluded),
    boundaryNotes: normalizeStringArray(root.boundary_notes),
    scopeSummary: {
      memberCount: normalizeNumber(scopeSummary.member_count),
      includedCount: normalizeNumber(scopeSummary.included_count),
      excludedCount: normalizeNumber(scopeSummary.excluded_count),
      releaseCohortCounts: normalizeRecordOfNumbers(scopeSummary.release_cohort_counts),
      strongIndexDecisionCounts: normalizeRecordOfNumbers(scopeSummary.strong_index_decision_counts),
    },
    publication: {
      publisherName: normalizeString(publisher.name, "FermatMind"),
      publisherUrl: normalizeDatasetPublicationUrl(publisher.url) || "https://www.fermatmind.com/",
      licenseName: normalizeString(license.name),
      licenseUrl: normalizeDatasetPublicationUrl(license.url),
      usageSummary: normalizeString(usage.summary),
      downloadUrl: normalizeDatasetPublicationUrl(distribution.download_url),
    },
    structuredData: {
      article: normalizeObject(structuredData.article),
      breadcrumbList: normalizeObject(structuredData.breadcrumb_list),
    },
  };
}
