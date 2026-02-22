import type { Locale } from "@/lib/i18n/locales";

export type SiteDictionary = {
  header: {
    brand: string;
    tests: string;
    types: string;
    blog: string;
    start: string;
    switchToEnglish: string;
    switchToChinese: string;
  };
  tests: {
    title: string;
    subtitle: string;
  };
  card: {
    compactLabel: string;
    a11yVisualDescriptions: Record<string, string>;
    a11yVisualFallback: string;
  };
  quiz: {
    milestoneHints: string[];
  };
  loading: {
    phases: string[];
  };
  common: {
    start: string;
    details: string;
    questions_unit: string;
    minutes_unit: string;
  };
  lang: {
    zh_label: string;
    en_label: string;
  };
  cookie: {
    message: string;
    accept: string;
    decline: string;
  };
  footer: {
    privacy: string;
    terms: string;
    refund: string;
    support: string;
    copyright: string;
  };
  commerce: {
    unlock_title: string;
    unlock_subtitle: string;
    unlock_button: string;
    price: string;
    processing: string;
    secure_payment: string;
    guarantee: string;
    privacy_first: string;
    trust_badges: string[];
  };
  result: {
    title: string;
    breakdown: string;
    interpretation: string;
    noDimensions: string;
    summaryPending: string;
    reportUnavailable: string;
    paymentUnavailable: string;
  };
  orders: {
    title: string;
    pending: string;
    paid: string;
    failed: string;
    canceled: string;
    refunded: string;
    reportReady: string;
    reportGenerating: string;
    reportFailed: string;
    retryPayment: string;
    contactSupport: string;
    refresh: string;
    viewReport: string;
  };
  support: {
    title: string;
    lookup: string;
    quickActions: string;
    contact: string;
    emailHint: string;
  };
  legal: {
    privacy_title: string;
    terms_title: string;
    refund_title: string;
    medical_disclaimer: string;
    effectiveDateLabel: string;
    deletionChannel: string;
  };
};

export type I18nRegistry = Record<Locale, SiteDictionary>;
