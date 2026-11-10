export const DESIGN_COMPARE_PILOT = ['industrial-designers', 'graphic-designers'] as const;
export const DESIGN_COMPARE_HREF = `/zh/career/compare?c1=${DESIGN_COMPARE_PILOT[0]}&c2=${DESIGN_COMPARE_PILOT[1]}`;
export const DESIGN_COMPARE_LABEL = '一键对比工业设计师和平面设计师';

export function isDesignComparePair(first: unknown, second: unknown): boolean {
  const [industrial, graphic] = DESIGN_COMPARE_PILOT;
  return (first === industrial && second === graphic) || (first === graphic && second === industrial);
}
