import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { build, collect, convertText } from "./convert-zh-tw.mjs";

const root = new URL("../../", import.meta.url);
const editions = {
  "mythical-creature": ["mythical-creature", "MythicalCreature", "mythicalCreature"],
  "what-dog-breed-am-i": ["dog-breed", "DogBreed", "dogBreed"],
  "superpower-test": ["superpower", "Superpower", "superpower"],
};
const output = new URL("lib/i18n/zh-TW/archetype-questionnaires.generated.json", root);
const membersOutput = new URL("lib/i18n/zh-TW/archetype-questionnaire-members.generated.json", root);
const read = (file) => existsSync(file) ? readFileSync(file, "utf8") : "";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const previous = read(output);
const sourcePaths = Object.entries(editions).flatMap(([slug, [reading]]) => [
  `lib/questionnaires/data/${slug}.json`,
  `lib/questionnaires/result-content/${reading}.json`,
]);
const { artifact, snapshots } = build(previous ? JSON.parse(previous) : {}, sourcePaths);
const previousUnits = previous ? JSON.parse(previous).units : {};
const members = {};
const terms = [["测试", "測驗"], ["测验", "測驗"], ["链接", "連結"], ["画像", "人物側寫"]];

function readLiteral(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(readLiteral);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((property) => {
    if (!ts.isPropertyAssignment(property) || (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name))) throw new Error("Unexpected editorial property");
    return [property.name.text, readLiteral(property.initializer)];
  }));
  throw new Error("Unexpected editorial expression");
}

for (const [slug, [, name, prefix]] of Object.entries(editions)) {
  const quiz = JSON.parse(snapshots[`lib/questionnaires/data/${slug}.json`]);
  members[slug] = quiz.profiles.map(profile => profile.id);
  const file = `components/questionnaires/${name}LandingEditorial.ts`;
  const raw = read(new URL(file, root));
  snapshots[file] = raw;
  artifact.sourceHashes[file] = digest(raw);
  const syntax = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true);
  const declarations = syntax.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations]);
  for (const [field, suffix] of [["sections", "Sections"], ["faq", "Faq"], ["summaries", "Summaries"], ["privacy", "PrivacyAnswer"]]) {
    const declaration = declarations.find(candidate => candidate.name.getText(syntax) === prefix + suffix);
    if (!declaration?.initializer) throw new Error(`Missing editorial source: ${file}/${field}`);
    for (const [pointer, source] of Object.entries(collect(readLiteral(declaration.initializer)))) {
      const id = `${slug}/editorial/${field}${pointer}`;
      const sourceHash = digest(JSON.stringify([id, source, artifact.converter, terms]));
      artifact.units[id] = previousUnits[id]?.sourceHash === sourceHash ? previousUnits[id] : { sourceHash, text: convertText(source, terms) };
    }
  }
}

for (const [file, old, value] of [[output, previous, artifact], [membersOutput, read(membersOutput), members]]) {
  const next = JSON.stringify(value, null, 2) + "\n";
  if (next === old) continue;
  if (process.argv.includes("--check")) throw new Error("Taiwan archetype questionnaire source changed. Run pnpm i18n:zh-TW");
  if (Object.entries(snapshots).some(([name, bytes]) => read(new URL(name, root)) !== bytes) || read(file) !== old) {
    throw new Error("Taiwan archetype questionnaire source or target changed concurrently");
  }
  const temporary = new URL(`${file.href}.${process.pid}.tmp`);
  writeFileSync(temporary, next, { flag: "wx" });
  renameSync(temporary, file);
}
console.log(`zh-TW archetype questionnaires: ${Object.keys(members).length} readers, ${Object.keys(artifact.units).length} source-bound strings`);
