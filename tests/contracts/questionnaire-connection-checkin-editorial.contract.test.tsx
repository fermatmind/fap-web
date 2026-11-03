import { recordConnectionCheckIn21 } from "@/lib/questionnaires/connectionCheckIn21";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { ConnectionCheckInPage } from "@/components/questionnaires/ConnectionCheckInPage";
import { connectionCheckInSections, connectionCheckInFaq } from "@/components/questionnaires/ConnectionCheckInLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/connection-belonging-check-in.json", "utf8")) as Questionnaire;
describe("connection-belonging-check-in editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<ConnectionCheckInPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-connection-checkin-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="connection-checkin-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="connection-checkin-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(dom.querySelectorAll("[data-connection-checkin-support]")).toHaveLength(1);
    expect(connectionCheckInSections).toHaveLength(8);expect(connectionCheckInFaq).toHaveLength(8);
    for(const s of connectionCheckInSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="connection-checkin-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});

it("checks the published seven-observation category example without turning labels into points", () => {
  const sequence=["0","1","2","2","3","4","na"];
  const result=recordConnectionCheckIn21(quiz,Object.fromEntries(quiz.questions.map((q,i)=>[q.id,sequence[i%7]])));
  expect(result.status).toBe("complete");
  if(result.status!=="complete") throw Error("Expected complete category records");
  for(const record of result.records) expect(record.counts).toEqual({"0":1,"1":1,"2":2,"3":1,"4":1,na:1});
});
