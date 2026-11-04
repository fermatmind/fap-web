import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CareerMatchClient } from "@/components/questionnaires/CareerMatchClient";
import { CareerMatchResultReading } from "@/components/questionnaires/CareerMatchResultReading";
import { isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerInterestComparisonRole } from "@/lib/career/api/fetchCareerInterestComparisonRole";
import { careerMatchDirectoryFixture, careerMatchRoleFixture } from "@/tests/fixtures/questionnaires/careerMatch";
import type { Questionnaire } from "@/lib/questionnaires/types";
import content from "@/lib/questionnaires/result-content/career-match.json";
vi.mock("@/lib/career/api/fetchCareerJobIndex",()=>({fetchCareerJobIndex:vi.fn()}));
vi.mock("@/lib/career/api/fetchCareerInterestComparisonRole",()=>({fetchCareerInterestComparisonRole:vi.fn()}));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/career-match.json","utf8")) as Questionnaire;
beforeEach(()=>{vi.mocked(fetchCareerJobIndex).mockReset();vi.mocked(fetchCareerInterestComparisonRole).mockReset();});
afterEach(cleanup);
async function choose(locale:"en"|"zh"){
 fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"开始比较":"Start comparison"}));await screen.findByLabelText(locale==="zh"?"职业1":"Occupation 1");
 for(const t of ["A","S"])fireEvent.click(document.querySelector(`[data-interest-theme="${t}"]`)!);
 for(const[i,suffix]of ["a","b"].entries())fireEvent.change(document.getElementById(`career-match-role-${i}`)!,{target:{value:`contract-role-${suffix}`}});
 fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"查看主题比较":"Compare interest themes"}));
}
describe("Career Match result guidance without inventing a questionnaire, occupational truth or fit score",()=>{
 it("keeps the strict source input tool intact and all bilingual modules complete",()=>{
  expect(isCareerMatchConfigurationValid(quiz)).toBe(true);expect(quiz.questions).toEqual([]);expect(quiz.profiles).toEqual([]);expect(content.sections.map(s=>s.id)).toEqual(["method","evidence","theme-R","theme-I","theme-A","theme-S","theme-E","theme-C"]);
  for(const s of content.sections){expect(s.paragraphs).toHaveLength(3);for(const p of s.paragraphs){expect(p.en).not.toMatch(/\p{Script=Han}|TODO|placeholder/u);expect(p.zh).toMatch(/\p{Script=Han}/u);}}
 });
 it("renders both complete general readings with usable collapsed navigation and no personal inputs or computed values",()=>{
  for(const locale of ["en","zh"]as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<CareerMatchResultReading locale={locale}/>);expect(d.querySelectorAll("h3")).toHaveLength(1);expect(d.querySelectorAll("h4")).toHaveLength(8);expect(d.querySelectorAll("[data-career-match-reading-section] li")).toHaveLength(24);expect(d.querySelectorAll("details:not([open]) nav a")).toHaveLength(8);for(const a of d.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of content.sections)for(const p of s.paragraphs)expect(d.textContent).toContain(p[locale]);expect(d.textContent).toContain(content.scope[locale]);expect(d.querySelector("input,textarea,select,[data-career-interest-code],[data-career-shared-themes]")).toBeNull();expect(d.querySelector('a[href="https://www.onetonline.org/find/descriptor/browse/1.B.1/"]')).not.toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);}
 });
 it.each(["en","zh"]as const)("%s native results retain current-role values, empty intersections and all common guidance without reordering or persistence",async locale=>{
  const before=JSON.stringify(quiz);vi.mocked(fetchCareerJobIndex).mockResolvedValue(careerMatchDirectoryFixture(locale));vi.mocked(fetchCareerInterestComparisonRole).mockImplementation(async({slug})=>careerMatchRoleFixture(locale,slug,slug.endsWith("a")?"ASE":"RIC"));const storage=vi.spyOn(Storage.prototype,"setItem");const{container}=render(<CareerMatchClient quiz={quiz} locale={locale}/>);expect(container.querySelector("[data-career-match-result-reading]")).toBeNull();await choose(locale);await waitFor(()=>expect(container.querySelectorAll("[data-career-read-status='available']")).toHaveLength(2));expect([...container.querySelectorAll("[data-career-interest-code]")].map(n=>n.textContent)).toEqual(["ASE","RIC"]);expect(container.querySelectorAll("[data-career-match-reading-section]")).toHaveLength(8);expect(container.querySelector('[data-career-match-role="contract-role-b"] [data-career-shared-themes]')).toHaveTextContent(locale==="zh"?"没有共同":"No shared");for(const s of content.sections)for(const p of s.paragraphs)expect(container.querySelector("[data-career-match-result-reading]")?.textContent).toContain(p[locale]);expect(fetchCareerInterestComparisonRole).toHaveBeenCalledTimes(2);expect(storage).not.toHaveBeenCalled();expect(JSON.stringify(quiz)).toBe(before);fireEvent.click(container.querySelector('[data-interest-theme="I"]')!);expect(container.querySelector("[data-career-match-result-reading]")).toBeNull();storage.mockRestore();
 });
 it.each(["missing","invalid","error"]as const)("keeps %s distinct from empty intersection while exposing only general explanatory modules",async status=>{
  vi.mocked(fetchCareerJobIndex).mockResolvedValue(careerMatchDirectoryFixture("en"));vi.mocked(fetchCareerInterestComparisonRole).mockImplementation(async()=>{if(status==="error")throw Error("transport");return status==="missing"?null:{bundle_kind:"legacy"}as never;});const{container}=render(<CareerMatchClient quiz={quiz} locale="en"/>);await choose("en");await waitFor(()=>expect(container.querySelectorAll(`[data-career-read-status="${status}"]`)).toHaveLength(2));expect(container.querySelector("[data-career-shared-themes],[data-career-interest-code]")).toBeNull();expect(container.querySelectorAll("[data-career-match-result-reading]")).toHaveLength(1);expect(container.querySelectorAll("[data-career-match-reading-section]")).toHaveLength(8);const ids=[...container.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
 });
});
