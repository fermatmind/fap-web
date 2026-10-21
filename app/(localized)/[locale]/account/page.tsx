import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveLocale } from "@/lib/i18n/getDict";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import AccountCenter from "@/components/account/AccountCenter";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "我的账户" : "My account",
    robots: NOINDEX_ROBOTS,
  };
}
export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense
      fallback={
        <main aria-busy="true">
          {locale === "zh" ? "正在加载账户…" : "Loading account…"}
        </main>
      }
    >
      <AccountCenter locale={resolveLocale(locale)} />
    </Suspense>
  );
}
