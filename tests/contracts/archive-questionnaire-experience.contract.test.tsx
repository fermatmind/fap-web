import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArchiveQuestionnaireNextStep, ArchiveReadingSnapshot } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { getArchiveExperience, getArchiveSnapshot } from "@/lib/entertainment/archiveExperience";
import { loadTraditionalArchetype } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { isArchivedEntertainmentPath } from "@/lib/seo/discoverabilityExposurePolicy";

const locales = ["en", "zh", "zh-TW"] as const;

describe("archive questionnaire experience", () => {
  it.each(["found-family-role-test", "travel-personality-test"])("preserves %s identity and scores while localizing the result and next step", async (slug) => {
    const source = await loadQuestionnaire(slug);
    const traditional = await loadTraditionalArchetype(slug);
    const copy = getArchiveExperience(slug);
    if (!source || !traditional || !copy) throw new Error(`Missing content for ${slug}`);
    const ids = source.profiles.map(p => p.id);
    expect(Object.keys(copy.profiles).sort()).toEqual([...ids].sort());
    expect(traditional.profiles.map(p => p.id)).toEqual(ids);

    const topology = (quiz: typeof source) => quiz.questions.map(q => [
      q.id, q.reverse, q.options.map(o => [o.id, o.score, o.directionId]),
    ]);
    expect(topology(traditional)).toEqual(topology(source));
    for (const pick of [0, 1, 2, 3]) {
      const answers = Object.fromEntries(source.questions.map(q => [q.id, q.options[pick].id]));
      expect(scoreArchetypeQuestionnaire(traditional, answers)).toEqual(scoreArchetypeQuestionnaire(source, answers));
    }

    for (const locale of locales) {
      expect(isArchivedEntertainmentPath(questionnairePath(locale, slug))).toBe(true);
      const snapshots = new Set<string>();
      for (const id of ids) {
        expect(isArchivedEntertainmentPath(questionnaireGuidePath(locale, slug, id))).toBe(true);
        const snapshot = getArchiveSnapshot(slug, id, locale);
        expect(snapshot?.every(Boolean)).toBe(true);
        snapshots.add(snapshot![0]);
        const html = renderToStaticMarkup(<ArchiveReadingSnapshot slug={slug} id={id} locale={locale} />);
        expect(html).toContain(`data-archive-reading="${id}"`);
        expect(html.match(/<li\b/g)).toHaveLength(2);
      }
      expect(snapshots.size).toBe(ids.length);
      const html = renderToStaticMarkup(<ArchiveQuestionnaireNextStep slug={slug} locale={locale} />);
      expect(html.match(/href="/g)).toHaveLength(1);
      expect(html).toContain(`href="/${locale}/tests/${copy.next.slug}"`);
      expect(html).toContain('referrerPolicy="no-referrer"');
    }
  });

  it("keeps the new blocks scoped to authorized archive titles and known result IDs", () => {
    expect(getArchiveExperience("constructor")).toBeUndefined();
    expect(getArchiveSnapshot("travel-personality-test", "constructor", "en")).toBeUndefined();
    expect(renderToStaticMarkup(<ArchiveQuestionnaireNextStep slug="temperament" locale="en" />)).toBe("");
  });
});
