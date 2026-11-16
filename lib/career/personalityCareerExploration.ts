import { careerCompareItems, readPublishedCareerTaskPage } from '@/lib/career/compare';
import type { CareerPage } from '@/lib/career/careerPage';
import type { Locale } from '@/lib/i18n/locales';
import { canonicalUrl } from '@/lib/site';
import { getReleasedCareerInterestEvidence } from './interestRelease';
import sceneCopy from './personalityCareerScenes.json';

type LocalizedCopy = Record<Locale, string>;
export type CareerScene = {
  title: LocalizedCopy;
  intro: LocalizedCopy;
  examples: Array<{ slug: string; question: LocalizedCopy }>;
  comparison: { title: LocalizedCopy; brief: LocalizedCopy; prompts: LocalizedCopy[] };
};

const scenes: Record<string, CareerScene> = sceneCopy;

export function getPersonalityCareerScene(slug: string): CareerScene | undefined {
  return Object.hasOwn(scenes, slug) ? scenes[slug] : undefined;
}

export async function readPersonalityCareerExamples(locale: Locale, scene: CareerScene) {
  const examples = scene.examples.flatMap(({ slug, question }) => {
    const evidence = getReleasedCareerInterestEvidence(slug);
    return evidence ? [{ slug, question, onet: evidence.onet, interests: evidence.interest }] : [];
  });
  return readCareerExamples(locale, examples);
}

type CareerExample = {
  slug: string;
  onet: string;
  interests: string;
  question: Record<Locale, string>;
};

export type PersonalityCareerCard = CareerExample & {
  page: CareerPage;
  tasks: string[];
  taskSourceRefs: string[];
  href: string;
  occupationalCategory: string;
};

async function readCareerExamples(locale: Locale, examples: CareerExample[]): Promise<PersonalityCareerCard[]> {
  const candidates = await Promise.all(examples.map(async (example) => {
    const read = await readPublishedCareerTaskPage(locale, example.slug, 'server-cache');
    if (read.state !== 'ready' || !read.page.content.subject.summary) return null;
    const { page } = read;
    const taskItems = careerCompareItems(page, ['career.item.responsibilities-block']).filter(item => {
      return item.type === 'list' && Array.isArray(item.data.entries) &&
        page.content.sources.some(source => item.sourceRefs.includes(source.id) &&
          source.url?.match(/^https:\/\/(?:www\.)?onetonline\.org\/link\/(?:details|summary|custom)\/([\d.-]+)(?:[/?#]|$)/u)?.[1] === example.onet);
    });
    const entries = taskItems.flatMap(item => Array.isArray(item.data.entries) ? item.data.entries : []);
    const tasks = [...new Set(entries.filter((entry): entry is string => typeof entry === 'string')
      .map(entry => entry.trim()).filter(Boolean))].slice(0, 3);
    if (tasks.length !== 3) return null;
    return {
      ...example, page, tasks,
      taskSourceRefs: [...new Set(taskItems.flatMap(item => item.sourceRefs))],
      href: `/${locale}/career/jobs/${example.slug}#fit`,
      occupationalCategory: `O*NET-SOC ${example.onet}`,
    };
  }));
  return candidates.filter(card => card !== null);
}

export function personalityCareerItemList(cards: PersonalityCareerCard[], title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Occupation',
        url: canonicalUrl(card.href.split('#')[0]),
        name: card.page.content.subject.name,
        description: card.page.content.subject.summary,
        occupationalCategory: card.occupationalCategory,
        responsibilities: card.tasks,
      },
    })),
  };
}
