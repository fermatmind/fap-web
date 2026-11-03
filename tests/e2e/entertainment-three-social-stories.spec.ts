import {test,expect} from "@playwright/test";
import project from "../../lib/entertainment/data/group-project-finale.json";
import trip from "../../lib/entertainment/data/group-trip-seatmate.json";
import guest from "../../lib/entertainment/data/hosting-a-guest.json";
import insideJoke from "../../lib/entertainment/data/inside-joke.json";
import kitchen from "../../lib/entertainment/data/kitchen-improviser.json";
import postcard from "../../lib/entertainment/data/long-distance-postcard.json";
import search from "../../lib/entertainment/data/lost-key-search.json";
import magic from "../../lib/entertainment/data/magic-shopkeeper.json";
import tone from "../../lib/entertainment/data/message-tone.json";
import cabin from "../../lib/entertainment/data/mountain-cabin.json";
import tomorrow from "../../lib/entertainment/data/museum-of-tomorrow.json";
import visitor from "../../lib/entertainment/data/museum-visitor.json";
import club from "../../lib/entertainment/data/new-club-member.json";
import garden from "../../lib/entertainment/data/night-garden.json";
import notes from "../../lib/entertainment/data/note-taking-doodles.json";
import creature from "../../lib/entertainment/data/paper-creature-language.json";
import world from "../../lib/entertainment/data/paper-world.json";
import arrival from "../../lib/entertainment/data/party-arrival.json";
import museum from "../../lib/entertainment/data/personal-museum.json";
import photo from "../../lib/entertainment/data/photo-group-role.json";
import playlist from "../../lib/entertainment/data/playlist-maker.json";
import pocketMap from "../../lib/entertainment/data/pocket-map.json";
import potluck from "../../lib/entertainment/data/potluck-contribution.json";
import quietCompany from "../../lib/entertainment/data/quiet-company.json";
import questReward from "../../lib/entertainment/data/quest-reward.json";
import rainyWindow from "../../lib/entertainment/data/rainy-window.json";
import readingRitual from "../../lib/entertainment/data/reading-ritual.json";
import reunionStyle from "../../lib/entertainment/data/reunion-style.json";
import riverCrossing from "../../lib/entertainment/data/river-crossing.json";
import roadTripDj from "../../lib/entertainment/data/road-trip-dj.json";
import roomAtmosphere from "../../lib/entertainment/data/room-atmosphere.json";
import sayingGoodbye from "../../lib/entertainment/data/saying-goodbye.json";
import seasonalTable from "../../lib/entertainment/data/seasonal-table.json";
import secretGardenGate from "../../lib/entertainment/data/secret-garden-gate.json";
import sharedHobby from "../../lib/entertainment/data/shared-hobby.json";
import sharedRitual from "../../lib/entertainment/data/shared-ritual.json";
import sharedWorkspace from "../../lib/entertainment/data/shared-workspace.json";
import smallApology from "../../lib/entertainment/data/small-apology.json";
import snowDay from "../../lib/entertainment/data/snow-day.json";
import souvenirStory from "../../lib/entertainment/data/souvenir-story.json";
import spellSchool from "../../lib/entertainment/data/spell-school-elective.json";
import stargazingRole from "../../lib/entertainment/data/stargazing-role.json";
import storybookNarrator from "../../lib/entertainment/data/storybook-narrator.json";
import teamNameMaker from "../../lib/entertainment/data/team-name-maker.json";
import thriftShopFind from "../../lib/entertainment/data/thrift-shop-find.json";
import tidePool from "../../lib/entertainment/data/tide-pool-creature.json";
import timeCapsule from "../../lib/entertainment/data/time-capsule.json";
import tinyKingdom from "../../lib/entertainment/data/tiny-kingdom.json";
import tinySuperpower from "../../lib/entertainment/data/tiny-superpower.json";
import tinyTreat from "../../lib/entertainment/data/tiny-treat.json";
import weatherBottle from "../../lib/entertainment/data/weather-in-a-bottle.json";
import weekendPace from "../../lib/entertainment/data/weekend-pace.json";
import woodlandAnimal from "../../lib/entertainment/data/woodland-animal.json";
const banks=[weatherBottle,weekendPace,woodlandAnimal,tinyKingdom,tinySuperpower,tinyTreat,tidePool,timeCapsule,storybookNarrator,teamNameMaker,thriftShopFind,spellSchool,stargazingRole,souvenirStory,smallApology,snowDay,sharedHobby,sharedRitual,sharedWorkspace,secretGardenGate,sayingGoodbye,seasonalTable,roomAtmosphere,reunionStyle,riverCrossing,roadTripDj,rainyWindow,readingRitual,questReward,potluck,quietCompany,pocketMap,playlist,arrival,museum,photo,creature,world,notes,garden,club,tomorrow,visitor,cabin,tone,magic,project,trip,guest,insideJoke,kitchen,postcard,search];
for(const quiz of banks)for(const locale of ["en","zh"] as const)test(`@release ${quiz.slug} ${locale}: direct first scene, every highest set, complete portraits, public guides and responsive layout`,async({page,request})=>{
 test.setTimeout(120000);const zh=locale==="zh",path=`/${locale}/tests/play/${quiz.slug}`;
 await page.addInitScript(()=>localStorage.setItem("fm_consent_v1",JSON.stringify({analytics:"denied",updatedAt:new Date().toISOString()})));
 await page.goto(path);await expect(page.locator("h1")).toHaveText(quiz.title[locale]);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",`https://fermatmind.com${path}`);
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});await expect(page.locator('[data-explore-start]')).toBeEnabled();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:test.info().outputPath(`${quiz.slug}-${locale}-${width}.png`),fullPage:true});}
 const witnesses=new Map<string,number[]>();
 const optionCount=quiz.questions[0].options.length;for(let n=0;n<optionCount**6;n++){let v=n;const choices:number[]=[],counts:Record<string,number>=Object.fromEntries(quiz.tieOrder.map(id=>[id,0]));for(const q of quiz.questions){const i=v%optionCount;v=Math.floor(v/optionCount);choices.push(i);const option=q.options[i];counts[Object.keys(option.points)[0]]++;}const ids=quiz.tieOrder.filter(id=>counts[id]===Math.max(...Object.values(counts)));if(!witnesses.has(ids.join(",")))witnesses.set(ids.join(","),choices);}
 expect(witnesses.size).toBe(quiz.results.length===4?14:7);
 await page.locator('[data-explore-start]').click();await expect(page.locator('#play h2')).toHaveText(quiz.questions[0].prompt[locale]);await expect(page.locator('#play')).toHaveAttribute('data-stage','answer');
 for(const [ids,choices] of witnesses){
  for(const [i,q] of quiz.questions.entries()){
   if(quiz.slug==="night-garden"){
    const panel=page.locator(`[data-night-garden-panel="${q.id}"]`);await expect(panel).toBeVisible();await expect(panel.locator('svg')).toHaveAttribute('role','img');await expect(panel.locator('figcaption')).toContainText(zh?'没有音频':'no audio');await expect(page.locator('#play audio')).toHaveCount(0);
    if(ids===[...witnesses.keys()][0]){await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await panel.screenshot({path:test.info().outputPath(`night-garden-${locale}-${q.id}.png`)});}
   }
   if(quiz.slug==="snow-day"){
    const panel=page.locator(`[data-snow-day-panel="${q.id}"]`);await expect(panel).toBeVisible();await expect(panel.locator('svg')).toHaveAttribute('role','img');await expect(panel.locator('figcaption')).toContainText(zh?'纸上':'on paper');
    if(ids===[...witnesses.keys()][0]){await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await panel.screenshot({path:test.info().outputPath(`snow-day-${locale}-${q.id}.png`)});}
   }
   if(quiz.slug==="thrift-shop-find"){
    const panel=page.locator('[data-thrift-shelf-panel]');await expect(panel).toHaveCount(i===0?1:0);
    if(i===0){await expect(panel.locator('svg')).toHaveAttribute('role','img');await expect(panel.locator('figcaption')).toContainText(zh?'无需购买':'without buying');}
   }
   await page.locator(`#play input[name="${q.id}"]`).nth(choices[i]).check();
   await page.getByRole('button',{name:i===5?(zh?'查看完整结果':'See full result'):(zh?'下一题':'Next'),exact:true}).click();
  }
  await expect(page.locator('#play')).toHaveAttribute('data-stage','result');
  for(const id of ids.split(',')){const portrait=quiz.results.find(p=>p.id===id)!;for(const field of ['summary','example','strength','tradeoff','experiment'] as const)await expect(page.locator('#play')).toContainText(portrait[field][locale]);}
  await expect(page.locator('#play > article')).toHaveCount(ids.split(',').length);
  await page.getByRole('button',{name:zh?'重新测试':'Retake quiz',exact:true}).click();
  await expect(page.locator('#play h2')).toHaveText(quiz.questions[0].prompt[locale]);await expect(page.locator('#play input:checked')).toHaveCount(0);
 }
 // Back permits editing a choice without adding a confirmation gate.
 await page.locator('#play input[type="radio"]').first().check();await page.getByRole('button',{name:zh?'下一题':'Next',exact:true}).click();await page.getByRole('button',{name:zh?'上一题':'Back',exact:true}).click();await expect(page.locator('#play input[type="radio"]').first()).toBeChecked();
 for(const portrait of quiz.results){const response=await request.get(`${path}/results/${portrait.id}`);expect(response.status()).toBe(200);const html=await response.text();const text=await page.evaluate(markup=>new DOMParser().parseFromString(markup,'text/html').body.textContent,html);for(const field of ['summary','example','strength','tradeoff','experiment'] as const)expect(text).toContain(portrait[field][locale]);}
});
