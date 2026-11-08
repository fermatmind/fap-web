import { localizedPath, type DisplayLocale } from "./locales";

export const EMAIL_DISPLAY_PATHS = ["/email/preferences", "/email/unsubscribe"] as const;
export type EmailDisplayPath = typeof EMAIL_DISPLAY_PATHS[number];
export function emailDisplayPath(path: EmailDisplayPath, locale: DisplayLocale): string {
  return locale === "zh-TW" ? `/zh-TW${path}` : localizedPath(path, locale);
}
export function emailRecoveryPath(path: "/help" | "/orders/lookup", locale: DisplayLocale): string {
  return localizedPath(path, locale === "zh-TW" ? "zh" : locale);
}
export function emailRecoveryLabel(label: string, locale: DisplayLocale): string {
  return locale === "zh-TW" ? `${label}（簡體中文）` : label;
}
function isEmailFlow(pathname: string): boolean {
  return /^\/(?:en|zh|zh-TW)\/email\/(?:preferences|unsubscribe)\/?$/.test(pathname);
}
/** Carry an opaque token only between the existing private email pages. */
export function emailTokenSwitchHref(pathname: string, target: string, search: string): string {
  if (!isEmailFlow(pathname) || !isEmailFlow(target)) return target;
  const token = new URLSearchParams(search).get("token")?.trim();
  return token ? `${target}?token=${encodeURIComponent(token)}` : target;
}
