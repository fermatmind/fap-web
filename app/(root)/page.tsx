import { cookies, headers } from "next/headers";
import { LocaleGatewayButtons } from "@/components/i18n/LocaleGatewayButtons";
import { LOCALE_COOKIE_NAME, resolvePreferredLocale } from "@/lib/i18n/localeNegotiation";

export default async function RootLanguageGatewayPage() {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const preferred = resolvePreferredLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-[var(--fm-container-gutter)] py-12">
      <div className="rounded-[var(--fm-radius-xl)] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-8 shadow-[var(--fm-shadow-md)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          x-default Language Gateway
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)]">
          FermatMind · 费马测试
        </h1>
        <p className="mt-3 text-[var(--fm-text-muted)]">
          Scientific self-assessments and personality insights in Chinese and English.
        </p>
        <p className="mt-1 text-[var(--fm-text-muted)]">
          科学自我测评与人格洞察，支持中文与英文。
        </p>

        <LocaleGatewayButtons preferred={preferred} />
      </div>
    </main>
  );
}
