import type { Locale } from "@/lib/i18n/locales";
const description = {
  en: "Three fictional objects on a shelf: a simple open box with paper, a plain empty frame and a notebook with a faded green label. The drawing supplies no price, origin or condition assessment.",
  zh: "架上三个虚构物件：放有纸张的简单开口盒、空的素框，以及带褪色绿标签的笔记本。绘图不提供价格、来历或品相评估。",
};
export function ThriftShelfPanel({ locale, displayText = (text) => text }: { locale: Locale; displayText?: (text: string) => string }) {
  return <figure data-thrift-shelf-panel className="my-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    <svg role="img" aria-label={displayText(description[locale])} viewBox="0 0 600 230" className="w-full" focusable="false">
      <rect width="600" height="230" fill="#f4f3ed" />
      <path d="M28 185h544v13H28Zm21 13v21m502-21v21" fill="#b9b8a4" stroke="#909a8b" strokeWidth="2" />
      <path d="m64 138 60-20 55 20v47H64Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2" />
      <path d="m64 138 58 19 57-19m-57 19v28" fill="none" stroke="#b29659" strokeWidth="2" />
      <path d="m90 134 2-45 46 3-3 40m-29 5 5-40 42 5-5 36" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2" />
      <rect x="245" y="63" width="105" height="122" rx="2" fill="#f4e7c9" stroke="#b29659" strokeWidth="2" /><rect x="255" y="73" width="85" height="102" fill="#f4f3ed" stroke="#b29659" />
      <path d="M422 83h91v102h-91Z" fill="#d88770" stroke="#a96f5f" strokeWidth="2" /><path d="M433 83v102" stroke="#fffdf8" strokeWidth="3" />
      <path d="m449 108 43-3 2 33-44 2Z" fill="#b6c8af" stroke="#78a7a2" strokeWidth="2" /><path d="M458 118h22m-22 10h14" stroke="#6b8d80" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
    <figcaption className="px-4 py-3 text-sm leading-6 text-slate-600">{displayText(description[locale])} {locale==="zh"?displayText("原创静态插画；可以只根据文字选择，无需购买或上传物件。"):"Original static illustration; you can choose from the text alone, without buying or uploading an object."}</figcaption>
  </figure>;
}
