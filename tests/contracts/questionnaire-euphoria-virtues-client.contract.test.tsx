import { readFileSync } from "node:fs";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
const events=vi.hoisted(()=>vi.fn());vi.mock("@/lib/analytics",()=>({trackEvent:events}));
const read=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const virtues=read("lib/questionnaires/data/seven-sins-virtues-test.json") as Questionnaire;
const euphoria=read("lib/questionnaires/data/euphoria-character-quiz.json") as Questionnaire;
const outcomes=read("tests/fixtures/questionnaires/euphoria-outcomes-reference.json") as {witnesses:{winnerIds:string[];answers:QuestionnaireAnswers}[]};
beforeEach(()=>{events.mockClear();Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});});
function finish(quiz:Questionnaire,answers:QuestionnaireAnswers,locale:"en"|"zh"){
 for(let i=0;i<quiz.questions.length;i++){
  const q=quiz.questions[i],option=q.options.find(o=>o.id===answers[q.id])!;
  fireEvent.click(screen.getByRole("radio",{name:option.label[locale]}));
  expect(document.querySelectorAll("[data-mini-virtues-score],[data-archetype-count]")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button",{name:i===quiz.questions.length-1?(locale==="zh"?"查看完整结果":"See full result"):(locale==="zh"?"下一题":"Next")}));
 }
}
for(const locale of ["en","zh"] as const)for(const quiz of [virtues,euphoria]){
 it(`${quiz.slug} ${locale}: actual choices retain full personal output, clear optional drafts and copy only public entry`,async()=>{
  const clipboard=vi.fn(async()=>{});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:clipboard}});
  const stored=vi.spyOn(Storage.prototype,"setItem"),key=`fm_questionnaire_draft:${quiz.slug}`;
  render(<QuestionnaireClient quiz={quiz} locale={locale}/>);
  fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"开始测试":"Start test"}));
  fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"下一题":"Next"}));
  expect(screen.getByRole("status").textContent).toContain(locale==="zh"?"请选择":"Choose an option");
  fireEvent.click(screen.getAllByRole("radio")[0]);expect(stored).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("checkbox"));expect(sessionStorage.getItem(key)).not.toBeNull();
  const answers=quiz===virtues?Object.fromEntries(quiz.questions.map(q=>[q.id,"3"])):outcomes.witnesses.find(w=>w.winnerIds.length===6)!.answers;
  finish(quiz,answers,locale);
  expect(sessionStorage.getItem(key)).toBeNull();expect(localStorage.length).toBe(0);
  expect(document.querySelectorAll(quiz===virtues?"[data-mini-virtues-part]":"[data-archetype-match]")).toHaveLength(quiz===virtues?7:6);
  expect(document.querySelectorAll("#take-test h4")).toHaveLength(quiz===virtues?56:36);
  expect(screen.getByRole("heading",{level:2})).toHaveFocus();
  await act(async()=>{fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"复制公开入口":"Copy public entry"}));});
  expect(clipboard).toHaveBeenCalledWith(`${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${quiz.slug}`);
  expect(screen.getByRole("status").textContent).toContain(locale==="zh"?"不含个人答案或次数":"without personal answers or counts");
  expect(JSON.stringify(events.mock.calls)).not.toMatch(/VIRTUES_LK_|EUPHORIA_ORIGINAL_|rawSum|winnerIds|answers|miniVirtues|counts/);
  expect(events.mock.calls.filter(c=>c[0]==="complete_test")).toHaveLength(1);expect(events.mock.calls.filter(c=>c[0]==="view_result")).toHaveLength(1);
  const mbti=screen.queryByRole("link",{name:locale==="zh"?"可选：另做MBTI偏好探索":"Optional: explore MBTI preferences separately"});
  if(quiz===virtues)expect(mbti).toBeNull();else expect(mbti).toHaveAttribute("href",expect.stringContaining("target_action=questionnaire_result_mbti"));
  fireEvent.click(screen.getByRole("button",{name:locale==="zh"?"重新测试":"Retake test"}));
  expect(screen.getAllByRole("radio").some(r=>(r as HTMLInputElement).checked)).toBe(false);expect(sessionStorage.getItem(key)).toBeNull();
  expect(document.querySelectorAll("[data-mini-virtues-result],[data-archetype-match]")).toHaveLength(0);stored.mockRestore();
 });
}
it("restores only a saved compatible draft, supports Back and deletes it on explicit exit",()=>{
 const key=`fm_questionnaire_draft:${virtues.slug}`;
 sessionStorage.setItem(key,JSON.stringify({version:virtues.version,savedAt:Date.now(),answers:{VIRTUES_LK_001:"4"}}));
 render(<QuestionnaireClient quiz={virtues} locale="en"/>);
 fireEvent.click(screen.getByRole("button",{name:"Resume this tab's progress"}));
 expect(screen.getByText("Question 2 of 28",{exact:true})).toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Back"}));
 expect(screen.getByRole("radio",{name:virtues.questions[0].options[3].label.en})).toBeChecked();
 fireEvent.click(screen.getByRole("button",{name:"Exit and clear this attempt"}));expect(sessionStorage.getItem(key)).toBeNull();expect(screen.queryByRole("button",{name:"Resume this tab's progress"})).toBeNull();
});
it("provides a public-only manual copy fallback when clipboard access fails",async()=>{
 Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:vi.fn(async()=>{throw Error("synthetic clipboard denial");})}});
 render(<QuestionnaireClient quiz={euphoria} locale="en"/>);fireEvent.click(screen.getByRole("button",{name:"Start test"}));finish(euphoria,outcomes.witnesses[0].answers,"en");
 await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Copy public entry"}));});
 expect(screen.getByRole("textbox",{name:"Result text for manual copying"})).toHaveValue(`${euphoria.title.en}\nhttps://fermatmind.com/en/tests/explore/euphoria-character-quiz`);
});
it("disables entry controls in the server HTML until hydration",()=>{
 for(const quiz of [virtues,euphoria]){
  const parsed=new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireClient quiz={quiz} locale="en"/>),"text/html");
  expect(parsed.querySelector("button")?.hasAttribute("disabled")).toBe(true);expect(parsed.querySelector("input,textarea")).toBeNull();
 }
});
