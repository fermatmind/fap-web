import "server-only";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { eqResultPageSchema } from "./resultPage";

export async function loadEqResultSample() {
  const response = await fetch(`${resolveApiBaseUrl()}/v0.5/eq-assessment/sample`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("EQ sample is temporarily unavailable");
  const payload = await response.json();
  if (payload.ok !== true || payload.sample !== true) throw new Error("Invalid EQ sample response");
  return eqResultPageSchema.parse(payload.eq60_result_page_v1);
}
