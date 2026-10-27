import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCtl41Attribution({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-ctl41-attribution className="my-6 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7">
    <p>{zh
      ? "源题文：Kapusta ND、Jankowski KS、Wolf V、Chéron-Le Guludec M、Lopatka M、Hammerer C、Schnieder A、Kealy D、Ogrodniczuk JS、Blüml V（2018）。Measuring the Capacity to Love: Development of the CTL-Inventory。Frontiers in Psychology 9:1115，DOI：10.3389/fpsyg.2018.01115，表一完整41条英文，按CC BY 4.0署名复用。"
      : "Source items: Kapusta ND, Jankowski KS, Wolf V, Chéron-Le Guludec M, Lopatka M, Hammerer C, Schnieder A, Kealy D, Ogrodniczuk JS and Blüml V (2018). Measuring the Capacity to Love: Development of the CTL-Inventory. Frontiers in Psychology 9:1115. DOI: 10.3389/fpsyg.2018.01115. All 41 English statements follow Table 1, reused with attribution under CC BY 4.0."}</p>
    <p className="mt-3">{zh
      ? "改编：费马新中文工作译文、另参考当前作者站端点的四点数字呈现及原创完整读法。2、3保留数字，不拼成已验证原英文完整协议。不是当前作者站修订题本；2018德语、波兰语研究不确立本英文显示、新中译或线上使用效度，不暗示原作者背书。"
      : "Changes: a new FermatMind Chinese working translation, four-point numeric presentation with endpoints separately referenced to the current author site, and original full readings. Choices 2 and 3 remain numeric; this does not reconstruct a verified original English protocol. This is not the current author-site revised form. The 2018 German and Polish research does not validate this English display, new Chinese or online use, and no original-author endorsement is implied."}</p>
    <p className="mt-3"><a className="underline" href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.01115/full">{zh ? "2018原论文与表一" : "Original 2018 article and Table 1"}</a>{" · "}<a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>{" · "}<a className="underline" href="https://capacity-to-love.com/research">{zh ? "当前端点参考及版本区别" : "Current endpoint reference and edition distinction"}</a></p>
  </aside>;
}
