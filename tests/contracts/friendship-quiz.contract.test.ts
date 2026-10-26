import { generateMetadata as homeMetadata } from "@/app/(localized)/[locale]/tests/friendship-quiz/page";
import { generateMetadata as questionsMetadata } from "@/app/(localized)/[locale]/tests/friendship-quiz/questions/page";
import { generateMetadata as guideMetadata } from "@/app/(localized)/[locale]/tests/friendship-quiz/how-to-play/page";
import { generateMetadata as scoresMetadata } from "@/app/(localized)/[locale]/tests/friendship-quiz/scores/page";
import { generateMetadata as inviteMetadata } from "@/app/(localized)/[locale]/share/friendship/[id]/page";
import { generateMetadata as manageMetadata } from "@/app/(localized)/[locale]/share/friendship/[id]/manage/page";
import { friendshipApi } from "@/lib/friendship/api";
import { createElement } from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { ShareTools } from "@/components/friendship/ShareTools";
const tracking = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("@/lib/tracking/client", () => ({ trackClientEvent: tracking.send }));
import { friendshipEvent } from "@/lib/friendship/analytics";
import { filterTrackingPayload } from "@/lib/tracking/events";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { appendFriendshipSitemapEntries } from "@/lib/friendship/sitemap";
import { average, ranked, selectQuestions, swapQuestion, title, validAnswers, type Pack, type Entry } from "@/lib/friendship/core";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { resourceMetadata } from "@/components/friendship/PublicContent";
const categories = ["food", "connection", "play", "reflection", "personality", "daily"];
const pack: Pack = { version: "test", categories: Object.fromEntries(categories.map(c => [c, { en: c, zh: c }])), questions: categories.flatMap(category => Array.from({ length: 40 }, (_, i) => ({ id: `${category}-${i}`, category, en: { prompt: "Choose", options: ["A", "B"] as [string, string] }, zh: { prompt: "选择", options: ["甲", "乙"] as [string, string] } }))) };
function entry(id: string, correct: number, hidden = false): Entry { return { id, nickname: "Synthetic", correct, hidden, categories: { food: { correct, total: 30 } } }; }
describe("friendship quiz public and private contract", () => {
  it.each(["en", "zh"] as const)("wires actual %s routes to public identities and private metadata", async locale => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
    for (const [suffix, build] of [["", homeMetadata], ["/questions", questionsMetadata], ["/how-to-play", guideMetadata], ["/scores", scoresMetadata]] as const) {
      const metadata = await build({ params: Promise.resolve({ locale }) });
      expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/friendship-quiz${suffix}`);
    }
    for (const build of [inviteMetadata, manageMetadata]) {
      const metadata = await build({ params: Promise.resolve({ locale }) });
      expect(metadata.robots).toMatchObject({ index: false, follow: false });
      expect(metadata.referrer).toBe("no-referrer");
      expect(metadata.alternates?.canonical).toBeNull();
    }
    } finally { vi.unstubAllEnvs(); }
  });
  it("distinguishes missing capabilities from transient transport failures", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));
    try { await expect(friendshipApi("/challenges/synthetic/manage")).rejects.toThrow("key_required"); }
    finally { fetchMock.mockRestore(); }
  });
  it("keeps creator previews out of friend completion and invitation statistics", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(createElement(ShareTools, { locale: "en", url: "https://fermatmind.com/en/share/friendship/synthetic", result: { nickname: "Synthetic", correct: 30, total: 30, percent: 100, preview: true, categories: {}, answers: [], guesses: [], entries: [] } }));
    fireEvent.click(screen.getByRole("button", { name: "Copy invite link" }));
    await waitFor(() => expect(tracking.send.mock.calls.at(-1)![0].payload.form_code).toBe("friendship_v1_creator"));
    const client = readFileSync("components/friendship/FriendshipClient.tsx", "utf8");
    expect(client).toMatch(/if \(!r\.preview\) \{ friendshipEvent\("complete_test", locale, "friend"\)/);
  });
  it("preserves product, role and share-sheet semantics through existing event filtering", () => {
    friendshipEvent("share_result", "en", "friend", "share_sheet_completed");
    const sent = tracking.send.mock.calls.at(-1)![0];
    const filtered = filterTrackingPayload("share_result", sent.payload);
    expect(filtered.form_code).toBe("friendship_v1_friend_share_sheet_completed");
    expect(sent.path).toBe("/en/tests/friendship-quiz");
    expect(sent.anonymousId).toBe("");
    expect(JSON.stringify(sent)).not.toMatch(/key=|guesses|nickname|\/share\/friendship/);
    friendshipEvent("revisit_result", "zh", "creator");
    expect(filterTrackingPayload("revisit_result", tracking.send.mock.calls.at(-1)![0].payload).form_code).toBe("friendship_v1_creator");
  });
  it("admits only the exact code-owned game without broadening assessment authority", async () => { for (const locale of ["en", "zh"]) { const allowed = await proxy(new NextRequest(`https://fermatmind.com/${locale}/tests/friendship-quiz`)); expect(allowed.status).toBe(200); const unknown = await proxy(new NextRequest(`https://fermatmind.com/${locale}/tests/friendship-quiz-made-up`)); expect(unknown.status).toBe(404); } });
  it.each([30, 60, 90, 120, 150])("selects balanced unique %i-question rounds", size => { const qs = selectQuestions(pack, size); expect(new Set(qs.map(q => q.id)).size).toBe(size); categories.forEach(cat => expect(qs.filter(q => q.category === cat)).toHaveLength(size / 6)); });
  it("replaces within category without repetition, stops honestly at exhaustion, and prefers fresh questions next round", () => { const qs = selectQuestions(pack, 150); const replacement = swapQuestion(pack, qs, 0, qs.map(q => q.id)); expect(replacement?.category).toBe(qs[0].category); expect(qs.some(q => q.id === replacement?.id)).toBe(false); expect(swapQuestion(pack, qs, 0, pack.questions.map(q => q.id))).toBeNull(); const next = selectQuestions(pack, 30, qs.map(q => q.id)); expect(next.some(q => qs.some(old => q.id === old.id))).toBe(false); });
  it("preserves all tied ranks and excludes own/hidden entries from comparisons", () => { const rows = [entry("a", 22), entry("b", 22), entry("c", 0), entry("h", 30, true)]; expect(ranked(rows).map(e => e.rank)).toEqual([1, 1, 3]); expect(average(rows, "food", "a")).toBeCloseTo(36.666); expect(average([rows[0]], "food", "a")).toBeNull(); expect(title(73, "en")).toBe("On the same wavelength"); expect(title(0, "zh")).toBe("新发现满满"); expect(validAnswers([0, null, 1], 3)).toBe(true); expect(validAnswers(["0"], 1)).toBe(false); });
  it("publishes exactly eight static identities with bilingual metadata, never private instances", () => { const entries = appendFriendshipSitemapEntries([]); expect(entries).toHaveLength(8); expect(entries.every(e => !e.loc.includes("/share/"))).toBe(true); for (const kind of ["home", "questions", "scores", "how-to-play"] as const) { const en = resourceMetadata("en", kind); const zh = resourceMetadata("zh", kind); expect(en.alternates?.canonical).toContain("/en/tests/friendship-quiz"); expect(zh.alternates?.canonical).toContain("/zh/tests/friendship-quiz"); expect(en.alternates?.languages).toHaveProperty("zh-CN"); } });
  it("keeps answer authority, management keys and invitation IDs out of events and public HTML", () => { const events = readFileSync("lib/friendship/analytics.ts", "utf8"); expect(events).not.toContain("inviteId"); expect(events).not.toContain("nickname"); const page = readFileSync("app/(localized)/[locale]/share/friendship/[id]/page.tsx", "utf8"); expect(page).toContain("index: false"); expect(page).toContain('referrer: "no-referrer"'); const share = readFileSync("components/friendship/ShareTools.tsx", "utf8"); expect(share).toContain('name === "AbortError"'); expect(share).toContain("canvas.toBlob"); expect(share).not.toContain("result.entries"); });
});
