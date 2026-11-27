import { expect, test, type Page, type APIRequestContext } from "@playwright/test";
import { wave3cVariant } from "../../../lib/questionnaires/wave3cScope";

type Locale = "zh" | "zh-TW" | "en";
type Option = { id: string; directionId: string };
type Question = { id: string; options: Option[]; correctOptionId?: string };
type Bank = { slug: string; kind: string; questions: Question[]; profiles: { id: string }[] };
const corePaths = {
  MBTI: "mbti-personality-test-16-personality-types",
  RIASEC: "holland-career-interest-test-riasec",
  EQ_60: "eq-test-emotional-intelligence-assessment",
  BIG5_OCEAN: "big-five-personality-test-ocean-model",
};
const sections: Record<string, number> = { afqt32: 8, technical30: 6, reasoning18: 6 };
const dedicatedPractice = new Set(["afqt32", "technical30", "reasoning18", "critical30"]);
const nextButton = (page: Page) => page.locator("#take-test button[data-questionnaire-next]");
const click = (locator: ReturnType<Page["locator"]>) => locator.evaluate((button: HTMLButtonElement) => button.click());

async function begin(page: Page, bank: Bank, landing: string) {
  const response = await page.goto(landing + "/take", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  const body = page.locator("#take-test");
  if (bank.kind === "written-coordination") {
    await body.locator('input[name="written-practice-mode"][value="study"]').check();
    await click(body.locator('[data-written-start="cross-reference"]'));
  } else {
    // Sectioned exercises intentionally expose setup before starting the clock.
    const mode = body.locator('input[value="study"]');
    if (dedicatedPractice.has(bank.kind) && await mode.isVisible()) await mode.check();
    const start = body.locator("button[data-explore-start]:enabled");
    await expect(body.locator('[data-questionnaire-next], button[data-explore-start]:enabled').first()).toBeVisible();
    if (await start.count()) {
      try { await click(start.first()); }
      catch (error) { if (!(await nextButton(page).isVisible())) throw error; }
    }
  }
  await expect(nextButton(page)).toBeVisible();
}

async function finish(page: Page, bank: Bank, selected: "correct" | "blank") {
  const questions = bank.kind === "written-coordination"
    ? bank.questions.filter(q => q.options[0].directionId === "cross-reference")
    : bank.questions;
  for (const [i, question] of questions.entries()) {
    if (sections[bank.kind] && i && i % sections[bank.kind] === 0) {
      await click(page.getByRole("button", { name: /^(Start this part|开始本部分|開始本部分)$/u }));
    }
    const radio = (name: string, value: string) => page.locator(`#take-test input[type="radio"][name="${name}"][value="${value}"]`);
    if (bank.kind === "most-least") {
      await click(radio(question.id + "-most", question.options[0].id));
      await click(radio(question.id + "-least", question.options[1].id));
    } else {
      const choice = selected === "blank" && question.options.some(option => option.id === "na")
        ? "na"
        : question.correctOptionId ?? question.options[i % question.options.length].id;
      await click(radio(question.id, choice));
    }
    await click(nextButton(page));
  }
  return questions.length;
}

async function archived(request: APIRequestContext, path: string, canonical: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status(), path).toBe(200);
  const html = await response.text();
  expect(html, path).toMatch(/<meta name="robots" content="noindex, follow(?:,[^"]*)?"\s*\/?\s*>/u);
  expect(html, path).toContain(`href="https://fermatmind.com${canonical}"`);
  expect(html, path).not.toMatch(/<link[^>]+hreflang=/iu);
}

export function archiveWave3cScenarios(bank: Bank) {
  const variant = wave3cVariant(bank.slug);
  if (!variant) throw new Error(`Missing Wave 3C variant for ${bank.slug}`);
  for (const locale of ["zh", "zh-TW", "en"] as const satisfies readonly Locale[]) {
    const landing = `/${locale}/tests/explore/${bank.slug}`;
    test(`@release ${bank.slug} ${locale}: archived readback and private mobile result`, async ({ page, request }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const outgoing: string[] = [];
      page.on("request", r => {
        if (/\/(?:api\/)?og(?:\/|$)/iu.test(new URL(r.url()).pathname)) outgoing.push(r.url());
      });
      await page.addInitScript(() => {
        localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }));
        Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Clipboard denied for fallback check"); } } });
      });
      await archived(request, landing, landing);
      const guide = `${landing}/results/${bank.profiles[0].id}`;
      await archived(request, guide, guide);
      await archived(request, guide + "?ref=archive-legacy&portrait=preserved", guide);

      await begin(page, bank, landing);
      const blank = locale === "en" && bank.kind === "likert" && bank.questions.every(q => q.options.some(o => o.id === "na"));
      const total = await finish(page, bank, blank ? "blank" : "correct");
      const card = page.locator("[data-archetype-honor-card]");
      await expect(card).toHaveCount(1);
      await expect(card.locator("button")).toHaveCount(0);
      expect((await card.boundingBox())!.height).toBeLessThanOrEqual(560);
      await expect(card.locator("li")).toHaveCount(3);
      if (variant.shell === "practice") {
        await expect(card.locator("[data-honor-reading]")).toHaveText(`${total} / ${total} · 100%`);
      } else if (blank) {
        await expect(card.locator("[data-honor-reading], [data-honor-metric]")).toHaveCount(0);
      }
      const actions = page.locator("[data-archetype-honor-actions] button");
      await expect(actions).toHaveCount(4);
      const bridge = page.locator("[data-archetype-core-assessment] a");
      await expect(bridge).toHaveCount(1);
      await expect(bridge).toHaveAttribute("href", `/${locale}/tests/${corePaths[variant.target]}`);
      await expect(page.locator("[data-archive-next-step]")).toHaveCount(0);
      await click(actions.nth(2));
      const caption = page.locator("#take-test textarea");
      await expect(caption).toHaveCount(1);
      const [title, link, ...other] = (await caption.inputValue()).split("\n");
      expect(title.trim()).not.toBe("");
      expect(link).toBe(`https://fermatmind.com${landing}`);
      expect(other).toEqual([]);
      expect(title).not.toMatch(/\d+\s*\/\s*\d+|\d+%/u);
      if (["four-axes-test", "python-test", "written-coordination-practice"].includes(bank.slug)) {
        await click(actions.nth(1));
        const modal = page.locator("dialog[open][data-archetype-lightbox]");
        await expect(modal.locator("img")).toBeVisible();
        const closeBox = (await modal.locator("button").boundingBox())!;
        const imageBox = (await modal.locator("img").boundingBox())!;
        const gap = imageBox.y - closeBox.y - closeBox.height;
        expect(gap).toBeGreaterThanOrEqual(5);
        expect(gap).toBeLessThanOrEqual(7);
        await page.keyboard.press("Escape");
        await expect(modal).toHaveCount(0);
      }
      expect(outgoing).toEqual([]);
      await click(actions.nth(3));
      await expect(card).toHaveCount(0);
      await expect(page.locator('#take-test[data-stage="answer"] input[type="radio"]:checked')).toHaveCount(0);
    });
  }
}
