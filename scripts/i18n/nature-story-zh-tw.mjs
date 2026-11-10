import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { build, collect, convertText } from "./convert-zh-tw.mjs";

const root = new URL("../../", import.meta.url);
const sources = {
  "beachcomber": ["Beachcomber", "beachcomber"],
  "birdwatching-companion": ["Birdwatching", "birdwatching"],
  "cloud-drift": ["CloudDrift", "cloudDrift"],
};
const output = new URL("lib/i18n/zh-TW/nature-stories.generated.json", root);
const memberOutput = new URL("lib/i18n/zh-TW/nature-story-members.generated.json", root);
const read = (file) => existsSync(file) ? readFileSync(file, "utf8") : "";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const before = read(output);
const previous = before ? JSON.parse(before) : {};
const quizPaths = Object.keys(sources).map((slug) => `lib/entertainment/data/${slug}.json`);
const { artifact, snapshots } = build({ units: previous.quizUnits }, quizPaths);
const members = {};
const editorials = {};
const sourceHashes = { ...artifact.sourceHashes };
const terms = [["观鸟", "賞鳥"], ["画像", "人物側寫"], ["测试", "測驗"], ["测验", "測驗"]];
for (const [slug, [name, prefix]] of Object.entries(sources)) {
  const quiz = JSON.parse(snapshots[`lib/entertainment/data/${slug}.json`]);
  members[slug] = quiz.results.map((item) => item.id);
  const file = `components/entertainment/${name}Editorial.ts`;
  const raw = read(new URL(file, root));
  snapshots[file] = raw;
  sourceHashes[file] = digest(raw);
  const syntax = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true);
  const declarations = syntax.statements.filter(ts.isVariableStatement).flatMap((statement) => [...statement.declarationList.declarations]);
  const copy = Object.fromEntries(["Sections", "Faq"].map((part) => {
    const name = prefix + part;
    const declaration = declarations.find((candidate) => candidate.name.getText(syntax) === name);
    if (!declaration?.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) throw new Error(`Missing nature story source: ${name}`);
    return [part.toLowerCase(), JSON.parse(declaration.initializer.getText(syntax))];
  }));
  for (const [pointer, original] of Object.entries(collect(copy))) {
    const id = `${slug}${pointer}`;
    const sourceHash = digest(JSON.stringify([file, id, original, artifact.converter, terms]));
    const prior = previous.editorialUnits?.[id];
    editorials[id] = prior?.sourceHash === sourceHash ? prior : { sourceHash, text: convertText(original, terms) };
  }
}

const outputs = [[output, before, { targetLocale: artifact.targetLocale, converter: artifact.converter, sourceHashes, quizUnits: artifact.units, editorialUnits: editorials }], [memberOutput, read(memberOutput), members]];
for (const [file, old, value] of outputs) {
  const next = JSON.stringify(value, null, 2) + "\n";
  if (next === old) continue;
  if (process.argv.includes("--check")) throw new Error("Taiwan nature story sources changed. Run pnpm i18n:zh-TW");
  if (Object.entries(snapshots).some(([name, bytes]) => read(new URL(name, root)) !== bytes) || read(file) !== old) {
    throw new Error("Taiwan nature story source or target changed concurrently");
  }
  const temporary = new URL(`${file.href}.${process.pid}.tmp`);
  writeFileSync(temporary, next, { flag: "wx" });
  renameSync(temporary, file);
}
console.log(`zh-TW nature stories: ${Object.keys(members).length} readers, ${Object.keys(artifact.units).length + Object.keys(editorials).length} source-bound strings`);
