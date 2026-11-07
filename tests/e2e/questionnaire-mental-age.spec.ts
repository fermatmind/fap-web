import {test,expect} from "@playwright/test";
import {enterMentalAge,finishMentalAge,words} from "./helpers/mental-age";
for(const locale of ["en","zh"]as const)for(const width of [390,1280])test(`@release mental-age classic ${locale} ${width}: 30 scored / Chinese33 screens, ages, back, language, copy and retake`,async({page,context})=>{
 const w=(en:string,zh:string)=>words(locale,en,zh),other=locale==='en'?'zh':'en';
 await page.setViewportSize({width,height:900});await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.addInitScript(()=>{sessionStorage.setItem('fm_questionnaire_draft:mental-age',JSON.stringify({version:'fm_mental_age12_v1',savedAt:Date.now(),answers:{MAGE_01:'a'}}));});
 const leak:string[]=[];page.on('request',r=>{if(r.method()==='POST'&&/MAC_\d|MAGE_\d|actualAge|"answers"|"gender"/.test(r.postData()??''))leak.push(r.url());});
 await enterMentalAge(page,locale);
 const age=page.getByLabel(w('Actual age (optional)','实际年龄（选填）'),{exact:true});
 for(const invalid of ['0','126','1.5']){await age.fill(invalid);await page.getByRole('button',{name:w('Begin questions','开始答题'),exact:true}).click();await expect(page.getByRole('status')).toContainText(w('1 to 125','1至125'));}
 if(width===1280){await age.fill('35');await page.getByRole('button',{name:w('Begin questions','开始答题'),exact:true}).click();}else await page.getByRole('button',{name:w('Keep private and begin','保密并开始'),exact:true}).click();
 expect(await page.evaluate(()=>sessionStorage.getItem('fm_questionnaire_draft:mental-age'))).toBeNull();
 await page.locator('[data-questionnaire-next]').click();await expect(page.getByRole('status')).toContainText(w('Choose an option','请选择'));
 await finishMentalAge(page,locale,1,true);
 await expect(page.locator('[data-mental-age-comparison]')).toContainText(width===1280?'+5':w('private','保密'));
 await page.getByRole('button',{name:w('Change actual age','修改实际年龄'),exact:true}).click();
 await page.getByLabel(w('New actual age (empty means private)','新的实际年龄（留空即保密）'),{exact:true}).fill('125');await page.getByRole('button',{name:w('Update comparison','更新对照'),exact:true}).click();
 await expect(page.locator('[data-mental-age-comparison]')).toContainText('-85');await expect(page.locator('[data-mental-age-value]')).toContainText('40');
 await page.getByRole('button',{name:w('Change actual age','修改实际年龄'),exact:true}).click();await page.getByLabel(w('New actual age (empty means private)','新的实际年龄（留空即保密）'),{exact:true}).fill('');await page.getByRole('button',{name:w('Update comparison','更新对照'),exact:true}).click();await expect(page.locator('[data-mental-age-comparison]')).toContainText(w('private','保密'));
 await page.getByRole('button',{name:w('用中文阅读结果','Read result in English'),exact:true}).click();
 await expect(page.locator('[data-mental-age-value]')).toHaveText(`40${other==='zh'?'岁':' years'}`);
 await page.getByRole('button',{name:words(other,'Copy public entry','复制公开入口'),exact:true}).click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(`${other==='zh'?'心理年龄测试':'Mental Age Test'}\nhttps://fermatmind.com/${other}/tests/explore/mental-age`);
 expect(new URL(page.url()).search).toBe('');expect(leak).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath(`${locale}-${width}-classic.png`),fullPage:true});
 await page.getByRole('button',{name:words(other,'Retake test','重新测试'),exact:true}).click();await expect(age).toHaveValue('');await expect(page.locator('[data-mental-age-report]')).toHaveCount(0);
});
