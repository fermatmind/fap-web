import { expect, type Locator, type Page, type Response } from "@playwright/test";

async function activateOption(option: Locator): Promise<void> {
  // Keep clicks resilient during animated transitions on long quiz flows.
  await option.scrollIntoViewIfNeeded();

  try {
    await option.click();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Execution context was destroyed")) {
      // The page navigated right when the final answer was activated.
      return;
    }
    if (error instanceof Error && error.message.includes("intercepts pointer events")) {
      await option.focus();
      await option.press("Space");
      return;
    }
    throw error;
  }
}

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

  await activateOption(option);
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
