const KEY = "fm_career_guest_key_v1";

// A private browser credential, independent of the public analytics anon_id.
// Never include it in URLs, analytics, provider payloads, or visible order data.
export function careerGuestHeaders(create = false): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    let key = window.localStorage.getItem(KEY);
    if (!key && create) {
      key = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0")).join("");
      window.localStorage.setItem(KEY, key);
    }
    if (key && /^[a-f0-9]{64}$/.test(key)) return { "X-Career-Guest-Token": key };
  } catch {
    if (create) throw new Error("BROWSER_STORAGE_REQUIRED");
  }
  if (create) throw new Error("BROWSER_STORAGE_REQUIRED");
  return {};
}
