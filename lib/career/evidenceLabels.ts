import type {Locale} from '@/lib/i18n/locales';
const labels: Record<string, [string,string]> = {
  primary_document: ['原始资料','Primary source'],
  editorial_design: ['编辑设计','Editorial design'],
  editorial_synthesis: ['编辑整理','Editorial synthesis'],
  exact: ['本职业口径','Occupation-specific'],
  recruitment_proxy: ['招聘样本参考','Recruitment sample'],
  industry_proxy: ['行业参考','Industry reference'],
  parent_occupation_proxy: ['上级职业类别参考','Broader occupation reference'],
};
export function careerEvidenceLabel(value: string | null | undefined, locale: Locale): string | null {
  return value ? labels[value]?.[locale === 'zh' ? 0 : 1] ?? value : null;
}
