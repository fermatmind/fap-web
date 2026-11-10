import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCharacterSource({ locale, traditional = false }: { locale: Locale; traditional?: boolean }) {
  const zh = locale === "zh";
  return <aside className="my-5 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7" data-character-source>
    <p>{traditional ? "英文採用 IPIP-VIA-R 官方 96 題短版及正反向計分鍵，署名 Bluemke、Partsch、Saucier 與 Lechner（2021）。IPIP 題目、量表與題本屬於公有領域。繁體題目與結果說明由費馬編寫，目前尚無在地常模、信效度或跨語言等值驗證。" : zh ? "英文采用IPIP-VIA-R官方96条短版及正反向键，署名Bluemke、Partsch、Saucier与Lechner（2021）。IPIP条目、量表与题本属于公有领域；本版中文为费马独立试译，结果解释独立编写，尚无本地常模、信效度或跨语言等价验证。" : "English uses the official 96-item IPIP-VIA-R short key, attributed to Bluemke, Partsch, Saucier and Lechner (2021). IPIP items, scales and inventories are public domain. FermatMind independently drafted the Chinese trial translation and explanations; this edition has no local norms, validation or established language equivalence."}</p>
    <p>{traditional ? "本測驗採用 IPIP 公開題本，與 VIA Institute 官方 Survey 及 Gallup 測評各自獨立。自述結果無法認證道德、智慧、能力、健康或職業適配。" : zh ? "这是IPIP公开题库呈现，不是VIA Institute的官方Survey或Gallup测评。自述不能认证道德、智慧、能力、健康或职业适配。" : "This presents the public-domain IPIP instrument, not the official VIA Institute Survey or a Gallup assessment. Self-description certifies neither morality, wisdom, ability, health nor career fit."}</p>
    <p className="mt-2 flex flex-wrap gap-x-5"><a className="underline" href="https://ipip.ori.org/IPIP-VIA-R_Key.html">{traditional ? "官方 96 題與計分鍵" : zh ? "官方96条与正反向键" : "Official 96 items and keying"}</a><a className="underline" href="https://ipip.ori.org/newPermission.htm">{traditional ? "公有領域授權說明" : zh ? "公有领域许可" : "Public-domain permission"}</a><a className="underline" href="https://www.ipip.ori.org/newScoringInstructions.htm">{traditional ? "原始計分說明" : zh ? "原始计分说明" : "Original scoring instructions"}</a></p>
  </aside>;
}
