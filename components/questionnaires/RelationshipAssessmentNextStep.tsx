"use client";

import Link from "next/link";
import { hasAnalyticsConsent } from "@/lib/consent/store";
import { modeABatchThreeAssessments, modeABatchThreeTargets } from "@/lib/entertainment/modeABatchThree";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { getBrowserAnalyticsSuppressionDecision } from "@/lib/tracking/browserAnalyticsSuppression";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { buildSeoCtaNavigationHref, buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";
import { trackEvent } from "@/lib/analytics";

const copy = {
  en: {
    heading: "Optional: explore a related assessment",
    interaction: ["Take the emotional intelligence assessment", "Explore how you notice and manage emotions in everyday interactions."],
    boundaries: ["Take the Big Five personality assessment", "Explore broader traits such as sociability and consideration for others."],
    preferences: ["Take the MBTI assessment", "Explore your broader preferences for processing information and making decisions."],
    boundary: "You can finish here. The other assessment uses its own questions. This result cannot determine its score or predict a relationship outcome.",
    finish: "Your music preferences are worth exploring in their own right. You can finish here.",
  },
  zh: {
    heading: "可选：继续做一项相关测评",
    interaction: ["做情商测评", "进一步了解你在日常互动中如何识别和调节情绪。"],
    boundaries: ["做大五人格测评", "进一步探索社交活跃度、考虑他人感受等更广泛的个性特点。"],
    preferences: ["做 MBTI 测评", "进一步了解你吸收信息和做决定时的偏好。"],
    boundary: "也可以到这里结束。后续测评需独立作答。本次结果无法推算后续分数或预测关系走向。",
    finish: "听歌偏好本身就值得探索。你可以到这里结束。",
  },
  "zh-TW": {
    heading: "想再多了解自己？可以另外做一項測驗",
    interaction: ["做情緒智力測驗", "想想你在日常互動中，怎麼察覺情緒、調整自己的反應。"],
    boundaries: ["做大五人格測驗", "進一步認識你的社交活躍程度，以及在互動中留意他人感受的方式。"],
    preferences: ["做 MBTI 測驗", "進一步看看你平常怎麼接收資訊、做決定。"],
    boundary: "你也可以在這裡結束。另一項測驗要另外作答。這次的結果無法推算另一份測驗的分數，也無法預測關係會怎麼發展。",
    finish: "你可以把這次結果當成探索音樂口味的起點，也可以在這裡結束。",
  },
} as const;

export function RelationshipAssessmentNextStep({ slug, locale, displayLocale }: {
  slug: keyof typeof modeABatchThreeTargets;
  locale: Locale;
  displayLocale: DisplayLocale;
}) {
  const topic = modeABatchThreeTargets[slug];
  const text = copy[displayLocale];
  if (!topic) return <p className="mt-8 leading-7" data-b3-next-step="finish">{text.finish}</p>;

  const target = modeABatchThreeAssessments[topic];
  const href = `/${displayLocale}/tests/${target.slug}`;
  const sourcePath = questionnairePath(displayLocale, slug);
  const privateSource = isAnalyticsDisabledQuestionnaireUrl(questionnairePath(locale, slug));
  const action = slug === "relationship-values"
    ? "entertainment_result_mbti"
    : `questionnaire_result_${topic === "interaction" ? "eq" : topic === "boundaries" ? "bigfive" : "mbti"}`;
  const attribution = {
    locale, sourceRouteFamily: "test_detail" as const, sourceSlug: slug, sourcePath, href,
    ctaId: action, targetAction: action, targetTestSlug: target.slug, scaleCode: target.scale,
  };
  return <section className="mt-10 space-y-3 border-t pt-7" data-b3-next-step={topic}>
    <h3 className="text-xl font-semibold">{text.heading}</h3>
    <p className="leading-7">{text[topic][1]}</p>
    <p className="leading-7">{text.boundary}</p>
    <Link href={href} prefetch={false} referrerPolicy="no-referrer" className="inline-block min-h-11 py-2 underline"
      onClick={(event) => {
        if (privateSource || !hasAnalyticsConsent() || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (getBrowserAnalyticsSuppressionDecision({ pathname: window.location.pathname, search: window.location.search }).suppressed) return;
        event.preventDefault();
        trackEvent(slug === "relationship-values" ? "article_to_test_click" : "start_click", {
          ...buildSeoCtaTrackingPayload(attribution),
          locale: displayLocale,
        });
        window.location.assign(buildSeoCtaNavigationHref(attribution));
      }}>
      {text[topic][0]}
    </Link>
  </section>;
}
