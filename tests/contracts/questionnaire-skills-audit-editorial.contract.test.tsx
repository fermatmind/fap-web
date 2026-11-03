import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import data from "@/lib/questionnaires/data/skills-audit.json";
import { SkillsAuditPage } from "@/components/questionnaires/SkillsAuditPage";
import { skillsAuditSections, skillsAuditFaq, skillsAuditSummaries } from "@/components/questionnaires/SkillsAuditLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("SkillsAudit four task-habit groups and public readings", () => {
  it.each(["en", "zh"] as const)("preserves source methods, complete guide links, fourteen FAQ and a direct start: %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<SkillsAuditPage quiz={data as Questionnaire} locale={locale} />);
    const text = dom.textContent!;
    for (const s of [...data.guide, ...skillsAuditSections]) for (const p of s.paragraphs) expect(text).toContain(p[locale]);
    for (const f of [...data.faq, ...skillsAuditFaq]) expect(text).toContain(f.answer[locale]);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(dom.querySelectorAll('[aria-labelledby="skills-audit-library"] li')).toHaveLength(4);
    for (const p of data.profiles) expect(dom.querySelector(`a[href="/${locale}/tests/explore/skills-audit/results/${p.id}"]`)).not.toBeNull();
    expect(dom.querySelectorAll('[aria-labelledby="skills-audit-faq"] h3')).toHaveLength(14);
    const ids = [...dom.querySelectorAll("[id]")].map(x => x.id); expect(new Set(ids).size).toBe(ids.length);
    for (const a of dom.querySelectorAll('a[href^="#skills-audit-reference-"]')) expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(dom.querySelectorAll("[data-skills-evidence-row]")).toHaveLength(0);
    expect(dom.querySelectorAll("[id^=skills-audit-reference-] a")).toHaveLength(3);
    expect(text).not.toContain(locale === "zh" ? "网站内容版本" : "Website content version");
  });
  it("keeps the non-scoring task-state model and a reproducible count example", () => {
    expect(skillsAuditSections).toHaveLength(9); expect(skillsAuditFaq).toHaveLength(8);
    expect(Object.keys(skillsAuditSummaries)).toEqual(data.profiles.map(p => p.id));
    expect(data.questions).toHaveLength(20);
    for(const q of (data as Questionnaire).questions) { expect(q.reverse).toBeUndefined(); for(const o of q.options) expect(o.score).toBeUndefined(); }
    const raw = ["recent", "older", "recent", "na", "explore"];
    expect(["recent","older","explore","na"].map(s=>raw.filter(v=>v===s).length)).toEqual([2,1,1,1]);
    expect(raw.length).toBe(5);
    for(const s of skillsAuditSections) for(const p of [s.title,...s.paragraphs]) { expect(p.en.length).toBeGreaterThan(12); expect(p.zh.length).toBeGreaterThan(7); }
  });
});
