import { expect, type Locator, type Page, type Response } from "@playwright/test";

export async function clickLastOptionAndWaitForSubmit({
  page,
  option,
  timeoutMs = 30000,
}: {
  page: Page;
  option: Locator;
  timeoutMs?: number;
}): Promise<Response> {
  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/v0.3/attempts/submit"),
    { timeout: timeoutMs }
  );

  await option.click();
  return submitResponsePromise;
}

export async function clickLastOptionAndWaitForSubmitAndUrl({
  page,
  option,
  targetUrl,
  timeoutMs = 30000,
}: {
  page: Page;
  option: Locator;
  targetUrl: RegExp;
  timeoutMs?: number;
}): Promise<Response> {
  const submitResponse = await clickLastOptionAndWaitForSubmit({
    page,
    option,
    timeoutMs,
  });
  await expect(page).toHaveURL(targetUrl, { timeout: timeoutMs });
  return submitResponse;
}
