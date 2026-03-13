import type { Locale } from "@/lib/i18n/locales";

export type SiteDictionary = {
  header: {
    brand: string;
    home: string;
    tests: string;
    articles: string;
    personality: string;
    career: string;
    help: string;
    business: string;
    start: string;
    search: string;
    profile: string;
    menu: string;
    closeMenu: string;
    completedPrefix: string;
    completedSuffix: string;
    switchToEnglish: string;
    switchToChinese: string;
  };
  tests: {
    title: string;
    subtitle: string;
    relatedArticles: {
      title: string;
      subtitle: string;
      empty: string;
    };
  };
  articles: {
    kicker: string;
    title: string;
    subtitle: string;
    readArticle: string;
    backToArticles: string;
    updatedLabel: string;
    groupedByTestTitle: string;
    voiceLabels: {
      tool: string;
      growth: string;
      narrative: string;
    };
  };
  home: {
    hero: {
      kicker: string;
      title: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      chips: string[];
    };
    valueProps: {
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    socialProof: {
      title: string;
      subtitle: string;
      trustPillarsTitle: string;
      trustPillarsSubtitle: string;
      testimonialsTitle: string;
    };
    highlighted: {
      title: string;
      subtitle: string;
      cta: string;
      clinicalBadge: string;
      comingSoonBadge: string;
      comingSoonCta: string;
      comingSoonCards: Array<{
        title: string;
        description: string;
      }>;
    };
  };
  card: {
    compactLabel: string;
    a11yVisualDescriptions: Record<string, string>;
    a11yVisualFallback: string;
  };
  quiz: {
    milestoneHints: string[];
    answerTip: string;
    estimatedTimeLabel: string;
    immersive: {
      backToLanding: string;
      backToDetails: string;
      previous: string;
      currentFocus: string;
      submitRetry: string;
      noOptions: string;
      submitPhases: [string, string, string];
    };
    iq: {
      pickPrompt: string;
      selectHint: string;
      next: string;
      submit: string;
    };
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
    manageEmailPreferences: string;
    unsubscribeFromEmails: string;
    copyright: string;
    allTestsTitle: string;
    articlesTitle: string;
    localesTitle: string;
    reviewsTitle: string;
    socialTitle: string;
    ratingLabel: string;
    contactLabel: string;
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
    reportNotFoundRetrying: string;
    reportNotFoundFallback: string;
    generatingPaymentHint: string;
    viewOrderStatus: string;
    openOrderLookup: string;
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
    paymentActionTitle: string;
    paymentProviderLabel: string;
    qrCodeHint: string;
    qrCodeGenerating: string;
    qrCodeUnavailable: string;
    openPaymentHint: string;
    openPaymentPage: string;
  };
  support: {
    title: string;
    lookup: string;
    quickActions: string;
    contact: string;
    emailHint: string;
  };
  email: {
    preferences: {
      metadataTitle: string;
      metadataDescription: string;
      title: string;
      description: string;
      missingDescription: string;
      missingRecoveryHint: string;
      loading: string;
      emailLabel: string;
      statusTitle: string;
      statusDescription: string;
      statusEnabled: string;
      statusDisabled: string;
      save: string;
      saving: string;
      unsubscribeCta: string;
      successMessage: string;
      invalidTitle: string;
      invalidDescription: string;
      saveError: string;
      fields: {
        marketing_updates: {
          title: string;
          description: string;
        };
        report_recovery: {
          title: string;
          description: string;
        };
        product_updates: {
          title: string;
          description: string;
        };
      };
      ctas: {
        orderLookup: string;
        help: string;
      };
    };
    unsubscribe: {
      metadataTitle: string;
      metadataDescription: string;
      title: string;
      description: string;
      missingDescription: string;
      confirmTitle: string;
      confirmDescription: string;
      confirmEffects: string[];
      confirm: string;
      confirming: string;
      backToPreferences: string;
      successTitle: string;
      successDescription: string;
      successNextSteps: string[];
      statusLabel: string;
      statusValues: {
        unsubscribed: string;
      };
      invalidTitle: string;
      invalidDescription: string;
      submitError: string;
      ctas: {
        preferences: string;
        orderLookup: string;
        help: string;
      };
    };
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
