import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import ResultClient from "@/app/(localized)/[locale]/(app)/result/[id]/ResultClient";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { MBTI_COMPARISON_BASE_TYPES } from "@/lib/mbti/personalityComparison";
import freeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import projectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const state = vi.hoisted(() => ({
  pathname: "/en/result/attempt-123",
  report: vi.fn(), access: vi.fn(), cms: vi.fn(), introduction: vi.fn(),
}));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname, useSearchParams: () => new URLSearchParams() }));
vi.mock("@/lib/api/v0_3", async () => ({
  ...await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3"),
  fetchAttemptReport: state.report,
  fetchAttemptReportAccess: state.access,
  fetchAttemptResult: vi.fn(async () => { throw new Error("Rich result must not use the generic result endpoint"); }),
  fetchAttemptSubmission: vi.fn(async () => ({ ok: true, submission: { state: "succeeded" }, generating: false })),
  fetchAttemptInviteUnlockProgress: vi.fn(async () => ({ ok: true, required_invitees: 2, completed_invitees: 0 })),
}));
vi.mock("@/lib/anon", () => ({ getOrCreateAnonId: () => "anon_navigation", readPendingAnonLinkAttempts: () => [] }));
vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: vi.fn(async () => "issued"),
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));
vi.mock("@/lib/auth/fmToken", () => ({ getFmToken: () => "fixture-token", isGuestTokenRequestError: () => false, setFmToken: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
vi.mock("@/lib/observability/sentry", () => ({ captureError: vi.fn() }));
vi.mock("@/lib/cms/personality-desktop-clone", async () => ({
  ...await vi.importActual<typeof import("@/lib/cms/personality-desktop-clone")>("@/lib/cms/personality-desktop-clone"),
  fetchPersonalityDesktopCloneContent: state.cms,
}));
vi.mock("@/lib/cms/personality-result-introduction", () => ({ fetchPersonalityResultIntroduction: state.introduction }));
vi.mock("@/lib/cms/personality-trait-explanations", () => ({ fetchPersonalityTraitExplanations: vi.fn(async () => null) }));

function createListItems(prefix: string) {
  return [
    { title: `${prefix} 1`, body: `${prefix} body 1` },
    { title: `${prefix} 2`, body: `${prefix} body 2` },
    { title: `${prefix} 3`, body: `${prefix} body 3` },
    { title: `${prefix} 4`, body: `${prefix} body 4` },
    { title: `${prefix} 5`, body: `${prefix} body 5` },
    { title: `${prefix} 6`, body: `${prefix} body 6` },
  ] as [
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
  ];
}

function createStrengthItems(prefix: string) {
  return [1, 2, 3, 4, 5, 6].map((index) => ({
    title: `${prefix} ${index}`,
    description: `${prefix} description ${index}`,
  }));
}

function createLockedBlocks(prefix: string) {
  return [
    {
      title: `${prefix} locked primary`,
      overlayTitle: "解锁完整报告",
      overlayBody: "解锁后查看完整内容。",
      overlayCtaLabel: "解锁完整报告",
      blurredItems: createListItems(`${prefix} locked primary redacted`),
    },
    {
      title: `${prefix} locked secondary`,
      overlayTitle: "解锁完整报告",
      overlayBody: "解锁后查看完整内容。",
      overlayCtaLabel: "解锁完整报告",
      blurredItems: createListItems(`${prefix} locked secondary redacted`),
    },
  ] as [
    {
      title: string;
      overlayTitle: string;
      overlayBody: string;
      overlayCtaLabel: string;
      blurredItems: ReturnType<typeof createListItems>;
    },
    {
      title: string;
      overlayTitle: string;
      overlayBody: string;
      overlayCtaLabel: string;
      blurredItems: ReturnType<typeof createListItems>;
    },
  ];
}

function createPublicDesktopClonePayload(locale: "en" | "zh"): PersonalityDesktopCloneContentPayload {
  const chapter = (prefix: string) => ({
    intro: [`${prefix} public intro one`, `${prefix} public intro two`] as [string, string],
    influentialTraits: [
      { label: `${prefix} trait one`, body: "public trait body one", colorKey: "blue" },
      { label: `${prefix} trait two`, body: "public trait body two", colorKey: "gold" },
      { label: `${prefix} trait three`, body: "public trait body three", colorKey: "green" },
      { label: `${prefix} trait four`, body: "public trait body four", colorKey: "purple" },
    ] as [
      { label: string; body: string; colorKey: "blue" },
      { label: string; body: string; colorKey: "gold" },
      { label: string; body: string; colorKey: "green" },
      { label: string; body: string; colorKey: "purple" },
    ],
    visibleBlocks: [
      {
        title: `${prefix} visible block`,
        items: createListItems(`${prefix} visible item`),
      },
    ] as [{ title: string; items: ReturnType<typeof createListItems> }],
    lockedBlocks: createLockedBlocks(prefix),
  });

  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode: "ENFP-T",
    baseCode: "ENFP",
    locale: locale === "zh" ? "zh-CN" : "en",
    content: {
      hero: {
        summary: "ISFP-T public storage hero summary",
        profileIdentity: {
          code: "ENFP-T",
          name: "探险家型",
          nickname: "温柔感受者",
          rarity: "约 4-9%",
          keywords: ["感受力", "自由", "当下体验", "审美", "共情", "随性"],
        },
      },
      intro: {
        paragraphs: [
          "ISFP-T public storage intro one",
          "ISFP-T public storage intro two",
        ],
      },
      traits: {
        summaryPane: {
          eyebrow: "能力方向",
          title: "ISFP-T public storage traits title",
          value: "72%",
          body: "ISFP-T public storage traits body",
        },
        body: ["ISFP-T public trait body one", "ISFP-T public trait body two"],
      },
      chapters: {
        career: {
          ...chapter("career"),
          careerIdeas: {
            title: "paid-only career ideas should stay hidden while locked",
            items: createStrengthItems("paid-only career idea"),
          },
        },
        growth: chapter("growth"),
        relationships: chapter("relationships"),
      },
      finalOffer: {
        eyebrow: "完整报告",
        headline: "继续解锁完整报告",
        body: "查看完整报告后获得更细的结果。",
        priceLabel: "¥199",
        ctaLabel: "解锁完整报告",
        guarantee: "安全支付",
      },
    },
    assetSlots: [],
    meta: {
      authority_source: "personality_profile_variant_clone_contents",
      route_mode: "full_code_exact",
      public_route_type: "32-type",
    },
  };
}


function access(freeFull = false) {
  return { ok: true, attempt_id: "attempt-123", access_state: "ready", report_state: "ready", pdf_state: "ready",
    unlock_stage: freeFull ? "full" : "locked", unlock_source: "none", reason_code: "report_ready", projection_version: 1,
    ...(freeFull ? { access_mode: "free_full", paywall_suppressed: true } : {}),
    actions: { page_href: "/result/attempt-123", pdf_href: "/api/v0.3/attempts/attempt-123/report.pdf" } };
}
function report(type = "ENFP-T", projection = true): ReportResponse {
  const data = structuredClone(projection ? projectionFixture : freeFixture) as ReportResponse;
  data.recommended_reads = [];
  if (data.report) data.report.recommended_reads = [];
  if (data.report?.profile) data.report.profile.type_code = type;
  if (data.report?.identity_card) data.report.identity_card.type_code = type;
  if (data.mbti_public_projection_v1) {
    data.mbti_public_projection_v1.display_type = type;
    data.mbti_public_projection_v1.runtime_type_code = type;
    data.mbti_public_projection_v1.canonical_type_code = type.split("-")[0];
    data.mbti_public_projection_v1.variant_code = type.split("-")[1] ?? "";
  }
  return data;
}
async function expectNavigation(locale: "en" | "zh", type: string) {
  await waitFor(() => expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument());
  const nav = screen.getByTestId("mbti-result-personality-next-step");
  const links = within(nav).getAllByRole("link");
  const href = `/${locale}/personality/${type.toLowerCase()}`;
  expect(links.map(link => link.getAttribute("href"))).toEqual([href, `${href}#growth_edges`]);
  expect(nav).toHaveTextContent(locale === "zh" ? "尝试观察练习" : "Try an observation exercise");
  expect(links[0]).toHaveTextContent(type);
  if (locale === "en") expect(nav.textContent).not.toMatch(/[\u3400-\u9fff]/);
  expect(nav.innerHTML).not.toMatch(/attempt-123|fixture-token|anon_navigation|\?/);
}

beforeEach(() => {
  vi.clearAllMocks();
  state.cms.mockResolvedValue(null);
  state.introduction.mockResolvedValue(null);
  state.access.mockResolvedValue(access());
  window.sessionStorage.clear();
  // Every external call in this contract must be explicitly mocked.
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("Network forbidden in result navigation fixtures"); }));
});
afterEach(() => vi.unstubAllGlobals());

describe("MBTI rich result to public personality navigation", () => {
  it.each(["en", "zh"] as const)("keeps both original failing %s fixtures usable without CMS or recommended reads", async (locale) => {
    state.pathname = `/${locale}/result/attempt-123`;
    for (const projection of [false, true]) {
      state.report.mockResolvedValue(report("ENFP-T", projection));
      const view = render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);
      await expectNavigation(locale, "ENFP-T");
      view.unmount();
    }
  });

  it.each(["en", "zh"] as const)("keeps %s free_full navigation independent of unavailable and available public content", async (locale) => {
    state.pathname = `/${locale}/result/attempt-123`;
    state.access.mockResolvedValue(access(true));
    state.report.mockResolvedValue(report());
    for (const available of [false, true]) {
      state.cms.mockResolvedValue(available ? createPublicDesktopClonePayload(locale) : null);
      state.introduction.mockResolvedValue(available ? {
        fullCode: "ENFP-T", locale: locale === "zh" ? "zh-CN" : "en", revision: 1, contentHash: "a".repeat(64),
        paragraphs: ["An introduction from public CMS.", "A second public paragraph."],
      } : null);
      const view = render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);
      await expectNavigation(locale, "ENFP-T");
      expect(screen.queryByTestId("mbti-offer-comparison-section")).not.toBeInTheDocument();
      view.unmount();
    }
  });

  it.each(((["en", "zh"] as const).flatMap(locale => MBTI_COMPARISON_BASE_TYPES.flatMap(base => ["", "-A", "-T"].map(suffix => ({ locale, type: `${base.toUpperCase()}${suffix}` }))))))(
    "preserves $locale $type identity in the real ready rich branch", async ({ locale, type }) => {
      state.pathname = `/${locale}/result/attempt-123`;
      state.report.mockResolvedValue(report(type));
      render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);
      await expectNavigation(locale, type);
    }
  );

  it.each(["UNKNOWN", "", "ENFP-X", "ENFP-T?token=secret"])("does not invent a public identity for %s", async (type) => {
    state.report.mockResolvedValue(report(type, false));
    render(<ResultClient attemptId="attempt-123" rolloutEnv={{} as never} />);
    await waitFor(() => expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument());
    expect(screen.queryByTestId("mbti-result-personality-next-step")).not.toBeInTheDocument();
  });

  it("keeps the new navigation outside the PDF snapshot", () => {
    render(<RichResultReport locale="en" reportData={report()} printSnapshotMode />);
    expect(screen.queryByTestId("mbti-result-personality-next-step")).not.toBeInTheDocument();
  });
});
