import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

const EFFECTIVE_DATE = "February 15, 2026";
const EFFECTIVE_DATE_ZH = "2026年2月15日";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const canonical = localizedPath("/privacy", locale);

  return {
    title: locale === "zh" ? "隐私政策" : "Privacy Policy",
    description:
      locale === "zh"
        ? "了解 FermatMind 如何收集、使用、共享与删除数据。"
        : "How FermatMind collects, uses, shares, and deletes data.",
    alternates: { canonical },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const isZh = locale === "zh";

  return (
    <Container as="main" className="max-w-4xl space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          Legal
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {dict.legal.privacy_title}
        </h1>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {dict.legal.effectiveDateLabel}: {isZh ? EFFECTIVE_DATE_ZH : EFFECTIVE_DATE}
        </p>
      </section>

      <article className="prose max-w-none rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)] prose-headings:font-serif prose-headings:text-[var(--fm-text)] prose-p:text-[var(--fm-text-muted)] prose-li:text-[var(--fm-text-muted)] prose-strong:text-[var(--fm-text)] prose-a:text-[var(--fm-accent)]">
        <h2 id="scope">{isZh ? "1. 收集范围" : "1. What We Collect"}</h2>
        <ul>
          <li>
            {isZh
              ? "账户标识、匿名标识、设备与浏览器基础信息。"
              : "Account identifiers, anonymous identifiers, and basic device/browser signals."}
          </li>
          <li>
            {isZh
              ? "测评过程数据（题目进度、订单号、支付状态、交付状态）。"
              : "Assessment flow data (progress, order number, payment status, delivery status)."}
          </li>
          <li>
            {isZh
              ? "经同意后采集的分析事件，用于稳定性与转化优化。"
              : "Consent-based analytics events for reliability and conversion optimization."}
          </li>
        </ul>

        <h2 id="usage">{isZh ? "2. 使用目的" : "2. How We Use Data"}</h2>
        <ul>
          <li>{isZh ? "生成测评结果与报告交付。" : "Generate assessment results and report delivery."}</li>
          <li>{isZh ? "支付风控、对账、退款与客服处理。" : "Payment risk control, reconciliation, refund, and support workflows."}</li>
          <li>{isZh ? "满足法律、审计与防欺诈要求。" : "Meet legal, auditing, and anti-fraud obligations."}</li>
        </ul>

        <h2 id="sharing">{isZh ? "3. 对外共享" : "3. Sharing"}</h2>
        <p>
          {isZh
            ? "我们仅在提供服务所必需时与支付、邮件、云基础设施供应商共享最小必要信息。"
            : "We only share the minimum required data with payment, email, and cloud infrastructure providers to deliver the service."}
        </p>

        <h2 id="retention">{isZh ? "4. 保存期限" : "4. Retention"}</h2>
        <p>
          {isZh
            ? "数据仅在业务、合规与防欺诈需要范围内保留，到期后进行删除或匿名化。"
            : "Data is retained only for operational, compliance, and anti-fraud purposes, then deleted or anonymized."}
        </p>

        <h2 id="rights">{isZh ? "5. 用户权利与删除通道" : "5. User Rights and Deletion Channel"}</h2>
        <p>{dict.legal.deletionChannel}</p>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>

        <h2 id="disclaimer">{isZh ? "6. 非医疗免责声明" : "6. Medical Disclaimer"}</h2>
        <p>{dict.legal.medical_disclaimer}</p>
      </article>
    </Container>
  );
}
