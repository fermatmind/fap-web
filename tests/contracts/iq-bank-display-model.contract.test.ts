import { describe, expect, it } from "vitest";
import {
  IQ_BETA_50_BANK_ID,
  IQ_CANONICAL_SCALE_CODE,
  IQ_OWNER_ORIGINAL_30_BANK_ID,
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
  it("keeps owner_original_30 as the current available IQ form", () => {
    const ownerOriginal30 = getIqBankDisplayModel(IQ_OWNER_ORIGINAL_30_BANK_ID);

    expect(ownerOriginal30).toMatchObject({
      key: "owner_original_30",
      bankId: IQ_OWNER_ORIGINAL_30_BANK_ID,
      formCode: IQ_OWNER_ORIGINAL_30_BANK_ID,
      scaleCode: IQ_CANONICAL_SCALE_CODE,
      slug: IQ_PUBLIC_SLUG,
      availability: "available",
      itemCount: 30,
      isDefault: true,
      isTakeEnabled: true,
      ctaState: "start",
    });
    expect(getIqDefaultBankDisplayModel().key).toBe("owner_original_30");
    expect(isIqBankTakeEnabled(IQ_OWNER_ORIGINAL_30_BANK_ID)).toBe(true);
  });

  it("does not introduce a second IQ scale identity", () => {
    expect(IQ_BANK_DISPLAY_MODELS).toHaveLength(2);
    expect(new Set(IQ_BANK_DISPLAY_MODELS.map((model) => model.scaleCode))).toEqual(new Set([IQ_CANONICAL_SCALE_CODE]));
    expect(IQ_BANK_DISPLAY_MODELS.map((model) => model.key)).toEqual(["owner_original_30", "beta_50"]);
  });

  it("keeps beta50 unavailable for result compatibility without exposing it on the landing chooser", () => {
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

  it("builds only the owner-original landing choice with the form-coded take href", () => {
    const choices = getIqBankLandingChoices({
      locale: "en",
      takeHref: "/en/tests/iq-test-intelligence-quotient-assessment/take",
    });
    const ownerOriginal30 = choices[0];

    expect(choices).toHaveLength(1);
    expect(ownerOriginal30).toMatchObject({
      href: `/en/tests/iq-test-intelligence-quotient-assessment/take?form=${IQ_OWNER_ORIGINAL_30_BANK_ID}`,
      ctaLabel: "Start current 30-item form",
      targetAction: "start_owner_original_30",
    });
  });
});
