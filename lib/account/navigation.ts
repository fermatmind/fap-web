import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { accountDisplayPath } from "@/lib/i18n/accountDisplayRoutes";

export function accountNavigationPath(path: string, locale: DisplayLocale): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) throw new Error("Invalid account navigation.");
  if (/[\u0000-\u001f\u007f]/.test(path)) throw new Error("Invalid account navigation.");
  const target = new URL(path, "https://account.invalid");
  if (target.origin !== "https://account.invalid") throw new Error("Invalid account navigation.");
  if (locale !== "zh-TW") return localizedPath(path, locale);
  if (target.pathname === "/account") return accountDisplayPath(locale) + target.search + target.hash;
  const translated = traditionalPath(`/zh${target.pathname}`);
  return translated ? translated + target.search + target.hash : localizedPath(path, "zh");
}
