import { buildApiUrl } from "@/lib/api-base";
export async function friendshipApi<T>(path: string, method = "GET", data?: unknown, key?: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(buildApiUrl(`/v0.3/friendship${path}`), { method, cache: "no-store", signal: controller.signal, headers: { Accept: "application/json", ...(data ? { "Content-Type": "application/json" } : {}), ...(key ? { Authorization: `Bearer ${key}` } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
    if (!response.ok) throw new Error(response.status === 401 ? "key_required" : response.status === 410 ? "closed" : response.status === 404 ? "missing" : response.status === 409 ? "conflict" : response.status === 422 ? "invalid" : response.status === 429 ? "limit" : "network");
    return await response.json() as T;
  } finally { clearTimeout(timer); }
}
