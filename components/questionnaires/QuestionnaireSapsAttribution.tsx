export function QuestionnaireSapsAttribution({ locale }: { locale: "en" | "zh" }) {
  const zh = locale === "zh";
  return <aside data-saps-attribution className="my-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
    <p>Rice, K. G., Richardson, C. M., &amp; Tueller, S. (2014). The Short Form of the Revised Almost Perfect Scale. <em>Journal of Personality Assessment, 96</em>, 368–379. doi:10.1080/00223891.2013.838172.</p>
    <p className="mt-2">{zh
      ? "正式八条英文陈述与计分键来自源量表，使用与翻译依据作者实验室的SAPS专项说明。中文为经费马编辑复核、尚未独立验证的工作译稿，不表示原作者审阅或为本站背书。"
      : "The eight English statements and scoring key follow the source scale; use and translation follow the author laboratory’s SAPS-specific notice. Chinese is a working translation reviewed by FermatMind editors without independent validation, original-author review or endorsement of this website."}</p>
    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
      <li><a className="underline" href="https://sites.gsu.edu/cpyricelab/almost-perfect-scale-revised-aps-r-and-short-almost-perfect-scale-saps/">{zh ? "作者使用、翻译与计分说明" : "Author use, translation and scoring notice"}</a></li>
      <li><a className="underline" href="https://www.kennethwang.com/apsr/scales/SAPS.pdf">{zh ? "正式英文八题与计分键" : "Source English items and scoring key"}</a></li>
      <li><a className="underline" href="https://pubmed.ncbi.nlm.nih.gov/24090303/">{zh ? "原始研究摘要" : "Original research abstract"}</a></li>
    </ul>
  </aside>;
}
