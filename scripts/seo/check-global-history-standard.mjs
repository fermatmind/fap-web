import { createJiti } from "jiti";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);
const jiti = createJiti(import.meta.url, { alias: { "@": fileURLToPath(root) }, fsCache: false });
const data = "lib/entertainment/global-history/";
const read = path => readFileSync(new URL(path, root), "utf8");
const json = path => JSON.parse(read(path));
const load = name => jiti.import(fileURLToPath(new URL(data + name + ".ts", root)));

const [{ historyPeople }, { displayHistoryPerson }, { getHistoryResult }, { historyProfileNotes, listedWithoutCoxEstimate },
  { globalHistoryGeoEditorial }, { historyProfileExpansions }, { historyStandards }] = await Promise.all(
  ["people", "traditional-roster", "result-v2", "reference", "geo-editorial", "profile-evidence", "standard-profiles"].map(load),
);
const review = json(data + "editorial-review.json");
const tier1 = new Set(review.tier1);
const schedule = review.schedule.sort((a, b) => a.order - b.order);
const bySlug = new Map(historyPeople.map(person => [person.id, person]));
const reviewed = new Map(Object.entries(review.reviewedDecisionUrls));
const variants = json(data + "taiwan-name-variants.json");
const locales = ["zh", "zh-TW", "en"];
const han = /\p{Script=Han}/u;
const validTitle = (text, locale) => !!text?.trim() && han.test(text) === (locale !== "en");
const countWords = (text, locale) => (text.match(locale === "en"
  ? /[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu : /\p{Script=Han}/gu) ?? []).length;
const blocked = url => {
  if (!url) return true;
  const { hostname, pathname, protocol } = new URL(url);
  return protocol !== "https:" || /(?:^|\.)(?:ctext\.org|wikipedia\.org|old\.maa\.org)$/iu.test(hostname)
    || /(?:^|\/)~[^/]+|^\/8\.13\//u.test(pathname);
};
const cite = (source, locale) => validTitle((source.label ?? source.title)?.[locale], locale)
  && !!source.locator?.[locale] && (locale !== "en" || !han.test(source.locator.en))
  && !/^(?:supplementary reference|补充参考资料|補充參考資料)$/iu.test((source.label ?? source.title)[locale]);
const outside = birth => birth !== 0 && (birth < 1450 || birth > 1850);
const records = schedule.filter(({ slug }) => !tier1.has(slug)).map(({ slug, order, wave }) => {
  const person = bySlug.get(slug);
  const result = getHistoryResult(person);
  const geo = globalHistoryGeoEditorial[slug];
  const standard = historyStandards[slug];
  const notes = historyProfileNotes[slug];
  const expansion = standard ? undefined : historyProfileExpansions[slug];
  const source = geo?.decision?.source;
  const alternatives = standard ? [] : notes?.alternatives ?? [];
  const renderedCitations = [source, notes?.primaryWork, ...alternatives, ...(expansion?.evidence ?? []).map(item => item.source)].filter(Boolean);
  // Some editorial records omit disputed years. Keep the Cox transcription alongside
  // the representative year so the diagnostic does not imply an exact birth date.
  const coxDates = result.iq_benchmark.has_cox_data ? result.iq_benchmark.estimate.dates : undefined;
  const birthFromCox = !result.years[0] ? coxDates?.match(/^(?:c\.?\s*)?(\d{4})(?=\D)/iu) : undefined;
  const birth = result.years[0] || (birthFromCox ? Number(birthFromCox[1]) : 0);
  const cox = result.iq_benchmark.has_cox_data ? "estimate" : listedWithoutCoxEstimate.has(slug) ? "listed-no-estimate"
    : outside(birth) ? "outside-birth-window" : birth ? "in-window-not-listed" : "unknown-birth-year";
  const profileChecks = {};
  for (const locale of locales) {
    const answer = standard?.personalityAnswer?.[locale] ?? notes?.typeAnswer?.[locale];
    const core = [geo?.summary[locale], geo?.decision.fact[locale], geo?.decision.interpretation[locale],
      standard?.narrative?.[locale], answer, geo?.answer[locale],
      ...alternatives.map(item => item.rationale[locale]),
      ...(expansion?.evidence ?? []).flatMap(item => [item.fact[locale], item.interpretation[locale]])].filter(Boolean).join(" ");
    const length = countWords(core, locale);
    const [min, max] = locale === "en" ? [380, 550] : [550, 800];
    const approvedName = displayHistoryPerson(person, "zh-TW").name.zh;
    const badName = locale === "zh-TW" && (variants[slug] ?? []).some(name => !approvedName.includes(name) && core.includes(name));
    const oldQuotes = locale === "zh-TW" && /[“”‘’]/u.test([core, standard?.personalityQuestion?.[locale], geo?.question[locale]].join(" "));
    const failures = [
      ...(length < min || length > max ? ["core-length"] : []),
      ...(!source || blocked(source.url) || reviewed.get(slug) !== source.url || !cite(source, locale) ? ["verified-decision-source"] : []),
      ...(renderedCitations.some(item => blocked(item.url) || !cite(item, locale)) ? ["citation-locale-or-url"] : []),
      ...(alternatives.some(item => !item.rationale?.[locale] || !cite(item, locale)) ? ["alternative-reading"] : []),
      ...(!geo?.question[locale] || !geo?.answer[locale] || !answer || !!expansion
        || (standard && !standard.personalityQuestion?.[locale]) || badName || oldQuotes ? ["localized-faq-or-taiwan-copy"] : []),
      ...(cox === "unknown-birth-year" ? ["cox-birth-year-unresolved"] : []),
    ];
    profileChecks[locale] = { length, failures };
  }
  return {
    slug, order, wave, source: source?.url ?? null, upgraded: !!standard, cox, birth, ...(birthFromCox ? { birthApproximate: true, coxDates } : {}), locales: profileChecks,
    passed: Object.values(profileChecks).every(item => item.failures.length === 0),
  };
});

if (tier1.size !== 60 || records.length !== 428 || new Set(schedule.map(({ slug }) => slug)).size !== historyPeople.length
  || Object.keys(historyStandards).some(slug => tier1.has(slug) || !bySlug.has(slug))) {
  throw new Error("Tier 1, Tier 2, and the editorial schedule disagree");
}
const passed = records.filter(row => row.passed);
const missing = records.filter(row => !row.passed).map(({ slug }) => slug);
const waves = [...new Set(records.map(({ wave }) => wave))].map(wave => {
  const rows = records.filter(row => row.wave === wave);
  return { wave, total: rows.length, passed: rows.filter(row => row.passed).length };
});
const report = {
  total: records.length,
  passed: passed.length,
  initialPassed: passed.filter(row => !row.upgraded).length,
  newlyPassed: passed.filter(row => row.upgraded).length,
  remaining: missing.length,
  waves,
  missing,
  records,
};
const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice("--report=".length);
if (reportPath) writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ ...report, records: undefined, missing: undefined }));
const failedUpgrades = records.filter(row => row.upgraded && !row.passed);
if (failedUpgrades.length) {
  console.error(JSON.stringify(failedUpgrades, null, 2));
  process.exitCode = 1;
}
