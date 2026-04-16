import type { CareerDatasetMethodResponseRaw } from "@/lib/career/api/types";
import type { CareerDatasetMethodAdapter } from "@/lib/career/adapters/types";

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

export function adaptCareerDatasetMethod(
  input: AdaptCareerDatasetMethodInput
): CareerDatasetMethodAdapter | null {
  const root = normalizeObject(input.payload);
  if (Object.keys(root).length === 0) {
    return null;
  }

  const structuredData = normalizeObject(root.structured_data);

  return {
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
    structuredData: {
      article: normalizeObject(structuredData.article),
      breadcrumbList: normalizeObject(structuredData.breadcrumb_list),
    },
  };
}

