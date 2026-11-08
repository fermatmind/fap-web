import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/rice-purity-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import { isRice100ConfigurationValid, scoreRiceSelections } from "@/lib/questionnaires/ricePurity";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { RicePurityClient } from "@/components/questionnaires/RicePurityClient";
import { RicePurityPage } from "@/components/questionnaires/RicePurityPage";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { entertainmentActivityDefinitions } from "@/lib/entertainment/activityDefinitions";

const quiz = source as Questionnaire;
const reference = readFileSync("tests/fixtures/questionnaires/rice-purity-original100-reference.json");
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const original = JSON.parse(reference.toString());
afterEach(cleanup);
beforeAll(() => { HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) { this.setAttribute("open", ""); }); });

describe("independent adult Rice Purity 100-item edition", () => {
  it("binds all 100 original bilingual items and complete public explanation", async () => {
    expect(quiz.questions.map(q => ({ id:q.id, label:q.prompt, category:q.experienceCategory }))).toEqual(original.questions);
    expect(quiz.source.itemBankSha256).toBe(sha(reference));
    expect(quiz.source.resultContentSha256).toBe(sha(JSON.stringify({profiles:quiz.profiles,guide:quiz.guide,faq:quiz.faq})));
    expect(isRice100ConfigurationValid(quiz)).toBe(true);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect((await loadQuestionnaire(quiz.slug))?.source).toEqual(quiz.source);
    for (const locale of ["en","zh"] as const) {
      const html = renderToStaticMarkup(<RicePurityPage quiz={quiz} locale={locale} />);
      expect(html).toContain(`/${locale}/tests/explore/rice-purity-test/take`);
      for(const s of quiz.guide) for(const p of s.paragraphs) expect(html).toContain(p[locale].replaceAll("&","&amp;").replaceAll("'","&#x27;").replaceAll('"',"&quot;"));
      expect(html).not.toContain('type="checkbox"');
    }
  });
  it("reproduces every possible checked count, permits skips and refuses corrupted selections", () => {
    const ids = quiz.questions.map(q=>q.id);
    for (let n=0;n<=100;n++) {
      expect(scoreRiceSelections(quiz,ids.slice(0,n))).toEqual({score:100-n,checked:n});
      expect(scoreRiceSelections(quiz,[...ids].reverse().slice(0,n))).toEqual({score:100-n,checked:n});
    }
    expect(scoreRiceSelections(quiz,[ids[0],ids[0]])).toBeNull();
    expect(scoreRiceSelections(quiz,["unknown"])).toBeNull();
    const broken=structuredClone(quiz);broken.questions.pop();expect(scoreRiceSelections(broken,[])).toBeNull();
  });
  it.each(["en","zh"] as const)("shows an explicit adult gate, all 100 %s items, reversible count and confirmed clear", locale => {
    const zh=locale==="zh";
    const {container}=render(<RicePurityClient quiz={quiz} locale={locale}/>);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button",{name:zh?"我已成年，自愿继续":"I am an adult and choose to continue"}));
    expect(screen.getAllByRole("checkbox")).toHaveLength(100);
    for(const box of screen.getAllByRole("checkbox").slice(0,3)) fireEvent.click(box);
    fireEvent.click(screen.getByRole("button",{name:zh?"按当前勾选计算结果":"Calculate from current selections"}));
    expect(container.querySelector('[data-stage="result"]')).not.toBeNull();
    expect(container.textContent).toContain(zh?"100 − 3 项勾选 = 97":"100 − 3 checked = 97");
    fireEvent.click(screen.getByRole("button",{name:zh?"返回修改":"Edit selections"}));
    expect(container.querySelectorAll('input:checked')).toHaveLength(3);
    fireEvent.click(screen.getByRole("button",{name:zh?"清空全部":"Clear all"}));
    fireEvent.click(screen.getByRole("button",{name:zh?"取消，保留选择":"Cancel, keep selections"}));
    expect(container.querySelectorAll('input:checked')).toHaveLength(3);
    fireEvent.click(screen.getByRole("button",{name:zh?"清空全部":"Clear all"}));
    fireEvent.click(screen.getByRole("button",{name:zh?"确认清空":"Confirm clear"}));
    expect(container.querySelectorAll('input:checked')).toHaveLength(0);
    fireEvent.click(screen.getByRole("button",{name:zh?"按当前勾选计算结果":"Calculate from current selections"}));
    expect(container.textContent).toContain(zh?"100 − 0 项勾选 = 100":"100 − 0 checked = 100");
  });
  it("disables analytics throughout the product and exposes a real searchable directory cover", () => {
    for(const locale of ["en","zh"]) for(const suffix of ["","/take","/result/score-reading"]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/rice-purity-test${suffix}`)).toBe(true);
    expect(entertainmentActivityDefinitions.find(a=>a.slug===quiz.slug)?.privacy).toBe("explicit_opt_in");
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<MoreTests locale="en"/>);
    const card=[...dom.querySelectorAll("article")].find(a=>a.querySelector('a[href="/en/tests/explore/rice-purity-test"]'));
    expect(card?.textContent).toContain("Rice Purity");
    expect(card?.querySelector('img')?.getAttribute('src')).toBe('/images/test-covers/rice-purity-test.webp');
    const cover=readFileSync('public/images/test-covers/rice-purity-test.webp');expect(cover.subarray(8,12).toString()).toBe('WEBP');
    const client=readFileSync('components/questionnaires/RicePurityClient.tsx','utf8');
    for(const forbidden of ['localStorage','sessionStorage','fetch(','trackEvent','sendBeacon'])expect(client).not.toContain(forbidden);
    expect(client).toContain('canvas.toBlob');expect(client).toContain('"image/png"');
  });
});
