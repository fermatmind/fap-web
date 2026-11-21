import { notFound } from "next/navigation";
import { fetchPersonalityDesktopCloneContent } from "@/lib/cms/personality-desktop-clone";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { previewCodes } from "./content-preview";
import { applyLocalizedPreview, localizedDimensions } from "./localized-preview";
import { FullReportPreview } from "../mbti-influential/FullReportPreview";
import { ResultEvidenceAndPrompts } from "./ResultEvidenceAndPrompts";
import { PreviewLanguage } from "./PreviewLanguage";
import styles from "./ai-conversation.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "MBTI · Local content preview", robots: { index: false, follow: false } };
const languages = { zh: "简体中文", "zh-TW": "繁體中文", en: "English" };

export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string | string[]; language?: string | string[] }>;
}) {
  const locale = (await params).locale;
  if (process.env.NODE_ENV !== "development" || (locale !== "zh" && locale !== "en")) notFound();
  const query = await searchParams;
  const requested = query.type;
  const fullCode = typeof requested === "string" ? requested.toUpperCase() : "ISFJ-A";
  const languageValue = query.language ?? locale;
  if (typeof languageValue !== "string" || !Object.hasOwn(languages, languageValue)) notFound();
  const language = languageValue as DisplayLocale;
  if (Array.isArray(requested) || !previewCodes.includes(fullCode)) notFound();
  // The backend's published zh-CN identity is the source. Target copy stays a local candidate.
  const published = await fetchPersonalityDesktopCloneContent(fullCode, "zh");
  if (!published) return <p role="alert">{language === "en" ? "The source content is unavailable. Please try again later." : language === "zh-TW" ? "來源內容暫時無法載入，請稍後再試。" : "源内容暂时无法加载，请稍后重试。"}</p>;
  const candidate = applyLocalizedPreview(published, language);
  const href = (target: DisplayLocale, code: string) => `/${target === "en" ? "en" : "zh"}/dev/mbti-direct-result?type=${code}&language=${target}`;
  return <>
    <aside className="bg-emerald-50 px-6 py-3 text-sm text-emerald-950" lang={language === "zh-TW" ? "zh-Hant" : language}>
      {language === "en" ? `Local preview · ${fullCode} · English editorial candidate. Scores are display examples, not an actual assessment result.`
        : language === "zh-TW" ? `本機預覽 · ${fullCode} · 繁體中文三章內容候選。分數僅為顯示範例，不代表實際測評結果。`
        : `本地预览 · ${fullCode} · 简体中文三章内容候选。分数仅作展示示例，不代表真实测评结果。`}
      <nav aria-label="Preview language" className="mt-2 flex flex-wrap gap-4">{(Object.keys(languages) as DisplayLocale[]).map((target) => <a key={target} href={href(target, fullCode)} aria-current={target === language ? "page" : undefined}>{languages[target]}</a>)}</nav>
      <details className="mt-2"><summary className="cursor-pointer">{language === "en" ? "Choose a type (32 variants)" : language === "zh-TW" ? "切換預覽類型（32 個變體）" : "切换预览类型（32 个变体）"}</summary>
        <nav aria-label="Preview type" className="mt-2 flex flex-wrap gap-3">{previewCodes.map((code) => <a key={code} href={href(language, code)} aria-current={code === fullCode ? "page" : undefined}>{code}</a>)}</nav>
      </details>
    </aside>
    <main lang={language === "zh-TW" ? "zh-Hant" : language} className={`${styles.report} mx-auto max-w-[1320px] px-6 py-8 md:px-10`}>
      <PreviewLanguage language={language}>
        <FullReportPreview locale={language === "en" ? "en" : "zh"} displayLocale={language} data={candidate.data} dimensions={localizedDimensions(fullCode, language)} applicationContent={candidate.applications} faqReplacementNode={false} fullWidthFooterNode={<ResultEvidenceAndPrompts fullCode={fullCode} language={language} />} referenceRail isUnlocked suppressUnlockSurfaces />
      </PreviewLanguage>
    </main>
  </>;
}
