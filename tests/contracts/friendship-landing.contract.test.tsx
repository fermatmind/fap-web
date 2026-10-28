import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Page, { generateMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/page";
import { PublicResource } from "@/components/friendship/PublicContent";

vi.mock("@/components/friendship/FriendshipClient", () => ({ default: ({ locale }: { locale: string }) => <div data-testid="live-game" data-locale={locale}>Live game</div> }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("friendship search intent and one canonical tool", () => {
  it.each(["en", "zh"] as const)("keeps one %s tool, localized handoffs and the existing canonical pair", async locale => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const { container } = render(await Page({ params: Promise.resolve({ locale }) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByTestId("live-game")).toHaveLength(1);
    expect(screen.getByTestId("live-game")).toHaveAttribute("data-locale", locale);
    expect(container.querySelectorAll('#create')).toHaveLength(1);
    expect(container.querySelectorAll('a[href="#create"]')).toHaveLength(2);
    const links = Array.from(container.querySelectorAll('a[href]'), a => a.getAttribute("href"));
    for (const path of ["questions", "how-to-play", "scores"]) expect(links).toContain(`/${locale}/tests/play/friendship-quiz/${path}`);
    expect(links.some(path => /\/bff-test|\/who-knows-me-best|\/friendship-quiz-maker/.test(path ?? ""))).toBe(false);
    const metadata = await generateMetadata({ params: Promise.resolve({ locale }) });
    expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/friendship-quiz`);
    expect(metadata.alternates?.languages).toMatchObject({ en: "https://fermatmind.com/en/tests/play/friendship-quiz", "zh-CN": "https://fermatmind.com/zh/tests/play/friendship-quiz" });
    expect(metadata.robots).not.toMatchObject({ index: false });
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema).toMatchObject({ "@type": "WebApplication", inLanguage: locale === "zh" ? "zh-CN" : "en", offers: { price: "0" } });
  });
  it("answers English creator, BFF, group and printable tasks with actual product rules", async () => {
    const { container } = render(await Page({ params: Promise.resolve({ locale: "en" }) }));
    const text = container.textContent!;
    for (const phrase of ["friendship quiz", "How well do you know me?", "Who knows me best?", "BFF test", "no signup", "same frozen", "equal scores", "can't add custom questions", "expire after 90 days", "1,000 entries"]) expect(text.toLowerCase()).toContain(phrase.toLowerCase());
    expect(text).toContain("Knowing their choice and sharing their preference are different things");
    expect(text).toContain("online game still uses a six-category mix");
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
    expect(comparison.querySelectorAll('th[scope="col"]')).toHaveLength(3);
    expect(comparison.querySelectorAll('th[scope="row"]')).toHaveLength(4);
    expect(comparison.textContent).toContain(locale === "en" ? "no affiliation" : "没有隶属或合作关系");
    expect(comparison.textContent).toContain(locale === "en" ? "single-topic Love" : "单主题版本");
    expect(comparison.textContent).toContain(locale === "en" ? "90 days" : "90天");
    expect(comparison.textContent).toContain(locale === "en" ? "no import" : "不能直接导入");
    expect(comparison.textContent).toContain(locale === "en" ? "Another device may still repeat" : "换设备仍可能重复");
    const links = Array.from(comparison.querySelectorAll("a"), a => a.getAttribute("href"));
    for (const path of ["#create", "/questions", "/how-to-play", "/scores"]) expect(links).toContain(`/${locale}/tests/play/friendship-quiz${path}`);
    expect(links).toContain("https://rikaido.me/en/guide.html");
    expect(links).toContain("https://rikaido.me/en/lab/read-results/");
    expect(container.querySelectorAll('a[href="#rikaido-alternative"]')).toHaveLength(1);
    if (locale === "en") expect(comparison.textContent).not.toMatch(/[\u4e00-\u9fff]/);
  });
  it.each(["en", "zh"] as const)("keeps the %s public sharing instructions aligned with QR and Story behavior", locale => {
    const { container } = render(<PublicResource locale={locale} kind="how-to-play" />);
    const text = container.textContent!;
    expect(text).toContain(locale === "en" ? "QR for this invitation" : "这份邀请的二维码");
    expect(text).toContain(locale === "en" ? "tries to copy" : "尝试同时复制");
    expect(text).toContain(locale === "en" ? "does not confirm that a message was sent" : "不代表消息已发送");
  });
});
