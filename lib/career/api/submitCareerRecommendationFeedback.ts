import { ApiError, apiClient } from "@/lib/api-client";
import type { CareerRecommendationFeedbackResponseRaw } from "@/lib/career/api/types";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

export type SubmitCareerRecommendationFeedbackInput = {
  locale: Locale | string;
  type: string;
  burnoutCheckin: number;
  careerSatisfaction: number;
  switchUrgency: number;
};

function buildQuery(locale: Locale | string): string {
  const query = new URLSearchParams();
  query.set("locale", toApiLocale(locale));
  return `?${query.toString()}`;
}

export async function submitCareerRecommendationFeedback(
  input: SubmitCareerRecommendationFeedbackInput
): Promise<CareerRecommendationFeedbackResponseRaw | null> {
  const normalizedType = String(input.type ?? "").trim().toLowerCase();
  if (!normalizedType) {
    return null;
  }

  try {
    return await apiClient.post<CareerRecommendationFeedbackResponseRaw>(
      `/v0.5/career/recommendations/mbti/${encodeURIComponent(normalizedType)}/feedback${buildQuery(input.locale)}`,
      {
        burnout_checkin: input.burnoutCheckin,
        career_satisfaction: input.careerSatisfaction,
        switch_urgency: input.switchUrgency,
      },
      {
        locale: input.locale,
        skipAuth: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return null;
    }

    return null;
  }
}

