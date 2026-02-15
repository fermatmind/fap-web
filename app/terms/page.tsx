import type { Metadata } from "next";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

const EFFECTIVE_DATE = "February 15, 2026";
const EFFECTIVE_DATE_ZH = "2026年2月15日";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const canonical = localizedPath("/terms", locale);

  return {
    title: locale === "zh" ? "服务条款" : "Terms of Service",
    description:
      locale === "zh"
        ? "使用 FermatMind 服务前请阅读本条款。"
        : "Terms governing your use of FermatMind services.",
    alternates: { canonical },
  };
}

export default async function TermsPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const dict = getDictSync(locale);
  const isZh = locale === "zh";

  return (
    <Container as="main" className="max-w-3xl py-10">
      <article className="prose prose-neutral max-w-none">
        <h1>{dict.legal.terms_title}</h1>
        <p>
          {dict.legal.effectiveDateLabel}: {isZh ? EFFECTIVE_DATE_ZH : EFFECTIVE_DATE}
        </p>

        <h2 id="service">{isZh ? "1. 服务说明" : "1. Service Scope"}</h2>
        <p>
          {isZh
            ? "FermatMind 提供用于自我认知的测评与报告服务，结果仅供参考。"
            : "FermatMind provides assessments and reports for self-discovery and educational use."}
        </p>

        <h2 id="payment">{isZh ? "2. 支付与订单" : "2. Payments and Orders"}</h2>
        <p>
          {isZh
            ? "你需要提供真实订单信息并遵守支付机构规则。异常支付或欺诈行为可能导致订单冻结或拒绝服务。"
            : "You must provide accurate order information and comply with payment network rules. Fraudulent activity may lead to order hold or service rejection."}
        </p>

        <h2 id="refund">{isZh ? "3. 退款条款" : "3. Refund Terms"}</h2>
        <p>
          {isZh
            ? "退款窗口、例外条款与处理时效以退款政策页为准。"
            : "Refund windows, exceptions, and handling timelines are defined by the refund policy page."}
        </p>

        <h2 id="liability">{isZh ? "4. 责任限制" : "4. Limitation of Liability"}</h2>
        <p>
          {isZh
            ? "在法律允许范围内，服务按“现状”基础提供。"
            : "To the extent permitted by law, the service is provided on an \"as is\" basis."}
        </p>

        <h2 id="disclaimer">{isZh ? "5. 非医疗免责声明" : "5. Medical Disclaimer"}</h2>
        <p>{dict.legal.medical_disclaimer}</p>

        <h2 id="contact">{isZh ? "6. 联系方式" : "6. Contact"}</h2>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </article>
    </Container>
  );
}
