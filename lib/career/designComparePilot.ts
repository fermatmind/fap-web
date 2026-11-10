export const DESIGN_COMPARE_PILOT = ['industrial-designers', 'graphic-designers'] as const;
export const DESIGN_COMPARE_HREF = `/zh/career/compare?c1=${DESIGN_COMPARE_PILOT[0]}&c2=${DESIGN_COMPARE_PILOT[1]}`;
export const DESIGN_COMPARE_LABEL = '一键对比工业设计师和平面设计师';
export const DESIGN_COMPARE_TASKS = [
  {
    slug: DESIGN_COMPARE_PILOT[0],
    name: '工业设计师',
    output: '产品草图与原型',
    interest: { code: 'ARI', dimensions: '艺术 / 现实 / 研究', source: 'https://www.onetonline.org/link/summary/27-1021.00#Interests' },
    task: '绘制产品草图、制作原型，并核对材料和制造条件。',
    mbtiTypes: ['ISTP', 'INTJ', 'INTP'],
    explorationQuestion: '你愿意反复制作原型，比较材料、结构和使用体验的取舍吗？',
  },
  {
    slug: DESIGN_COMPARE_PILOT[1],
    name: '平面设计师',
    output: '视觉版式与交付文件',
    interest: { code: 'AC', dimensions: '艺术 / 常规', source: 'https://www.onetonline.org/link/summary/27-1024.00#Interests' },
    task: '用文字与图形组织版式，检查并交付印刷或数字文件。',
    mbtiTypes: ['ENFP', 'INFP', 'ISFP'],
    explorationQuestion: '你愿意把信息整理成几个版式，并根据反馈反复调整吗？',
  },
] as const;

export const DESIGN_MBTI_EXPLORATION_NOTE = '类型由编辑选作工作方式探索示例，职业选择请结合实际任务与入行条件。';

export function findDesignCareersByMbtiType(type: string) {
  const normalized = type.toUpperCase();
  return DESIGN_COMPARE_TASKS.filter(career => career.mbtiTypes.some(candidate => candidate === normalized));
}

export function isDesignComparePair(first: unknown, second: unknown): boolean {
  const [industrial, graphic] = DESIGN_COMPARE_PILOT;
  return (first === industrial && second === graphic) || (first === graphic && second === industrial);
}
