import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import catalog from "@/lib/questionnaires/catalog.json";
import stories from "@/lib/entertainment/catalog.json";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import dog from "@/lib/questionnaires/data/what-dog-breed-am-i.json";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { DogBreedPage } from "@/components/questionnaires/DogBreedPage";
import { HarborLightPage } from "@/components/entertainment/HarborLightPage";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { hasQuestionnaireTake, INLINE_QUESTIONNAIRE_TOOLS } from "@/lib/questionnaires/take";
import { parseQuestionnaireTakePath } from "@/lib/questionnaires/takePath";
import { questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { isIndexablePath } from "@/lib/seo/indexingPolicy";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS, isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";

describe("Independent entertainment answering routes", () => {
  it("covers every native questionnaire while keeping the five calculator and comparison tools intact", () => {
    const answerable = catalog.filter(item => hasQuestionnaireTake(item.slug));
    expect(answerable).toHaveLength(279);
    expect(catalog.filter(item => !hasQuestionnaireTake(item.slug)).map(item => item.slug).sort()).toEqual([...INLINE_QUESTIONNAIRE_TOOLS].sort());
    expect(hasQuestionnaireTake("unknown-product")).toBe(false);
  });
  it("admits all 380 answering experiences in both languages and still refuses absent products", () => {
    const entries = [...catalog.filter(item => hasQuestionnaireTake(item.slug)).map(item => `${item.collection}/${item.slug}`), ...stories.filter(item => !catalog.some(native => native.slug === item.slug)).map(item => `play/${item.slug}`), "play/friendship-quiz"];
    expect(entries).toHaveLength(380);
    for (const locale of ["en", "zh"]) for (const entry of entries) expect(isMissingFunRoute(`/${locale}/tests/${entry}/take`)).toBe(false);
    for (const path of ["/zh/tests/explore/missing-product/take", "/en/tests/play/missing-story/take", "/en/tests/explore/career-match/take", "/en/tests/play/friendship-quiz/take/manage"]) expect(isMissingFunRoute(path)).toBe(true);
  });
  it.each(["en", "zh"] as const)("keeps the %s dog landing editorial and moves its unchanged engine into /take", locale => {
    const quiz = dog as Questionnaire;
    const landing = renderToStaticMarkup(<DogBreedPage quiz={quiz} locale={locale} />);
    expect(landing).toContain(`action="/${locale}/tests/explore/what-dog-breed-am-i/take"`);
    expect(landing).toContain('name="start" value="1"');
    expect(landing).toContain('id="dog-breed-methods"');
    expect(landing).toContain('id="dog-breed-library"');
    expect(landing).not.toContain('data-stage="answer"');
    expect(landing).not.toContain('data-stage="welcome"');
    const take = DogBreedPage({ quiz, locale, take: true });
    expect(take.type).toBe(QuestionnaireClient);
    expect(take.props.quiz).toEqual(quiz);
    expect(take.props.locale).toBe(locale);
  });
  it.each(["en", "zh"] as const)("keeps %s story instructions and public guides without mounting the story engine", async locale => {
    const harbor = await loadFunQuiz("harbor-light");
    if (!harbor) throw new Error("Authoritative local story missing");
    const html = renderToStaticMarkup(<HarborLightPage quiz={harbor} locale={locale} />);
    expect(html).toContain(`action="/${locale}/tests/play/harbor-light/take"`);
    expect(html).toContain('id="possible-results"');
    expect(html).toContain('id="harbor-light-methods"');
    expect(html).not.toContain('data-stage="welcome"');
  });
  it.each(["/en/tests/explore/disc/take", "/zh/tests/explore/what-dog-breed-am-i/take", "/en/tests/play/harbor-light/take", "/zh/tests/play/friendship-quiz/take", "/en/tests/play/changan-history-quiz/take", "/zh/tests/play/changan-history-quiz/take"])("keeps %s out of indexing and shared caches", async path => {
    const route = parseQuestionnaireTakePath(path)!;
    expect(route.landing).toBe(path.replace(/\/take$/, ""));
    expect(isIndexablePath(path)).toBe(false);
    expect(isIndexablePath(route.landing)).toBe(true);
    const metadata = questionnaireTakeMetadata("Test", route.landing);
    expect(metadata.robots).toEqual({ index: false, follow: false, nocache: true });
    expect(metadata.alternates?.canonical).toBe(route.landing);
    const response = await proxy(new NextRequest(`https://fermatmind.com${path}`, { headers: { accept: "text/html" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  });
  it("preserves sensitive-questionnaire analytics suppression on the new suffix", () => {
    for (const path of ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS) expect(isAnalyticsDisabledQuestionnaireUrl(`/zh${path}/take`)).toBe(true);
  });
  it.each(["/zh/tests/explore/disc/results/single-d", "/zh/tests/explore/disc", "/zh/tests/mbti/take", "/zh/tests/play/bad%2fslug/take", "/zh/tests/play/a/take/extra"])("does not treat %s as a native entertainment take route", path => {
    expect(parseQuestionnaireTakePath(path)).toBeNull();
  });
});
