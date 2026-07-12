const APPROVED_TARGETS = Object.freeze({
  "home-zh": { kind: "page", url: "https://fermatmind.com/" },
  "career-directory-en": { kind: "page", url: "https://fermatmind.com/en/career/jobs" },
  "personality-intj-a-en": { kind: "page", url: "https://fermatmind.com/en/personality/intj-a" },
  "article-en": { kind: "page", url: "https://fermatmind.com/en/articles/big-five-personality-test-vs-mbti" },
  "career-directory-api": {
    kind: "api",
    url: "https://api.fermatmind.com/api/v0.5/career/directory?locale=en&org_id=0&page=1&per_page=20",
  },
  "personality-intj-a-api": {
    kind: "api",
    url: "https://api.fermatmind.com/api/v0.5/personality/intj-a?locale=en&org_id=0",
  },
  "article-detail-api": {
    kind: "api",
    url: "https://api.fermatmind.com/api/v0.5/articles/big-five-personality-test-vs-mbti?locale=en&org_id=0",
  },
  "article-seo-api": {
    kind: "api",
    url: "https://api.fermatmind.com/api/v0.5/articles/big-five-personality-test-vs-mbti/seo?locale=en&org_id=0",
  },
});

const APPROVED_HOSTS = new Set(["fermatmind.com", "api.fermatmind.com"]);

export function resolveApprovedPerformanceTarget(target) {
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    throw new Error("Performance target must be an object.");
  }

  const id = String(target.id ?? "").trim();
  const approved = APPROVED_TARGETS[id];
  if (!approved) {
    throw new Error(`Performance target is not approved: ${id || "<missing>"}`);
  }

  let configuredUrl;
  try {
    configuredUrl = new URL(String(target.url ?? ""));
  } catch {
    throw new Error(`Performance target URL is invalid: ${id}`);
  }

  if (
    configuredUrl.protocol !== "https:"
    || !APPROVED_HOSTS.has(configuredUrl.hostname)
    || configuredUrl.username
    || configuredUrl.password
    || configuredUrl.port
    || configuredUrl.hash
  ) {
    throw new Error(`Performance target URL is not a public approved HTTPS URL: ${id}`);
  }

  if (target.kind !== approved.kind || configuredUrl.toString() !== approved.url) {
    throw new Error(`Performance target does not match its approved request: ${id}`);
  }

  // Return the code-owned URL, never the file-owned value, so configuration data
  // cannot select an outbound destination.
  return approved.url;
}
