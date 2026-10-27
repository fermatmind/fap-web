import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCbiAttribution({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-cbi-attribution="true" aria-label={zh ? "CBI来源、使用条件与版本" : "CBI source, permission and edition"} className="my-6 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 [overflow-wrap:anywhere]">
    <p className="font-semibold">{zh ? "CBI：两个完整源模块与费马工作中译" : "CBI: two complete source modules and FermatMind working Chinese translation"}</p>
    <p className="mt-3">{zh ? "本版使用NFA公开的PUMA研究英文CBI完整个人六题与工作七题，不施测服务对象相关六题；不是完整十九题，也不声称是新近验证的十三题短版。NFA明确允许商业及非商业使用，条件是清楚引用下列来源。该使用条件不等于CC BY或公共领域声明，也不表示作者或NFA为本站背书。" : "This edition uses the complete six-item personal and seven-item work-related CBI modules in NFA’s public English PUMA source. The six client-related items are not administered. It is not the full nineteen-item inventory or a newly validated thirteen-item short form. NFA expressly permits commercial and non-commercial use with the following source clearly cited. This permission is not a CC BY or public-domain claim, and no author or NFA endorsement is implied."}</p>
    <p className="mt-3">Borritz M et al. Burnout among employees in human service work: design and baseline findings of the PUMA study. Scandinavian Journal of Public Health. 2006;34:49–58.</p>
    <p className="mt-3">{zh ? "保留原英文题文、两种选项格式、工作精力题唯一反向键及个人至少三项／工作至少四项有效的源规则。中文由费马另作工作译本。独立NA选项、固定交错题序、两位小数、有效题调整后总和与完整解释为本站呈现选择，不声称是官方中译，也没有建立本地效度或跨语言测量等价。源说明没有数字化回忆期限。本版不加入综合分、风险等级、诊断或人口排名。" : "The original English wording, two response formats, single reversed work-energy item and source minima of three valid personal and four valid work responses are retained. Chinese is a new FermatMind working translation. Optional NA, fixed interleaving, two-decimal display, adjusted sums of rated items and full explanations are website presentation choices. This is not an official Chinese translation, and local validity or cross-language measurement equivalence has not been established. The source specifies no numeric recall period. No overall score, risk band, diagnosis or population rank is added."}</p>
    <ul className="mt-3 list-disc pl-5">
      <li><a className="underline" href="https://nfa.dk/vaerktoejer/spoergeskemaer/spoergeskema-til-maaling-af-udbraendthed-cbi/copenhagen-burnout-inventory-cbi">{zh ? "NFA原始发布页与使用条件" : "NFA original publication and permission"}</a></li>
      <li><a className="underline" href="https://nfa.dk/media/a4wheblj/cbi-scales.pdf">{zh ? "CBI英文源题、选项与计分规则" : "CBI original English items, response formats and scoring"}</a></li>
      <li><a className="underline" href="https://doi.org/10.1080/14034940510032275">{zh ? "Borritz等（2006）：须引用的PUMA研究" : "Borritz et al. (2006): required PUMA citation"}</a></li>
    </ul>
    <p className="mt-3">{zh ? "完整说明由费马测试编辑部撰写。公开链接与分享不包含个人答案、调整后总和或均分。" : "Full explanations are authored by FermatMind Editorial. Public links and sharing contain no personal answers, adjusted sums or means."}</p>
  </aside>;
}
