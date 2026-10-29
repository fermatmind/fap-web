import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

// Public navigation, not another scoring or result-content authority. Reuse the
// existing explanation, type directory and synthetic examples before the long methods section.
export function AssessmentReadingPaths({ slug, locale }: { slug: string; locale: "zh" | "en" }) {
  if (locale !== "zh") return null;

  const copy = slug === SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM ? {
    title: "九型人格测试结果怎么看？",
    body: "先看九型分布，再对照候选类型的动机解释。分数接近时保留多个候选，用具体经历核对，不把最高分当成固定身份。",
    links: [
      { href: "/zh/articles/enneagram-personality-test-explained", label: "九型人格的计分方法与结果解读" },
      { href: "/zh/personality/enneagram", label: "查看九种类型与动机解释" },
    ],
  } : slug === SCALE_CANONICAL_SLUG_MAP.RIASEC ? {
    title: "霍兰德测试结果与三字代码怎么看？",
    body: "先看完整六维兴趣，再看前三项与分数差距。已有结果可以直接对照合成示例和探索工作表；还没有结果，可从上方选择题本。兴趣不是能力或职业匹配结论。",
    links: [
      { href: "/zh/holland-test/pdf-download#result-examples", label: "查看三种合成结果示例与探索工作表" },
      { href: "/zh/articles/riasec-holland-career-interest-test-explained", label: "六维兴趣、三字代码与接近分数解读" },
    ],
  } : null;

  if (!copy) return null;

  return (
    <section id="read-results" aria-labelledby="read-results-title" data-testid="assessment-reading-paths" className="space-y-4">
      <h2 id="read-results-title">{copy.title}</h2>
      <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{copy.body}</p>
      <ul className="m-0 list-disc space-y-3 pl-5 text-sm leading-7">
        {copy.links.map(({ href, label }) => (
          <li key={href}><Link href={href} className="underline underline-offset-4">{label}</Link></li>
        ))}
      </ul>
    </section>
  );
}
