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
  taskHighlights?: Record<Locale, [string, string, string]>;
};

const INTJ_EXAMPLES: CareerExample[] = [
  {
    slug: 'operations-research-analysts', onet: '15-2031.00', interests: 'IC',
    question: {
      zh: '你更想把资源与时间的冲突写成一个能比较的模型吗？',
      en: 'Would you rather turn competing demands for time and resources into a model you can test?',
    },
  },
  {
    slug: 'industrial-designers', onet: '27-1021.00', interests: 'ARI',
    question: {
      zh: '你更愿意在材料和生产约束下反复修改一个实体原型吗？',
      en: 'Would you rather keep improving a physical prototype within material and production constraints?',
    },
    taskHighlights: {
      zh: ['绘制产品构思草图和详细图纸', '用工作模型检验并修改设计', '按安全、功能和生产成本评估方案'],
      en: ['Draw product concepts and detailed drawings', 'Use working models to test and revise designs', 'Assess designs against safety, function, and production costs'],
    },
  },
  {
    slug: 'graphic-designers', onet: '27-1024.00', interests: 'AC',
    question: {
      zh: '你更愿意根据读者反馈调整版式、信息层级和阅读顺序吗？',
      en: 'Would you rather use reader feedback to improve layout, hierarchy, and reading order?',
    },
    taskHighlights: {
      zh: ['与客户确认版式用途并研究受众', '安排图文版面并选择字体', '用设计软件制作插图和版式'],
      en: ['Confirm the layout brief with clients and research the audience', 'Arrange text and images and select typefaces', 'Create illustrations and layouts with design software'],
    },
  },
];

export type PersonalityCareerCard = CareerExample & {
  page: CareerPage;
  tasks: string[];
  taskSourceRefs: string[];
  href: string;
  occupationalCategory: string;
};

export function readIntjCareerExamples(locale: Locale) {
  return readCareerExamples(locale, INTJ_EXAMPLES);
}

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
      ...example, page, tasks: example.taskHighlights?.[locale] ?? tasks,
      taskSourceRefs: [...new Set(taskItems.flatMap(item => item.sourceRefs))],
      href: `/${locale}/career/jobs/${example.slug}`,
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
        url: canonicalUrl(card.href),
        name: card.page.content.subject.name,
        description: card.page.content.subject.summary,
        occupationalCategory: card.occupationalCategory,
        responsibilities: card.tasks,
      },
    })),
  };
}
