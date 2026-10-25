import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCharacterSource({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside className="my-5 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7" data-character-source>
    <p>{zh ? "英文采用IPIP-VIA-R官方96条短版及正反向键，署名Bluemke、Partsch、Saucier与Lechner（2021）。IPIP条目、量表与题本属于公有领域；本版中文为费马独立试译，结果解释独立编写，尚无本地常模、信效度或跨语言等价验证。" : "English uses the official 96-item IPIP-VIA-R short key, attributed to Bluemke, Partsch, Saucier and Lechner (2021). IPIP items, scales and inventories are public domain. FermatMind independently drafted the Chinese trial translation and explanations; this edition has no local norms, validation or established language equivalence."}</p>
    <p>{zh ? "这是IPIP公开题库呈现，不是VIA Institute的官方Survey或Gallup测评。自述不能认证道德、智慧、能力、健康或职业适配。" : "This presents the public-domain IPIP instrument, not the official VIA Institute Survey or a Gallup assessment. Self-description certifies neither morality, wisdom, ability, health nor career fit."}</p>
    <p className="mt-2 flex flex-wrap gap-x-5"><a className="underline" href="https://ipip.ori.org/IPIP-VIA-R_Key.html">{zh ? "官方96条与正反向键" : "Official 96 items and keying"}</a><a className="underline" href="https://ipip.ori.org/newPermission.htm">{zh ? "公有领域许可" : "Public-domain permission"}</a><a className="underline" href="https://www.ipip.ori.org/newScoringInstructions.htm">{zh ? "原始计分说明" : "Original scoring instructions"}</a></p>
  </aside>;
}
