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
 {slug:"weather-in-a-bottle",hash:"8c3e0c46eaafafa9e1394e3a1dadb48ac474cb29beb2deca0df607c9e51c5621",mapping:[["mist","breeze","sun"],["breeze","sun","mist"],["sun","mist","breeze"],["mist","breeze","sun"],["breeze","mist","sun"],["sun","mist","breeze"]]},
 {slug:"weekend-pace",hash:"01c521981a368e6a75f8a1ffea690abb4a6c5c7b441e27b566c82422272a3ec3",mapping:[["anchor","open","space"],["space","anchor","open"],["open","anchor","space"],["space","anchor","open"],["open","anchor","space"],["anchor","open","space"]]},
 {slug:"woodland-animal",hash:"a44d8fa9bfc86cfb2760965d130a1c63a055a6834d04e91c259368cdf46689a2",mapping:[["jay","beaver","hedgehog"],["beaver","jay","hedgehog"],["hedgehog","beaver","jay"],["jay","beaver","hedgehog"],["beaver","jay","hedgehog"],["hedgehog","jay","beaver"]]},
 {slug:"tiny-kingdom",hash:"e4188ca0bd579874e79a287170a150de010fab0e2c6cdc8342bb74faeb56914e",mapping:[["exchange","experiment","promise"],["experiment","exchange","promise"],["exchange","experiment","promise"],["promise","exchange","experiment"],["experiment","promise","exchange"],["promise","exchange","experiment"]]},
 {slug:"tiny-superpower",hash:"4e42c1193599595a4ea982590adeed555fa2bd79074e14639226f5b4aadbbf43",mapping:[["word","pause","edge"],["pause","edge","word"],["edge","word","pause"],["word","pause","edge"],["pause","word","edge"],["edge","word","pause"]]},
 {slug:"tiny-treat",hash:"3033d20e7088a94547ed8dc5ed0a2d40bfc12e28204b94301384cec0160fe4ee",mapping:[["moment","token","time"],["token","time","moment"],["time","moment","token"],["moment","token","time"],["token","moment","time"],["time","token","moment"]]},
 {slug:"tide-pool-creature",hash:"6a2b7d9c87d4940e751582befc610ef8315accf53c3ef880af51021ce9aa8950",mapping:[["crab","shrimp","anemone"],["shrimp","crab","anemone"],["anemone","crab","shrimp"],["crab","shrimp","anemone"],["anemone","shrimp","crab"],["crab","shrimp","anemone"]]},
 {slug:"time-capsule",hash:"1e17d36e05ca0d6c49d8f11f9c5a8e519c82fde0981955fd761fdbd08905d7c4",mapping:[["scene","question","instruction"],["question","instruction","scene"],["instruction","scene","question"],["scene","question","instruction"],["question","scene","instruction"],["instruction","scene","question"]]},
 {slug:"storybook-narrator",hash:"4bc8b8e4b39a21d20447934e6fe7867d526296078d48962996ac6f36d23b62e8",mapping:[["lens","chorus","wink"],["chorus","lens","wink"],["wink","lens","chorus"],["lens","wink","chorus"],["chorus","lens","wink"],["lens","chorus","wink"]]},
 {slug:"team-name-maker",hash:"197188d935dc4a6a379c0a25e29602b7e4a9f47de7e98e01351554201db5cefe",mapping:[["wordplay","reference","process"],["wordplay","reference","process"],["reference","wordplay","process"],["process","wordplay","reference"],["process","wordplay","reference"],["reference","wordplay","process"]]},
 {slug:"thrift-shop-find",hash:"7aad9cc5f79ae570781438ef1519fdc92434252a3d24bc82eb91116f0141e9a5",mapping:[["use","remake","trace"],["remake","use","trace"],["trace","use","remake"],["remake","use","trace"],["use","remake","trace"],["trace","use","remake"]]},
 {slug:"stargazing-role",hash:"2479be7339c4656d83d65f97301ebb9bc0d1fdf67c7e540d1f2afa4dda44593b",mapping:[["pattern","tale","host"],["host","pattern","tale"],["tale","pattern","host"],["pattern","tale","host"],["host","pattern","tale"],["tale","pattern","host"]]},
 {slug:"souvenir-story",hash:"f6721d5d1f03908f2b54f53c3c2444ab225e1c34b81af466022bd87a02b86342",mapping:[["use","moment","shared"],["moment","shared","use"],["shared","use","moment"],["moment","use","shared"],["use","shared","moment"],["use","moment","shared"]]},
 {slug:"small-apology",hash:"6f25164ba9815bc1d30595fdc98c5cfcd80722c0f4cdb7860c067954bfdc671a",mapping:[["name","repair","space"],["name","repair","space"],["name","repair","space"],["repair","name","space"],["name","repair","space"],["repair","name","space"]]},
 {slug:"snow-day",hash:"360d10f1857e64e532ecf825a7c2b9ae92ba92879734ea47853d2b67ff447d5e",mapping:[["builder","character","player"],["builder","character","player"],["character","player","builder"],["player","builder","character"],["builder","character","player"],["character","builder","player"]]},
 {slug:"shared-hobby",hash:"c8e113df97b265450eaaff5aa982db93c3d2ab37c28744d607289c448eb328c6",mapping:[["guest","parallel","swap"],["guest","parallel","swap"],["swap","parallel","guest"],["parallel","guest","swap"],["parallel","swap","guest"],["parallel","swap","guest"]]},
 {slug:"shared-ritual",hash:"f5447ee1e5c55bc52deaf1700feeef2f26610bec4cd30ac1290069bbeeaa7f28",mapping:[["cue","window","meaning"],["meaning","cue","window"],["window","cue","meaning"],["cue","meaning","window"],["meaning","window","cue"],["window","cue","meaning"]]},
 {slug:"shared-workspace",hash:"4923e37d1a8c78dcd53da4618dd45cb1ecd78d802893d3117f22a7db1ce3f139",mapping:[["label","tool","feedback"],["tool","label","feedback"],["feedback","label","tool"],["label","tool","feedback"],["feedback","label","tool"],["tool","label","feedback"]]},
 {slug:"secret-garden-gate",hash:"b2f13a1d2d0726ebdaa8a7c98fca4c99696db63ccfab62e9844b17d5b09e6378",mapping:[["glimpse","process","contribute"],["process","contribute","glimpse"],["contribute","glimpse","process"],["glimpse","process","contribute"],["process","glimpse","contribute"],["contribute","glimpse","process"]]},
 {slug:"saying-goodbye",hash:"9b350aa98ed348629c5ab422559f6ff20c5aacf92ac11dd37bb181432083f2d4",mapping:[["clear","detail","future"],["clear","future","detail"],["future","detail","clear"],["clear","detail","future"],["detail","clear","future"],["clear","detail","future"]]},
 {slug:"seasonal-table",hash:"1fb13a451b7b768ec120099220336f692f3984871e106b25b1ed8e4fbb0d550d",mapping:[["trace","space","shared"],["space","shared","trace"],["shared","trace","space"],["trace","space","shared"],["space","trace","shared"],["shared","space","trace"]]},
 {slug:"room-atmosphere",hash:"48ff9f5c58a69962abe92d1407cc5648e992631ae07ded3ca9fe1cdaaafa7769",mapping:[["glow","space","layers"],["space","layers","glow"],["layers","glow","space"],["glow","space","layers"],["space","layers","glow"],["layers","glow","space"]]},
 {slug:"reunion-style",hash:"03af662d8bc8a6e6dc2d4f36594cd8b5010aad0999a09295404c70771429c4a7",mapping:[["thread","present","fresh"],["present","thread","fresh"],["fresh","thread","present"],["thread","present","fresh"],["fresh","present","thread"],["thread","present","fresh"]]},
 {slug:"river-crossing",hash:"ffabc9cda3b142f3a1f29965b4eedb360195d27430f6f9a1fc5b735c3de2c426",mapping:[["tester","partner","pacer"],["tester","pacer","partner"],["pacer","partner","tester"],["partner","tester","pacer"],["pacer","tester","partner"],["partner","tester","pacer"]]},
 {slug:"road-trip-dj",hash:"1d05272eb00a87ed87affa20e595d8106bfee6e34282fe4e8e00972fcbc53daa",mapping:[["turns","bridge","quiet"],["turns","bridge","quiet"],["turns","bridge","quiet"],["bridge","turns","quiet"],["quiet","turns","bridge"],["bridge","turns","quiet"]]},
 {slug:"rainy-window",hash:"6794aace9ee7aca9b70fc34e45e3a2b8b9f452db54fa7b1d1544659bc63662fa",mapping:[["near","reflection","distance"],["reflection","near","distance"],["distance","near","reflection"],["near","reflection","distance"],["reflection","near","distance"],["distance","near","reflection"]]},
 {slug:"reading-ritual",hash:"ddef369da9fe587edabb322c17a148e2b95bc473631df68f8710ac63e97cbed6",mapping:[["immerse","trail","appointment"],["trail","immerse","appointment"],["immerse","appointment","trail"],["trail","appointment","immerse"],["immerse","appointment","trail"],["trail","immerse","appointment"]]},
 {slug:"quest-reward",hash:"55f7e590721e43ede38757b51865afb2448f75f55a2e4eee87e5bebc83c528ec",mapping:[["map","feast","token"],["feast","token","map"],["map","token","feast"],["token","map","feast"],["map","feast","token"],["feast","token","map"]]},
 {slug:"potluck-contribution",hash:"874d82890ff509358c03e81a357ba0e7bb6221f549d041bdf5275078cac152e2",mapping:[["menu","handover","note"],["menu","handover","note"],["note","handover","menu"],["handover","menu","note"],["note","menu","handover"],["handover","menu","note"]]},
 {slug:"quiet-company",hash:"907918bd8e44e037027744eddafa5ab79aef7d921103500e51d14782abfc5207",mapping:[["pages","view","task"],["view","pages","task"],["pages","view","task"],["view","task","pages"],["task","view","pages"],["pages","task","view"]]},
 {slug:"pocket-map",hash:"da07f5ea0d5350c4c0176bc61e2670121199795852dfc92eadd96aa4217d3f41",mapping:[["landmarks","stops","gaps"],["stops","gaps","landmarks"],["gaps","landmarks","stops"],["landmarks","stops","gaps"],["stops","landmarks","gaps"],["gaps","stops","landmarks"]]},
 {slug:"playlist-maker",hash:"b6befe90c4dbf23e57150ad68a1102a4219907580f8ded309b38fcc92118c1aa",mapping:[["arc","room","discovery"],["arc","discovery","room"],["room","discovery","arc"],["room","arc","discovery"],["discovery","arc","room"],["discovery","arc","room"]]},
 {slug:"party-arrival",hash:"72e4a98700271a1f3d1acb0f1b0de6421bd317ca24ee0aac82a4444288bf42aa",mapping:[["conversation","activity","landing"],["conversation","activity","landing"],["landing","conversation","activity"],["conversation","landing","activity"],["activity","conversation","landing"],["landing","conversation","activity"]]},
 {slug:"personal-museum",hash:"73dbf9b5d6a158196e8b6eddcf2fc307e56725c03c1efb0bcb094bd21cb4b758",mapping:[["sequence","detail","connection"],["detail","connection","sequence"],["connection","sequence","detail"],["sequence","detail","connection"],["detail","sequence","connection"],["connection","detail","sequence"]]},
 {slug:"photo-group-role",hash:"93e03db4bfbe1253874b8862ec92180ff238bbd2709e1fb6901a9948036e8468",mapping:[["frame","choice","moment"],["frame","choice","moment"],["choice","frame","moment"],["frame","moment","choice"],["choice","frame","moment"],["moment","choice","frame"]]},
 {slug:"paper-creature-language",hash:"f372ced708f5959e3f7abaa350174b7173eff4914f7a580068a54336e0c5aa97",mapping:[["signal","mirror","turn"],["mirror","signal","turn"],["turn","signal","mirror"],["signal","mirror","turn"],["mirror","turn","signal"],["turn","signal","mirror"]]},
 {slug:"paper-world",hash:"3a2539058499778bcb0dc6205908b98e66ecc72f9327b6dd7b720d2f29c38cb2",mapping:[["fold","cast","layers"],["cast","layers","fold"],["layers","fold","cast"],["fold","cast","layers"],["cast","fold","layers"],["layers","fold","cast"]]},
 {slug:"note-taking-doodles",hash:"f91d48f77db9d0354a3b91e93a4a264d8ccfb079cad3cee91d90bc943bbb9d1b",mapping:[["line","sketch","links"],["sketch","line","links"],["line","links","sketch"],["links","sketch","line"],["line","sketch","links"],["links","sketch","line"]]},
 {slug:"night-garden",hash:"afc7173eeafa488112dfc3c90436791504783e6f2efad9e7f9b934e8d42b0f0a",mapping:[["listener","shadow","detail"],["shadow","listener","detail"],["detail","listener","shadow"],["shadow","detail","listener"],["listener","shadow","detail"],["detail","shadow","listener"]]},
 {slug:"new-club-member",hash:"e20f5c2cf5c8a43342e8b88da8a39e861f5ab791984b2e5c8589a10848fb3049",mapping:[["glossary","process","exchange"],["process","glossary","exchange"],["exchange","process","glossary"],["glossary","process","exchange"],["process","glossary","exchange"],["process","exchange","glossary"]]},
 {slug:"museum-of-tomorrow",hash:"3d84131bda09453d7de772b1bcfe3810a7ce485f760bc3755ebf27827e4b6c2d",mapping:[["function","user","limit"],["user","function","limit"],["limit","function","user"],["function","user","limit"],["user","function","limit"],["limit","function","user"]]},
 {slug:"museum-visitor",hash:"b952b77c37e15e767de321fda22a2b90c203e1bfbf80f857e24c10d61eae2cf9",mapping:[["close","thread","together"],["thread","close","together"],["together","close","thread"],["thread","close","together"],["together","close","thread"],["thread","close","together"]]},
 {slug:"mountain-cabin",hash:"9f3c1d048f6e096a35e64ff07e26c8d9dbad7b29011be6e0a718551297ae9ea3",mapping:[["keeper","nest","boundary"],["keeper","boundary","nest"],["boundary","nest","keeper"],["keeper","boundary","nest"],["boundary","keeper","nest"],["nest","keeper","boundary"]]},
 {slug:"message-tone",hash:"7057316150a39e99ff004c9cc665c0d6fd7a1f4a6de4d5bf61d5217af70ed9e0",mapping:[["ask","context","pause"],["pause","context","ask"],["ask","context","pause"],["context","pause","ask"],["ask","context","pause"],["ask","context","pause"]]},
 {slug:"magic-shopkeeper",hash:"15ff4ffc9c42bc07b23a44c1adf6531da92c55088d99e0040e70b61aa8934858",mapping:[["label","loan","wonder"],["loan","wonder","label"],["label","wonder","loan"],["loan","label","wonder"],["wonder","label","loan"],["label","loan","wonder"]]},
 {slug:"kitchen-improviser",hash:"15fc38fec955d758efec1203f3001c70a7fb4b9bea70f4b20c0277a00936d0d9",mapping:[["bridge","test","table"],["table","bridge","test"],["bridge","table","test"],["test","table","bridge"],["table","bridge","test"],["test","bridge","table"]]},
 {slug:"long-distance-postcard",hash:"dd1c6860011e15f498eef09ebc6bcdfa9314b10e27520022944cd28a97af7b4c",mapping:[["scene","question","marker"],["scene","question","marker"],["question","scene","marker"],["marker","scene","question"],["scene","marker","question"],["question","marker","scene"]]},
 {slug:"lost-key-search",hash:"82533b6c844ed9a6cb32d5f7ea4ac1d0d2a01476b22ea9ca0974cbccefb532b4",mapping:[["sequence","space","perspective"],["space","sequence","perspective"],["perspective","sequence","space"],["sequence","perspective","space"],["sequence","perspective","space"],["space","perspective","sequence"]]},
 {slug:"inside-joke",hash:"a59fefeab0983de907245b68e343c0bf1db09f6175104c626e6dc2d808065fda",mapping:[["context","twist","light"],["context","twist","light"],["light","twist","context"],["twist","context","light"],["light","context","twist"],["context","twist","light"]]},
 {slug:"group-project-finale",hash:"15c3d0515e97d8a2d6ae195725864a2a2eb136c09a3c625629558eda6b5c81f6",mapping:[["credit","handover","moment"],["credit","handover","moment"],["credit","handover","moment"],["handover","credit","moment"],["moment","handover","credit"],["handover","credit","moment"]]},
 {slug:"group-trip-seatmate",hash:"75e51d2e919f7383a05549abaf92214e08b10ec25d4b5261bc3cda3c32f971e8",mapping:[["talk","parallel","practical"],["parallel","talk","practical"],["talk","practical","parallel"],["practical","parallel","talk"],["parallel","talk","practical"],["talk","practical","parallel"]]},
 {slug:"hosting-a-guest",hash:"3d959e0aa1147b3881a85c4b3b01e2df55a29cae6846c09525991ec8ad84d17a",mapping:[["note","tour","ask"],["tour","note","ask"],["note","ask","tour"],["ask","tour","note"],["note","tour","ask"],["tour","note","ask"]]},
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
