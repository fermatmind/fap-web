import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function CareerMinimalShell({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";

  return (
    <main className="fm-page-background min-h-screen text-[var(--fm-text)]" data-testid="career-minimal-shell">
      <Container className="flex min-h-screen max-w-3xl flex-col justify-center gap-6 py-16">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-accent)]">
          FermatMind
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold leading-tight md:text-5xl">
          {isZh ? "职业中心暂时不可用" : "Career center is temporarily unavailable"}
        </h1>
        <p className="m-0 max-w-2xl text-base leading-7 text-[var(--fm-text-muted)]">
          {isZh
            ? "你仍然可以继续进入核心 MBTI 测评。"
            : "You can still continue to the core MBTI assessment."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={localizedPath("/tests/mbti-personality-test-16-personality-types", locale)}
            className="rounded-full bg-[var(--fm-text)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fm-accent)]"
          >
            {isZh ? "打开 MBTI 测试" : "Open MBTI test"}
          </Link>
          <Link
            href={localizedPath("/tests", locale)}
            className="rounded-full border border-[var(--fm-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
          >
            {isZh ? "查看全部测评" : "Browse all tests"}
          </Link>
        </div>
      </Container>
    </main>
  );
}
