import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";

describe("tracking whitelist contract", () => {
  it("enforces strict whitelist for card/report UI events", () => {
    const basePayload = {
      slug: "big-five-personality-test",
      scale_code: "BIG5_OCEAN",
      visual_kind: "bars_ocean",
      interaction: "click",
      milestone: 40,
      duration_bucket: "60_120s",
      phase: "matching",
      locked: true,
      variant: "free",
      locale: "en",
      answers: "forbidden",
      report_tags: ["forbidden"],
      question_text: "forbidden",
      email: "forbidden@example.com",
      token: "forbidden",
      authorization: "forbidden",
      unexpected: "drop-me",
    };

    const impression = filterTrackingPayload(TRACKING_EVENTS.UI_CARD_IMPRESSION, basePayload);
    expect(impression).toEqual({
      slug: "big-five-personality-test",
      scale_code: "BIG5_OCEAN",
      visual_kind: "bars_ocean",
      locale: "en",
    });

    const interaction = filterTrackingPayload(TRACKING_EVENTS.UI_CARD_INTERACTION, basePayload);
    expect(interaction).toEqual({
      slug: "big-five-personality-test",
      scale_code: "BIG5_OCEAN",
      visual_kind: "bars_ocean",
      interaction: "click",
      locale: "en",
    });

    const milestone = filterTrackingPayload(TRACKING_EVENTS.UI_QUIZ_MILESTONE, basePayload);
    expect(milestone).toEqual({
      scale_code: "BIG5_OCEAN",
      milestone: 40,
      duration_bucket: "60_120s",
      locale: "en",
    });

    const loading = filterTrackingPayload(TRACKING_EVENTS.UI_REPORT_LOADING_PHASE, basePayload);
    expect(loading).toEqual({
      scale_code: "BIG5_OCEAN",
      phase: "matching",
      locked: true,
      variant: "free",
      locale: "en",
    });
  });
});
