import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
  listItems?: string[];
  emailLinkIndexes?: number[];
};

type PrivacyCopy = {
  legalKicker: string;
  sections: PrivacySection[];
};

const EFFECTIVE_DATE = "March 3, 2026";
const EFFECTIVE_DATE_ZH = "2026年3月3日";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";

const PRIVACY_COPY: Record<"en" | "zh", PrivacyCopy> = {
  en: {
    legalKicker: "Legal",
    sections: [
      {
        id: "introduction",
        title: "1. Introduction",
        paragraphs: [
          "FermatMind (\"the Company,\" \"we,\" \"us,\" or \"our\") operates the Fermat Assessment Platform. We are committed to protecting your privacy and handling personal information responsibly. This Privacy Policy explains how we collect, use, disclose, retain, and protect information through our website and, where available, our mobile applications and AI-powered assessment services (collectively, the \"Services\").",
        ],
      },
      {
        id: "information-we-collect",
        title: "2. Information We Collect",
        paragraphs: [
          "We may collect the following categories of information:",
        ],
        listItems: [
          "Information you provide directly: for example, contact details you submit for support, order lookup details (such as order number and purchase email), and any information you voluntarily provide in forms or communications. If account/profile features are available, this may also include account and profile information.",
          "Assessment data: your responses, progress, and generated results/reports when you complete personality or cognitive assessments.",
          "Technical and usage data: device/browser information, IP address, interaction logs, anonymous identifiers, and cookie-related signals used for reliability, security, and service optimization.",
        ],
      },
      {
        id: "how-we-use-information",
        title: "3. How We Use Information",
        paragraphs: [
          "We use information to:",
        ],
        listItems: [
          "Provide and operate the Services, including assessment delivery, report generation, order support, and customer service.",
          "Maintain service quality, monitor performance, troubleshoot incidents, and improve product experience.",
          "Detect, prevent, and investigate abuse, fraud, and security risks.",
          "Meet legal, regulatory, accounting, and compliance obligations.",
        ],
      },
      {
        id: "ai-and-data-processing",
        title: "4. AI and Data Processing",
        paragraphs: [
          "FermatMind uses AI and algorithmic systems to generate structured assessment insights.",
        ],
        listItems: [
          "Analysis: assessment-related data is processed to produce personalized outputs and reports.",
          "Improvement: we may use de-identified and aggregated data to evaluate and improve model quality and scoring consistency.",
          "Model training boundary: we do not provide directly identifying personal information to third-party public model training without your explicit opt-in consent.",
        ],
      },
      {
        id: "how-we-share-information",
        title: "5. How We Share Information",
        paragraphs: [
          "We do not sell personal information.",
          "We share personal information only when necessary and only with:",
        ],
        listItems: [
          "Service providers and infrastructure partners (for example, cloud hosting, payment, email, analytics, and AI API providers) under contractual controls.",
          "Legal or regulatory authorities when required by law, court order, subpoena, or similar lawful process.",
          "Relevant parties in a merger, acquisition, financing, or similar corporate transaction, subject to continued protection requirements.",
        ],
      },
      {
        id: "data-retention-and-security",
        title: "6. Data Retention and Security",
        paragraphs: [
          "We retain information only for as long as reasonably necessary for service delivery, legitimate business needs, legal obligations, dispute resolution, and fraud prevention, after which data is deleted, anonymized, or de-identified where appropriate.",
          "We apply industry-standard safeguards such as encryption in transit (SSL/TLS), access controls, and operational security measures. No security method is absolutely foolproof.",
        ],
      },
      {
        id: "international-processing-and-compliance",
        title: "7. International Processing and Compliance",
        paragraphs: [
          "Because we may serve users across regions, information may be processed in jurisdictions other than your own, with appropriate safeguards as required by applicable law.",
          "Our privacy program is designed to align with major data protection principles reflected in regulations such as GDPR, CCPA/CPRA, and PIPL, to the extent applicable.",
        ],
      },
      {
        id: "your-rights-and-choices",
        title: "8. Your Rights and Choices",
        paragraphs: [
          "Depending on your location and applicable law, you may have rights to access, correct, export, restrict, object to certain processing, or request deletion of your personal information.",
          "To protect user security, we may verify your identity before fulfilling requests. In specific cases, we may retain limited data where required or permitted by law (for example, accounting, anti-fraud, or legal compliance obligations).",
          "For analytics cookies/tracking, you can manage consent choices in the product where available.",
        ],
      },
      {
        id: "medical-scope-disclaimer",
        title: "9. Medical Scope Disclaimer",
        paragraphs: [
          "FermatMind reports are not a medical diagnosis and do not constitute medical advice.",
        ],
      },
      {
        id: "contact-us-and-policy-updates",
        title: "10. Contact Us and Policy Updates",
        paragraphs: [
          "If you have privacy questions or want to submit a rights request, contact:",
          "",
          "We may update this Privacy Policy from time to time. Material updates will be reflected by updating the \"Last Updated\" date.",
        ],
        emailLinkIndexes: [1],
      },
    ],
  },
  zh: {
    legalKicker: "法律信息",
    sections: [
      {
        id: "introduction",
        title: "1. 引言",
        paragraphs: [
          "FermatMind（费马测评，以下简称“公司”或“我们”）运营费马测评平台。我们致力于保护您的隐私，并以负责任的方式处理个人信息。本隐私政策说明我们如何通过网站，以及在可用情况下的移动应用与 AI 驱动测评服务（以下统称“服务”）收集、使用、披露、保存并保护您的信息。",
        ],
      },
      {
        id: "information-we-collect",
        title: "2. 我们收集的信息",
        paragraphs: [
          "我们可能收集以下类型的信息：",
        ],
        listItems: [
          "您主动提供的信息：例如您在客服沟通中提交的联系方式、订单查询信息（如订单号和购买邮箱），以及您在表单或沟通中自愿提供的信息。若相关版本提供账户/资料功能，还可能包括账户与资料信息。",
          "测评数据：您在完成人格或认知测评时的作答内容、作答进度及生成的结果/报告信息。",
          "技术与使用数据：用于保障稳定性、安全性与服务优化的设备/浏览器信息、IP 地址、交互日志、匿名标识符及 Cookie 相关信号。",
        ],
      },
      {
        id: "how-we-use-information",
        title: "3. 信息使用目的",
        paragraphs: [
          "我们使用信息以：",
        ],
        listItems: [
          "提供并运行服务，包括测评交付、报告生成、订单支持与客户服务。",
          "维护服务质量、监测性能、排查故障并优化产品体验。",
          "识别、预防并调查滥用、欺诈与安全风险。",
          "履行法律、监管、审计、财务和合规义务。",
        ],
      },
      {
        id: "ai-and-data-processing",
        title: "4. AI 与数据处理",
        paragraphs: [
          "FermatMind 使用 AI 与算法系统生成结构化测评洞察。",
        ],
        listItems: [
          "分析：测评相关数据会被处理，用于生成个性化输出与报告。",
          "优化：我们可能使用去标识化、汇总后的数据评估并改进模型质量与评分一致性。",
          "训练边界：未经您明确“主动同意（opt-in）”，我们不会向第三方公共模型训练提供可直接识别个人身份的信息。",
        ],
      },
      {
        id: "how-we-share-information",
        title: "5. 信息共享",
        paragraphs: [
          "我们不会出售个人信息。",
          "仅在必要场景下，我们才会向以下对象共享：",
        ],
        listItems: [
          "为服务提供支持的合作方与基础设施供应商（如云服务、支付、邮件、分析与 AI API 服务商），并受合同约束。",
          "依法有权机关：在法律法规、法院命令、传票或其他合法程序要求下。",
          "业务交易相关方：如并购、融资或类似交易中，在持续保护要求下进行必要的数据交接。",
        ],
      },
      {
        id: "data-retention-and-security",
        title: "6. 数据保存与安全",
        paragraphs: [
          "我们仅在实现服务目的、满足合理业务需求、履行法律义务、处理争议与防范欺诈所必需的期限内保存数据；到期后将视情况删除、匿名化或去标识化处理。",
          "我们采取行业通行安全措施（如传输加密 SSL/TLS、访问控制与运维安全措施）保护数据，但任何安全机制都无法保证绝对 100% 无风险。",
        ],
      },
      {
        id: "international-processing-and-compliance",
        title: "7. 跨境处理与合规",
        paragraphs: [
          "鉴于服务可能面向不同地区用户，信息可能在您所在法域之外处理，并在适用法律要求下采取相应保障措施。",
          "我们的隐私治理体系按适用情形对齐 GDPR、CCPA/CPRA、PIPL 等主要数据保护原则。",
        ],
      },
      {
        id: "your-rights-and-choices",
        title: "8. 您的权利与选择",
        paragraphs: [
          "根据您所在地区及适用法律，您可能享有访问、更正、导出、限制处理、反对特定处理或删除个人信息等权利。",
          "为保障账户与数据安全，我们可能在处理请求前进行身份核验。在特定情况下，若法律要求或允许（如财务记账、防欺诈、合规留存），我们可能保留部分必要数据。",
          "对于分析类 Cookie/追踪，您可在产品内可用的同意机制中管理授权选择。",
        ],
      },
      {
        id: "medical-scope-disclaimer",
        title: "9. 非医疗免责声明",
        paragraphs: [
          "FermatMind 报告不是医疗诊断，也不构成医疗建议。",
        ],
      },
      {
        id: "contact-us-and-policy-updates",
        title: "10. 联系我们与政策更新",
        paragraphs: [
          "如您有隐私问题或需提交权利请求，请联系：",
          "",
          "我们可能不时更新本政策，重大更新将通过“最近更新日期”体现。",
        ],
        emailLinkIndexes: [1],
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return buildPageMetadata({
    locale,
    pathname: isZh ? "/zh/privacy" : "/en/privacy",
    title: isZh ? "隐私政策" : "Privacy Policy",
    description: isZh
      ? "了解 FermatMind 如何收集、使用、共享与删除数据。"
      : "How FermatMind collects, uses, shares, and deletes data.",
    alternatesByLocale: {
      en: "/en/privacy",
      zh: "/zh/privacy",
      xDefault: "/",
    },
  });
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
  const copy = isZh ? PRIVACY_COPY.zh : PRIVACY_COPY.en;

  return (
    <Container as="main" className="max-w-4xl space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {copy.legalKicker}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {dict.legal.privacy_title}
        </h1>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {dict.legal.effectiveDateLabel}: {isZh ? EFFECTIVE_DATE_ZH : EFFECTIVE_DATE}
        </p>
      </section>

      <article className="prose max-w-none rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)] prose-headings:font-serif prose-headings:text-[var(--fm-text)] prose-p:text-[var(--fm-text-muted)] prose-li:text-[var(--fm-text-muted)] prose-strong:text-[var(--fm-text)] prose-a:text-[var(--fm-accent)]">
        {copy.sections.map((section) => (
          <section key={section.id}>
            <h2 id={section.id}>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => {
              const shouldRenderEmail = section.emailLinkIndexes?.includes(index) ?? false;
              if (shouldRenderEmail) {
                return (
                  <p key={`${section.id}-email-${index}`}>
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                  </p>
                );
              }

              return (
                <p key={`${section.id}-p-${index}`}>
                  {paragraph}
                </p>
              );
            })}
            {section.listItems ? (
              <ul>
                {section.listItems.map((item) => (
                  <li key={`${section.id}-li-${item}`}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </Container>
  );
}
