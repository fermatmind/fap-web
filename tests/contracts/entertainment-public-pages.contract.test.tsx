import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
import { responseColorCurrentEntryCopy } from "@/components/questionnaires/ResponseColorLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FunQuizPage, { generateMetadata } from "@/app/(localized)/[locale]/tests/play/[slug]/page";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import nativeCatalog from "@/lib/questionnaires/catalog.json";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import catalog from "@/lib/entertainment/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("complete bilingual entertainment entry rendering", () => {
  it("renders every catalog identity and its real public content, with aligned metadata and no pre-result MBTI gate", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      for (const quiz of catalog) for (const locale of ["en", "zh"] as const) {
        const props = { params: Promise.resolve({ slug: quiz.slug, locale }) };
        const metadata = await generateMetadata(props);
        const html = renderToStaticMarkup(await FunQuizPage(props));
        const dom = document.createElement("div"); dom.innerHTML = html;
        if (nativeCatalog.some(native => native.slug === quiz.slug && native.collection === "play")) {
          const authored = (await loadQuestionnaire(quiz.slug))!;
          expect(dom.querySelector("h1")?.textContent).toBe(authored.title[locale]);
          expect(dom.querySelectorAll("main")).toHaveLength(1);
          expect(metadata.title).toBe(authored.seoTitle[locale]);
          expect(metadata.description).toBe(authored.description[locale]);
          expect(metadata.openGraph?.images).toEqual([`https://fermatmind.com/og/fun/${quiz.slug}?locale=${locale}&v=${authored.version}`]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/${quiz.slug}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/play/${quiz.slug}`, "zh-CN": `https://fermatmind.com/zh/tests/play/${quiz.slug}` });
          expect(metadata.robots).toMatchObject({ index: true, follow: true });
          for (const faq of authored.faq) {
            expect(dom.textContent).toContain(faq.question[locale]);
            const answer = quiz.slug === "response-color" ? responseColorCurrentEntryCopy(faq.answer[locale], locale) : faq.answer[locale];
            expect(dom.textContent).toContain(answer);
          }
          for (const profile of authored.profiles) {
            expect(dom.querySelector(`a[href="/${locale}/tests/play/${quiz.slug}/results/${profile.id}"]`)).not.toBeNull();
            // Bespoke entries may author a new guide-card synopsis. Full source
            // reports are verified on their public result route, not as entry copy.
          }
          expect(dom.querySelector("#take-test")?.textContent).toContain(locale === "zh" ? "开始测试" : "Start test");
          expect(dom.querySelector("#take-test a[href*='mbti']")).toBeNull();
          expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
          continue;
        }
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
        expect(dom.querySelectorAll("main")).toHaveLength(1);
        const authored = (await loadFunQuiz(quiz.slug))!;
        expect(metadata.description).toBe(authored.seo.description[locale]);
        expect(metadata.title).toBe(authored.seo.title[locale]);
        expect(metadata.openGraph?.images).toEqual([`https://fermatmind.com/og/fun/${quiz.slug}?locale=${locale}&v=${authored.version}`]);
        expect(dom.textContent).toContain(authored.seo.faq.question[locale]);
        expect(dom.textContent).toContain(authored.seo.faq.answer[locale]);
        const publicPortraits = dom.querySelector("#possible-results")!.parentElement!;
        expect([...publicPortraits.querySelectorAll("article h3")].map(node => node.textContent)).toEqual(authored.results.map(result => result.title[locale]));
        for (const result of authored.results) expect(publicPortraits.textContent).toContain(result.summary[locale]);
        if (["beachcomber", "birdwatching-companion", "board-game-table", "borrowed-book", "browser-tabs", "camera-roll", "campfire-storyteller", "celebrating-a-friend", "celebration-planner", "choosing-together", "city-wanderer", "cloud-drift", "coffee-break", "comfort-offer", "community-fair", "date-plan-detour", "desert-oasis", "desk-reset", "dinner-host", "dragon-housemate", "dream-train", "enchanted-library", "escape-room-role", "fantasy-party-role", "festival-companion", "fictional-cafe", "firefly-evening", "floating-house", "festival-mask", "forest-soundtrack", "friendship-invitation", "game-night-reset", "garden-season", "gift-note", "group-chat-role", "harbor-light", "creative-spark", "cozy-object", "compliment-style"].includes(quiz.slug)) {
          expect(dom.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);
          expect(dom.querySelector("[data-explore-start]")).not.toBeNull();
          expect(dom.querySelector("nav[aria-label=Breadcrumb]")).toBeNull();
        } else if (additionalStoryEditorials[quiz.slug]) {
          expect(dom.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(1 + additionalStoryEditorials[quiz.slug]!.faq.length);
          expect(dom.querySelector("[data-explore-start]")).not.toBeNull();
        } else expect(dom.textContent).toContain(quiz.version);
        expect(dom.querySelector("#play")?.textContent).toContain(locale === "zh" ? "开始测试" : "Start quiz");
        expect(dom.querySelector("#play a[href*='mbti']")).toBeNull();
        expect(dom.querySelectorAll('#play input:not([type="hidden"])')).toHaveLength(0);expect(dom.querySelector("#play form")?.getAttribute("action")).toBe(`/${locale}/tests/play/${quiz.slug}/take`);expect([...dom.querySelectorAll<HTMLInputElement>('#play input[type="hidden"]')].map(input => [input.name, input.value])).toEqual([["start", "1"]]);
        expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
        expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/${quiz.slug}`);
        expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/play/${quiz.slug}`, "zh-CN": `https://fermatmind.com/zh/tests/play/${quiz.slug}` });
        expect(metadata.robots).toMatchObject({ index: true, follow: true });
      }
    } finally { vi.unstubAllEnvs(); }
  });
});
