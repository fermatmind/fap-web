import type { AttributionParams } from "@/lib/tracking/attribution";

export type UtmChannelKey =
  | "wechat_private"
  | "xiaohongshu_social"
  | "zhihu_answer"
  | "chatgpt_referral"
  | "bilibili_video"
  | "douyin_social"
  | "youtube_video"
  | "tiktok_social"
  | "weibo_social"
  | "x_social"
  | "facebook_social"
  | "instagram_social"
  | "reddit_social"
  | "website_share";

export type UtmChannelConfig = Required<Pick<AttributionParams, "utm_source" | "utm_medium" | "utm_campaign">>;

export const UTM_CHANNEL_CONFIG: Record<UtmChannelKey, UtmChannelConfig> = {
  wechat_private: {
    utm_source: "wechat",
    utm_medium: "private",
    utm_campaign: "mbti",
  },
  xiaohongshu_social: {
    utm_source: "xiaohongshu",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  zhihu_answer: {
    utm_source: "zhihu",
    utm_medium: "answer",
    utm_campaign: "mbti_holland",
  },
  chatgpt_referral: {
    utm_source: "chatgpt",
    utm_medium: "referral",
    utm_campaign: "seo_review",
  },
  bilibili_video: {
    utm_source: "bilibili",
    utm_medium: "video",
    utm_campaign: "career_test",
  },
  douyin_social: {
    utm_source: "douyin",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  youtube_video: {
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: "career_test",
  },
  tiktok_social: {
    utm_source: "tiktok",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  weibo_social: {
    utm_source: "weibo",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  x_social: {
    utm_source: "x",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  facebook_social: {
    utm_source: "facebook",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  instagram_social: {
    utm_source: "instagram",
    utm_medium: "social",
    utm_campaign: "career_test",
  },
  reddit_social: {
    utm_source: "reddit",
    utm_medium: "community",
    utm_campaign: "career_test",
  },
  website_share: {
    utm_source: "website",
    utm_medium: "share",
    utm_campaign: "result_share",
  },
};

export const DISALLOWED_UTM_SOURCE_VALUES = ["chatgpt.com", "qr"] as const;

export function buildUtmParams(channel: UtmChannelKey, overrides: Partial<AttributionParams> = {}): AttributionParams {
  const base = UTM_CHANNEL_CONFIG[channel];
  return {
    ...base,
    ...overrides,
  };
}

export function appendGovernedUtmParamsToHref(href: string, channel: UtmChannelKey, overrides: Partial<AttributionParams> = {}): string {
  const params = buildUtmParams(channel, overrides);

  try {
    const parsed = new URL(href);
    for (const [key, value] of Object.entries(params)) {
      if (value) parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch {
    const [pathname, rawQuery = ""] = href.split("?");
    const searchParams = new URLSearchParams(rawQuery);
    for (const [key, value] of Object.entries(params)) {
      if (value) searchParams.set(key, value);
    }
    const serialized = searchParams.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }
}
