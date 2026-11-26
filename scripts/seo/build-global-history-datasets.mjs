import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const root = new URL("../../", import.meta.url);
const jiti = createJiti(import.meta.url, { alias: { "@": fileURLToPath(root) }, fsCache: false });
const { historyAtlasDownloads } = await jiti.import("../../lib/entertainment/global-history/config.ts");
const { historyPeople } = await jiti.import("../../lib/entertainment/global-history/people.ts");
const { getHistoryResult } = await jiti.import("../../lib/entertainment/global-history/result-v2.ts");
const { displayHistoryPerson } = await jiti.import("../../lib/entertainment/global-history/traditional-roster.ts");
const cox = JSON.parse(readFileSync(new URL("lib/entertainment/global-history/cox-estimates.json", root), "utf8"));
const check = process.argv.includes("--check");
const locales = ["zh", "zh-TW", "en"];

const csvCell = value => {
  const text = String(value ?? "");
  return /[,"\r\n]/u.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
};
function csv(columns, rows) {
  return [columns.join(","), ...rows.map(row => columns.map(key => csvCell(row[key])).join(","))].join("\n") + "\n";
}
function emit(atlas, extension, contents) {
  const file = fileURLToPath(new URL("public" + historyAtlasDownloads[atlas] + "." + extension, root));
  if (check) {
    if (readFileSync(file, "utf8") !== contents) throw new Error(`Dataset is out of date: ${file}`);
    return;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

const readings = historyPeople.map(person => {
  const result = getHistoryResult(person);
  if (!result) throw new Error(`Missing reading: ${person.id}`);
  return {
    person_id: person.id,
    wikidata_id: person.qid,
    biographical_mbti: result.personality_benchmark.inferred_mbti,
    ...Object.fromEntries(locales.flatMap(locale => {
      const localized = displayHistoryPerson(person, locale);
      const language = locale === "en" ? "en" : "zh";
      const suffix = locale.replace("-", "_");
      return Object.entries({
        name: localized.name[language], era: result.era[locale],
        region: localized.region[language], field: localized.field[language],
      }).map(([field, value]) => [field + "_" + suffix, value]);
    })),
  };
});
const coxRows = Object.values(cox.entries).sort((a, b) => a.group.localeCompare(b.group) || a.rank - b.rank);
const coxFields = [
  "person_id", "wikidata_id", "name", "dates", "table", "sheet_row", "group", "rank",
  "ai", "ai_pe", "ai_grade", "ai_reliability", "childhood_corrected",
  "aii", "aii_pe", "aii_grade", "aii_reliability", "youth_corrected", "identity_note",
  "original_source", "transcription_credit", "transcription_source", "transcription_license", "transcription_changes",
];
const coxCSV = coxRows.map(row => ({
  ...row, original_source: cox.source, transcription_credit: cox.transcription.creator,
  transcription_source: cox.transcription.url, transcription_license: cox.transcription.license,
  transcription_changes: cox.transcription.changes,
}));

emit("cox-1926", "csv", csv(coxFields, coxCSV));
emit("cox-1926", "json", JSON.stringify({
  source: cox.source,
  transcription: cox.transcription,
  columns: {
    rank: "Eminence rank within group A or B, with fractional ties as printed.",
    ai: "Estimate using biographical material through age 17 (Table 12B: B I).",
    aii: "Estimate adding evidence from ages 17 to 26 (Table 12B: B II).",
    pe: "Probable error, as printed.",
    grade: "Reliability grade for the biographical material.",
    reliability: "Reliability coefficient for the material, not a test score.",
    sheet_row: "Location in the credited fold-out transcription.",
  },
  rows: coxRows,
}, null, 2) + "\n");
emit("personality-atlas", "csv", csv(Object.keys(readings[0]), readings));
emit("personality-atlas", "json", JSON.stringify({
  publisher: "FermatMind",
  interpretation: "Editorial readings of selected biographies; the type distribution is not a population norm.",
  rows: readings,
}, null, 2) + "\n");
console.log(`${readings.length} biographical readings and ${coxRows.length} Cox rows ${check ? "verified" : "exported"}.`);
