import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import {
  formatDailyGivingAmount,
  formatDailyGivingDate,
  type DailyGivingMonth,
  type DailyGivingRecord,
} from "@/lib/foundation/dailyGiving";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type DailyGivingLedgerPageProps = {
  locale: Locale;
  records: DailyGivingRecord[];
  months: DailyGivingMonth[];
  selectedMonth?: string;
};

function copy(locale: Locale) {
  return {
    home: locale === "zh" ? "首页" : "Home",
    foundation: locale === "zh" ? "公共利益" : "Public benefit",
    title: locale === "zh" ? "日常公益记录" : "Daily Giving Ledger",
    eyebrow: locale === "zh" ? "Foundation Daily Giving" : "Foundation Daily Giving",
    summary:
      locale === "zh"
        ? "这里按后端公开 API 展示费马测试的日常公益投入记录。页面不会把用户测试、订单或报告解锁行为解释为捐赠触发。"
        : "This page renders FermatMind daily giving records from the public backend API. Test activity, orders, and report unlocks are not presented as donation triggers.",
    records: locale === "zh" ? "记录" : "Records",
    months: locale === "zh" ? "月度归档" : "Monthly archive",
    emptyTitle: locale === "zh" ? "暂无公开记录" : "No public records yet",
    emptyBody:
      locale === "zh"
        ? "公开 API 当前未返回记录。页面会在后端发布记录后自动展示。"
        : "The public API returned no records. This page will populate when records are published by the backend.",
    amount: locale === "zh" ? "金额" : "Amount",
    recipient: locale === "zh" ? "接收方" : "Recipient",
    date: locale === "zh" ? "日期" : "Date",
    evidence: locale === "zh" ? "凭证" : "Evidence",
    socialPosts: locale === "zh" ? "社交记录" : "Social posts",
    allRecords: locale === "zh" ? "全部记录" : "All records",
    source: locale === "zh" ? "数据来源：后端公开 API" : "Source: backend public API",
  };
}

function MonthArchive({ locale, months, selectedMonth }: { locale: Locale; months: DailyGivingMonth[]; selectedMonth?: string }) {
  const c = copy(locale);

  return (
    <section className="rounded-lg border border-[var(--fm-border)] bg-white p-5" data-testid="daily-giving-months">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{c.months}</h2>
        {selectedMonth ? (
          <Link href={localizedPath("/foundation/daily-giving", locale)} className="text-sm font-medium text-[var(--fm-accent)]">
            {c.allRecords}
          </Link>
        ) : null}
      </div>

      {months.length ? (
        <div className="mt-4 grid gap-2">
          {months.map((month) => (
            <Link
              key={month.yearMonth}
              href={localizedPath(`/foundation/daily-giving/${month.yearMonth}`, locale)}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:border-[var(--fm-accent)]",
                selectedMonth === month.yearMonth ? "border-[var(--fm-accent)] bg-[var(--fm-surface)]" : "border-[var(--fm-border)]"
              )}
            >
              <span className="font-medium text-[var(--fm-text)]">{month.yearMonth}</span>
              <span className="text-[var(--fm-text-muted)]">{month.recordCount}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[var(--fm-text-muted)]">{c.emptyBody}</p>
      )}
    </section>
  );
}

function RecordCard({ locale, record }: { locale: Locale; record: DailyGivingRecord }) {
  const c = copy(locale);

  return (
    <article className="rounded-lg border border-[var(--fm-border)] bg-white p-5" data-testid="daily-giving-record">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">{record.month || record.status}</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--fm-text)]">{record.title}</h2>
        </div>
        <span className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-sm font-medium text-[var(--fm-text)]">
          {formatDailyGivingAmount(record, locale)}
        </span>
      </div>

      {record.description ? <p className="mt-4 text-sm leading-7 text-[var(--fm-text-muted)]">{record.description}</p> : null}

      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div>
          <dt className="text-[var(--fm-text-muted)]">{c.date}</dt>
          <dd className="m-0 font-medium text-[var(--fm-text)]">{formatDailyGivingDate(record.donatedOn, locale)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fm-text-muted)]">{c.recipient}</dt>
          <dd className="m-0 font-medium text-[var(--fm-text)]">
            {record.recipientUrl ? (
              <a href={record.recipientUrl} className="text-[var(--fm-accent)] hover:underline" rel="noopener noreferrer" target="_blank">
                {record.recipientName || record.recipientUrl}
              </a>
            ) : (
              record.recipientName || "-"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--fm-text-muted)]">{c.evidence}</dt>
          <dd className="m-0 font-medium text-[var(--fm-text)]">
            {record.evidenceUrl ? (
              <a href={record.evidenceUrl} className="text-[var(--fm-accent)] hover:underline" rel="noopener noreferrer" target="_blank">
                {c.evidence}
              </a>
            ) : (
              "-"
            )}
          </dd>
        </div>
      </dl>

      {record.socialLinks.length ? (
        <div className="mt-5 border-t border-[var(--fm-border)] pt-4" data-testid="daily-giving-social-links">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">{c.socialPosts}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {record.socialLinks.map((link) => (
              <a
                key={`${link.platform}:${link.url}`}
                href={link.url}
                className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-sm font-medium text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function DailyGivingLedgerPage({ locale, records, months, selectedMonth }: DailyGivingLedgerPageProps) {
  const c = copy(locale);

  return (
    <main className="min-h-screen bg-[var(--fm-surface)] text-[var(--fm-text)]" data-testid="daily-giving-ledger-page">
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: c.home, href: localizedPath("/", locale) },
            { label: c.foundation, href: localizedPath("/foundation", locale) },
            { label: selectedMonth ? `${c.title} ${selectedMonth}` : c.title },
          ]}
        />

        <section className="grid gap-8 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:py-16">
          <div className="max-w-3xl space-y-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">{c.eyebrow}</p>
            <h1 className="m-0 font-serif text-4xl font-semibold leading-tight md:text-6xl">
              {selectedMonth ? `${c.title} ${selectedMonth}` : c.title}
            </h1>
            <p className="m-0 text-lg leading-8 text-[var(--fm-text-muted)] md:text-xl md:leading-9">{c.summary}</p>
          </div>

          <MonthArchive locale={locale} months={months} selectedMonth={selectedMonth} />
        </section>

        <section className="space-y-4" aria-label={c.records}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{c.records}</h2>
              <p className="mt-1 text-sm text-[var(--fm-text-muted)]">{c.source}</p>
            </div>
          </div>

          {records.length ? (
            <div className="grid gap-4">
              {records.map((record) => (
                <RecordCard key={record.code} locale={locale} record={record} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--fm-border)] bg-white p-8" data-testid="daily-giving-empty-state">
              <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{c.emptyTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fm-text-muted)]">{c.emptyBody}</p>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
