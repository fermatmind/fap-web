export function Tipi10Attribution({ locale }: { locale: "en" | "zh" }) {
  const zh = locale === "zh";
  return <aside data-tipi10-attribution className="my-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
    <p>Gosling, S. D., Rentfrow, P. J., &amp; Swann, W. B., Jr. (2003). A Very Brief Measure of the Big Five Personality Domains. <em>Journal of Research in Personality, 37</em>, 504–528.</p>
    <p className="mt-2">{zh ? "按作者公开许可使用英文原十题、七级选项与五对计分。中文为费马独立工作译文，未独立验证或建立跨语言等价；不表示原作者为本站背书。完整读法由本站编辑撰写，极短版不测三十面向。" : "The original ten English items, seven anchors and five scoring pairs are used under the author’s public permission. Chinese is an independent FermatMind working translation without independent validation or established language equivalence, and does not imply author endorsement. Full guides are website editorial content; this short form does not measure thirty facets."}</p>
    <ul className="mt-2 space-y-2"><li><a className="inline-block min-h-11 py-2 underline" href="https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/">{zh ? "作者许可、来源与局限" : "Author permission, source and limitations"}</a></li><li><a className="inline-block min-h-11 py-2 underline" href="https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/ten-item-personality-inventory-tipi/">{zh ? "英文原十题与计分键" : "Original ten English items and scoring key"}</a></li></ul>
  </aside>;
}
