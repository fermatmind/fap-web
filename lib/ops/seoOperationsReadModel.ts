import {
  type SeoOperationsData,
  mockSeoOperationsData,
} from "@/components/ops/seo/mockSeoOperations";
import { seoIssueQueueArtifactOperationsData } from "@/components/ops/seo/seoIssueQueueArtifactAdapter";

export type SeoOperationsReadModelSource = "live_read_model" | "artifact_sample" | "mock_fixture" | "unavailable";

export type SeoOperationsReadModel = {
  source: SeoOperationsReadModelSource;
  sourceLabel: string;
  sourceDetail: string;
  generatedAt: string;
  warnings: string[];
  data: SeoOperationsData;
};

const emptyOperationsData: SeoOperationsData = {
  generatedAt: "unavailable",
  kpis: [],
  traffic: [],
  keywords: [],
  pages: [],
  tasks: [],
};

const sourceLabels: Record<SeoOperationsReadModelSource, string> = {
  live_read_model: "seo_intel read model",
  artifact_sample: "artifact_sample",
  mock_fixture: "mock_fixture",
  unavailable: "unavailable",
};

const sourceDetails: Record<SeoOperationsReadModelSource, string> = {
  live_read_model: "Sanitized read-only SEO intelligence summary.",
  artifact_sample: "Checked-in issue queue artifact sample; not live SEO truth.",
  mock_fixture: "Local UI fixture; not live SEO truth.",
  unavailable: "Read model unavailable; dashboard must render empty unknown state.",
};

function normalizeData(data?: Partial<SeoOperationsData>): SeoOperationsData {
  return {
    generatedAt: data?.generatedAt ?? "unavailable",
    kpis: data?.kpis ?? [],
    traffic: data?.traffic ?? [],
    keywords: data?.keywords ?? [],
    pages: data?.pages ?? [],
    tasks: data?.tasks ?? [],
  };
}

export function normalizeSeoOperationsReadModel(input?: {
  source?: SeoOperationsReadModelSource;
  sourceDetail?: string;
  generatedAt?: string;
  warnings?: string[];
  data?: Partial<SeoOperationsData>;
}): SeoOperationsReadModel {
  const source = input?.source ?? "unavailable";
  const data = normalizeData(input?.data);

  return {
    source,
    sourceLabel: sourceLabels[source],
    sourceDetail: input?.sourceDetail ?? sourceDetails[source],
    generatedAt: input?.generatedAt ?? data.generatedAt,
    warnings: input?.warnings ?? [],
    data,
  };
}

export async function loadSeoOperationsReadModel(): Promise<SeoOperationsReadModel> {
  return normalizeSeoOperationsReadModel({
    source: "artifact_sample",
    sourceDetail:
      "SEO-ISSUE-QUEUE-01 sample-only artifact bridged through the ops read-model boundary; not live seo_intel truth.",
    data: seoIssueQueueArtifactOperationsData,
    warnings: [
      "Keyword, trend, and page-performance rows retain mock fixture values until a later live read-model PR is approved.",
      "Dashboard actions remain UI-only and do not write CMS, publish, revalidate, or submit search-provider URLs.",
    ],
  });
}

export const seoOperationsMockFixtureReadModel = normalizeSeoOperationsReadModel({
  source: "mock_fixture",
  data: mockSeoOperationsData,
});

export const seoOperationsUnavailableReadModel = normalizeSeoOperationsReadModel({
  source: "unavailable",
  data: emptyOperationsData,
});
