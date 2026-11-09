import Link from "next/link";
import { traditionalQuiz as quiz, traditionalUi as ui } from "@/lib/i18n/zh-TW/chiikawa";
import { traditionalSevenSins as seven } from "@/lib/i18n/zh-TW/sevenSins";
import { TRADITIONAL_QUIZ_PATH, TRADITIONAL_SEVEN_SINS_PATH } from "@/lib/i18n/traditionalRoutes";

const entry = `/zh-TW${TRADITIONAL_QUIZ_PATH}`;

export function TraditionalPilotTests() {
  return <div id="more-tests" className="space-y-6"><h1 className="text-3xl font-bold">{ui.hub["zh-TW"]}</h1><p className="leading-8">{ui.available["zh-TW"]}</p><Link href={entry} className="block rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-bold underline">{quiz.title["zh-TW"]}</h2><p className="mt-4 leading-8">{quiz.description["zh-TW"]}</p><p className="mt-3">18 題 · 約 {quiz.minutes} 分鐘 · 免費 · 無需註冊</p></Link><Link href={`/zh-TW${TRADITIONAL_SEVEN_SINS_PATH}`} className="block rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-bold underline">{seven.title["zh-TW"]}</h2><p className="mt-4 leading-8">{seven.description["zh-TW"]}</p></Link></div>;
}
