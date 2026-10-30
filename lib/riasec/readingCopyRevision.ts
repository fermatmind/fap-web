import revision from "./readingCopyRevision.json";
import type { RiasecResultViewModel } from "./resultAssembler";

/** Read-only corrections to already admitted snapshot text; never replaces its source binding. */
export function applyRiasecReadingCopyRevision(vm: RiasecResultViewModel): RiasecResultViewModel {
  if ((vm.displayCopy && vm.displayCopy.revision !== revision.previousRevision) ||
      (vm.resultLocale !== "en" && vm.resultLocale !== "zh-CN")) return vm;
  // This is a finite text revision, not admission for future content packages.
  // Legacy snapshots reach this helper only through the assembler's existing binding checks.
  if (vm.authority?.mode === "canonical" && !revision.acceptedCanonicalSources.some(source =>
    source.sourceHash === vm.authority?.sourceHash && source.compiledHash === vm.authority?.compiledHash &&
    source.compilerVersion === vm.authority?.compilerVersion && vm.authority?.locale === vm.resultLocale &&
    source.locales.includes(vm.resultLocale as "en" | "zh-CN"))) return vm;
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
    const copy = [{ key: "score_faq", ...revision.faq }, ...revision.additionalFaqs]
      .find(row => item.q === row.question.before && item.a === row.answer.before);
    if (!copy) return item;
    appliedKeys.push(`lifecycle.${copy.key}`);
    return { ...item, q: copy.question.after, a: copy.answer.after };
  }) : undefined;
  const slots = vm.deepContentSlots?.slots.map(slot => {
    let content = slot.content;
    for (const copy of revision.slots) {
      if (copy.locale !== locale || copy.slotId !== slot.slotId || copy.slotKey !== slot.slotKey ||
          copy.slotName !== slot.state.slot_name || content[copy.field] !== copy.before) continue;
      content = { ...content, [copy.field]: copy.after };
      appliedKeys.push(`slot.${slot.slotId}.${copy.field}`);
    }
    return content === slot.content ? slot : { ...slot, content };
  });
  const activities = locale === "en" ? vm.activityExplorer?.codeActivityPack.activities.map(activity => {
    let revised = activity;
    for (const copy of revision.activities) {
      if (copy.activityKey !== activity.activityKey) continue;
      if (copy.field === "activityUserCopy" && revised.activityUserCopy === copy.before) {
        revised = { ...revised, activityUserCopy: copy.after };
      } else if (copy.field === "taskExamples" && copy.index !== null && revised.taskExamples[copy.index] === copy.before) {
        revised = { ...revised, taskExamples: revised.taskExamples.map((text, i) => i === copy.index ? copy.after : text) };
      } else continue;
      appliedKeys.push(`activity.${activity.activityKey}.${copy.field}`);
    }
    return revised;
  }) : undefined;
  if (!appliedKeys.length) return vm;
  return {
    ...vm,
    resultSummary: vm.resultSummary && highlights ? { ...vm.resultSummary, highlights } : vm.resultSummary,
    lifecycleCopy: lifecycle && surfaces && faqItems ? { ...lifecycle, surfaces, faqItems } : lifecycle,
    deepContentSlots: vm.deepContentSlots && slots ? { ...vm.deepContentSlots, slots } : vm.deepContentSlots,
    activityExplorer: vm.activityExplorer && activities ? { ...vm.activityExplorer,
      codeActivityPack: { ...vm.activityExplorer.codeActivityPack, activities } } : vm.activityExplorer,
    displayCopy: {
      revision: revision.revision,
      approvedSourceHash: revision.reviewedSourceHash,
      approvedCompiledHash: revision.reviewedCompiledHash,
      appliedKeys: [...new Set([...(vm.displayCopy?.appliedKeys ?? []), ...appliedKeys])],
    },
  };
}
