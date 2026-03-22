import { ApiError, apiClient } from "@/lib/api-client";
import type { AnswerSurfaceRaw, LandingSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeAnswerSurface, type AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import { normalizeLandingSurface, type LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";

type PublicGatewaySurfaceResponse = {
  ok?: boolean;
  landing_surface_v1?: LandingSurfaceRaw | null;
  answer_surface_v1?: AnswerSurfaceRaw | null;
};

export type PublicGatewaySurfaceViewModel = {
  landingSurface: LandingSurfaceViewModel | null;
  answerSurface: AnswerSurfaceViewModel | null;
};

function buildQuery(locale: Locale | string): string {
  return `?locale=${encodeURIComponent(toApiLocale(locale))}`;
}

async function getGateway(pathname: string, locale: Locale | string): Promise<PublicGatewaySurfaceViewModel | null> {
  try {
    const response = await apiClient.get<PublicGatewaySurfaceResponse>(`${pathname}${buildQuery(locale)}`, {
      locale,
      skipAuth: true,
      cache: "no-store",
    });

    return {
      landingSurface: normalizeLandingSurface(response.landing_surface_v1 ?? null),
      answerSurface: normalizeAnswerSurface(response.answer_surface_v1 ?? null),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}

export async function getHomeGatewaySurface(locale: Locale | string): Promise<PublicGatewaySurfaceViewModel | null> {
  return getGateway("/v0.3/public-gateways/home", locale);
}

export async function getTestsGatewaySurface(locale: Locale | string): Promise<PublicGatewaySurfaceViewModel | null> {
  return getGateway("/v0.3/public-gateways/tests", locale);
}

export async function getHelpGatewaySurface(locale: Locale | string): Promise<PublicGatewaySurfaceViewModel | null> {
  return getGateway("/v0.3/public-gateways/help", locale);
}

export async function getHelpDetailGatewaySurface(
  slug: string,
  locale: Locale | string
): Promise<PublicGatewaySurfaceViewModel | null> {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  return getGateway(`/v0.3/public-gateways/help/${encodeURIComponent(normalizedSlug)}`, locale);
}
