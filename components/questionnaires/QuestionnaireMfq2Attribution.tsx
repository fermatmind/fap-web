import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMfq2Attribution({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-mfq2-attribution="true" aria-label={zh ? "MFQ-2来源、许可与版本说明" : "MFQ-2 source, licence and edition"} className="my-6 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 [overflow-wrap:anywhere]">
    <p className="font-semibold">{zh ? "MFQ-2：作者英文源文与费马工作中译" : "MFQ-2: author English source and FermatMind working Chinese translation"}</p>
    <p className="mt-3">{zh ? "条目作者：Mohammad Atari、Jonathan Haidt、Jesse Graham、Sena Koleva、Sean T. Stevens、Morteza Dehghani。源研究为Morality Beyond the WEIRD（2023）；条目与项目材料依作者OSF项目所列CC BY 4.0许可使用，不表示作者为本站背书。" : "Item authors: Mohammad Atari, Jonathan Haidt, Jesse Graham, Sena Koleva, Sean T. Stevens and Morteza Dehghani. Source research: Morality Beyond the WEIRD (2023). Items and project materials are used under the CC BY 4.0 licence listed by the authors’ OSF project. No author endorsement of this website is implied."}</p>
    <p className="mt-3">{zh ? "版本说明：英文固定作者公开English Moral Foundations Questionnaire.docx的36题，检索于2026-10-27，仅规范呈现空白；第27题遵循该文档措辞，与预印本附录不同。中文为费马依本英文另作的工作译本，未照用作者中译对共同体、运动队及其他限定的改写。六项全有效才显示所属均分的NA规则、两位小数及完整解读为本站呈现；新中译和呈现未建立测量等价或本地效度。" : "Edition: the 36 English items are fixed to the authors’ public English Moral Foundations Questionnaire.docx, retrieved 2026-10-27, with presentation whitespace normalized. Item 27 follows that document’s wording, which differs from the preprint appendix. Chinese is a new FermatMind working translation of the selected English, rather than the authors’ separately adapted Chinese referents for community, sports team and other qualifications. The complete-six NA policy, two-decimal display and full explanations are website presentation choices. Measurement equivalence and local validity have not been established for the new translation and presentation."}</p>
    <ul className="mt-3 list-disc pl-5">
      <li><a className="underline" href="https://osf.io/srtxn/">{zh ? "作者原项目、材料与许可登记" : "Authors’ original project, materials and licence record"}</a></li>
      <li><a className="underline" href="https://osf.io/download/6bfe9/">{zh ? "本版采用的作者英文36题原文" : "The authors’ English 36-item source used in this edition"}</a></li>
      <li><a className="underline" href="https://doi.org/10.1037/pspp0000470">{zh ? "Atari等（2023）原研究" : "Atari and colleagues’ original research (2023)"}</a></li>
      <li><a className="underline" href="https://creativecommons.org/licenses/by/4.0/">{zh ? "CC BY 4.0许可与署名条件" : "CC BY 4.0 licence and attribution conditions"}</a></li>
    </ul>
    <p className="mt-3">{zh ? "源条目与本工作译文按CC BY 4.0提供，保留署名、来源、许可及修改说明；本站条款不对这些许可材料施加额外下游限制。完整解释文字由费马测试编辑部撰写，与源条目区分。公开说明不包含个人答案或均分。" : "Source items and this working translation are provided under CC BY 4.0, retaining attribution, source, licence and modification notices. Website terms add no downstream restrictions to these licensed materials. Full explanatory text is authored separately by FermatMind Editorial. Public explanations contain no personal answers or means."}</p>
  </aside>;
}
