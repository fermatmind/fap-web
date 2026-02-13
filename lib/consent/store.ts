export type AnalyticsConsent = "unknown" | "granted" | "denied";

type ConsentRecord = {
  analytics: AnalyticsConsent;
  updatedAt: string;
};

const CONSENT_KEY = "fm_consent_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function defaultConsent(): ConsentRecord {
  return {
    analytics: "unknown",
    updatedAt: new Date().toISOString(),
  };
}

export function getConsent(): ConsentRecord {
  if (!isBrowser()) return defaultConsent();

  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return defaultConsent();

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      parsed.analytics === "granted" ||
      parsed.analytics === "denied" ||
      parsed.analytics === "unknown"
    ) {
      return {
        analytics: parsed.analytics,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      };
    }

    return defaultConsent();
  } catch {
    return defaultConsent();
  }
}

export function setAnalyticsConsent(analytics: AnalyticsConsent): ConsentRecord {
  const record: ConsentRecord = {
    analytics,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch {
      // Ignore storage write errors.
    }
  }

  return record;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent().analytics === "granted";
}
