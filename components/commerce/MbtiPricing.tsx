import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";

export function mbtiPricingCopy(locale: DisplayLocale) {
  if (locale === "zh-TW") {
    return {
      title: "測評報告價格與內容",
      description: "基礎結果免費；了解測評完整報告的單次價格、付款方式與退款政策。",
      name: "單次測評深度報告",
      status: "單次購買 · 無需登入",
      price: "微信／支付寶 ¥2.99／次 · 銀行卡 US$2.99／次",
      billing: "單次購買，不會自動續訂。簡體、繁體與英文使用相同價格。",
      notice: "基礎結果繼續免費，完整報告可選付費解鎖。無需註冊或登入，過往已購買的權益保留。",
      link: "檢視價格、報告內容與退款說明",
      freeTitle: "基礎結果繼續免費",
      freeBody: "免費完成測試並查看基礎結果，再決定是否購買本次完整報告。不同測評提供不同內容，請先確認結果頁的解鎖說明。過往權益按原訂單範圍保留。",
      includesTitle: "購買範圍",
      includes: ["對應本次作答與所選題本的完整報告","該測評已有的解讀與應用章節，以結果頁說明為準","在網站中檢視該次測評的數位報告"],
      scope: "單次購買適用於該次測評的深度報告，不是全部測評的會員或訂閱。歷史訂單的權益按原購買範圍保留；已有權益無需重複購買。測評和建議用於自我探索，不替代專業判斷。",
      currencyTitle: "價格、付款與交付",
      currency: "支援微信、支付寶及海外銀行卡，無需註冊或登入。微信及銀行卡透過 Waffo Pancake 收款，實際可用管道、幣種和總額會在付款前顯示。發卡機構可能換算為本幣結算。",
      delivery: "伺服器確認付款後，會解鎖該次測評的線上報告。若已付款但未解鎖，請先查詢原訂單，不要重複付款。可在結果頁或訂單頁申請退款；審核通過後原路退款並收回該筆報告的付費權限。",
      policyTitle: "購買前先閱讀",
      refund: "退款與取消政策",
      terms: "使用條款",
      support: "訂單查詢與支援",
      test: "開始免費測試",
    };
  }
  return locale === "zh" ? {
    title: "测评报告价格与内容",
    description: "基础结果免费；了解测评完整报告的单次价格、付款方式与退款政策。",
    name: "单次测评深度报告",
    status: "单次购买 · 无需登录",
    price: "微信／支付宝 ¥2.99／次 · 银行卡 US$2.99／次",
    billing: "单次购买，不自动续费。简体、繁体与英文使用相同价格。",
    notice: "基础结果继续免费，完整报告可选付费解锁。无需注册或登录，历史已购买权益保留。",
    link: "查看价格、报告内容与退款说明",
    freeTitle: "基础结果继续免费",
    freeBody: "免费完成测试并查看基础结果，再决定是否购买本次完整报告。不同测评提供不同内容，请先确认结果页的解锁说明。历史权益按原订单范围保留。",
    includesTitle: "购买范围",
    includes: ["对应本次作答与所选题本的完整报告", "该测评已有的解读与应用章节，以结果页说明为准", "在网站中查看对应次测评的数字报告"],
    scope: "购买对象是对应次测评的深度报告，不是全部测评的会员或订阅。历史订单的权益按原购买范围保留；已有权益无需重复购买。测评和建议用于自我探索，不替代专业判断。",
    currencyTitle: "价格、付款与交付",
    currency: "支持微信、支付宝及海外银行卡，无需注册或登录。微信及银行卡通过 Waffo Pancake 收款，实际可用渠道、币种和总额会在付款前展示。发卡机构可能换算为本币结算。",
    delivery: "付款经服务端确认后为对应次测评解锁在线报告。若已付款但未解锁，请先查询原订单，不要重复付款。可在结果页或订单页申请退款；审核通过后原路退款并收回该笔报告的付费权限。",
    policyTitle: "购买前先阅读",
    refund: "退款与取消政策",
    terms: "使用条款",
    support: "订单查询与支持",
    test: "开始免费测试",
  } : {
    title: "Assessment report pricing and contents",
    description: "Basic results are free. See one-time full-report prices, payment methods and the refund policy.",
    name: "One-time assessment report",
    status: "One-time purchase · No sign-in required",
    price: "WeChat / Alipay ¥2.99 per report · Cards US$2.99 per report",
    billing: "One-time purchase. No automatic renewal. The same prices apply in Simplified Chinese, Traditional Chinese and English.",
    notice: "Basic results remain free; full reports are optional paid purchases. No registration or sign-in is required. Existing paid entitlements are preserved.",
    link: "View pricing, report contents and refund information",
    freeTitle: "Basic results remain free",
    freeBody: "Complete the assessment and view basic results for free, then decide whether to purchase the full report for this attempt. Contents differ by assessment; check the result-page description before paying. Existing paid access keeps its original scope.",
    includesTitle: "What the purchase covers",
    includes: ["The full report for this attempt and questionnaire version", "The assessment’s available readings and application chapters, as described on its result page", "Online access to the digital report for this assessment"],
    scope: "The purchase covers the in-depth report for one assessment, not membership or a subscription to all tests. Previous orders keep their original scope of access; existing access does not require another purchase. Assessments and suggestions support self-exploration and do not replace professional judgment.",
    currencyTitle: "Pricing, payment and delivery",
    currency: "Pay with WeChat Pay, Alipay or an international card without registration or sign-in. WeChat and card payments use Waffo Pancake. Available channels, currencies and totals are shown before payment. Your card issuer may convert the charge to your local currency.",
    delivery: "Server-confirmed payment unlocks the online report for that attempt. If access is missing after payment, check the original order instead of paying again. Request a refund from the result or order page; approved refunds return to the original payment method and revoke the associated paid access.",
    policyTitle: "Read before purchasing",
    refund: "Refund and cancellation policy",
    terms: "Terms of service",
    support: "Order lookup and support",
    test: "Start a free assessment",
  };
}

export function MbtiPricingNotice({ locale }: { locale: DisplayLocale }) {
  const copy = mbtiPricingCopy(locale);
  return (
    <aside data-testid="mbti-pricing-notice" className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
      <p className="m-0 font-semibold">{copy.price}</p>
      <p className="m-0">{copy.status} · {copy.billing}</p>
      <p className="m-0">{copy.notice}</p>
      <Link prefetch={false} href={locale === "zh-TW" ? "/zh-TW/pricing" : localizedPath("/pricing", locale)} className="inline-block font-semibold text-blue-800 underline underline-offset-4">{copy.link}</Link>
    </aside>
  );
}

export function MbtiPricingDetails({ locale }: { locale: DisplayLocale }) {
  const copy = mbtiPricingCopy(locale);
  function destination(path: string, label: string) {
    const href = localizedPath(path, locale === "zh-TW" ? "zh" : locale);
    if (locale !== "zh-TW") return { href, label };
    const traditional = traditionalPath(href);
    return traditional ? { href: traditional, label } : { href, label: `${label}（簡體中文）` };
  }
  const testPath = "/tests";
  const test = locale === "zh-TW"
    ? { href: `/zh-TW${testPath}`, label: copy.test }
    : destination(testPath, copy.test);
  const policyLinks = [destination("/support/payment-refund", copy.refund), destination("/terms", copy.terms), destination("/support", copy.support)];
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
        <Link href={test.href} className="inline-block font-semibold text-blue-800 underline underline-offset-4">{test.label}</Link>
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
          {policyLinks.map(({ href, label }) => <li key={href}><Link href={href}>{label}</Link></li>)}
        </ul>
      </nav>
    </div>
  );
}

export function MbtiPricingPageContent({ locale }: { locale: DisplayLocale }) {
  return (
    <Container as="main" className="max-w-4xl py-12 text-slate-700">
      <MbtiPricingDetails locale={locale} />
    </Container>
  );
}
