import {expect,test} from "@playwright/test";

test("Taiwan preferences keeps private headers, keyboard save and token-bearing language links",async({page})=>{
  let saved = false;
  await page.route("**/api/v0.3/email/preferences*",async route=>{
    const request=route.request();
    if(request.method()==="POST") {
      expect(request.postDataJSON()).toEqual({token:"tw_preferences_fixture",marketing_updates:false,report_recovery:true,product_updates:false});
      saved=true;
    }
    await route.fulfill({json:{ok:true,email_masked:"b***@example.test",preferences:{marketing_updates:!saved,report_recovery:true,product_updates:false}}});
  });
  const response=await page.goto("/zh-TW/email/preferences?token=tw_preferences_fixture");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page.locator("html")).toHaveAttribute("lang","zh-TW");
  await expect(page.getByTestId("email-preferences-email")).toHaveText("b***@example.test");
  const marketing=page.getByTestId("email-preferences-marketing-updates");
  await marketing.focus();
  await page.keyboard.press("Space");
  await page.getByTestId("email-preferences-save").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("email-preferences-feedback")).toContainText("訂閱偏好已儲存");
  expect(saved).toBe(true);
  await expect(page.getByRole("link",{name:"English",exact:true})).toHaveAttribute("href","/en/email/preferences?token=tw_preferences_fixture");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://fermatmind.com/zh-TW/email/preferences");
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
  await page.getByRole("link",{name:"English",exact:true}).click();
  await expect(page).toHaveURL(/\/en\/email\/preferences\?token=tw_preferences_fixture$/);
  await expect(page.getByTestId("email-preferences-email")).toHaveText("b***@example.test");
  await page.getByRole("navigation",{name:"Email language"}).getByRole("link",{name:"繁體中文",exact:true}).click();
  await expect(page).toHaveURL(/\/zh-TW\/email\/preferences\?token=tw_preferences_fixture$/);
  await expect(page.getByTestId("email-preferences-email")).toHaveText("b***@example.test");
});

test("Taiwan unsubscribe posts only after confirmation and permits retry after a temporary failure",async({page})=>{
  let requests=0;
  await page.route("**/api/v0.3/email/unsubscribe",async route=>{
    expect(route.request().postDataJSON()).toEqual({token:"tw_unsubscribe_fixture",reason:"user_request"});
    requests++;
    if(requests===1) await route.fulfill({status:503,json:{ok:false,error_code:"TEMPORARY_UNAVAILABLE"}});
    else await route.fulfill({json:{ok:true,status:"unsubscribed"}});
  });
  await page.goto("/zh-TW/email/unsubscribe?token=tw_unsubscribe_fixture");
  await expect(page.getByTestId("email-unsubscribe-confirm")).toBeVisible();
  expect(requests).toBe(0);
  await page.getByTestId("email-unsubscribe-confirm-button").click();
  await expect(page.getByTestId("email-unsubscribe-error")).toContainText("暫時無法完成退訂");
  await expect(page.getByTestId("email-unsubscribe-confirm-button")).toBeEnabled();
  await page.getByTestId("email-unsubscribe-confirm-button").click();
  await expect(page.getByTestId("email-unsubscribe-success")).toContainText("已退訂");
  expect(requests).toBe(2);
});

test("Taiwan preferences distinguishes retryable network failures and invalid links",async({page})=>{
  let requests=0;
  await page.route("**/api/v0.3/email/preferences*",async route=>{
    requests++;
    await route.fulfill(requests===1 ? {status:503,json:{ok:false,error_code:"TEMPORARY_UNAVAILABLE"}} : {status:410,json:{ok:false,error_code:"TOKEN_EXPIRED"}});
  });
  await page.goto("/zh-TW/email/preferences?token=tw_failure_fixture");
  await expect(page.getByTestId("email-preferences-unavailable")).toBeVisible();
  await page.getByRole("button",{name:"重試",exact:true}).click();
  await expect(page.getByTestId("email-preferences-invalid")).toBeVisible();
  expect(requests).toBe(2);
});
