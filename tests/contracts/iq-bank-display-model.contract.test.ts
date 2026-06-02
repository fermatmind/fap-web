import { describe, expect, it } from "vitest";
import {
  IQ_BETA_30_BANK_ID,
  IQ_BETA_50_BANK_ID,
  IQ_CANONICAL_SCALE_CODE,
  IQ_PUBLIC_SLUG,
} from "@/lib/iq/constants";
import {
  IQ_BANK_DISPLAY_MODELS,
  getIqBankDisplayModel,
  getIqBankLandingChoices,
  getIqDefaultBankDisplayModel,
  isIqBankTakeEnabled,
} from "@/lib/iq/bankDisplay";

describe("IQ bank display model", () => {
  it("keeps beta_30 as the current available IQ form", () => {
    const beta30 = getIqBankDisplayModel(IQ_BETA_30_BANK_ID);

    expect(beta30).toMatchObject({
      key: "beta_30",
      bankId: IQ_BETA_30_BANK_ID,
      formCode: IQ_BETA_30_BANK_ID,
      scaleCode: IQ_CANONICAL_SCALE_CODE,
      slug: IQ_PUBLIC_SLUG,
      availability: "available",
      itemCount: 30,
      isDefault: true,
      isTakeEnabled: true,
      ctaState: "start",
    });
    expect(getIqDefaultBankDisplayModel().key).toBe("beta_30");
    expect(isIqBankTakeEnabled(IQ_BETA_30_BANK_ID)).toBe(true);
  });

  it("registers beta_50 as a future placeholder without a take entry", () => {
    const beta50 = getIqBankDisplayModel(IQ_BETA_50_BANK_ID);

    expect(beta50).toMatchObject({
      key: "beta_50",
      bankId: IQ_BETA_50_BANK_ID,
      formCode: IQ_BETA_50_BANK_ID,
      scaleCode: IQ_CANONICAL_SCALE_CODE,
      slug: IQ_PUBLIC_SLUG,
      availability: "future_placeholder",
      itemCount: 50,
      isDefault: false,
      isTakeEnabled: false,
      ctaState: "coming_soon",
    });
    expect(isIqBankTakeEnabled(IQ_BETA_50_BANK_ID)).toBe(false);
  });

  it("does not introduce a second IQ scale identity", () => {
    expect(IQ_BANK_DISPLAY_MODELS).toHaveLength(2);
    expect(new Set(IQ_BANK_DISPLAY_MODELS.map((model) => model.scaleCode))).toEqual(new Set([IQ_CANONICAL_SCALE_CODE]));
    expect(IQ_BANK_DISPLAY_MODELS.map((model) => model.key)).toEqual(["beta_30", "beta_50"]);
  });

  it("builds landing choices with a beta30 take href and a beta50 disabled teaser", () => {
    const choices = getIqBankLandingChoices({
      locale: "en",
      takeHref: "/en/tests/iq-test-intelligence-quotient-assessment/take",
    });
    const beta30 = choices.find((choice) => choice.key === "beta_30");
    const beta50 = choices.find((choice) => choice.key === "beta_50");

    expect(beta30).toMatchObject({
      href: "/en/tests/iq-test-intelligence-quotient-assessment/take",
      ctaLabel: "Start current 30-item form",
      targetAction: "start_beta_30",
    });
    expect(beta50).toMatchObject({
      href: null,
      ctaLabel: "Coming soon",
      targetAction: "preview_beta_50",
      isTakeEnabled: false,
    });
  });
});
