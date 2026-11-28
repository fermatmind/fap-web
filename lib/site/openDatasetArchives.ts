import type { DisplayLocale } from "@/lib/i18n/locales";

// Dedicated public FermatMind records, verified anonymously on 2026-11-28.
export const OPEN_DATASET_ARCHIVES = [
  { id: "zenodo", href: "https://doi.org/10.5281/zenodo.24574554", names: { zh: "Zenodo (DOI)", "zh-TW": "Zenodo (DOI)", en: "Zenodo (DOI)" } },
  { id: "hugging-face", href: "https://huggingface.co/datasets/fermatmind/historical-figures-personality-cox1926-dataset", names: { zh: "Hugging Face", "zh-TW": "Hugging Face", en: "Hugging Face" } },
  { id: "kaggle", href: "https://www.kaggle.com/datasets/fermatmind/historical-personality-atlas-488-biographies", names: { zh: "Kaggle", "zh-TW": "Kaggle", en: "Kaggle" } },
  { id: "tianchi", href: "https://tianchi.aliyun.com/dataset/235199", names: { zh: "阿里云天池", "zh-TW": "阿里雲天池", en: "Aliyun Tianchi" } },
  { id: "modelscope", href: "https://www.modelscope.ai/datasets/fermatmind/historical-figures-personality-cox1926-dataset", names: { zh: "魔搭 ModelScope", "zh-TW": "魔搭 ModelScope", en: "ModelScope" } },
  { id: "opendatalab", href: "https://opendatalab.com/fermatmind/historical-personality-cox1926", names: { zh: "OpenDataLab", "zh-TW": "OpenDataLab", en: "OpenDataLab" } },
  { id: "gitee-ai", href: "https://moark.com/datasets/dqxjwksz/historical-personality-cox", names: { zh: "模力方舟", "zh-TW": "模力方舟", en: "Gitee AI" } },
] as const;

export const OPEN_DATASET_LABELS: Record<DisplayLocale, string> = {
  zh: "公开数据集存档", "zh-TW": "公開資料集存檔", en: "Open Datasets",
};

export function showsHomePublicLinks(pathname: string | null, locale: DisplayLocale): boolean {
  // / is the existing canonical Chinese homepage, also reached from /zh.
  return (locale === "zh" && pathname === "/") ||
    pathname === `/${locale}`;
}

export function withOpenDatasetSameAs<T extends object>(organization: T & { sameAs?: readonly string[] }) {
  return {
    ...organization,
    sameAs: [...new Set([...(organization.sameAs ?? []), ...OPEN_DATASET_ARCHIVES.map(item => item.href)])],
  };
}
