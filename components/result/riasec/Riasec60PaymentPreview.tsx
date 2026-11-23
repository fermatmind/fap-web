import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { UnlockReportExperience } from "@/components/career/UnlockReportExperience";
import styles from "@/app/(localized)/[locale]/career/assessment/CareerAssessmentResult.module.css";
import { RiasecReadingReport } from "./RiasecReadingReport";
import { loadRiasec60ReadingDesignModel, loadRiasec60DesignReport } from "./riasec60PreviewData";

export async function Riasec60PaymentPreview({ locale, full = false, reading = false, profile = "IAR" }: { locale: DisplayLocale; full?: boolean; reading?: boolean; profile?: string }) {
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const base = `/${locale}/tests/holland-career-interest-test-riasec/preview`;
  if (reading || full) {
    // The public-facing sample is always the same fictional IAR report.
    // Profile selection is reserved for the separate development reading view.
    const vm = await loadRiasec60ReadingDesignModel(locale, full ? "IAR" : profile);
    return <main className="mx-auto max-w-7xl px-4 pb-12">
      <aside className={styles.previewBanner}>
        <p>{full ? t("示例报告 · 使用固定虚构分数展示；你的报告按实际作答生成。", "示例報告 · 使用固定虛構分數展示；你的報告按實際作答生成。", "Sample report · This fixed fictional example is the same for everyone. Your report is based on your own answers.") : t("本地合成结果 · 当前内容资产 · 不读取真实答卷", "本機合成結果 · 目前內容資產 · 不讀取真實答卷", "Local synthetic results · Current content assets · No real responses are loaded")}</p>
        {!full && <nav className="mt-2 flex flex-wrap justify-center gap-4" aria-label={t("切换分数样例", "切換分數示例", "Score examples")}>
          {[["IAR", "首位并列", "首位並列", "Tied leaders"], ["IAS", "清晰兴趣", "清晰興趣", "Clear interests"], ["LOW", "整体低分", "整體低分", "Lower scores"], ["NEAR", "接近分数", "接近分數", "Close scores"], ["ECR", "其他主型", "其他主型", "Another leading interest"]].map(([key, zh, tw, en]) => <Link key={key} className="underline" href={`${base}?view=reading&profile=${key}`} aria-current={profile === key ? "page" : undefined}>{key} · {t(zh, tw, en)}</Link>)}
        </nav>}
      </aside>
      <RiasecReadingReport viewModel={vm} locale={locale === "en" ? "en" : "zh"} displayLocale={locale} actions={<Link href={base}>{t("返回解锁页", "返回解鎖頁", "Back to the unlock page")}</Link>} />
    </main>;
  }
  const { model, premium, readings, chainReading } = await loadRiasec60DesignReport(locale);
  return <main>
    <aside className={styles.previewBanner}>
      <p>{t("本地预览 · 示例分数 · 支付已停用", "本機預覽 · 示例分數 · 付款已停用", "Local preview · Example scores · Payments disabled")}</p>
      <details className="mt-1 text-xs"><summary className="cursor-pointer">{t("预览价格说明", "預覽價格說明", "Illustrative prices")}</summary><p>{t("展示价沿用职业测试：国内 ¥2.99，海外 US$2.99。正式价格与开通状态以服务端为准。", "展示價格沿用職涯測驗：中國大陸 ¥2.99，海外 US$2.99。正式價格與開通狀態以伺服器為準。", "Illustrative prices follow the career assessment: ¥2.99 in mainland China and US$2.99 internationally. Live prices and availability remain server-controlled.")}</p></details>
      <nav className="mt-2 flex flex-wrap justify-center gap-4" aria-label={t("预览切换", "切換預覽", "Preview views")}>
        <Link className="underline" href={full ? base : `${base}?view=report`}>{full ? t("查看付费入口预览", "查看付費入口預覽", "View the purchase preview") : t("查看完整报告版式", "查看完整報告版型", "View the full report layout")}</Link>
        <Link className="underline" href={displayNavigationPath("/tests/holland-career-interest-test-riasec", locale)}>{t("返回霍兰德测试", "返回霍蘭德測驗", "Back to the Holland test")}</Link>
      </nav>
    </aside>
    <UnlockReportExperience model={model} locale={locale} assessment="riasec60" readings={readings} chainReading={chainReading}
      sampleHref={`${base}?view=report`} premium={full ? premium : undefined}
      purchase={<div className={styles.purchase}>
        {[["微信支付", "微信支付", "WeChat Pay", "¥2.99"], ["支付宝", "支付寶", "Alipay", "¥2.99"], ["海外银行卡", "海外銀行卡", "International card", "US$2.99"]].map(([zh, tw, en, price]) =>
          <button key={en} className={styles.cta} type="button" disabled>{t(zh, tw, en)} · {price}</button>)}
        <p>{t("无需登录或注册 · 一次付款解锁本次完整报告", "無須登入或註冊 · 一次付款解鎖本次完整報告", "No login or signup · One payment unlocks this full report")}</p>
        <p><Link href={displayNavigationPath("/support/payment-refund", locale)}>{t("退款政策", "退款政策", "Refund policy")}</Link></p>
      </div>} />
  </main>;
}
