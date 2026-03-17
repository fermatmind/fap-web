"use client";

import { getAttemptReport, getMyAttempts, type ReportResponse } from "@/lib/api/v0_3";
import { readCareerRiasecResult } from "@/lib/career/storage";
import type { Big5ScoreVector, CareerProfileSnapshot } from "@/lib/career/types";
import { normalizeMbtiCanonicalTypeCode } from "@/lib/mbti/publicProjection";

type AttemptSummary = {
  attemptId: string;
  typeCode?: string;
  domainsMean?: Record<string, number>;
};

function normalizeBig5Domains(input: Record<string, number> | undefined): Partial<Big5ScoreVector> | undefined {
  if (!input) return undefined;

  const aliasMap: Record<string, keyof Big5ScoreVector> = {
    openness: "openness",
    open: "openness",
    o: "openness",
    conscientiousness: "conscientiousness",
    conscientious: "conscientiousness",
    c: "conscientiousness",
    extraversion: "extraversion",
    extra: "extraversion",
    e: "extraversion",
    agreeableness: "agreeableness",
    agreeable: "agreeableness",
    a: "agreeableness",
    neuroticism: "neuroticism",
    neurotic: "neuroticism",
    n: "neuroticism",
  };

  const result: Partial<Big5ScoreVector> = {};
  for (const [key, value] of Object.entries(input)) {
    const trait = aliasMap[key.toLowerCase()];
    if (!trait || !Number.isFinite(value)) continue;
    const normalized = value <= 1 ? value * 100 : value;
    result[trait] = Math.max(0, Math.min(100, normalized));
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function extractPrimaryScoreFromReport(report: ReportResponse | null): number | undefined {
  if (!report || !report.report || typeof report.report !== "object") return undefined;
  const scores = (report.report as { scores?: unknown }).scores;
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) return undefined;

  for (const value of Object.values(scores as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.min(100, value));
    }
    if (value && typeof value === "object") {
      const candidate = (value as Record<string, unknown>).score ??
        (value as Record<string, unknown>).value ??
        (value as Record<string, unknown>).percentile;
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return Math.max(0, Math.min(100, candidate));
      }
    }
  }

  return undefined;
}

async function fetchLatestAttempt(scaleCode: string): Promise<AttemptSummary | null> {
  try {
    const response = await getMyAttempts({ scaleCode, page: 1, pageSize: 1 });
    const item = Array.isArray(response.items) ? response.items[0] : null;
    if (!item) return null;

    return {
      attemptId: String(item.attempt_id ?? ""),
      typeCode: typeof item.type_code === "string" ? item.type_code : undefined,
      domainsMean:
        item.result_summary && typeof item.result_summary === "object"
          ? ((item.result_summary as { domains_mean?: Record<string, number> }).domains_mean ?? undefined)
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function resolveCareerProfileSnapshot(): Promise<CareerProfileSnapshot> {
  const [mbtiLatest, big5Latest, iqLatest, eqLatest] = await Promise.all([
    fetchLatestAttempt("MBTI"),
    fetchLatestAttempt("BIG5_OCEAN"),
    fetchLatestAttempt("IQ_RAVEN"),
    fetchLatestAttempt("EQ_60"),
  ]);

  let mbtiType = normalizeMbtiCanonicalTypeCode(mbtiLatest?.typeCode) || undefined;
  let big5 = normalizeBig5Domains(big5Latest?.domainsMean);
  let iqScore: number | undefined;
  let eqScore: number | undefined;

  const reportPromises: Array<Promise<void>> = [];

  if (mbtiLatest?.attemptId) {
    reportPromises.push(
      getAttemptReport({ attemptId: mbtiLatest.attemptId })
        .then((report) => {
          const candidate =
            normalizeMbtiCanonicalTypeCode(report.mbti_public_projection_v1?.canonical_type_code) ||
            normalizeMbtiCanonicalTypeCode(report.type_code);
          if (candidate) mbtiType = candidate;
        })
        .catch(() => undefined)
    );
  }

  if (!big5 && big5Latest?.attemptId) {
    reportPromises.push(
      getAttemptReport({ attemptId: big5Latest.attemptId })
        .then((report) => {
          const raw = report.report && typeof report.report === "object"
            ? (report.report as { scores?: Record<string, unknown> }).scores
            : undefined;
          if (!raw || typeof raw !== "object") return;

          const domains: Record<string, number> = {};
          for (const [key, value] of Object.entries(raw)) {
            if (typeof value === "number") {
              domains[key] = value;
              continue;
            }
            if (value && typeof value === "object") {
              const candidate = (value as Record<string, unknown>).score ??
                (value as Record<string, unknown>).value ??
                (value as Record<string, unknown>).percentile;
              if (typeof candidate === "number") {
                domains[key] = candidate;
              }
            }
          }

          const normalized = normalizeBig5Domains(domains);
          if (normalized) big5 = normalized;
        })
        .catch(() => undefined)
    );
  }

  if (iqLatest?.attemptId) {
    reportPromises.push(
      getAttemptReport({ attemptId: iqLatest.attemptId })
        .then((report) => {
          iqScore = extractPrimaryScoreFromReport(report);
        })
        .catch(() => undefined)
    );
  }

  if (eqLatest?.attemptId) {
    reportPromises.push(
      getAttemptReport({ attemptId: eqLatest.attemptId })
        .then((report) => {
          eqScore = extractPrimaryScoreFromReport(report);
        })
        .catch(() => undefined)
    );
  }

  if (reportPromises.length > 0) {
    await Promise.all(reportPromises);
  }

  const riasecResult = readCareerRiasecResult();

  return {
    mbtiType,
    big5,
    iqScore,
    eqScore,
    riasec: riasecResult?.scores,
    sources: {
      mbti: mbtiType ? "history" : "none",
      big5: big5 ? "history" : "none",
      iq: typeof iqScore === "number" ? "history" : "none",
      eq: typeof eqScore === "number" ? "history" : "none",
      riasec: riasecResult ? "local" : "none",
    },
  };
}
