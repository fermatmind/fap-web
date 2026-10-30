import revision from "./readingCopyRevision.json";
import type { RiasecResultViewModel } from "./resultAssembler";

/** Read-only corrections to already admitted snapshot text; never replaces its source binding. */
export function applyRiasecReadingCopyRevision(vm: RiasecResultViewModel): RiasecResultViewModel {
  if (vm.displayCopy || (vm.resultLocale !== "en" && vm.resultLocale !== "zh-CN")) return vm;
  const locale = vm.resultLocale;
  const bands = revision.lowBands[locale] as Record<string, { before: string; after: string }>;
  const appliedKeys: string[] = [];
  const highlights = vm.resultSummary?.highlights.map(item => {
    const copy = bands[item.dimensionCode];
    if (!copy || item.text !== copy.before) return item;
    appliedKeys.push(`result_summary.${item.dimensionCode}.low`);
    return { ...item, text: copy.after };
  });
  const lifecycle = vm.lifecycleCopy;
  // Chinese lifecycle prose is not displayed by the reader; do not create a new surface.
  const surfaces = locale === "en" && lifecycle?.status === "available" ? lifecycle.surfaces.map(item => {
    const copy = revision.surfaces.find(row => row.surface === item.surface && row.before === item.copy);
    if (!copy) return item;
    appliedKeys.push(`lifecycle.${item.surface}`);
    return { ...item, copy: copy.after };
  }) : undefined;
  const faqItems = locale === "en" && lifecycle?.status === "available" ? lifecycle.faqItems.map(item => {
    if (item.q !== revision.faq.question.before || item.a !== revision.faq.answer.before) return item;
    appliedKeys.push("lifecycle.score_faq");
    return { ...item, q: revision.faq.question.after, a: revision.faq.answer.after };
  }) : undefined;
  if (!appliedKeys.length) return vm;
  return {
    ...vm,
    resultSummary: vm.resultSummary && highlights ? { ...vm.resultSummary, highlights } : vm.resultSummary,
    lifecycleCopy: lifecycle && surfaces && faqItems ? { ...lifecycle, surfaces, faqItems } : lifecycle,
    displayCopy: {
      revision: revision.revision,
      approvedSourceHash: revision.publishedSourceHash,
      approvedCompiledHash: revision.publishedCompiledHash,
      appliedKeys,
    },
  };
}
