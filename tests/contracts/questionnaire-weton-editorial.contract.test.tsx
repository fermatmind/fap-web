import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { WetonStory35Page } from "@/components/questionnaires/WetonStory35Page";
import { wetonStorySections, wetonStoryFaq } from "@/components/questionnaires/WetonStoryLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/weton-story-preferences.json","utf8")) as Questionnaire;
describe("Weton story editorial and separate optional calendar",()=>{
 it.each(["en","zh"] as const)("retains original method and public guide identity in %s",locale=>{
  const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<WetonStory35Page quiz={quiz} locale={locale}/>);
  expect(dom.querySelectorAll("h1")).toHaveLength(1);expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
  expect(dom.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();expect(dom.querySelector(".explore-intro input[type=date]")).toBeNull();
  expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
  expect(dom.querySelectorAll('[aria-labelledby="weton-library"] li')).toHaveLength(35);
  expect(dom.querySelectorAll('[aria-labelledby="weton-faq"] h3')).toHaveLength(12);
  expect(dom.querySelectorAll('[id^="weton-reference-"]')).toHaveLength(6);
  expect(dom.textContent).toContain(quiz.instructions![locale]);
  expect(dom.querySelector(".explore-intro")?.textContent).not.toContain(quiz.instructions![locale]);
  for(const s of quiz.guide) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
  for(const s of wetonStorySections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
  for(const p of quiz.profiles) expect(dom.querySelector(`[href="/${locale}/tests/explore/${quiz.slug}/results/${p.id}"]`)?.textContent).toBe(p.title[locale]);
  expect(wetonStorySections).toHaveLength(8);expect(wetonStoryFaq).toHaveLength(8);
  const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
 });
});
