import { buildApiUrl } from "@/lib/api-base";

const browserBase = "/friendship-browser";
let opening: Promise<void> | undefined;
let sessionReady = false;
const granted = new Set<string>();

async function request<T>(url: string, method: string, data?: unknown, preview = false): Promise<T> {
  const response = await fetch(url, {
    method,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/json",
      ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(preview ? { "X-Friendship-Owner-Preview": "1" } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  if (!response.ok) throw new Error(response.status === 401 ? "key_required" : response.status === 410 ? "closed" : response.status === 404 ? "missing" : response.status === 409 ? "conflict" : response.status === 422 ? "invalid" : response.status === 429 ? "limit" : "network");
  return await response.json() as T;
}

export function friendshipApi<T>(path: string, method = "GET", data?: unknown, preview = false): Promise<T> {
  const publicRead = method === "GET" && /^\/(?:catalog|stats|challenges\/[a-f0-9-]+)$/i.test(path);
  return request<T>(publicRead ? buildApiUrl(`/v0.3/friendship${path}`) : browserBase + path, method, data, preview).catch(error => {
    if (!publicRead && error instanceof Error && error.message === "key_required") {
      sessionReady = false;
      granted.clear();
    }
    throw error;
  });
}

export async function prepareFriendshipGrant(id: string, role: "owner" | "player", options: { legacy?: string; draft?: boolean } = {}) {
  const identity = `${role}:${id}`;
  if (!options.legacy && granted.has(identity)) return;
  if (!sessionReady) {
    if (!opening) {
      const start = () => request(browserBase + "/session", "POST");
      opening = (navigator.locks ? navigator.locks.request("fm-friendship-session", start) : start())
        .then(() => { sessionReady = true; })
        .finally(() => { opening = undefined; });
    }
    await opening;
  }
  await friendshipApi(`/challenges/${id}/browser-grant`, "POST", { role, ...options });
  granted.add(identity);
}
