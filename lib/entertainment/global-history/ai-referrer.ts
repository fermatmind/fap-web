const aiReferrerHosts = [
  "perplexity.ai",
  "chatgpt.com",
  "chat.openai.com",
  "copilot.microsoft.com",
  "doubao.com",
  "yuanbao.tencent.com",
  "claude.ai",
  "gemini.google.com",
] as const;

export function globalHistoryAiReferrerHost(referrer?: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return aiReferrerHosts.find(host =>
      url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return undefined;
  }
}

const referralKey = "fm_global_history_ai_referrer_v1";
const referralLifetime = 30 * 60 * 1000;

/** Called after the shared analytics consent and public-page checks. */
export function captureGlobalHistoryAiReferrer(referrer: string, origin: string): void {
  if (referrer === origin || referrer.startsWith(`${origin}/`)) return;
  try {
    const host = globalHistoryAiReferrerHost(referrer);
    if (host) {
      window.sessionStorage.setItem(referralKey, JSON.stringify({ host, expiresAt: Date.now() + referralLifetime }));
    } else {
      window.sessionStorage.removeItem(referralKey);
    }
  } catch {
    // Storage is optional.
  }
}

export function readGlobalHistoryAiReferrer(referrer: string, origin: string): string | undefined {
  if (referrer && referrer !== origin && !referrer.startsWith(`${origin}/`)) {
    return globalHistoryAiReferrerHost(referrer);
  }
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(referralKey) ?? "null");
    return stored?.expiresAt > Date.now() ? aiReferrerHosts.find(host => host === stored.host) : undefined;
  } catch {
    return undefined;
  }
}
