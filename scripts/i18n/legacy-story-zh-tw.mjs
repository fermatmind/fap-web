import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { build, collect, convertText } from "./convert-zh-tw.mjs";

const root = new URL("../../", import.meta.url);
const output = new URL("lib/i18n/zh-TW/legacy-stories.generated.json", root);
const membersOutput = new URL("lib/i18n/zh-TW/legacy-story-members.generated.json", root);
const editorialPath = "components/entertainment/AdditionalStoryEditorials.ts";
const catalogPath = "lib/entertainment/catalog.json";
const terms = [["趣味测试", "趣味測驗"], ["测验", "測驗"], ["测试", "測驗"], ["画像", "人物側寫"]];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = (path) => readFileSync(new URL(path, root), "utf8");

const previousText = readFileSync(output, "utf8");
const previousMembers = readFileSync(membersOutput, "utf8");
const previous = JSON.parse(previousText);
const editorialSource = read(editorialPath);
const syntax = ts.createSourceFile(editorialPath, editorialSource, ts.ScriptTarget.Latest, true);
const binding = syntax.statements.filter(ts.isVariableStatement)
  .flatMap((statement) => [...statement.declarationList.declarations])
  .find((declaration) => declaration.name.getText(syntax) === "additionalStoryEditorials");
const editorials = JSON.parse(binding.initializer.getText(syntax));

const catalogSource = read(catalogPath);
const catalog = new Map(JSON.parse(catalogSource).map((quiz) => [quiz.slug, quiz]));
const slugs = Object.keys(JSON.parse(previousMembers));
const members = Object.fromEntries(slugs.map((slug) => {
  const quiz = catalog.get(slug);
  if (!quiz || !Object.hasOwn(editorials, slug)) throw new Error(`Missing legacy story source: ${slug}`);
  return [slug, quiz.resultSlugs];
}));
const sourcePaths = slugs.map((slug) => `lib/entertainment/data/${slug}.json`);
const { artifact, snapshots } = build({ units: previous.quizUnits }, sourcePaths);
const editorialUnits = Object.fromEntries(Object.entries(collect(
  Object.fromEntries(Object.entries(editorials).filter(([slug]) => Object.hasOwn(members, slug))),
)).map(([id, original]) => {
  const sourceHash = hash(JSON.stringify(["zh-TW", editorialPath, id, original, artifact.converter, terms]));
  const prior = previous.editorialUnits[id];
  return [id, prior?.sourceHash === sourceHash ? prior : { sourceHash, text: convertText(original, terms) }];
}));
const next = {
  targetLocale: artifact.targetLocale,
  sourceCommit: previous.sourceCommit,
  converter: artifact.converter,
  sourceHashes: { ...artifact.sourceHashes, [editorialPath]: hash(editorialSource) },
  quizUnits: artifact.units,
  editorialUnits,
};
const encode = (value) => JSON.stringify(value, null, 2) + "\n";
for (const [file, before, value] of [[output, previousText, next], [membersOutput, previousMembers, members]]) {
  const encoded = encode(value);
  if (encoded === before) continue;
  if (process.argv.includes("--check")) throw new Error("Taiwan story source changed. Run node scripts/i18n/legacy-story-zh-tw.mjs");
  if (read(editorialPath) !== editorialSource || read(catalogPath) !== catalogSource
    || Object.entries(snapshots).some(([source, bytes]) => read(source) !== bytes)
    || readFileSync(file, "utf8") !== before) throw new Error("Taiwan story source or target changed concurrently");
  const temporary = new URL(`${file.href}.${process.pid}.tmp`);
  writeFileSync(temporary, encoded, { flag: "wx" });
  renameSync(temporary, file);
}
console.log(`zh-TW stories: ${slugs.length} readers, ${Object.keys(artifact.units).length + Object.keys(editorialUnits).length} source-bound strings`);

await import("./bespoke-story-zh-tw.mjs");
await import("./archetype-questionnaire-zh-tw.mjs");
await import("./likert-questionnaire-zh-tw.mjs");
await import("./directional-questionnaire-zh-tw.mjs");
