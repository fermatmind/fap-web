import Link from "next/link";

const EXAMPLES = [
  {
    key: "clearer",
    title: "A clearer preference pattern",
    pairs: ["I 70% / E 30%", "N 65% / S 35%", "T 75% / F 25%", "P 60% / J 40%"],
    reading: "The higher poles spell INTP in this illustration. Start with the four pairs, then check where the descriptions fit your experience and where they do not. A larger gap does not establish stronger ability or a more certain identity.",
    action: "For a meeting, try writing a short outline before speaking. Record whether it helped you explain your point, and one occasion when talking it through first worked better.",
  },
  {
    key: "close",
    title: "A preference near the midpoint",
    pairs: ["I 51% / E 49%", "N 65% / S 35%", "T 75% / F 25%", "P 60% / J 40%"],
    reading: "I is only slightly higher than E here. A small response difference could change the first letter while the other pairs stay the same. Read both descriptions and keep the context, rather than treating the two-point gap as a firm division between people.",
    action: "Compare two ordinary discussions: one where you prepared alone and one where you developed an idea aloud. Note the task, what you did, what helped, and a counterexample. You can use this observation without taking another test.",
  },
] as const;

export function MbtiResultExamples() {
  return (
    <section id="result-examples" aria-labelledby="mbti-examples-title" data-testid="mbti-result-examples" className="space-y-6">
      <h2 id="mbti-examples-title">See a result before you start</h2>
      <p className="m-0 text-sm text-slate-600">
        These two synthetic examples illustrate how to read preference percentages. They are not scored attempts, real user reports, or your result. Both the 93- and 144-question forms use four core preference pairs; the figures below do not demonstrate a difference between the forms or establish that their scores are interchangeable.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {EXAMPLES.map((example) => (
          <article key={example.key} data-example={example.key} className="min-w-0 space-y-4 rounded-2xl border border-slate-200 p-5">
            <h3 className="m-0 text-xl font-semibold">{example.title}</h3>
            <dl className="m-0 space-y-2 text-sm">
              {example.pairs.map((pair, index) => (
                <div key={pair} className="flex flex-wrap justify-between gap-2">
                  <dt>{["Introversion / Extraversion", "Intuition / Sensing", "Thinking / Feeling", "Perceiving / Judging"][index]}</dt>
                  <dd className="m-0 font-semibold tabular-nums">{pair}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 text-sm text-slate-600">{example.reading}</p>
            <p className="m-0 text-sm text-slate-600"><strong>One next step: </strong>{example.action}</p>
          </article>
        ))}
      </div>
      <p className="m-0 text-sm text-slate-600">
        The percentages describe response direction within a result, not population percentiles, accuracy, statistical confidence, or career suitability. A/T is a separate additional description and is not inferred from these four pairs. No scoring version, response-quality assessment, or population reference is supplied for these teaching examples. For your own result, retain its questionnaire form, versions, units, and quality guidance; missing information stays unknown.
      </p>
      <p className="m-0 text-sm text-slate-600">
        After completing your chosen form, read the result overview and preference details, then choose one observation. If the result is still loading or unavailable, use its retry or recovery option; these examples cannot replace it. You can also read the{" "}
        <Link href="/en/articles/mbti-full-report-career-relationship-communication" className="underline underline-offset-4">guide to understanding and using your results</Link>{" "}
        or <a href="#choose-version" className="underline underline-offset-4">choose the 93- or 144-question version</a>.
      </p>
      <p className="m-0 text-sm text-slate-600">
        Keep your own notes with the observation record: it includes a blank record and a clearly synthetic planning example, without calculating a score. Download the{" "}
        <a href="/resources/mbti/fermatmind-personality-observation-en.txt" download className="underline underline-offset-4">observation record (TXT)</a>{" "}
        or <a href="/resources/mbti/fermatmind-personality-observation-en.md" download className="underline underline-offset-4">observation record (Markdown)</a>.
        Open the saved file and check its contents. Your notes stay in your own file; there is no automatic upload or cloud save. If downloading is unavailable, copy the observation steps above into your own document.
      </p>
    </section>
  );
}
