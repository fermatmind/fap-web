import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { build, collect, convertText } from "./convert-zh-tw.mjs";

const root = new URL("../../", import.meta.url);
const editions = {
  "mythical-creature": ["mythical-creature", "MythicalCreature", "mythicalCreature"],
  "what-dog-breed-am-i": ["dog-breed", "DogBreed", "dogBreed"],
  "superpower-test": ["superpower", "Superpower", "superpower"],
  "barbie-character": ["barbie-character", "Barbie", "barbieLanding", true],
  "avengers-character": ["avengers-character", "Avengers", "avengersLanding", true],
  "wednesday-addams-character": ["wednesday-addams-character", "Wednesday", "wednesdayLanding", true],
  "twilight-character": ["twilight-character", "Twilight", "twilightLanding", true],
  "stranger-things": ["stranger-things", "StrangerThings", "strangerThingsLanding", true],
  "ginny-and-georgia-character-quiz": ["ginny-georgia", "GinnyGeorgia", "ginnyGeorgiaLanding", true],
  "gilmore-girls": ["gilmore-girls", "GilmoreGirls", "gilmoreGirlsLanding", true],
  "dexter": ["dexter", "Dexter", "dexterLanding", true],
  "gossip-girl": ["gossip-girl", "GossipGirl", "gossipGirlLanding", true],
  "game-of-thrones": ["game-of-thrones", "GameOfThrones", "gameOfThronesLanding", true],
  "harry-potter-character": ["harry-potter-character", "HarryPotter", "harryPotterLanding", true],
  "euphoria-character-quiz": ["euphoria-character-quiz", "Euphoria", "euphoriaLanding", true],
  "hazbin-hotel-character-quiz": ["hazbin-hotel", "HazbinHotel", "hazbinHotelLanding", true],
  "my-hero-academia-character-quiz": ["my-hero-academia", "MyHeroAcademia", "myHeroAcademiaLanding", true],
  "my-little-pony-character-quiz": ["my-little-pony", "MyLittlePony", "myLittlePonyLanding", true],
  "nana-character": ["nana-character", "Nana", "nanaLanding", true],
  "south-park": ["south-park", "SouthPark", "southParkLanding", true],
  "jujutsu-kaisen-character": ["jujutsu-kaisen-character", "JujutsuKaisen", "jujutsuKaisenLanding", true],
  "amazing-digital-circus": ["amazing-digital-circus", "DigitalCircus", "digitalCircusLanding", true],
  "blue-lock": ["blue-lock", "BlueLock", "blueLockLanding", true],
  "anime-character-archetype-test": ["anime-character-archetype-test", "AnimeStoryRoles", "animeStoryRolesLanding", true],
  "space-marine-chapter": ["space-marine-chapter", "SpaceMarineChapters", "spaceMarineChaptersLanding", true],
  "hundred-acre-wood-friend-quiz": ["hundred-acre-wood-friend-quiz", "StorybookFriends", "storybookFriendsLanding", true],
  "apocalypse-survival-type-test": ["apocalypse-survival-type-test", "Apocalypse", "apocalypseLanding", true],
  "next-life": ["next-life", "NextLife", "nextLifeLanding", true],
  "villain-era-archetype-test": ["villain-era-archetype-test", "VillainEra", "villainEraLanding", true],
  "big-fish-energy-test": ["big-fish-energy-test", "BigFish", "bigFishLanding", true],
  "decade-aesthetic-test": ["decade-aesthetic-test", "Decade", "decadeLanding", true],
  "bojack-horseman-character-quiz": ["bojack-horseman", "BoJack", "", "summaries"],
  "naruto-character": ["naruto-character", "Naruto", "", "summaries"],
  "death-note": ["death-note", "DeathNote", "", "summaries"],
  "star-wars-character": ["star-wars-character", "StarWars", "", "summaries"],
  "hello-kitty": ["hello-kitty", "HelloKitty", "", "summaries"],
  "disney-princess": ["disney-princess", "DisneyPrincess", "", "summaries"],
  "jungian-archetype": ["jungian-archetype", "JungianArchetype", "jungianArchetype", "summaries"],
  "temperament": ["temperament", "Temperament", "temperament", "summaries"],
  "leadership-style": ["leadership-style", "Leadership", "leadership", "summaries"],
  "travel-personality-test": ["travel-personality", "Travel", "travel", "summaries"],
  "aesthetic-core-test": ["aesthetic-core", "Aesthetic", "aesthetic", "summaries"],
  "tsundere-dere-type": ["dere-type", "Dere", "dere", "summaries"],
  "hogwarts-house-quiz": ["hogwarts-house", "Hogwarts", "hogwarts", "summaries"],
  "found-family-role-test": ["found-family-role-test", "FoundFamilyRole", "foundFamilyRoleLanding", "standalone"],
  "chinese-zodiac": ["chinese-zodiac", "ChineseZodiac", "chineseZodiacLanding", "standalone"],
  "zodiac-sign-quiz": ["zodiac-sign-quiz", "ZodiacStory", "zodiacStoryLanding", "standalone"],
  "male-archetype-test": ["four-roles", "MaleRole", "maleRoleLanding", "standalone"],
  "wojak": ["wojak", "Wojak", "wojakLanding", "standalone"],
};
const sourceOnly = ["avatar-bender-quiz", "soldier-poet-king-quiz"];
const output = new URL("lib/i18n/zh-TW/archetype-questionnaires.generated.json", root);
const membersOutput = new URL("lib/i18n/zh-TW/archetype-questionnaire-members.generated.json", root);
const read = (file) => existsSync(file) ? readFileSync(file, "utf8") : "";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const previous = read(output);
const sourcePaths = Object.entries(editions).flatMap(([slug, [reading]]) => [
  `lib/questionnaires/data/${slug}.json`,
  `lib/questionnaires/result-content/${reading}.json`,
]).concat(sourceOnly.map(slug => `lib/questionnaires/data/${slug}.json`));
// These seven live introductions, methods and FAQ use the same entry-copy
// corrections as the original reader, including the current no-draft policy.
const correctedSources = {};
const correctionSnapshots = {};
const noDraft = "这份测试不保存答题进度，重新整理、切换语言或离开后需要重新开始";
const formerDraftCopy = [
  ["自愿开启的草稿只在本标签页保存最多24小时，完成、清除或重测即删", noDraft],
  ["可选标签页草稿24小时失效，完成、退出并清除或重测即删；未存草稿刷新会丢进度", noDraft],
  ["可选标签页草稿会失效，完成或清除后删除", noDraft],
  ["可选标签页草稿24小时失效，完成、重测或退出并清除即删；未存草稿刷新丢进度", noDraft],
  ["草稿主动开启，仅本设备24小时，完成、退出或重测清除；不保存也能完成", noDraft],
  ["可选标签页草稿24小时失效，完成、重测或退出清除即删除", noDraft],
  ["草稿仅在主动开启后于本标签页保存最多24小时，完成、清除或重测即删除", noDraft],
  ["仅主动保存时保留本标签页24小时内的进度，完成、清除或重测会删除", noDraft],
  ["默认不保存，主动选择临时保存后，本标签页可在24小时内恢复。完成、清除退出或重测会清除临时进度", noDraft],
  ["主动保存才建立本标签页24小时草稿，完成、清除或重测即删除", noDraft],
  ["免费全文、草稿与相伴比喻的边界", "免费全文、答题进度与相伴比喻的边界"],
  ["完整结果、草稿和分享需要付费吗", "完整结果和分享需要付费吗"],
  ["草稿、重测和分享怎样处理", "答题进度、重测和分享怎样处理"],
  ["草稿、重测和公开分享怎样运作", "答题进度、重测和公开分享怎样运作"],
  ["私密选择、可选草稿与分享", "私密选择、答题进度与分享"],
  ["作答、保存与重测", "作答进度与重测"],
  ["或先同意保存", ""],
];
const correctStandaloneCopy = text => formerDraftCopy.reduce((value, [before, after]) => value.replaceAll(before, after), text);
for (const [slug, [, component, correction, layout]] of Object.entries(editions)) {
  if (layout === "standalone") {
    // QuestionnaireTakeDocument opens a fresh in-memory session on every entry.
    const data = `lib/questionnaires/data/${slug}.json`;
    correctionSnapshots[data] = read(new URL(data, root));
    correctedSources[data] = JSON.parse(correctionSnapshots[data], (key, value) =>
      key === "zh" && typeof value === "string" ? correctStandaloneCopy(value) : value);
  }
  if (layout !== "summaries" || !correction) continue;
  const editorial = `components/questionnaires/${component}LandingEditorial.ts`;
  const data = `lib/questionnaires/data/${slug}.json`;
  correctionSnapshots[editorial] = read(new URL(editorial, root));
  correctionSnapshots[data] = read(new URL(data, root));
  const { [`${correction}CurrentEntryCopy`]: currentCopy } = await import(new URL(editorial, root));
  const quiz = JSON.parse(correctionSnapshots[data]);
  const apply = text => ({ ...text, zh: currentCopy(text.zh, "zh") });
  quiz.introduction = apply(quiz.introduction);
  quiz.guide = quiz.guide.map(section => ({
    ...section,
    title: apply(section.title),
    paragraphs: section.paragraphs.map(apply),
  }));
  quiz.faq = quiz.faq.map(item => ({ question: apply(item.question), answer: apply(item.answer) }));
  correctedSources[data] = quiz;
}
const { artifact, snapshots } = build(previous ? JSON.parse(previous) : {}, sourcePaths, correctedSources);
const previousUnits = previous ? JSON.parse(previous).units : {};
const members = Object.fromEntries(sourceOnly.map(slug => [slug, JSON.parse(snapshots[`lib/questionnaires/data/${slug}.json`]).profiles.map(profile => profile.id)]));
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

for (const [slug, [, name, prefix, layout]] of Object.entries(editions)) {
  const quiz = JSON.parse(snapshots[`lib/questionnaires/data/${slug}.json`]);
  members[slug] = quiz.profiles.map(profile => profile.id);
  const file = `components/questionnaires/${name}LandingEditorial.ts`;
  const raw = read(new URL(file, root));
  snapshots[file] = raw;
  artifact.sourceHashes[file] = digest(raw);
  const syntax = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true);
  const declarations = syntax.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations]);
  const fields = layout === "summaries"
    ? [["summaries", "summaries"]]
    : [["sections", "Sections"], ["faq", "Faq"]];
  if (!layout) fields.push(["summaries", "Summaries"], ["privacy", "PrivacyAnswer"]);
  for (const [field, suffix] of fields) {
    const name = layout === "summaries" ? suffix : prefix + suffix;
    const declaration = declarations.find(candidate => candidate.name.getText(syntax) === name);
    if (!declaration?.initializer) throw new Error(`Missing editorial source: ${file}/${field}`);
    const strings = collect(readLiteral(declaration.initializer));
    if (layout === "summaries" && (Object.keys(strings).length !== members[slug].length ||
        members[slug].some(id => !Object.hasOwn(strings, `/${id}`)))) {
      throw new Error(`Missing landing profile summaries: ${slug}`);
    }
    for (const [pointer, original] of Object.entries(strings)) {
      const source = layout === "standalone" ? correctStandaloneCopy(original) : original;
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
  const allSnapshots = [...Object.entries(snapshots), ...Object.entries(correctionSnapshots)];
  if (allSnapshots.some(([name, bytes]) => read(new URL(name, root)) !== bytes) || read(file) !== old) {
    throw new Error("Taiwan archetype questionnaire source or target changed concurrently");
  }
  const temporary = new URL(`${file.href}.${process.pid}.tmp`);
  writeFileSync(temporary, next, { flag: "wx" });
  renameSync(temporary, file);
}
console.log(`zh-TW archetype questionnaires: ${Object.keys(members).length} readers, ${Object.keys(artifact.units).length} source-bound strings`);
