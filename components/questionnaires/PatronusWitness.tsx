import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { scorePatronus } from "@/lib/questionnaires/patronus";
import { selectedChoiceIds } from "@/lib/questionnaires/orderedChoices";

/** A published fixed demonstration, never a visitor's answers or personal result. */
export function PatronusWitness({ quiz, id, locale, traditionalCopy }: { quiz: Questionnaire; id: string; locale: Locale; traditionalCopy?: (text: string) => string }) {
  const displayText = (text: string) => traditionalCopy?.(text) ?? text;
  const answers = quiz.patronus?.witnesses[id];
  const result = scorePatronus(quiz, answers);
  if (result.status !== "complete" || result.minimumDistanceUnits !== 0 || result.profileIds.length !== 1 || result.profileIds[0] !== id) throw new Error("PATRONUS_PUBLIC_EXAMPLE_UNAVAILABLE");
  const zh = locale === "zh";
  return <section className="my-8 space-y-4 rounded-xl border border-cyan-200 bg-cyan-50 p-5" aria-labelledby="patronus-public-witness" data-patronus-public-witness={id}>
    <h2 id="patronus-public-witness" className="text-2xl font-semibold">{zh ? displayText("固定可达演示：不是你的答卷") : "Fixed reachable example: not your answers"}</h2>
    <p className="leading-8">{zh ? displayText("下面是一份固定20屏演示，其六维计数恰好等于此画像坐标，距离为0，因此得到本页画像。它证明该结果可达，不代表真实参与者、常见分布或你的经历；其他答卷也可能得到同一意象。") : "This fixed 20-screen demonstration has six counts equal to this portrait’s coordinates, so its distance is zero and it reaches this portrait. It demonstrates reachability, not a real participant, a typical distribution or your experiences. Other answer patterns can also reach the same image."}</p>
    <dl className="space-y-2">{quiz.directions.map((d, i) => <div key={d.id} className="flex justify-between gap-4"><dt>{d.title[locale]}</dt><dd>{result.raw[d.id]} / {quiz.patronus!.maxima[i]}</dd></div>)}</dl>
    <details><summary className="min-h-11 cursor-pointer font-semibold">{zh ? displayText("展开全部20屏演示选择") : "Expand all 20 demonstration choices"}</summary><ol className="mt-4 space-y-5">{quiz.questions.map((q, i) => {
      const chosen = selectedChoiceIds(q, answers![q.id], true);
      if (chosen === null) throw new Error("PATRONUS_PUBLIC_EXAMPLE_INVALID");
      const labels = chosen.map((id, index) => `${q.interaction === "rank" ? `${index + 1}. ` : ""}${q.options.find(o => o.id === id)!.label[locale]}`);
      return <li key={q.id} data-patronus-witness-screen={q.id}><h3 className="font-semibold">{i + 1}. {q.prompt[locale]}</h3><p className="mt-2 leading-8">{labels.length ? labels.join(q.interaction === "rank" ? " → " : zh ? displayText("；") : "; ") : zh ? displayText("明确不选（0项）") : "Explicit none (0 items)"}</p></li>;
    })}</ol></details>
  </section>;
}
