import type { Metadata } from "next";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { isConfiguredStagingSiteUrl, SITE_URL } from "@/lib/site";
import { GLOBAL_HISTORY_ATLAS_SLUGS, globalHistoryAtlasPath, globalHistoryPortraitPath } from "./config";

const atlasCopy = (zh: string, traditional: string, en: string): Record<DisplayLocale, string> => ({ zh, "zh-TW": traditional, en });

export type HistoryAtlas = (typeof GLOBAL_HISTORY_ATLAS_SLUGS)[number];
export type AtlasQuery = Record<string, string | string[] | undefined>;

export function isHistoryAtlas(value: string): value is HistoryAtlas {
  return GLOBAL_HISTORY_ATLAS_SLUGS.some(atlas => atlas === value);
}

export const historyAtlasCopy = {
  "personality-atlas": {
    title: atlasCopy("488 位历史人物传记人格图鉴", "488 位歷史人物傳記人格圖鑑", "488 Historical Figures by Biographical MBTI"),
    description: atlasCopy(
      "浏览费马为 488 位历史人物撰写的传记人格解读，按类型、时代、地区和领域查找人物及史料。",
      "瀏覽費馬為 488 位歷史人物撰寫的傳記人格解讀，依類型、時代、地區與領域查找人物和史料。",
      "Explore 488 editorial MBTI interpretations by type, era, region, and field, with links to historical profiles and sources.",
    ),
    method: atlasCopy(
      "四字母类型来自费马对人物经历和作品的编辑解读。历史人物没有完成费马测评，解读用于比较案例。六维做事偏好是全球卷独立的匹配模型。",
      "四字母類型來自費馬對人物經歷與作品的編輯解讀。歷史人物沒有做過費馬測驗，解讀供案例比較。六個做事面向是全球篇獨立的配對模型。",
      "The four-letter types are FermatMind’s editorial interpretations of lives and work. These figures never took the assessment. The quiz’s six work preferences form a separate matching model.",
    ),
  },
  "cox-1926": {
    title: atlasCopy("Cox（1926）301 位历史人物智力估值档案", "Cox（1926）301 位歷史人物智力估值檔案", "Cox (1926) Historical IQ Estimates for 301 Figures"),
    description: atlasCopy(
      "核查 Cox 原表中 301 位历史人物的原估值、概然误差、史料等级、信度及修正估值。",
      "查閱 301 位歷史人物在 Cox 原表中的原估值、概然誤差、史料等級、信度與修正估值。",
      "Compare the original and corrected estimates, probable errors and evidence reliability for 301 historical figures in Cox’s tables.",
    ),
    method: atlasCopy(
      "第一阶段根据截至 17 岁的资料估值，第二阶段加入 17 至 26 岁间的资料重新估值。概然误差（PE）、史料等级和信度系数（r）按原表记录。估值不能换算成现代测验成绩或人口百分位。",
      "第一階段依截至 17 歲的資料估值，第二階段納入 17 至 26 歲的新資料重新估值。概然誤差（PE）、史料等級與信度係數（r）依原表記錄。估值無法換算成現代測驗成績或人口百分位。",
      "The first estimate uses evidence through age 17. The second adds evidence from ages 17 to 26. Probable error (PE), evidence grade and reliability (r) follow the printed tables. The estimates cannot be converted into modern test scores or population percentiles.",
    ),
  },
} as const;

export function historyAtlasMetadata(locale: DisplayLocale, atlas: HistoryAtlas, query: AtlasQuery): Metadata {
  const copy = historyAtlasCopy[atlas];
  const canonical = (lang: DisplayLocale) => SITE_URL + globalHistoryAtlasPath(lang, atlas);
  return {
    title: copy.title[locale],
    description: copy.description[locale],
    openGraph: {
      title: copy.title[locale],
      description: copy.description[locale],
      url: canonical(locale),
      type: "website",
      locale: { zh: "zh_CN", "zh-TW": "zh_TW", en: "en_US" }[locale],
      images: [SITE_URL + globalHistoryPortraitPath(atlas === "personality-atlas" ? "wu-zetian" : "isaac-newton")],
    },
    robots: { index: !isConfiguredStagingSiteUrl() && !Object.values(query).some(Boolean), follow: true },
    alternates: {
      canonical: canonical(locale),
      languages: { "zh-CN": canonical("zh"), "zh-TW": canonical("zh-TW"), en: canonical("en"), "x-default": canonical("en") },
    },
  };
}
