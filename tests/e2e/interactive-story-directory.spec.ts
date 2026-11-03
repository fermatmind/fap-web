import {test,expect} from '@playwright/test';
import {storyQuizzes} from '../../lib/entertainment/directory';
for(const locale of ['en','zh'] as const)test(`@release ${locale} hub keeps 285 tests and 99 stories separate, searches and opens the original story`,async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('fm_consent_v1',JSON.stringify({analytics:'denied',updatedAt:new Date().toISOString()})));
 await page.goto(`/${locale}/tests`);
 await expect(page.locator('#more-tests .catalog-item')).toHaveCount(285);
 const stories=page.locator('#interactive-stories');await expect(stories.locator('[data-story-slug]')).toHaveCount(99);
 const hrefs=await stories.locator('h4 a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
 expect(hrefs.sort()).toEqual(storyQuizzes.map(q=>`/${locale}/tests/play/${q.slug}`).sort());
 await expect(stories).toContainText(locale==='zh'?'合计 384个产品':'384 products in total');
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await stories.locator('header').screenshot({path:test.info().outputPath(`story-library-${locale}-${width}.png`)});}
 const search=stories.getByRole('searchbox');await search.fill('woodland-animal');await expect(stories.locator('[data-story-slug]')).toHaveCount(1);
 await stories.locator('a.catalog-item-start').click();await expect(page).toHaveURL(new RegExp(`/${locale}/tests/play/woodland-animal$`));
 await expect(page.locator('[data-explore-start]')).toBeEnabled();await page.locator('[data-explore-start]').click();await expect(page.locator('#play')).toHaveAttribute('data-stage','answer');
 await expect(page.locator('#play input[type=radio]')).toHaveCount(3);
});
