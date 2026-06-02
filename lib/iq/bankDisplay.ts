import {
  IQ_BETA_30_BANK_ID,
  IQ_BETA_50_BANK_ID,
  IQ_CANONICAL_SCALE_CODE,
  IQ_PUBLIC_SLUG,
} from "@/lib/iq/constants";
import type { Locale } from "@/lib/i18n/locales";

export type IqBankDisplayKey = "beta_30" | "beta_50";
export type IqBankAvailability = "available" | "future_placeholder";

export type IqBankDisplayModel = {
  key: IqBankDisplayKey;
  bankId: typeof IQ_BETA_30_BANK_ID | typeof IQ_BETA_50_BANK_ID;
  formCode: typeof IQ_BETA_30_BANK_ID | typeof IQ_BETA_50_BANK_ID;
  scaleCode: typeof IQ_CANONICAL_SCALE_CODE;
  slug: typeof IQ_PUBLIC_SLUG;
  availability: IqBankAvailability;
  itemCount: number;
  isDefault: boolean;
  isTakeEnabled: boolean;
  ctaState: "start" | "coming_soon";
  labels: {
    en: string;
    zh: string;
  };
  shortLabels: {
    en: string;
    zh: string;
  };
  descriptions: {
    en: string;
    zh: string;
  };
};

export type IqBankDisplayText = {
  label: string;
  shortLabel: string;
  description: string;
  ctaLabel: string;
  statusLabel: string;
};

export type IqBankLandingChoice = IqBankDisplayModel & IqBankDisplayText & {
  href: string | null;
  testId: string;
  targetAction: string;
};

export const IQ_BANK_DISPLAY_MODELS: readonly IqBankDisplayModel[] = [
  {
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
    labels: {
      en: "IQ Beta 30",
      zh: "IQ Beta 30 题",
    },
    shortLabels: {
      en: "30-item beta",
      zh: "30 题 beta",
    },
    descriptions: {
      en: "Current free FermatMind IQ beta assessment with 30 original reasoning items.",
      zh: "当前免费的 FermatMind 原创 30 题 IQ beta 测评。",
    },
  },
  {
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
    labels: {
      en: "IQ Beta 50",
      zh: "IQ Beta 50 题",
    },
    shortLabels: {
      en: "50-item validation beta",
      zh: "50 题验证版 beta",
    },
    descriptions: {
      en: "Future validation-oriented IQ beta form. It must stay unavailable until the backend bank, scoring, and norm gates are ready.",
      zh: "未来验证导向的 IQ beta 表单；后端题库、评分与常模 gate 未就绪前不得开放答题入口。",
    },
  },
] as const;

export function getIqDefaultBankDisplayModel(): IqBankDisplayModel {
  return IQ_BANK_DISPLAY_MODELS.find((model) => model.isDefault) ?? IQ_BANK_DISPLAY_MODELS[0];
}

export function getIqBankDisplayModel(value: string | null | undefined): IqBankDisplayModel | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized) return null;

  return IQ_BANK_DISPLAY_MODELS.find((model) => {
    return model.bankId === normalized || model.formCode === normalized || model.key.toUpperCase() === normalized;
  }) ?? null;
}

export function isIqBankTakeEnabled(value: string | null | undefined): boolean {
  return getIqBankDisplayModel(value)?.isTakeEnabled === true;
}

export function getIqBankDisplayText(model: IqBankDisplayModel, locale: Locale): IqBankDisplayText {
  const isZh = locale === "zh";

  return {
    label: model.labels[locale],
    shortLabel: model.shortLabels[locale],
    description: model.descriptions[locale],
    ctaLabel: model.ctaState === "start"
      ? isZh
        ? "开始当前 30 题"
        : "Start current 30-item form"
      : isZh
        ? "即将开放"
        : "Coming soon",
    statusLabel: model.availability === "available"
      ? isZh
        ? "当前可用"
        : "Available now"
      : isZh
        ? "未来占位"
        : "Future placeholder",
  };
}

export function getIqBankLandingChoices({
  locale,
  takeHref,
}: {
  locale: Locale;
  takeHref: string;
}): IqBankLandingChoice[] {
  return IQ_BANK_DISPLAY_MODELS.map((model) => ({
    ...model,
    ...getIqBankDisplayText(model, locale),
    href: model.isTakeEnabled ? takeHref : null,
    testId: `test-detail-landing-cta-${model.key}`,
    targetAction: model.isTakeEnabled ? `start_${model.key}` : `preview_${model.key}`,
  }));
}
