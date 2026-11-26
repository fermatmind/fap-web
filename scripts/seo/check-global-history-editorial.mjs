import { createJiti } from "jiti";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const jiti = createJiti(import.meta.url, { alias: { "@": root }, fsCache: false });
const { historyPeople } = await jiti.import("../../lib/entertainment/global-history/people.ts");
const { displayHistoryPerson } = await jiti.import("../../lib/entertainment/global-history/traditional-roster.ts");
const { getHistoryResult } = await jiti.import("../../lib/entertainment/global-history/result-v2.ts");
const { globalHistoryGeoEditorial } = await jiti.import("../../lib/entertainment/global-history/geo-editorial.ts");
const { default: sitelinks } = await jiti.import("../../lib/entertainment/global-history/wikidata-sitelinks.json");
const { listedWithoutCoxEstimate, historyDecisionAxes, historyProfileNotes } = await jiti.import("../../lib/entertainment/global-history/reference.ts");
const { historyFlagships } = await jiti.import("../../lib/entertainment/global-history/flagship-profiles.ts");
const { historyProfileExpansions } = await jiti.import("../../lib/entertainment/global-history/profile-evidence.ts");
const { historyStandards } = await jiti.import("../../lib/entertainment/global-history/standard-profiles.ts");
const nameVariants = JSON.parse(readFileSync(new URL("../../lib/entertainment/global-history/taiwan-name-variants.json", import.meta.url)));
const { historyAxes } = await jiti.import("../../lib/entertainment/global-history/questions.ts");
const { historyAtlasCopy } = await jiti.import("../../lib/entertainment/global-history/atlas.ts");

const bannedTaiwan = /型別|許可權|物件|區域性|擴充套件|連線|儲存(?:了|至今)|獲籤|出徵|範布勒|馬裡|・|(?:發表|議事|法律|工作|審查|選舉|交易|認購|公開|立法|議會|制度|集體|人身保護令|諮詢|外交|修訂|複核)程式|程式(?:辯論者|細節識別|露縫)|支援(?:召回|主張|改革|解讀)/u;
const locales = ["zh", "zh-TW", "en"];
const hanCharacters = /\p{Script=Han}/u;
const englishSentences = new Intl.Segmenter("en", { granularity: "sentence" });
const problems = [];
const { tier1 } = JSON.parse(readFileSync(new URL("../../lib/entertainment/global-history/editorial-review.json", import.meta.url)));
const flagshipStats = [];
const flagshipParagraphs = [];
const names = new Set();
const reviewed = [];
const legacy = [];
const slugSet = new Set(historyPeople.map(person => person.id));

function checkTaiwan(text, key, oldNames = []) {
  const match = text.match(bannedTaiwan) ?? (/\.(?:flagship|standard)(?:\.|$)/u.test(key) ? text.match(/[“”‘’]/u) : null);
  if (match) problems.push(`${key}: ${match[0]}`);
  for (const oldName of oldNames) {
    if ((oldName === "馬丁·路德·金" ? /馬丁·路德·金(?!恩)/u.test(text) : text.includes(oldName))) problems.push(`${key}: inconsistent Taiwan name ${oldName}`);
  }
}

function checkLocalized(record, key, oldNames = []) {
  if (!record || typeof record !== "object") return;
  if (Object.hasOwn(record, "zh-TW")) {
    const check = value => Array.isArray(value) ? value.forEach(check) : typeof value === "string" && checkTaiwan(value, key, oldNames);
    check(record["zh-TW"]);
    return;
  }
  for (const [name, child] of Object.entries(record)) checkLocalized(child, `${key}.${name}`, oldNames);
}

function checkFlagshipCitation(slug, location, title, locator) {
  for (const locale of locales) {
    const label = title?.[locale]?.trim();
    if (!label || (locale === "en" ? hanCharacters.test(label) : !hanCharacters.test(label))) {
      problems.push(`${slug}.${locale}: invalid ${location} title language`);
    }
    if (locale === "en" && hanCharacters.test(locator?.en ?? "")) {
      problems.push(`${slug}.en: invalid ${location} locator language`);
    }
    if (/^(?:supplementary reference|补充参考资料|補充參考資料)$/iu.test(label ?? "")) {
      problems.push(`${slug}.${locale}: placeholder flagship citation`);
    }
  }
}

function shingles(text, locale) {
  const values = locale === "en"
    ? text.toLowerCase().match(/\p{L}+/gu) ?? []
    : [...text.replace(/[^\p{L}\p{N}]/gu, "")];
  const size = locale === "en" ? 3 : 5;
  return new Set(values.slice(size - 1).map((_, i) => values.slice(i, i + size).join(" ")));
}

function casesTooSimilar(a, b) {
  if (a.size < 5 || b.size < 5) return false;
  if (Math.min(a.size, b.size) / Math.max(a.size, b.size) <= 0.65) return false;
  let overlap = 0;
  for (const value of a) if (b.has(value)) overlap++;
  return overlap / (a.size + b.size - overlap) > 0.65;
}

for (const person of historyPeople) {
  const result = getHistoryResult(person);
  if (!result) {
    problems.push(`${person.id}: missing existing editorial record`);
    continue;
  }
  const localized = displayHistoryPerson(person, "zh-TW");
  const oldNames = (nameVariants[person.id] ?? []).filter(value => value === "馬丁·路德·金" || !localized.name.zh.includes(value));
  for (const field of ["name", "region", "field", "bio"]) checkTaiwan(localized[field].zh, `${person.id}.${field}`, oldNames);
  if (/裡|維希·範·貝多芬|萊布尼茨/u.test(localized.name.zh)) problems.push(`${person.id}: incorrect Taiwan name`);
  checkLocalized(result, person.id, oldNames);
  checkLocalized(historyProfileNotes[person.id], `${person.id}.notes`, oldNames);
  checkLocalized(historyProfileExpansions[person.id], `${person.id}.expansion`, oldNames);
  if (!/^Q[1-9]\d*$/u.test(person.qid) || !sitelinks[person.qid]?.en || names.has(person.qid)) problems.push(`${person.id}: invalid or duplicate Wikidata identity`);
  names.add(person.qid);
  if (!existsSync(new URL(`../../public/images/global-history/${person.id}.jpg`, import.meta.url))) problems.push(`${person.id}: missing JPG`);

  legacy.push({
    slug: person.id,
    facts: Object.fromEntries(locales.map(locale => [
      locale,
      shingles(`${result.superpower[locale]} ${result.quirk_or_blindspot[locale]}`, locale),
    ])),
  });
  const geo = globalHistoryGeoEditorial[person.id];
  if (!geo) continue;
  const mappedAxes = historyDecisionAxes[person.id];
  if (!mappedAxes?.length || new Set(mappedAxes).size !== mappedAxes.length ||
      mappedAxes.some(name => !historyAxes.some(axis => axis.en === name))) {
    problems.push(`${person.id}: missing or invalid decision evidence mapping`);
  }
  const flagship = historyFlagships[person.id];
  if (flagship) {
    const beforeFlagshipChecks = problems.length;
    const sourceRecords = [geo.decision.source, ...flagship.evidence.map(({ source }) => source)];
    const mapped = new Set(flagship.episodes.flatMap(episode => episode.axes));
    const flagshipSources = [...sourceRecords, flagship.alternative];
    if (flagshipSources.some(({ url }) => /(?:^|\.)ctext\.org$/u.test(new URL(url).hostname))) {
      problems.push(`${person.id}: blocked flagship citation host`);
    }
    checkFlagshipCitation(person.id, "M6/M9 alternative", flagship.alternative.title, flagship.alternative.locator);
    sourceRecords.forEach(({ label, locator }, index) =>
      checkFlagshipCitation(person.id, `M9 E${index + 1}`, label, locator));
    const primaryWork = historyProfileNotes[person.id]?.primaryWork;
    if (primaryWork) checkFlagshipCitation(person.id, "M9 primary work", primaryWork.title, primaryWork.locator);
    if (!tier1.includes(person.id) || flagship.episodes.length !== sourceRecords.length ||
        sourceRecords.length < 2 || sourceRecords.length > 3 ||
        new Set(sourceRecords.map(source => new URL(source.url).hostname.replace(/^www\./u, ""))).size !== sourceRecords.length ||
        flagship.evidence.some((episode, index) =>
          [...episode.axes].sort().join("/") !== [...flagship.episodes[index + 1].axes].sort().join("/")) ||
        mapped.size < 3 || mapped.size > 5 || [...mapped].some(name => !historyAxes.some(axis => axis.en === name))) {
      problems.push(`${person.id}: invalid flagship sources or linked dimensions`);
    }
    checkLocalized(flagship, `${person.id}.flagship`, oldNames);
    const lengths = {};
    for (const locale of locales) {
      const narrative = flagship.episodes.flatMap(episode => episode.paragraphs[locale].split("\n\n"));
      for (const paragraph of narrative) {
        flagshipParagraphs.push({ slug: person.id, locale, shingle: shingles(paragraph, locale) });
        if (locale !== "en" && /(?:英语读者|英語讀者|英文读者|英文讀者|翻[译譯]中的.{0,3}["“「]I)/u.test(paragraph)) {
          problems.push(`${person.id}.${locale}: translated reader perspective`);
        }
      }
      const core = [...narrative, geo.decision.fact[locale], geo.decision.interpretation[locale],
        ...flagship.evidence.flatMap(item => [item.fact[locale], item.interpretation[locale]]),
        flagship.alternative.rationale[locale], flagship.typeAnswer[locale], flagship.followup.answer[locale]].join(" ");
      const count = locale === "en"
        ? (core.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length
        : (core.match(/\p{Script=Han}/gu) ?? []).length;
      lengths[locale] = count;
      const [min, max] = locale === "en" ? [800, 1200] : [1200, 1800];
      if (count < min || count > max || !flagship.followup.question[locale] || !flagship.followup.answer[locale] ||
          !flagship.typeAnswer[locale] || !flagship.alternative.rationale[locale] ||
          sourceRecords.some(source => !source.label[locale] || !source.locator[locale])) {
        problems.push(`${person.id}.${locale}: invalid flagship content or length: ${count}`);
      }
    }
    if (problems.length === beforeFlagshipChecks) {
      flagshipStats.push({ slug: person.id, evidence: sourceRecords.length, axes: mapped.size, lengths });
    }
  }
  checkLocalized(historyStandards[person.id], `${person.id}.standard`, oldNames);
  checkLocalized(geo, `${person.id}.geo`, oldNames);
  const mbti = result.personality_benchmark.inferred_mbti;
  const cox = result.iq_benchmark;
  const years = text => [...new Set(text.match(/(?<!\d)[12]\d{3}(?!\d)/gu) ?? [])]
    .filter(year => year !== "1926").sort().join(",");
  if (new Set(locales.map(locale => years(geo.summary[locale]))).size !== 1) {
    problems.push(`${person.id}: summary dates differ between locales`);
  }
  // A personal initial is not a sentence boundary. Leave Roman numerals such as Charles I. intact.
  const english = geo.summary.en.replace(/(?<![\p{L}])([A-HJ-Z])\.(?=\s+[A-Z])/gu, "$1");
  const sections = [...englishSentences.segment(english)].map(({ segment }) => segment);
  if (sections.length !== 3 || !sections[1]?.includes(mbti) || !/\bCox\b/u.test(sections[2] ?? "")) {
    problems.push(`${person.id}: English summary must contain one event, one MBTI interpretation and one Cox statement`);
  }
  for (const locale of locales) {
    const summary = geo.summary[locale];
    const length = locale === "en" ? summary.split(/\s+/u).length : [...summary.replace(/\s/gu, "")].length;
    if (length < (locale === "en" ? 24 : 60) || length > 80) problems.push(`${person.id}.${locale}: summary length ${length}`);
    if (!summary.includes(mbti) || !/cox/iu.test(summary)) problems.push(`${person.id}.${locale}: summary MBTI or Cox missing`);
    if (cox.has_cox_data) {
      const figures = new Set(summary.match(/\d+/gu)?.map(Number));
      if (!figures.has(cox.estimate.childhood_corrected) || !figures.has(cox.estimate.youth_corrected)) {
        problems.push(`${person.id}.${locale}: summary Cox estimates differ from source`);
      }
    } else {
      const coxAt = summary.toLowerCase().lastIndexOf("cox");
      const coverage = summary.slice(coxAt);
      const listedWithoutEstimate = listedWithoutCoxEstimate.has(person.id) &&
        /列名但未估值|list him without an estimate/iu.test(summary);
      if (!listedWithoutEstimate && !/未.{0,4}(?:收录|收錄)|(?:did|does) not include|not in|does not appear|is not in|not listed|no entry|does not list|never included/iu.test(summary)) {
        problems.push(`${person.id}.${locale}: summary must state the absence of Cox coverage`);
      }
      const namedSubject = locale === "en"
        ? coverage.match(/(?:not include|does not list) ([\p{Lu}][\p{L}’'-]*(?: [\p{Lu}][\p{L}’'-]*)*)/u)?.[1]
        : coverage.match(/未(?:被)?(?:收录|收錄)([\p{Script=Han}·]{2,16})[。；，]/u)?.[1];
      if (namedSubject && !/^(这|這|该|該|此前|其)/u.test(namedSubject) &&
          !summary.slice(0, coxAt).toLowerCase().includes(namedSubject.toLowerCase())) {
        problems.push(`${person.id}.${locale}: named Cox subject differs from the summary subject`);
      }
    }
    if (!geo.decision.fact[locale] || !geo.decision.interpretation[locale] || !geo.question[locale] || !geo.answer[locale]) problems.push(`${person.id}.${locale}: missing decision evidence or question`);
  }
  const source = geo.decision.source;
  for (const field of ["label", "locator"]) {
    if (!/\p{Script=Han}/u.test(source[field].zh) || !/\p{Script=Han}/u.test(source[field]["zh-TW"])
        || !source[field].en || /\p{Script=Han}/u.test(source[field].en)) {
      problems.push(`${person.id}: incomplete trilingual source ${field}`);
    }
  }
  const destination = new URL(source.url);
  if (/^(?:www\.)?ctext\.org$|^old\.maa\.org$/u.test(destination.hostname)
      || /(?:^|\/)~[^/]+/u.test(destination.pathname)
      || (destination.hostname === "web.mit.edu" && /^\/8\.13\//u.test(destination.pathname))) {
    problems.push(`${person.id}: outdated source ${destination.hostname}${destination.pathname}`);
  }
  if (!geo.decision.source.url.startsWith("https://") || !geo.decision.source.locator || new URL(geo.decision.source.url).hostname === "old.maa.org") {
    problems.push(`${person.id}: missing source locator or inactive source host`);
  }
  reviewed.push({
    slug: person.id,
    summaries: Object.fromEntries(locales.map(locale => [locale, shingles(geo.summary[locale], locale)])),
    facts: Object.fromEntries(locales.map(locale => [locale, shingles(geo.decision.fact[locale], locale)])),
    answers: Object.fromEntries(locales.map(locale => [locale, shingles(geo.answer[locale], locale)])),
  });
}

for (const slug of Object.keys(globalHistoryGeoEditorial)) if (!slugSet.has(slug)) problems.push(`${slug}: unknown editorial identity`);
checkLocalized(historyAtlasCopy, "atlas");
checkLocalized(historyAxes, "behavior axes");

for (const [section, records, field] of [
  ["existing body", legacy, "facts"],
  ["summary", reviewed, "summaries"],
  ["decision evidence", reviewed, "facts"],
  ["decision answer", reviewed, "answers"],
]) {
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      for (const locale of locales) {
        if (casesTooSimilar(records[i][field][locale], records[j][field][locale])) {
          problems.push(`${locale}: similar ${section} ${records[i].slug} / ${records[j].slug}`);
        }
      }
    }
  }
}

if (historyPeople.length !== 488 || slugSet.size !== 488 || Object.keys(sitelinks).length !== 488) problems.push("History identity count must be exactly 488");
if (process.argv.includes("--require-reviewed") && reviewed.length !== historyPeople.length) {
  problems.push(`Reviewed editorial coverage: ${reviewed.length}/${historyPeople.length}`);
}
for (let i = 0; i < flagshipParagraphs.length; i++) {
  const a = flagshipParagraphs[i];
  for (const b of flagshipParagraphs.slice(i + 1)) {
    if (a.slug !== b.slug && a.locale === b.locale && casesTooSimilar(a.shingle, b.shingle)) {
      problems.push(`${a.locale}: similar flagship paragraphs ${a.slug} / ${b.slug}`);
    }
  }
}
const passedFlagships = new Set(flagshipStats.map(({ slug }) => slug));
const missingFlagships = tier1.filter(slug => !passedFlagships.has(slug));
if (process.argv.includes("--require-flagships") && missingFlagships.length) {
  problems.push(`Flagship coverage: ${flagshipStats.length}/${tier1.length}. Missing: ${missingFlagships.join(", ")}`);
}
if (process.argv.includes("--flagship-report")) {
  const batchSize = 20;
  const batches = [];
  for (let offset = 0; offset < tier1.length; offset += batchSize) {
    const slugs = tier1.slice(offset, offset + batchSize);
    batches.push({
      batch: batches.length + 1,
      pass: slugs.filter(slug => passedFlagships.has(slug)).length,
      total: slugs.length,
    });
  }
  const evidenceCountDistribution = {};
  for (const { evidence } of flagshipStats) {
    evidenceCountDistribution[evidence] = (evidenceCountDistribution[evidence] ?? 0) + 1;
  }
  console.log(JSON.stringify({
    expected: tier1.length,
    records: flagshipStats,
    missing: missingFlagships,
    batches,
    evidenceCountDistribution,
  }, null, 2));
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`History Taiwan, QID, JPG and reviewed editorial checks passed. Reviewed content: ${reviewed.length}/${historyPeople.length}.`);
}
