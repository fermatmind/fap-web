import { RIASEC_CODES, type RIASECCode, type RIASECScoreVector } from "@/lib/career/types";

export const RIASEC_STORAGE_KEY = "fm_career_riasec_v1";

export type RiasecQuestion = {
  id: string;
  code: RIASECCode;
  text: {
    en: string;
    zh: string;
  };
};

export type RiasecAnswerMap = Record<string, number>;

const QUESTION_TEMPLATES: Record<RIASECCode, Array<{ en: string; zh: string }>> = {
  R: [
    { en: "I enjoy building or fixing things with my hands.", zh: "我喜欢动手搭建或修理东西。" },
    { en: "I like practical tasks with visible outcomes.", zh: "我偏好结果直观的实操任务。" },
    { en: "I am comfortable working with tools and equipment.", zh: "我对使用工具与设备感到自在。" },
    { en: "I prefer action and execution over long discussion.", zh: "相比长时间讨论，我更偏好直接执行。" },
    { en: "I enjoy solving mechanical or technical problems.", zh: "我喜欢解决机械或技术类问题。" },
    { en: "I like work that requires field operations.", zh: "我喜欢需要现场操作的工作。" },
  ],
  I: [
    { en: "I enjoy analyzing complex problems.", zh: "我喜欢分析复杂问题。" },
    { en: "I am curious about data, evidence, and logic.", zh: "我对数据、证据和逻辑有好奇心。" },
    { en: "I prefer research before making decisions.", zh: "我做决策前倾向先做研究。" },
    { en: "I enjoy reading and learning difficult concepts.", zh: "我喜欢阅读并学习有难度的概念。" },
    { en: "I like identifying patterns from information.", zh: "我喜欢从信息中识别规律。" },
    { en: "I value rigorous thinking in my work.", zh: "我重视工作中的严谨思考。" },
  ],
  A: [
    { en: "I enjoy creating new ideas and original work.", zh: "我喜欢创造新点子和原创成果。" },
    { en: "I am motivated by self-expression.", zh: "表达自我是我的主要动力之一。" },
    { en: "I like experimenting with different styles.", zh: "我喜欢尝试不同的风格和表达方式。" },
    { en: "I prefer open-ended tasks to fixed routines.", zh: "相比固定流程，我更喜欢开放式任务。" },
    { en: "I enjoy visual, written, or conceptual design work.", zh: "我喜欢视觉、文字或概念设计类工作。" },
    { en: "I feel energized by creative exploration.", zh: "创造性探索会让我更有能量。" },
  ],
  S: [
    { en: "I enjoy helping people solve their problems.", zh: "我喜欢帮助他人解决问题。" },
    { en: "I care about team atmosphere and relationships.", zh: "我重视团队氛围和人际关系。" },
    { en: "I am patient when listening to others.", zh: "我愿意耐心倾听他人。" },
    { en: "I like roles that involve mentoring or support.", zh: "我喜欢包含辅导或支持职责的角色。" },
    { en: "I feel fulfilled when my work benefits others.", zh: "当工作能帮助他人时我更有成就感。" },
    { en: "I can coordinate collaboration across people.", zh: "我能协调多方协作。" },
  ],
  E: [
    { en: "I enjoy persuading people with ideas.", zh: "我喜欢通过观点影响他人。" },
    { en: "I am energized by leading initiatives.", zh: "主导推进事项会让我更有动力。" },
    { en: "I like setting goals and driving outcomes.", zh: "我喜欢设定目标并推动结果达成。" },
    { en: "I am comfortable with negotiation and advocacy.", zh: "我能适应谈判与争取资源的场景。" },
    { en: "I enjoy business-oriented challenges.", zh: "我喜欢偏商业导向的挑战。" },
    { en: "I can take ownership under pressure.", zh: "在压力下我愿意主动承担责任。" },
  ],
  C: [
    { en: "I prefer clear processes and structured workflows.", zh: "我偏好清晰流程和结构化工作方式。" },
    { en: "I pay attention to details and quality checks.", zh: "我重视细节与质量校验。" },
    { en: "I like planning and tracking progress.", zh: "我喜欢规划并跟踪进度。" },
    { en: "I am reliable in repetitive but important tasks.", zh: "对于重复但重要的任务我执行稳定。" },
    { en: "I value standards, consistency, and documentation.", zh: "我重视规范、一致性和文档化。" },
    { en: "I am good at organizing operations.", zh: "我擅长组织和运营执行。" },
  ],
};

export const RIASEC_QUESTIONS: RiasecQuestion[] = RIASEC_CODES.flatMap((code) =>
  QUESTION_TEMPLATES[code].map((template, index) => ({
    id: `${code}-${index + 1}`,
    code,
    text: template,
  }))
);

export function createEmptyRiasecVector(): RIASECScoreVector {
  return {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };
}

function clampLikert(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function scoreRiasecAnswers(answers: RiasecAnswerMap): RIASECScoreVector {
  const sums = createEmptyRiasecVector();
  const counts = createEmptyRiasecVector();

  for (const question of RIASEC_QUESTIONS) {
    const raw = answers[question.id];
    if (typeof raw !== "number") continue;

    sums[question.code] += clampLikert(raw);
    counts[question.code] += 1;
  }

  const result = createEmptyRiasecVector();
  for (const code of RIASEC_CODES) {
    const max = counts[code] * 5;
    if (max <= 0) {
      result[code] = 0;
      continue;
    }
    result[code] = Number(((sums[code] / max) * 100).toFixed(2));
  }

  return result;
}

export function topRiasecCodes(vector: RIASECScoreVector): [RIASECCode, RIASECCode] {
  const sorted = [...RIASEC_CODES].sort((a, b) => vector[b] - vector[a]);
  return [sorted[0], sorted[1]];
}

export function cosineSimilarity(a: RIASECScoreVector, b: RIASECScoreVector): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const code of RIASEC_CODES) {
    const va = a[code];
    const vb = b[code];
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }

  if (normA <= 0 || normB <= 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
