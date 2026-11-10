import type { Locale } from "@/lib/i18n/locales";

const OCCUPATIONS = {
  industrial: {
    slug: "industrial-designers", soc: "27-1021.00", interest: "ARI",
    name: { zh: "工业设计师", en: "Industrial designer" },
    task: {
      zh: "画产品草图，用工作模型修改设计，再核对安全、成本与制造条件。",
      en: "Sketch a physical product, revise it using a working model, and check safety, cost and manufacturing constraints.",
    },
  },
  graphic: {
    slug: "graphic-designers", soc: "27-1024.00", interest: "AC",
    name: { zh: "平面设计师", en: "Graphic designer" },
    task: {
      zh: "安排文字和图像的版式，按反馈修订，准备可交付的印刷或数字文件。",
      en: "Arrange text and images in a layout, revise it after review, and prepare files for print or digital delivery.",
    },
  },
  film: {
    slug: "film-and-video-editors", soc: "27-4032.00", interest: "AC",
    name: { zh: "影视剪辑师", en: "Film and video editor" },
    task: {
      zh: "挑选并排列素材，让镜头顺序符合脚本或制作要求，并检查画面与声音是否同步。",
      en: "Select and sequence footage to meet script or production requirements, and check that sound and picture are in sync.",
    },
  },
} as const;

export const CAREER_INTEREST_SOURCE = "https://www.onetcenter.org/dictionary/31.0/excel/career_interest_types.html";
export const CAREER_INTEREST_DATA = "https://www.onetcenter.org/dl_files/database/db_31_0_csv/career_interest_types.csv";

export const CAREER_EXPLORATION_PILOT = {
  intj: {
    occupations: [OCCUPATIONS.industrial, OCCUPATIONS.graphic],
    copy: {
      zh: {
        title: "INTJ 工作偏好与职业探索：比较两种设计工作",
        summary: "如果你想用 INTJ 描述自己的工作偏好，可以先观察两件事：你喜欢按明确的条件推敲方案吗？方案遇到试用反馈时，你愿意重做哪一部分？把同一个问题放进两种职业任务里试一次。",
        evidence: "以下是对照用的工作任务。四字母类型不能推出霍兰德代码、职业胜任力或录用机会。",
        exercise: "以水杯清洗为例。先画一个易拆洗杯盖，再给原有杯盖画一张三步清洗说明。记录你更想继续修改结构，还是更想改图与阅读顺序。再找一份真实招聘说明，核对实际任务与工作条件。",
      },
      en: {
        title: "INTJ at work: explore two kinds of design",
        summary: "If INTJ helps you describe how you like to work, try testing two preferences. Do you enjoy developing a design against clear constraints? Which part would you revise after someone tries it? Use the same problem to compare two design tasks.",
        evidence: "These roles illustrate different kinds of work. Four-letter type cannot establish a Holland code, job competence or hiring prospects.",
        exercise: "Use a reusable cup as the brief. Sketch a lid that comes apart for cleaning, then sketch a three-step cleaning guide for the existing lid. Note whether you want to improve the mechanism or the visual sequence. Check a real job description for tasks and working conditions.",
      },
    },
  },
  ari: {
    indexable: true,
    occupations: [OCCUPATIONS.industrial, OCCUPATIONS.graphic],
    copy: {
      zh: {
        title: "霍兰德 ARI 代码与职业探索：从工业设计开始",
        summary: "ARI 依次代表艺术型、现实型、研究型。你可以用同一项任务观察三个环节：构思不同方案、做出可试用的草模、查证哪种方案更合用。",
        evidence: "在 O*NET 31.0 的美国职业兴趣表中，商业与工业设计师是精确 ARI 示例。平面设计师的官方代码是 AC，放在这里是为了对照实体产品和视觉版式的工作差异。",
        exercise: "给一个可重复使用的水杯画两种杯盖。设定两个条件，例如单手打开和容易清洗。标出你打算怎么试握，写下一个必须通过模型或使用者反馈核实的问题。",
      },
      en: {
        title: "ARI Holland Code careers: start with industrial design",
        summary: "ARI stands for Artistic, Realistic and Investigative, in that order. A single brief lets you explore all three activities: develop different ideas, make a model you can try, and investigate which idea works better.",
        evidence: "In O*NET 31.0, Commercial and Industrial Designers are an exact U.S. ARI example. Graphic Designers have the code AC and appear here as a contrast between physical products and visual layouts.",
        exercise: "Sketch two lids for a reusable cup. Set two constraints, such as one-handed opening and easy cleaning. Mark how you would test the grip and write one question you can only answer with a model or user feedback.",
      },
    },
  },
  ac: {
    indexable: false,
    occupations: [OCCUPATIONS.graphic, OCCUPATIONS.film],
    copy: {
      zh: {
        title: "霍兰德 AC 代码与职业探索：平面设计与影视剪辑",
        summary: "AC 依次代表艺术型、常规型。先看你是否喜欢创作，再观察自己是否愿意整理素材、核对交付要求和处理修订。",
        evidence: "在 O*NET 31.0 美国职业兴趣表中，平面设计师和影视剪辑师都标为 AC。这是官方职业的两字高点代码。费马档案用于查任务，其 O*NET 对照仍为目录候选。",
        exercise: "把同一份清洗说明分别做成一页海报草图和一段 15 秒视频的三镜头分镜。请一个人复述步骤。记录你更愿意反复调整版式，还是更愿意整理镜头、节奏和声音。",
      },
      en: {
        title: "AC Holland Code careers: graphic design and video editing",
        summary: "AC stands for Artistic and Conventional, in that order. Explore whether you enjoy creating something and whether you also want to organize source material, check delivery requirements and handle revisions.",
        evidence: "The U.S. O*NET 31.0 table lists both Graphic Designers and Film and Video Editors as AC. The official profiles have a two-letter high-point code. FermatMind dossiers illustrate work tasks, and their O*NET crosswalks are still directory candidates.",
        exercise: "Turn the same cleaning instructions into a one-page poster sketch and a three-shot storyboard for a 15-second video. Ask someone to repeat the steps. Note whether you want to refine the layout or revisit shot order, timing and sound.",
      },
    },
  },
} as const;

export type CareerExplorationPilot = keyof typeof CAREER_EXPLORATION_PILOT;
export type CareerInterestPilot = Exclude<CareerExplorationPilot, "intj">;

export const CAREER_INTEREST_PILOTS = ["ari", "ac"] as const;

export function careerExplorationPilotPath(locale: Locale, pilot: CareerExplorationPilot): string {
  return pilot === "intj"
    ? `/${locale}/career/recommendations/mbti/intj`
    : `/${locale}/career/interests/${pilot}`;
}

export function indexableCareerInterestPilots() {
  return CAREER_INTEREST_PILOTS.filter((code) => CAREER_EXPLORATION_PILOT[code].indexable).flatMap((code) =>
    (["en", "zh"] as const).map((locale) => ({
      locale,
      path: careerExplorationPilotPath(locale, code),
      title: CAREER_EXPLORATION_PILOT[code].copy[locale].title,
      summary: CAREER_EXPLORATION_PILOT[code].copy[locale].summary,
    }))
  );
}

export function isCareerPilotOnIndexHold(path: string): boolean {
  return (["en", "zh"] as const).some((locale) =>
    path === careerExplorationPilotPath(locale, "intj") ||
    CAREER_INTEREST_PILOTS.some((code) =>
      !CAREER_EXPLORATION_PILOT[code].indexable && path === careerExplorationPilotPath(locale, code)
    )
  );
}
