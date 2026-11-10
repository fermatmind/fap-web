import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportCenter } from "@/components/support/SupportCenter";
import { getContentPage } from "@/lib/cms/content-pages";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { getHelpGatewaySurface } from "@/lib/publicGateway";
import { helpQuestionsFromCms, helpTopicFor, type HelpEntry } from "@/lib/support/helpCenter";

const helpSlugs = ["faq", "about", "team", "used-and-mentioned", "for-business-and-research", "contact"];
const toolPaths = {
  order_lookup: "/zh/orders/lookup",
  email_preferences: "/zh/email/preferences",
  unsubscribe: "/zh/email/unsubscribe",
  privacy_data: "/zh/privacy",
};

async function readSupportLanding() {
  const landing = (await getHelpGatewaySurface("zh-TW"))?.landingSurface;
  const hero = landing?.summaryBlocks.find(block => block.key === "help_home");
  if (!landing || !hero?.title || !hero.body) notFound();

  const cards = helpSlugs.map(slug =>
    landing.discoverabilityItems.find(item => item.key === slug && item.href === `/zh/help/${slug}` && item.title && item.summary));
  const tools = Object.entries(toolPaths).map(([key, path]) =>
    landing.ctaBundle.find(tool => tool.key === key && tool.href === path));
  if (cards.some(card => !card) || tools.some(tool => !tool)) notFound();

  return { hero, cards: cards.filter(card => card !== undefined), tools: tools.filter(tool => tool !== undefined) };
}

function displayLink(path: string, label: string) {
  const localized = traditionalPath(path);
  return localized ? { href: localized, title: label } : { href: path, title: `${label}（簡體中文）` };
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { hero } = await readSupportLanding();
  return {
    title: hero.title,
    description: hero.body,
    robots: { index: false, follow: true },
    alternates: { canonical: "/zh-TW/support" },
  };
}

export default async function TraditionalSupportPage() {
  const [{ hero, cards, tools: gatewayTools }, faqPage, contactPage] = await Promise.all([
    readSupportLanding(),
    getContentPage("help-faq", "zh-TW"),
    getContentPage("help-contact", "zh-TW"),
  ]);
  if (!faqPage || !contactPage) notFound();

  const questions = helpQuestionsFromCms(faqPage);
  if (!questions.length) notFound();
  const tools = gatewayTools.map(tool => {
    const { href, title } = displayLink(tool.href, tool.label);
    return { ...tool, href, label: title };
  });
  const contact = cards.find(item => item.key === "contact");
  const entries: HelpEntry[] = [
    { key: "pricing", ...displayLink("/zh/pricing", "價格與報告內容"), summary: "MBTI 單次深度報告的計畫價格與交付範圍，目前尚未開賣。", topic: "orders", kind: "article" },
    { key: "refund_policy", ...displayLink("/zh/help/payment-refund", "退款與取消政策"), summary: "", topic: "orders", kind: "article" },
    { key: "result_lookup", href: "/zh-TW/results/lookup", title: "找回已儲存的結果", summary: "使用儲存結果時填寫的電子郵件地址查詢。", topic: "results", kind: "tool" },
    ...tools.map((tool): HelpEntry => ({
      key: tool.key, title: tool.label, summary: "", href: tool.href, topic: helpTopicFor(tool.key), kind: "tool",
    })),
    ...cards.map((card): HelpEntry => ({
      key: card.key, ...displayLink(card.href, card.title), summary: card.summary, topic: helpTopicFor(card.key), kind: "article",
    })),
    { key: "method_boundaries", href: "/zh-TW/method-boundaries", title: "測評方法與使用範圍", summary: "了解測評能提供哪些參考，以及如何理解結果。", topic: "assessments", kind: "article" },
  ];
  const supportEmail = contactPage.supportContact;
  return <>
    <SupportCenter
      locale="zh-TW" title={hero.title} entries={entries} questions={questions} tools={tools}
      contactHref={contact ? displayLink(contact.href, contact.title).href : null}
      contactLabel={contact?.title ?? null}
      contactLink={supportEmail && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(supportEmail)
        ? <a href={`mailto:${supportEmail}`} className="inline-flex min-h-11 items-center gap-4 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#203c66]">{supportEmail}<ArrowUpRight size={17} aria-hidden /></a>
        : null}
    />
    <nav aria-label="頁面語言" className="mt-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/support" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/support" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
  </>;
}
