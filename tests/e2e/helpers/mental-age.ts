import {expect,type Page} from "@playwright/test";
import quiz from "../../../lib/questionnaires/data/mental-age.json";
export type MentalLocale="en"|"zh";
export const words=(locale:MentalLocale,en:string,zh:string)=>locale==="zh"?zh:en;
export async function enterMentalAge(page:Page,locale:MentalLocale) {
 await page.goto(`/${locale}/tests/explore/mental-age`);
 await page.getByRole("button",{name:words(locale,"Decline","拒绝"),exact:true}).click();
 await page.locator('[data-questionnaire-take-entry] button[data-explore-start]').click();
 await expect(page.getByLabel(words(locale,"Actual age (optional)","实际年龄（选填）"),{exact:true})).toBeVisible();
}
export async function finishMentalAge(page:Page,locale:MentalLocale,point=1,back=false,extraMode:"skip"|"choose"="skip") {
 for(const [i,q] of quiz.questions.entries()) {
  const chosen=q.options.find(o=>o.score===point)!;
  await expect(page.getByRole("heading",{name:q.prompt[locale],exact:true})).toBeVisible();
  await expect(page.locator('[data-mental-age-progress]')).toHaveText(words(locale,`Question ${i+1} of 30`,`第 ${i+1} / 33 屏`));
  await page.getByRole('radio',{name:chosen.label[locale],exact:true}).check();
  if(i<29)await expect(page.getByRole('heading',{name:quiz.questions[i+1].prompt[locale],exact:true})).toBeVisible();
  if(i===0&&back){
   await page.getByRole('button',{name:words(locale,'Back','上一题'),exact:true}).click();
   await expect(page.getByRole('radio',{name:chosen.label[locale],exact:true})).toBeChecked();
   await page.getByRole('radio',{name:q.options.find(o=>o.score!==point)!.label[locale],exact:true}).check();
   await expect(page.getByRole('heading',{name:quiz.questions[1].prompt[locale],exact:true})).toBeVisible();
   await page.getByRole('button',{name:words(locale,'Back','上一题'),exact:true}).click();
   await page.getByRole('radio',{name:chosen.label[locale],exact:true}).check();
   await expect(page.getByRole('heading',{name:quiz.questions[1].prompt[locale],exact:true})).toBeVisible();
  }
 }
 if(locale==='zh')for(let n=31;n<=33;n++){await expect(page.locator('[data-mental-age-progress]')).toHaveText(`第 ${n} / 33 屏`);if(extraMode==='skip')await page.getByRole('button',{name:'跳过此屏',exact:true}).click();else await page.getByRole('radio').first().check();}
 await expect(page.locator('[data-mental-age-value]')).toHaveText(`${10+30*point}${locale==='zh'?'岁':' years'}`);
}
