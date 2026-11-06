import { GLOBAL_HISTORY_VERSION } from "./config";

export const globalHistoryResultKey = `fermatmind.global-history.${GLOBAL_HISTORY_VERSION}`;

export function rememberGlobalHistoryResult(id: string, vector: number[]) {
  try {
    sessionStorage.setItem(globalHistoryResultKey, JSON.stringify({ id, vector }));
  } catch {
    // The public card remains available when storage is disabled.
  }
}
