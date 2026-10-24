import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import catalog from "@/lib/entertainment/catalog.json";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { contentImagePath, findPublicPortrait, portraitRuleExample, relatedFunQuizzes, resultPath, resultSlug } from "@/lib/entertainment/guides";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("complete public entertainment result assets", () => {
  it("keeps tailored bilingual search copy and public identities for every test", async () => {
    const titles = { en: new Set<string>(), zh: new Set<string>() }, descriptions = { en: new Set<string>(), zh: new Set<string>() }, questions = { en: new Set<string>(), zh: new Set<string>() };
    for (const card of catalog) {
      const quiz = (await loadFunQuiz(card.slug))!;
      expect(card.resultSlugs).toEqual(quiz.results.map(result => resultSlug(result.id)));
      expect(new Set(card.resultSlugs).size).toBe(quiz.results.length);
      for (const locale of ["en", "zh"] as const) {
        for (const [set, value] of [[titles[locale], quiz.seo.title[locale]], [descriptions[locale], quiz.seo.description[locale]], [questions[locale], quiz.seo.faq.question[locale]]] as const) {
          expect(set.has(value), card.slug).toBe(false); set.add(value);
        }
        expect(quiz.seo.description[locale].length, card.slug).toBeGreaterThan(30);
        expect(quiz.seo.faq.answer[locale].length, card.slug).toBeGreaterThan(40);
      }
      expect(relatedFunQuizzes(catalog, quiz)).toHaveLength(3);
      expect(relatedFunQuizzes(catalog, quiz).every(other => other.slug !== quiz.slug && other.category === quiz.category)).toBe(true);
      for (const result of quiz.results) {
        expect(findPublicPortrait(quiz, resultSlug(result.id))?.id).toBe(result.id);
        const example = portraitRuleExample(quiz, result.id);
        expect(example.length).toBeGreaterThan(0);
        for (const step of example) expect(quiz.questions.some(q => q.prompt === step.question && q.options.some(option => option.label === step.choice))).toBe(true);
        if (quiz.mechanism === "branch") {
          const answers = Object.fromEntries(example.map(step => {
            const question = quiz.questions.find(q => q.prompt === step.question)!;
            return [question.id, question.options.find(option => option.label === step.choice)!.id];
          }));
          expect(resolveFunQuiz(quiz, answers).resultIds).toEqual([result.id]);
        }
        for (const locale of ["en", "zh"] as const) expect(isMissingFunRoute(resultPath(locale, quiz.slug, result.id))).toBe(false);
      }
    }
    expect(isMissingFunRoute("/en/tests/play/woodland-animal/results/not-a-portrait")).toBe(true);
    expect(isMissingFunRoute("/en/tests/play/not-a-quiz/results/jay")).toBe(true);
    expect(isMissingFunRoute("/en/tests/play/relationship-values/results/romantic_expression")).toBe(true);
    expect(isMissingFunRoute("/en/tests/play/woodland-animal/results/jay/extra")).toBe(true);
  });

  it("server-renders every complete portrait with its own canonical, language pair, metadata, comparisons and return path", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    vi.resetModules();
    const { default: ResultGuide, generateMetadata } = await import("@/app/(localized)/[locale]/tests/play/[slug]/results/[portrait]/page");
    const seen = new Set<string>(); let count = 0;
    try {
      for (const card of catalog) {
        const quiz = (await loadFunQuiz(card.slug))!;
        for (const result of quiz.results) for (const locale of ["en", "zh"] as const) {
          const props = { params: Promise.resolve({ slug: quiz.slug, portrait: resultSlug(result.id), locale }) };
          const metadata = await generateMetadata(props), html = renderToStaticMarkup(await ResultGuide(props));
          const dom = document.createElement("div"); dom.innerHTML = html;
          const canonical = `https://fermatmind.com${resultPath(locale, quiz.slug, result.id)}`;
          expect(seen.has(canonical)).toBe(false); seen.add(canonical);
          expect(metadata.alternates?.canonical).toBe(canonical);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com${resultPath("en", quiz.slug, result.id)}`, "zh-CN": `https://fermatmind.com${resultPath("zh", quiz.slug, result.id)}`, "x-default": `https://fermatmind.com${resultPath("en", quiz.slug, result.id)}` });
          expect(metadata.robots).toMatchObject({ index: true, follow: true });
          expect(metadata.description).toBeTruthy();
          expect(metadata.openGraph?.images).toEqual([`https://fermatmind.com${contentImagePath(quiz, locale, result.id)}`]);
          expect(dom.querySelectorAll("main")).toHaveLength(1);
          expect(dom.querySelectorAll("h1")).toHaveLength(1); expect(dom.querySelector("h1")?.textContent).toBe(result.title[locale]);
          for (const key of ["summary", "example", "strength", "tradeoff", "experiment"] as const) expect(dom.textContent).toContain(result[key][locale]);
          expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
          const webpage = [...dom.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent!)).find(data => data["@type"] === "WebPage");
          expect(webpage.url).toBe(canonical); expect(webpage.name).toBe(result.title[locale]);
          const hrefs = [...dom.querySelectorAll("a[href]")].map(node => node.getAttribute("href"));
          expect(hrefs).toContain(`/${locale}/tests/play/${quiz.slug}#play`);
          for (const other of quiz.results.filter(other => other.id !== result.id)) expect(hrefs).toContain(resultPath(locale, quiz.slug, other.id));
          expect(dom.querySelectorAll("input, textarea")).toHaveLength(0);
          expect(dom.querySelector("#rules details")?.textContent).toContain(portraitRuleExample(quiz, result.id)[0].choice[locale]);
          count++;
        }
      }
      console.info(`Complete public result assets verified: ${count} bilingual guide URLs, ${catalog.length} independent quizzes.`);
    } finally { vi.unstubAllEnvs(); }
  }, 30000);

  it("uses a local, bounded content image instead of personal result payloads or runtime remote fonts", () => {
    const source = readFileSync("app/og/fun/[slug]/route.tsx", "utf8");
    expect(source).toContain("findPublicPortrait"); expect(source).toContain("fun-700.ttf");
    expect(source).not.toMatch(/fetch\(|score\W|answers\W/);
    expect(readFileSync("public/fonts/noto-sans-sc/fun-700.ttf").byteLength).toBeLessThan(300000);
  });
});
