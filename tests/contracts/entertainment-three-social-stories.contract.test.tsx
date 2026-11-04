import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const fixtures = [
 {slug:"weather-in-a-bottle",hash:"187db72ecd5203ca35d834440f0315eed21d587749eda622879e5bcfff006c77",mapping:[["mist","breeze","sun"],["breeze","sun","mist"],["sun","mist","breeze"],["mist","breeze","sun"],["breeze","mist","sun"],["sun","mist","breeze"]]},
 {slug:"weekend-pace",hash:"f823ee8216e9e5b361797e7dc76ee5c056b99b5022bec63f5e006544f4e33acb",mapping:[["anchor","open","space"],["space","anchor","open"],["open","anchor","space"],["space","anchor","open"],["open","anchor","space"],["anchor","open","space"]]},
 {slug:"woodland-animal",hash:"6077b85fbc0ea0155c5fe296af047a2702965c4495d8fbb787b24e113f8551ac",mapping:[["jay","beaver","hedgehog"],["beaver","jay","hedgehog"],["hedgehog","beaver","jay"],["jay","beaver","hedgehog"],["beaver","jay","hedgehog"],["hedgehog","jay","beaver"]]},
 {slug:"tiny-kingdom",hash:"5736a8d7d9bf367dd44e85de93d52bef4a312dfc0ec41c60e29d34f4f871b5af",mapping:[["exchange","experiment","promise"],["experiment","exchange","promise"],["exchange","experiment","promise"],["promise","exchange","experiment"],["experiment","promise","exchange"],["promise","exchange","experiment"]]},
 {slug:"tiny-superpower",hash:"1037434f514b8bdd61f906b971cb19c2ce8f8de54098bf472a001148cafa1241",mapping:[["word","pause","edge"],["pause","edge","word"],["edge","word","pause"],["word","pause","edge"],["pause","word","edge"],["edge","word","pause"]]},
 {slug:"tiny-treat",hash:"c239f182b5a410d709f3c2243b2444423a65753610f615a2176379523f1e79d9",mapping:[["moment","token","time"],["token","time","moment"],["time","moment","token"],["moment","token","time"],["token","moment","time"],["time","token","moment"]]},
 {slug:"tide-pool-creature",hash:"836cd10906f6215cac742593dde438bf61db407c1adb5dfda3d4c6e677d07e34",mapping:[["crab","shrimp","anemone"],["shrimp","crab","anemone"],["anemone","crab","shrimp"],["crab","shrimp","anemone"],["anemone","shrimp","crab"],["crab","shrimp","anemone"]]},
 {slug:"time-capsule",hash:"3a073b51087a119905951dd67af6f27da79bf4da756895c4e76c5bdff958ba00",mapping:[["scene","question","instruction"],["question","instruction","scene"],["instruction","scene","question"],["scene","question","instruction"],["question","scene","instruction"],["instruction","scene","question"]]},
 {slug:"storybook-narrator",hash:"d00f22290314cdd973823ac13c968857e0321d61b10f16a2a334c5091709087c",mapping:[["lens","chorus","wink"],["chorus","lens","wink"],["wink","lens","chorus"],["lens","wink","chorus"],["chorus","lens","wink"],["lens","chorus","wink"]]},
 {slug:"team-name-maker",hash:"364d5a8ef7c9c8244b75d120d2f614692855ca935267a5b9128f6a530e88bf49",mapping:[["wordplay","reference","process"],["wordplay","reference","process"],["reference","wordplay","process"],["process","wordplay","reference"],["process","wordplay","reference"],["reference","wordplay","process"]]},
 {slug:"thrift-shop-find",hash:"398807b037259c1e35bc7b72034a59049c4ed36758062535fb06048190202c1b",mapping:[["use","remake","trace"],["remake","use","trace"],["trace","use","remake"],["remake","use","trace"],["use","remake","trace"],["trace","use","remake"]]},
 {slug:"stargazing-role",hash:"ef41008bd4efbc0c7cc7d2861c361396e0020431d1a2d732930a049a9261cb38",mapping:[["pattern","tale","host"],["host","pattern","tale"],["tale","pattern","host"],["pattern","tale","host"],["host","pattern","tale"],["tale","pattern","host"]]},
 {slug:"souvenir-story",hash:"0ef9b979e0fdd3f653495f48485a1c3285ba74ca0e8df839ea1904eaa8be5984",mapping:[["use","moment","shared"],["moment","shared","use"],["shared","use","moment"],["moment","use","shared"],["use","shared","moment"],["use","moment","shared"]]},
 {slug:"small-apology",hash:"0b00924eb42f5c96b30ecaf6e67dfa777f93751959808c1338bbc52a2e8030ae",mapping:[["name","repair","space"],["name","repair","space"],["name","repair","space"],["repair","name","space"],["name","repair","space"],["repair","name","space"]]},
 {slug:"snow-day",hash:"531c87940e26fed43fb27b97b3df1d8e3332e134826ce5b0cc327bc228fd8f48",mapping:[["builder","character","player"],["builder","character","player"],["character","player","builder"],["player","builder","character"],["builder","character","player"],["character","builder","player"]]},
 {slug:"shared-hobby",hash:"72709098584ab375c29d2a9023defdd42d599e0bb172596bb61d933bf849bfcd",mapping:[["guest","parallel","swap"],["guest","parallel","swap"],["swap","parallel","guest"],["parallel","guest","swap"],["parallel","swap","guest"],["parallel","swap","guest"]]},
 {slug:"shared-ritual",hash:"5d6f634bb76e3e955534cd739dd66d71de42c0e1beaff520d1b63cdd64091cb2",mapping:[["cue","window","meaning"],["meaning","cue","window"],["window","cue","meaning"],["cue","meaning","window"],["meaning","window","cue"],["window","cue","meaning"]]},
 {slug:"shared-workspace",hash:"a8d0efa7ea4809ee6dea67118d774942353abc00dbba546c93a6c4d146425f31",mapping:[["label","tool","feedback"],["tool","label","feedback"],["feedback","label","tool"],["label","tool","feedback"],["feedback","label","tool"],["tool","label","feedback"]]},
 {slug:"secret-garden-gate",hash:"4de22d90a847c140417662f608e12853f91343c8a5f83a2c997f0ccd8ba36ae3",mapping:[["glimpse","process","contribute"],["process","contribute","glimpse"],["contribute","glimpse","process"],["glimpse","process","contribute"],["process","glimpse","contribute"],["contribute","glimpse","process"]]},
 {slug:"saying-goodbye",hash:"785486464a5b75f4cdd1113cd4fb70ea7b96c69fbdec3c51431abfdfb3983bfe",mapping:[["clear","detail","future"],["clear","future","detail"],["future","detail","clear"],["clear","detail","future"],["detail","clear","future"],["clear","detail","future"]]},
 {slug:"seasonal-table",hash:"3e1996b965609265b0f87ddd4b1ac3cfd4f330bbe77276edf09abe5808723f04",mapping:[["trace","space","shared"],["space","shared","trace"],["shared","trace","space"],["trace","space","shared"],["space","trace","shared"],["shared","space","trace"]]},
 {slug:"room-atmosphere",hash:"ef2d8626db0b48eb4b6aa2f093ebca07717c7735acf8706d17fd8c15f149e255",mapping:[["glow","space","layers"],["space","layers","glow"],["layers","glow","space"],["glow","space","layers"],["space","layers","glow"],["layers","glow","space"]]},
 {slug:"reunion-style",hash:"0dbe8926d25e3a0b5c6351480702198f1ed2ecd9c6697dc0f18cc1e88da3ed9c",mapping:[["thread","present","fresh"],["present","thread","fresh"],["fresh","thread","present"],["thread","present","fresh"],["fresh","present","thread"],["thread","present","fresh"]]},
 {slug:"river-crossing",hash:"07605a3924d2233462e09cf27aedd97effa105ec6ad83f7365ed5d603a70f3ea",mapping:[["tester","partner","pacer"],["tester","pacer","partner"],["pacer","partner","tester"],["partner","tester","pacer"],["pacer","tester","partner"],["partner","tester","pacer"]]},
 {slug:"road-trip-dj",hash:"8d33b16b118ba8cae54bb2bad08e68410defc03563207bfc8ad0c0e927658f40",mapping:[["turns","bridge","quiet"],["turns","bridge","quiet"],["turns","bridge","quiet"],["bridge","turns","quiet"],["quiet","turns","bridge"],["bridge","turns","quiet"]]},
 {slug:"rainy-window",hash:"91484cccdb208fc21f3bf8b14572c1b39a292a858119c0005720395d108adcc1",mapping:[["near","reflection","distance"],["reflection","near","distance"],["distance","near","reflection"],["near","reflection","distance"],["reflection","near","distance"],["distance","near","reflection"]]},
 {slug:"reading-ritual",hash:"415f5dce8765e9d38cfcb1f6cae5cbde802fcf9309c12200038c8edace8c20f1",mapping:[["immerse","trail","appointment"],["trail","immerse","appointment"],["immerse","appointment","trail"],["trail","appointment","immerse"],["immerse","appointment","trail"],["trail","immerse","appointment"]]},
 {slug:"quest-reward",hash:"793ab4894f30380b320ae59bfc8c429793b90623f948e45eb465f50dd02cf158",mapping:[["map","feast","token"],["feast","token","map"],["map","token","feast"],["token","map","feast"],["map","feast","token"],["feast","token","map"]]},
 {slug:"potluck-contribution",hash:"629c1a4f989660bd5de31cedce2c7544e7e1b58aedf2b144a38e498e125a2b04",mapping:[["menu","handover","note"],["menu","handover","note"],["note","handover","menu"],["handover","menu","note"],["note","menu","handover"],["handover","menu","note"]]},
 {slug:"quiet-company",hash:"84feadd7dc016822c7353e600530b9cc16a31c239d120959acff801476daf552",mapping:[["pages","view","task"],["view","pages","task"],["pages","view","task"],["view","task","pages"],["task","view","pages"],["pages","task","view"]]},
 {slug:"pocket-map",hash:"ee83a10a8a4d198a99afcf6962a9519177b235569443bd0e5d216b92d1933ebb",mapping:[["landmarks","stops","gaps"],["stops","gaps","landmarks"],["gaps","landmarks","stops"],["landmarks","stops","gaps"],["stops","landmarks","gaps"],["gaps","stops","landmarks"]]},
 {slug:"playlist-maker",hash:"88626ac323cf90f414ce984c5330ddecffc44181489304f08e9965a903655be1",mapping:[["arc","room","discovery"],["arc","discovery","room"],["room","discovery","arc"],["room","arc","discovery"],["discovery","arc","room"],["discovery","arc","room"]]},
 {slug:"party-arrival",hash:"3c3fa3980bc139b067edd6c66b744d159be2a3d9b16ffc49a5337bbabda3fdb3",mapping:[["conversation","activity","landing"],["conversation","activity","landing"],["landing","conversation","activity"],["conversation","landing","activity"],["activity","conversation","landing"],["landing","conversation","activity"]]},
 {slug:"personal-museum",hash:"2915d9caa11086b3a2ac9dd30126fa830a9c6ff98e74901f306c908b8bb4b217",mapping:[["sequence","detail","connection"],["detail","connection","sequence"],["connection","sequence","detail"],["sequence","detail","connection"],["detail","sequence","connection"],["connection","detail","sequence"]]},
 {slug:"photo-group-role",hash:"5afcdda6766ef36024d99b636a5efde04b1e29fab5a28a8ed15ff0164fd677ce",mapping:[["frame","choice","moment"],["frame","choice","moment"],["choice","frame","moment"],["frame","moment","choice"],["choice","frame","moment"],["moment","choice","frame"]]},
 {slug:"paper-creature-language",hash:"6fae2ad7e8f7eeb7102a37891d45d56674c0e800ab0cb053569035652c257901",mapping:[["signal","mirror","turn"],["mirror","signal","turn"],["turn","signal","mirror"],["signal","mirror","turn"],["mirror","turn","signal"],["turn","signal","mirror"]]},
 {slug:"paper-world",hash:"c918dbbfe77d4327f0a9f0436d3af1414ee574d073d537d689a2ed697131b2d8",mapping:[["fold","cast","layers"],["cast","layers","fold"],["layers","fold","cast"],["fold","cast","layers"],["cast","fold","layers"],["layers","fold","cast"]]},
 {slug:"note-taking-doodles",hash:"61c8bd1a55831480be9694b6590c28694051cde99f12611e3445f568148e5bdd",mapping:[["line","sketch","links"],["sketch","line","links"],["line","links","sketch"],["links","sketch","line"],["line","sketch","links"],["links","sketch","line"]]},
 {slug:"night-garden",hash:"bba127996b5c6c41a6325d7850c619bc28178e0170e27b882de632c89548fcf5",mapping:[["listener","shadow","detail"],["shadow","listener","detail"],["detail","listener","shadow"],["shadow","detail","listener"],["listener","shadow","detail"],["detail","shadow","listener"]]},
 {slug:"new-club-member",hash:"e764b696826a0385904ddb909ec7389ad8de2df83b2a1435ada7a2a5c4754fb2",mapping:[["glossary","process","exchange"],["process","glossary","exchange"],["exchange","process","glossary"],["glossary","process","exchange"],["process","glossary","exchange"],["process","exchange","glossary"]]},
 {slug:"museum-of-tomorrow",hash:"a99b1c6f47b33b7d5c9012ad45261c7fdefdbacffdeb0a7a4076107ae807a423",mapping:[["function","user","limit"],["user","function","limit"],["limit","function","user"],["function","user","limit"],["user","function","limit"],["limit","function","user"]]},
 {slug:"museum-visitor",hash:"b952b77c37e15e767de321fda22a2b90c203e1bfbf80f857e24c10d61eae2cf9",mapping:[["close","thread","together"],["thread","close","together"],["together","close","thread"],["thread","close","together"],["together","close","thread"],["thread","close","together"]]},
 {slug:"mountain-cabin",hash:"63dbb5c3d2407a5278800276255892235f389b81866267c5023e800b0bb402e1",mapping:[["keeper","nest","boundary"],["keeper","boundary","nest"],["boundary","nest","keeper"],["keeper","boundary","nest"],["boundary","keeper","nest"],["nest","keeper","boundary"]]},
 {slug:"message-tone",hash:"1b50379037344454d78dd56743a600188ab5ba78670ca8df832de48f2508a3c5",mapping:[["ask","context","pause"],["pause","context","ask"],["ask","context","pause"],["context","pause","ask"],["ask","context","pause"],["ask","context","pause"]]},
 {slug:"magic-shopkeeper",hash:"15ff4ffc9c42bc07b23a44c1adf6531da92c55088d99e0040e70b61aa8934858",mapping:[["label","loan","wonder"],["loan","wonder","label"],["label","wonder","loan"],["loan","label","wonder"],["wonder","label","loan"],["label","loan","wonder"]]},
 {slug:"kitchen-improviser",hash:"15fc38fec955d758efec1203f3001c70a7fb4b9bea70f4b20c0277a00936d0d9",mapping:[["bridge","test","table"],["table","bridge","test"],["bridge","table","test"],["test","table","bridge"],["table","bridge","test"],["test","bridge","table"]]},
 {slug:"long-distance-postcard",hash:"ec8a3dc756985139f8e9a993a038f70d82079713f958d6bad27cc1ba89075cbc",mapping:[["scene","question","marker"],["scene","question","marker"],["question","scene","marker"],["marker","scene","question"],["scene","marker","question"],["question","marker","scene"]]},
 {slug:"lost-key-search",hash:"82533b6c844ed9a6cb32d5f7ea4ac1d0d2a01476b22ea9ca0974cbccefb532b4",mapping:[["sequence","space","perspective"],["space","sequence","perspective"],["perspective","sequence","space"],["sequence","perspective","space"],["sequence","perspective","space"],["space","perspective","sequence"]]},
 {slug:"inside-joke",hash:"12ed58c2eb8a1948c554ffc0c6c5aed1b4ed8b090bc961070edec40a68195c43",mapping:[["context","twist","light"],["context","twist","light"],["light","twist","context"],["twist","context","light"],["light","context","twist"],["context","twist","light"]]},
 {slug:"group-project-finale",hash:"564c8e179a354accc7228ec42587e95989c635335f409985813b087ad4486cf9",mapping:[["credit","handover","moment"],["credit","handover","moment"],["credit","handover","moment"],["handover","credit","moment"],["moment","handover","credit"],["handover","credit","moment"]]},
 {slug:"group-trip-seatmate",hash:"4a42f477b150f1450c05162cae8c8d27906f032a33a66972715b8bb575a216db",mapping:[["talk","parallel","practical"],["parallel","talk","practical"],["talk","practical","parallel"],["practical","parallel","talk"],["parallel","talk","practical"],["talk","practical","parallel"]]},
 {slug:"hosting-a-guest",hash:"ab35c12f06b9274bd0c3c48728b70093c4d834bc2b1052ba4cdd999d9aa11f43",mapping:[["note","tour","ask"],["tour","note","ask"],["note","ask","tour"],["ask","tour","note"],["note","tour","ask"],["tour","note","ask"]]},
];
for (const {slug,hash,mapping} of fixtures) describe(slug,()=>{
 const bytes=readFileSync(`lib/entertainment/data/${slug}.json`);const quiz=JSON.parse(bytes.toString()) as FunQuiz;
 it("keeps the source bank and complete portraits byte-identical, and independently checks all 729 paths",()=>{
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
  const sets=new Set<string>();
  for(let n=0;n<729;n++){
   let digits=n;const answers:Answers={};const expected=Object.fromEntries(quiz.tieOrder.map(id=>[id,0]));
   for(const [i,q] of quiz.questions.entries()){const digit=digits%3;digits=Math.floor(digits/3);answers[q.id]=q.options[digit].id;expected[mapping[i][digit]]++;}
   const result=resolveFunQuiz(quiz,answers);expect(result.complete).toBe(true);expect(result.scores).toEqual(expected);
   const highest=quiz.tieOrder.filter(id=>expected[id]===Math.max(...Object.values(expected)));expect(result.resultIds).toEqual(highest);sets.add(highest.join(","));
   expect(Object.values(result.scores).reduce((a,b)=>a+b,0)).toBe(6);
  }
  expect(sets.size).toBe(7);expect(resolveFunQuiz(quiz,{q1:"o1"}).complete).toBe(false);expect(()=>resolveFunQuiz(quiz,{q1:"invalid"})).toThrow();
 });
 it.each(["en","zh"] as const)("renders the actual %s route with dedicated content, full public guides and stable metadata",async locale=>{
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
  const route=await import("@/app/(localized)/[locale]/tests/play/[slug]/page");const props={params:Promise.resolve({locale,slug})};
  const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default(props));const editorial=additionalStoryEditorials[slug]!;
  for(const section of editorial.sections)for(const p of section.paragraphs)expect(dom.textContent?.replace(/\s*\[\d+\]/g, "")).toContain(p[locale].replace(/\s*\[\d+\]/g,""));
  for(const f of editorial.faq)expect(dom.textContent).toContain(f.answer[locale]);
  expect(dom.querySelector("#play")?.textContent).toContain(editorial.instructions[locale]);expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
  expect(dom.querySelectorAll('#play input:not([type="hidden"])')).toHaveLength(0);expect(dom.querySelector("#play form")?.getAttribute("action")).toBe(`/${locale}/tests/play/${quiz.slug}/take`);expect([...dom.querySelectorAll<HTMLInputElement>('#play input[type="hidden"]')].map(input => [input.name, input.value])).toEqual([["start", "1"]]);expect(dom.querySelectorAll("main")).toHaveLength(1);
  for(const result of quiz.results){expect(dom.querySelector(`a[href="/${locale}/tests/play/${slug}/results/${result.id}"]`)).not.toBeNull();expect(dom.textContent).toContain(result.summary[locale]);}
  for(const a of dom.querySelectorAll(`a[href^="#${slug}-reference-"]`))expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
  const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(ids.length).toBe(new Set(ids).size);
  const meta=await route.generateMetadata(props);expect(meta.title).toBe(quiz.seo.title[locale]);expect(meta.description).toBe(quiz.seo.description[locale]);
  expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/${slug}`);
 });
});
