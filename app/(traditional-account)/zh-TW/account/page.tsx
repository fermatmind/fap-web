import type { Metadata } from "next";
import { Suspense } from "react";
import AccountCenter from "@/components/account/AccountCenter";
import { accountText } from "@/lib/account/displayLocale";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: accountText("zh-TW", "我的账户"),
  robots: { index: false, follow: false },
  referrer: "strict-origin-when-cross-origin",
  alternates: { canonical: new URL("/zh-TW/account", SITE_URL).toString() },
};
export default function TraditionalAccountPage() {
  return <Suspense fallback={<main aria-busy="true">{accountText("zh-TW", "正在加载账户…")}</main>}><AccountCenter locale="zh-TW" /></Suspense>;
}
