import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { loadQuestionnaire } from '@/lib/questionnaires/loaders';
import { prepareResultProfile } from '@/lib/questionnaires/result-content/readings';
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));

describe('redesigned dedicated entries retain current result readings', () => {
  for (const slug of ['connection-meaning-reflection', 'body-frame-observations', 'connection-ideals', 'activity-engagement-patterns', 'style-impression-preferences', 'outfit-line-preferences']) {
    it.each(['en', 'zh'] as const)(`${slug}: publishes every current %s reading paragraph`, async locale => {
      const quiz = await loadQuestionnaire(slug);
      if (!quiz) throw new Error(`Missing authoritative questionnaire: ${slug}`);
      const { default: page } = await import('@/components/questionnaires/QuestionnairePage');
      const dom = document.createElement('div');
      dom.innerHTML = renderToStaticMarkup(await page({ params: Promise.resolve({ locale, slug }) }));
      expect(dom.querySelectorAll('h1')).toHaveLength(1);
      for (const profile of quiz.profiles) {
        const prepared = prepareResultProfile(slug, profile);
        expect(prepared.sections.flatMap(s => s.paragraphs).length).toBeGreaterThan(profile.sections.flatMap(s => s.paragraphs).length);
        for (const section of prepared.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      }
      const ids = [...dom.querySelectorAll('[id]')].map(n => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }
});
