import Link from "next/link";
import type { ComponentProps } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function AccountLink({ displayLocale, href, children, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string; displayLocale: DisplayLocale }) {
  const simplified = displayLocale === "zh-TW" && /^\/zh(?:\/|$|\?)/.test(href);
  return <Link {...props} href={href} hrefLang={simplified ? "zh-CN" : props.hrefLang}>{children}{simplified && <span className="text-xs font-normal">（簡體中文）</span>}</Link>;
}
