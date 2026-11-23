import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Page, { generateMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/page";
import TakePage from "@/app/(localized)/[locale]/tests/play/friendship-quiz/take/page";
import TraditionalTakePage from "@/app/(traditional)/zh-TW/tests/play/friendship-quiz/take/page";
import { PublicResource } from "@/components/friendship/PublicContent";

vi.mock("@/lib/site", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/site")>(),
  SITE_URL: "https://fermatmind.com",
}));
vi.mock("@/components/friendship/FriendshipClient", () => ({ default: ({ locale }: { locale: string }) => <div data-testid="live-game" data-locale={locale}>Live game</div> }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("friendship search intent and one canonical tool", () => {
  it.each(["en", "zh", "zh-TW"] as const)("keeps one %s tool, localized handoffs and the existing canonical pair", async locale => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const { container } = render(await Page({ params: Promise.resolve({ locale }) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByTestId("live-game")).toBeNull();
    const take = render(locale === "zh-TW" ? <TraditionalTakePage /> : await TakePage({ params: Promise.resolve({ locale }) }));
    expect(take.container.querySelectorAll('[data-testid="live-game"]')).toHaveLength(1);
    expect(take.container.querySelector('[data-testid="live-game"]')).toHaveAttribute("data-locale", locale);
    expect(container.querySelectorAll('#create')).toHaveLength(1);
    expect(container.querySelectorAll(`a[href="/${locale}/tests/explore/friendship-quiz/take"]`)).toHaveLength(3);
    const links = Array.from(container.querySelectorAll('a[href]'), a => a.getAttribute("href"));
    for (const path of ["questions", "how-to-play", "scores"]) expect(links).toContain(`/${locale}/tests/explore/friendship-quiz/${path}`);
    for (const [kind, fragment] of [["questions", "quick-round"], ["how-to-play", "received-invite"], ["scores", "sample-score"]] as const) {
      expect(links).toContain(`/${locale}/tests/explore/friendship-quiz/${kind}#${fragment}`);
      const resource = render(<PublicResource locale={locale} kind={kind} />);
      expect(resource.container.querySelector(`#${fragment}`)).not.toBeNull();
      resource.unmount();
    }
    expect(links.some(path => /\/bff-test|\/who-knows-me-best|\/friendship-quiz-maker/.test(path ?? ""))).toBe(false);
    const metadata = await generateMetadata({ params: Promise.resolve({ locale }) });
    expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/explore/friendship-quiz`);
    expect(metadata.alternates?.languages).toMatchObject({
      en: "https://fermatmind.com/en/tests/explore/friendship-quiz",
      "zh-CN": "https://fermatmind.com/zh/tests/explore/friendship-quiz",
      "zh-TW": "https://fermatmind.com/zh-TW/tests/explore/friendship-quiz",
    });
    expect(metadata.robots).not.toMatchObject({ index: false });
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema["@graph"][0]).toMatchObject({
      "@type": "WebApplication", inLanguage: locale === "zh" ? "zh-CN" : locale, isAccessibleForFree: true, offers: { price: "0" },
    });
    expect(schema["@graph"][2].itemListElement[1].item).toBe(metadata.alternates?.canonical);
    const faq = Array.from(container.querySelectorAll("[data-ent-faq]"), item => ({
      "@type": "Question",
      name: item.querySelector("summary")!.textContent,
      acceptedAnswer: { "@type": "Answer", text: item.querySelector("[data-ent-faq-answer]")!.textContent },
    }));
    expect(faq).toHaveLength(6);
    expect(container.querySelectorAll("[data-ent-faq][open]")).toHaveLength(3);
    expect(container.querySelector("[data-ent-boundary][open]")).toBeNull();
    expect(schema["@graph"][1].mainEntity).toEqual(faq);
    const facts = container.querySelector("[data-ent-summary]")!.textContent!;
    const factLength = locale === "en" ? facts.trim().split(/\s+/).length : facts.replace(/[^\p{L}\p{N}]/gu, "").length;
    expect(factLength).toBeGreaterThanOrEqual(60);
    expect(factLength).toBeLessThanOrEqual(80);
  });
  it.each(["en", "zh", "zh-TW"] as const)("renders the eight %s modules with three distinct radar samples", async locale => {
    const { container } = render(await Page({ params: Promise.resolve({ locale }) }));
    const landing = container.querySelector("main[data-ent-landing]")!;
    expect(landing).toHaveAttribute("data-ent-slot", "B");
    const modules = Array.from(landing.children, child => child.getAttribute("data-ent-module"));
    expect(modules).toEqual(["hero", "summary", "method", "profiles", "interpretation", "related", "comparison", "reference"]);
    expect(landing.querySelectorAll("[data-ent-deliverable]")).toHaveLength(3);
    expect(landing.querySelectorAll("[data-ent-interpretation]")).toHaveLength(3);
    const bands = Array.from(landing.querySelectorAll("[data-friendship-band]"), band => band.getAttribute("data-friendship-band"));
    expect(bands).toEqual(["90", "73", "50", "27", "0"]);

    const choices = Array.from(landing.querySelectorAll("[data-ent-sample-choice]"));
    expect(choices).toHaveLength(3);
    const polygons = new Set<string>();
    for (const [index, choice] of choices.entries()) {
      fireEvent.click(choice);
      const sample = landing.querySelector("[data-ent-sample-id]")!;
      expect(sample.getAttribute("data-ent-sample-id")).toBe(choice.getAttribute("data-ent-sample-choice"));
      expect(choice).toHaveAttribute("aria-pressed", "true");
      expect(sample).toHaveTextContent(index === 2 ? "18/30" : "22/30");
      expect(sample.querySelectorAll("[data-ent-chart-label]")).toHaveLength(6);
      polygons.add(sample.querySelector("polygon[fill-opacity]")!.getAttribute("points")!);
    }
    expect(polygons.size).toBe(3);
  });
  it("answers English creator, BFF, group and printable tasks with actual product rules", async () => {
    const { container } = render(await Page({ params: Promise.resolve({ locale: "en" }) }));
    const text = container.textContent!;
    for (const phrase of ["friendship quiz", "How well do you know me?", "Who knows me best?", "BFF test", "no signup", "same frozen", "equal scores", "can't add custom questions", "expire after 90 days", "1,000 entries"]) expect(text.toLowerCase()).toContain(phrase.toLowerCase());
    expect(text).toContain("Your own preferences don't affect the score");
    expect(text).toContain("online game uses a six-category mix");
    expect(text).toContain("Online rounds start at 30 questions");
    expect(text).not.toMatch(/[\u4e00-\u9fff]|scientifically proven|guaranteed|millions of friends/);
  });
  it("provides natural Chinese task copy with the same free/group/retention boundaries", async () => {
    const { container } = render(await Page({ params: Promise.resolve({ locale: "zh" }) }));
    for (const phrase of ["你有多了解我", "谁更了解我", "同分共享名次", "六类混合题组", "当前不支持自行添加问题", "挑战90天到期", "最多保留1000条记录", "24道原创", "无需注册"]) expect(container.textContent).toContain(phrase);
  });
  it.each(["en", "zh"] as const)("serves %s competitor comparison intent on the existing playable tool", async locale => {
    const { container } = render(await Page({ params: Promise.resolve({ locale }) }));
    const comparison = container.querySelector("#rikaido-alternative")!;
    expect(comparison).not.toBeNull();
    expect(comparison.querySelector("h2")).toHaveTextContent(locale === "en" ? "Rikaido alternative" : "Rikaido 的朋友默契替代玩法");
    expect(comparison.querySelectorAll('th[scope="col"]')).toHaveLength(4);
    expect(comparison.querySelectorAll('th[scope="row"]')).toHaveLength(4);
    expect(comparison.textContent).toContain(locale === "en" ? "no affiliation" : "没有隶属或合作关系");
    expect(comparison.textContent).toContain(locale === "en" ? "single-topic Love" : "单主题版本");
    expect(comparison.textContent).toContain(locale === "en" ? "90 days" : "90天");
    expect(comparison.textContent).toContain(locale === "en" ? "no import" : "不能直接导入");
    expect(comparison.textContent).toContain(locale === "en" ? "Another device may still repeat" : "换设备仍可能重复");
    const links = Array.from(comparison.querySelectorAll("a"), a => a.getAttribute("href"));
    expect(comparison.querySelector('a.fq-primary')).toHaveAttribute("href", `/${locale}/tests/explore/friendship-quiz/take`);
    for (const path of ["/questions", "/how-to-play", "/scores"]) expect(links).toContain(`/${locale}/tests/explore/friendship-quiz${path}`);
    expect(links).toContain("https://rikaido.me/en/guide.html");
    expect(links).toContain("https://rikaido.me/en/lab/read-results/");
    expect(container.querySelectorAll('a[href="#rikaido-alternative"]')).toHaveLength(1);
    if (locale === "en") expect(comparison.textContent).not.toMatch(/[\u4e00-\u9fff]/);
  });
  it.each(["en", "zh"] as const)("shows the %s fictional score and skips a rank after a tie", locale => {
    const { container } = render(<PublicResource locale={locale} kind="scores" />);
    const example = container.querySelector("#sample-score")!;
    expect(example.textContent).toContain("73%");
    const rows = Array.from(example.querySelectorAll("tbody tr"), row =>
      Array.from(row.querySelectorAll("td"), cell => cell.textContent));
    expect(rows).toEqual([["1", "22/30"], ["1", "22/30"], ["3", "18/30"]]);
    expect(example.querySelector("a, form")).toBeNull();
  });
  it.each(["en", "zh"] as const)("keeps the %s public sharing instructions aligned with QR and Story behavior", locale => {
    const { container } = render(<PublicResource locale={locale} kind="how-to-play" />);
    const text = container.textContent!;
    expect(text).toContain(locale === "en" ? "QR for this invitation" : "这份邀请的二维码");
    expect(text).toContain(locale === "en" ? "tries to copy" : "尝试同时复制");
    expect(text).toContain(locale === "en" ? "does not confirm that a message was sent" : "不代表消息已发送");
  });
});
