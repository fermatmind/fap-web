import { isValidElement, type ReactNode } from 'react';
import { QuestionnaireClient } from '@/components/questionnaires/QuestionnaireClient';
import type { Questionnaire } from '@/lib/questionnaires/types';
import catalog from '@/lib/questionnaires/catalog.json';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { loadQuestionnaire } from '@/lib/questionnaires/loaders';
import { prepareQuestionnaireResultReadings, prepareResultProfile } from '@/lib/questionnaires/result-content/readings';
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

function mountedGenericClient(node: ReactNode): { quiz: Questionnaire; [key:string]: unknown } | null {
  if (Array.isArray(node)) return node.map(mountedGenericClient).find(Boolean) ?? null;
  if (!isValidElement<{ children?: ReactNode; quiz: Questionnaire }>(node)) return null;
  if (node.type === QuestionnaireClient) return node.props;
  return mountedGenericClient(node.props.children);
}

it.each(['en','zh'] as const)('actual %s generic entry calls retain the current prepared question and result authority', async locale => {
  const { default: page } = await import('@/components/questionnaires/QuestionnairePage');
  const checked: string[] = [];
  for (const item of catalog) {
    const props = mountedGenericClient(await page({ params:Promise.resolve({locale,slug:item.slug}) }));
    if (!props) continue;
    const source = await loadQuestionnaire(item.slug);
    if (!source) throw new Error(`Missing source: ${item.slug}`);
    const prepared = prepareQuestionnaireResultReadings(source);
    const dedicated = ['mentalAgeReadingProfile','loveTypeReadingProfiles','workRoleReadingProfiles','fds32ReadingProfiles','breakupReadingProfiles','parentingReadingProfiles'].some(key => key in props);
    if (!dedicated) {
      expect(props.quiz.profiles, item.slug).toEqual(prepared.profiles);
      expect(props.quiz.questions, item.slug).toEqual(prepared.questions);
      checked.push(item.slug);
    }
  }
  expect(checked).toContain('tipi-10');
  expect(checked.length).toBeGreaterThan(0);
},120000);
