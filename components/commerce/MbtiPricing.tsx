import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function mbtiPricingCopy(locale: Locale) {
  return locale === "zh" ? {
    title: "MBTI 报告价格与内容",
    description: "基础结果免费；了解 MBTI 单次深度报告的计划价格、包含内容和退款政策。",
    name: "MBTI 单次深度报告",
    status: "计划价格 · 尚未开售",
    price: "中国大陆 ¥9.99／次 · 海外 US$1.99／次",
    billing: "单次购买，不自动续费。台湾地区同样按 US$1.99 定价。",
    notice: "目前正式收费尚未开启。基础结果继续免费，历史已购买权益保留。",
    link: "查看价格、报告内容与退款说明",
    freeTitle: "基础结果继续免费",
    freeBody: "基础结果和解释继续免费。深度报告是计划开放的可选单次购买，正式开放前不要求付款。历史已购买权益按原订单范围保留。",
    includesTitle: "计划解锁什么",
    includes: ["对应本次测评的人格特质扩展解读", "职业探索、个人成长和关系情境的阅读与应用建议", "在网站中查看对应次测评的数字报告"],
    scope: "购买对象是对应次测评的深度报告，不是全部测评的会员或订阅。历史订单的权益按原购买范围保留；已有权益无需重复购买。测评和建议用于自我探索，不替代专业判断。",
    currencyTitle: "价格、付款与交付",
    currency: "中国大陆保留本地支付宝渠道；海外计划通过 Waffo Pancake 收款。台湾按美元基准定价，实际支持的付款币种、换算金额及适用税费会在确认付款前展示。当前没有开放购买或真实扣款入口。",
    delivery: "正式开放后，付款经服务端确认后为对应次测评解锁在线报告。若已付款但未解锁，请先查询订单并联系支持，不要重复付款。",
    policyTitle: "购买前先阅读",
    refund: "退款与取消政策",
    terms: "使用条款",
    support: "订单查询与支持",
    test: "免费开始 MBTI 测试",
  } : {
    title: "MBTI report pricing and contents",
    description: "Basic results stay free. See the planned one-time MBTI in-depth report price, contents and refund policy.",
    name: "One-time MBTI in-depth report",
    status: "Planned pricing · Not on sale yet",
    price: "Mainland China ¥9.99 per report · Overseas US$1.99 per report",
    billing: "One-time purchase. No automatic renewal. Taiwan is also priced at US$1.99.",
    notice: "Live charging is not enabled. Basic results remain free and existing paid entitlements are preserved.",
    link: "View pricing, report contents and refund information",
    freeTitle: "Basic results remain free",
    freeBody: "Basic results and explanations remain free. The in-depth report is a planned optional one-time purchase; no payment is required before sales open. Existing paid access keeps its original scope.",
    includesTitle: "What the planned purchase includes",
    includes: ["Extended personality-trait explanations for this assessment", "Reading and application suggestions for career exploration, personal growth and relationships", "Online access to the digital report for this assessment"],
    scope: "The purchase covers the in-depth report for one assessment, not membership or a subscription to all tests. Previous orders keep their original scope of access; existing access does not require another purchase. Assessments and suggestions support self-exploration and do not replace professional judgment.",
    currencyTitle: "Pricing, payment and delivery",
    currency: "Mainland China keeps its local Alipay channel; overseas payments are planned through Waffo Pancake. Taiwan uses the USD base price. Supported checkout currencies, converted totals and applicable taxes will be shown before payment confirmation. No purchase or live payment entry is currently open.",
    delivery: "After sales open, server-confirmed payment unlocks the online report for the corresponding assessment. If you have paid but access is missing, look up the order and contact support rather than paying again.",
    policyTitle: "Read before purchasing",
    refund: "Refund and cancellation policy",
    terms: "Terms of service",
    support: "Order lookup and support",
    test: "Start the free MBTI assessment",
  };
}

export function MbtiPricingNotice({ locale }: { locale: Locale }) {
  const copy = mbtiPricingCopy(locale);
  return (
    <aside data-testid="mbti-pricing-notice" className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
      <p className="m-0 font-semibold">{copy.price}</p>
      <p className="m-0">{copy.status} · {copy.billing}</p>
      <p className="m-0">{copy.notice}</p>
      <Link prefetch={false} href={localizedPath("/pricing", locale)} className="inline-block font-semibold text-blue-800 underline underline-offset-4">{copy.link}</Link>
    </aside>
  );
}

export function MbtiPricingDetails({ locale }: { locale: Locale }) {
  const copy = mbtiPricingCopy(locale);
  return (
    <div className="space-y-8" data-testid="mbti-pricing-details">
      <header className="space-y-3">
        <p className="m-0 text-sm font-semibold text-blue-800">{copy.status}</p>
        <h1 className="m-0 text-3xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="m-0 leading-7 text-slate-600">{copy.notice}</p>
      </header>
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="m-0 text-xl font-semibold">{copy.freeTitle}</h2>
        <p className="m-0 leading-7">{copy.freeBody}</p>
        <Link href={localizedPath("/tests/mbti-personality-test-16-personality-types", locale)} className="inline-block font-semibold text-blue-800 underline underline-offset-4">{copy.test}</Link>
      </section>
      <section className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/40 p-6">
        <h2 className="m-0 text-2xl font-semibold">{copy.name}</h2>
        <p className="m-0 text-lg font-semibold">{copy.price}</p>
        <p className="m-0 leading-7">{copy.billing}</p>
        <h3 className="m-0 pt-2 text-lg font-semibold">{copy.includesTitle}</h3>
        <ul className="list-disc space-y-2 pl-5">{copy.includes.map(item => <li key={item}>{item}</li>)}</ul>
        <p className="m-0 leading-7">{copy.scope}</p>
      </section>
      <section className="space-y-3">
        <h2 className="m-0 text-xl font-semibold">{copy.currencyTitle}</h2>
        <p className="m-0 leading-7">{copy.currency}</p>
        <p className="m-0 leading-7">{copy.delivery}</p>
      </section>
      <nav aria-label={copy.policyTitle} className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="m-0 text-xl font-semibold">{copy.policyTitle}</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-3 font-semibold text-blue-800 underline underline-offset-4">
          <li><Link href={localizedPath("/help/payment-refund", locale)}>{copy.refund}</Link></li>
          <li><Link href={localizedPath("/terms", locale)}>{copy.terms}</Link></li>
          <li><Link href={localizedPath("/support", locale)}>{copy.support}</Link></li>
        </ul>
      </nav>
    </div>
  );
}
