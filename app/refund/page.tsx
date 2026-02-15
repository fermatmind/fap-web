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
  const canonical = localizedPath("/refund", locale);

  return {
    title: locale === "zh" ? "退款政策" : "Refund Policy",
    description:
      locale === "zh"
        ? "查看退款窗口、例外条款与处理流程。"
        : "Refund eligibility, exceptions, and processing flow.",
    alternates: { canonical },
  };
}

export default async function RefundPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const dict = getDictSync(locale);
  const isZh = locale === "zh";

  return (
    <Container as="main" className="max-w-3xl py-10">
      <article className="prose prose-neutral max-w-none">
        <h1>{dict.legal.refund_title}</h1>
        <p>
          {dict.legal.effectiveDateLabel}: {isZh ? EFFECTIVE_DATE_ZH : EFFECTIVE_DATE}
        </p>

        <h2 id="window">{isZh ? "1. 退款时间窗口" : "1. Refund Window"}</h2>
        <p>
          {isZh
            ? "通常在支付后 14 天内可申请退款。"
            : "Refund requests are generally accepted within 14 days after payment."}
        </p>

        <h2 id="requirements">{isZh ? "2. 申请所需信息" : "2. Required Information"}</h2>
        <ul>
          <li>{isZh ? "订单号" : "Order number"}</li>
          <li>{isZh ? "购买邮箱或账户标识" : "Purchase email or account identifier"}</li>
          <li>{isZh ? "申请原因简述" : "Short reason for request"}</li>
        </ul>

        <h2 id="exceptions">{isZh ? "3. 例外条款" : "3. Exceptions"}</h2>
        <p>
          {isZh
            ? "以下情形可能拒绝退款：重复欺诈、拒付滥用、条款违规或明显政策规避。"
            : "Refund may be rejected for repeated fraud, chargeback abuse, policy manipulation, or terms violations."}
        </p>

        <h2 id="timeline">{isZh ? "4. 处理与到账" : "4. Processing Timeline"}</h2>
        <p>
          {isZh
            ? "退款通过后通常在 5-10 个工作日原路返回。"
            : "Approved refunds are returned to the original payment method within 5-10 business days."}
        </p>

        <h2 id="contact">{isZh ? "5. 处理路径与联系" : "5. Contact and Resolution"}</h2>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>

        <h2 id="disclaimer">{isZh ? "6. 非医疗免责声明" : "6. Medical Disclaimer"}</h2>
        <p>{dict.legal.medical_disclaimer}</p>
      </article>
    </Container>
  );
}
