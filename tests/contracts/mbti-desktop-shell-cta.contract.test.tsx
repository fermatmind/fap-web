import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import { getMbtiDesktopAnchorHash } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
import { assignWindowLocation } from "@/lib/browser/locationNavigation";

const hoisted = vi.hoisted(() => ({
  createAttemptInviteUnlock: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/test-report",
}));
vi.mock("@/lib/cms/personality-desktop-clone", () => ({
  fetchPersonalityDesktopCloneContent: vi.fn(async () => null),
}));
vi.mock("@/lib/browser/locationNavigation", () => ({
  assignWindowLocation: vi.fn(),
}));
vi.mock("@/lib/api/v0_3", () => ({
  createAttemptInviteUnlock: hoisted.createAttemptInviteUnlock,
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createHeadline(): RichResultHeadline {
  return {
    badge: "MBTI",
    typeCode: "INFJ-T",
    displayName: "INFJ 类型",
    supportingLine: "INFJ supporting line",
    summary: "INFJ headline summary",
    rarity: "test rarity",
  };
}

function createSectionUnlocks(): Record<string, MbtiSectionUnlock> {
  return {
    traits: { teaser: "traits teaser", benefits: ["benefit one"], offer: null },
    career: { teaser: "career teaser", benefits: ["career benefit"], offer: null },
    growth: { teaser: "growth teaser", benefits: ["growth benefit"], offer: null },
    relationships: { teaser: "relationships teaser", benefits: ["relationships benefit"], offer: null },
  };
}

function createStoragePayload(tag: string): PersonalityDesktopCloneContentPayload {
  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode: "INFJ-T",
    baseCode: "INFJ",
    locale: "zh-CN",
    content: {
      hero: {
        summary: `hero ${tag}`,
        profileIdentity: {
          code: "INFJ-T",
          name: `name ${tag}`,
          nickname: `nickname ${tag}`,
          rarity: `rarity ${tag}`,
          keywords: [
            `keyword 1 ${tag}`,
            `keyword 2 ${tag}`,
            `keyword 3 ${tag}`,
            `keyword 4 ${tag}`,
            `keyword 5 ${tag}`,
            `keyword 6 ${tag}`,
          ],
        },
      },
      intro: { paragraphs: [`intro 1 ${tag}`, `intro 2 ${tag}`] },
      traits: {
        summaryPane: {
          eyebrow: `eyebrow ${tag}`,
          title: `title ${tag}`,
          value: `value ${tag}`,
          body: `body ${tag}`,
        },
        body: [`traits 1 ${tag}`, `traits 2 ${tag}`],
      },
      chapters: {
        career: {
          intro: [`career intro 1 ${tag}`, `career intro 2 ${tag}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
        growth: {
          intro: [`growth intro 1 ${tag}`, `growth intro 2 ${tag}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
        relationships: {
          intro: [`rel intro 1 ${tag}`, `rel intro 2 ${tag}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
      },
      finalOffer: {
        eyebrow: `eyebrow ${tag}`,
        headline: `headline ${tag}`,
        body: `body ${tag}`,
        priceLabel: `price label ${tag}`,
        ctaLabel: `cta ${tag}`,
        guarantee: `guarantee ${tag}`,
      },
    },
    assetSlots: [],
    meta: null,
  };
}

beforeEach(() => {
  vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
  vi.mocked(assignWindowLocation).mockReset();
  hoisted.trackEvent.mockReset();
  hoisted.createAttemptInviteUnlock.mockReset();
  hoisted.createAttemptInviteUnlock.mockResolvedValue({
    ok: true,
    invite_code: "invite_mbti_created_001",
    invite_url: INVITE_TAKE_HREF,
    status: "in_progress",
    required_invitees: 2,
    completed_invitees: 0,
    target_attempt_id: "attempt-123",
    unlock_stage: "locked",
    unlock_source: "invite",
    invite_unlock_diag_v1: null,
  });
});
const INVITE_TAKE_HREF = "/zh/tests/mbti-personality-test-16-personality-types/take?invite_code=invite_mbti_001";
const INVITE_TAKE_BASE_HREF = "/zh/tests/mbti-personality-test-16-personality-types/take";

function renderDefaultShell(overrides: Partial<ComponentProps<typeof MbtiDesktopCloneShell>> = {}) {
  return render(
    <MbtiDesktopCloneShell
      locale="zh"
      headline={createHeadline()}
      tags={[]}
      dimensions={[]}
      highlights={[]}
      sections={[]}
      sectionUnlocks={createSectionUnlocks()}
      offers={[]}
      projectionViewModel={null}
      isUnlocked={false}
      shareCtaLabel="分享"
      onShare={vi.fn()}
      retakeHref="/zh/test/mbti"
      primaryCtaLabel="去结算"
      primaryCtaHref="/zh/pay/checkout"
      inviteUnlockAttemptId="attempt-123"
      {...overrides}
    />,
  );
}

describe("MBTI desktop clone shell CTA wiring", () => {
  it("keeps chapter teaser lock-card CTA unified by locale and keeps final offer href CTA fallback", async () => {
    render(
      <MbtiDesktopCloneShell
        locale="zh"
        headline={createHeadline()}
        tags={[]}
        dimensions={[]}
        highlights={[]}
        sections={[]}
        sectionUnlocks={createSectionUnlocks()}
        offers={[]}
        projectionViewModel={null}
        isUnlocked={false}
        shareCtaLabel="分享"
        onShare={vi.fn()}
        retakeHref="/zh/test/mbti"
        primaryCtaLabel="去结算"
        primaryCtaHref="/zh/pay/checkout"
        inviteUnlockAttemptId="attempt-123"
      />,
    );

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
    });

    const finalOfferCta = screen.getByTestId("mbti-offers-primary-cta");
    expect(finalOfferCta).toHaveTextContent("1.99元直接解锁");
    expect(finalOfferCta).toHaveAttribute("href", "/zh/pay/checkout");
    expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("邀2人测完领报告");

    const lockedOverlayPayCtas = screen.getAllByTestId(/mbti-.*-pay-cta/);
    expect(lockedOverlayPayCtas).toHaveLength(9);
    for (const cta of lockedOverlayPayCtas) {
      expect(cta).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));
    }

    const rail = screen.getByTestId("mbti-sticky-rail");
    expect(within(rail).getByRole("link", { name: "1. Personality Traits" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("traits"),
    );
    expect(within(rail).getByRole("link", { name: "2. Your Career Path" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("career"),
    );
    expect(within(rail).getByRole("link", { name: "去结算" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull"),
    );
    expect(within(rail).getByRole("link", { name: "工作台" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull"),
    );
  });

  it("keeps runtime offer price while allowing storage copy to render", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("storage"));

    render(
      <MbtiDesktopCloneShell
        locale="zh"
        headline={createHeadline()}
        tags={[]}
        dimensions={[]}
        highlights={[]}
        sections={[]}
        sectionUnlocks={createSectionUnlocks()}
        offers={[
          {
            key: "MBTI_REPORT_FULL",
            title: "完整报告",
            price: "¥199",
            description: "desc",
            modules: [],
            moduleCodes: ["core_full"],
          },
        ]}
        projectionViewModel={null}
        isUnlocked={false}
        shareCtaLabel="分享"
        onShare={vi.fn()}
        retakeHref="/zh/test/mbti"
        primaryCtaLabel="去结算"
        primaryCtaHref="/zh/pay/checkout"
      />,
    );

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
      expect(screen.getByText("headline storage")).toBeInTheDocument();
    });

    expect(screen.getByText("price label storage")).toBeInTheDocument();
    expect(screen.getByText("¥199")).toBeInTheDocument();
  });

  it("renders the traits footer tools inside the same primary card shell", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("storage"));

    render(
      <MbtiDesktopCloneShell
        locale="zh"
        headline={createHeadline()}
        tags={[]}
        dimensions={[]}
        highlights={[]}
        sections={[]}
        sectionUnlocks={createSectionUnlocks()}
        offers={[]}
        projectionViewModel={null}
        isUnlocked={false}
        shareCtaLabel="分享"
        onShare={vi.fn()}
        retakeHref="/zh/test/mbti"
        historyHref="/zh/history"
        pdfHref="/zh/result/test.pdf"
        pdfReady
        primaryCtaLabel="去结算"
        primaryCtaHref="/zh/pay/checkout"
      />,
    );

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
    });

    const traitsTools = screen.getByTestId("mbti-traits-tools");
    expect(within(traitsTools).getByText("你可以继续保存、导出或查看历史结果。")).toBeInTheDocument();
    expect(within(traitsTools).getByRole("button", { name: "分享" })).toBeInTheDocument();
    expect(within(traitsTools).getByRole("link", { name: "导出 PDF" })).toHaveAttribute(
      "href",
      "/zh/result/test.pdf",
    );
    expect(within(traitsTools).getByRole("link", { name: "查看历史" })).toHaveAttribute(
      "href",
      "/zh/history",
    );
  });

  it("keeps invite CTA and payment CTA wiring intact on the owner locked surface", async () => {
    renderDefaultShell({ lockedInviteCtaHref: INVITE_TAKE_HREF });

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
    });

    expect(screen.getByTestId("mbti-offers-invite-cta")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveAttribute("href", "/zh/pay/checkout");
    expect(screen.getByTestId("mbti-career-pay-cta")).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));
  });

  it("keeps invite CTA visible and lazily creates invite link when href falls back to hash", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderDefaultShell({
      lockedInviteCtaHref: getMbtiDesktopAnchorHash("offerFull"),
      lockedInviteCtaLabel: "邀2人测完领报告",
    });

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
    });

    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveAttribute("href", "/zh/pay/checkout");
    const inviteCta = screen.getByTestId("mbti-offers-invite-cta");
    expect(inviteCta).toHaveTextContent("邀2人测完领报告");
    expect(inviteCta).toHaveAttribute("href", INVITE_TAKE_BASE_HREF);

    fireEvent.click(inviteCta);

    await waitFor(() => {
      expect(hoisted.createAttemptInviteUnlock).toHaveBeenCalledWith({
        attemptId: "attempt-123",
        locale: "zh",
      });
      expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("已复制邀请链接");
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining(INVITE_TAKE_HREF));
      expect(screen.getByTestId("mbti-desktop-clone-shell")).toHaveAttribute("data-invite-has-invite", "true");
      expect(screen.getByTestId("mbti-desktop-clone-shell")).toHaveAttribute("data-invite-href", INVITE_TAKE_HREF);
      expect(screen.getByTestId("mbti-desktop-clone-shell")).toHaveAttribute("data-invite-code", "invite_mbti_created_001");
    });

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "invite_create_start",
      expect.objectContaining({
        attempt_id: "attempt-123",
      }),
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "invite_create_success",
      expect.objectContaining({
        attempt_id: "attempt-123",
      }),
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "invite_share_or_copy",
      expect.objectContaining({
        attempt_id: "attempt-123",
        action: "copy",
      }),
    );
  });

  it("copies invite URL on success without redirecting", async () => {
    const assignSpy = vi.mocked(assignWindowLocation);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderDefaultShell({ lockedInviteCtaHref: INVITE_TAKE_HREF });
    fireEvent.click(screen.getByTestId("mbti-offers-invite-cta"));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining(INVITE_TAKE_HREF));
      expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("已复制邀请链接");
    });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("shows pending state and deduplicates in-flight invite creation requests", async () => {
    let resolveCreate!: (value: {
      ok: boolean;
      invite_code: string;
      invite_url: string;
      status: string;
      required_invitees: number;
      completed_invitees: number;
      target_attempt_id: string;
      unlock_stage: string;
      unlock_source: string;
      invite_unlock_diag_v1: null;
    }) => void;
    const createPromise = new Promise<{
      ok: boolean;
      invite_code: string;
      invite_url: string;
      status: string;
      required_invitees: number;
      completed_invitees: number;
      target_attempt_id: string;
      unlock_stage: string;
      unlock_source: string;
      invite_unlock_diag_v1: null;
    }>((resolve) => {
      resolveCreate = resolve;
    });
    hoisted.createAttemptInviteUnlock.mockReturnValueOnce(createPromise);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderDefaultShell({ lockedInviteCtaHref: "" });
    const inviteCta = screen.getByTestId("mbti-offers-invite-cta");

    fireEvent.click(inviteCta);
    fireEvent.click(inviteCta);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("正在创建邀请链接...");
      expect(hoisted.createAttemptInviteUnlock).toHaveBeenCalledTimes(1);
    });

    resolveCreate({
      ok: true,
      invite_code: "invite_mbti_created_pending_001",
      invite_url: INVITE_TAKE_HREF,
      status: "in_progress",
      required_invitees: 2,
      completed_invitees: 0,
      target_attempt_id: "attempt-123",
      unlock_stage: "locked",
      unlock_source: "invite",
      invite_unlock_diag_v1: null,
    });

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("已复制邀请链接");
    });
  });

  it("shows explicit feedback when invite creation fails", async () => {
    hoisted.createAttemptInviteUnlock.mockRejectedValueOnce(new Error("create failed"));
    renderDefaultShell({ lockedInviteCtaHref: "" });
    const inviteCta = screen.getByTestId("mbti-offers-invite-cta");

    fireEvent.click(inviteCta);

    await waitFor(() => {
      expect(hoisted.createAttemptInviteUnlock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("创建失败，点击重试");
      expect(screen.getByTestId("mbti-offers-invite-fallback-hint")).toHaveTextContent(
        "创建邀请链接失败，请重试。若持续失败，请稍后再试。",
      );
    });
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "invite_create_failed",
      expect.objectContaining({
        attempt_id: "attempt-123",
      }),
    );
  });

  it("shows explicit fallback actions on copy failure and does not auto-redirect", async () => {
    const assignSpy = vi.mocked(assignWindowLocation);
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard blocked"));
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderDefaultShell({ lockedInviteCtaHref: INVITE_TAKE_HREF });
    fireEvent.click(screen.getByTestId("mbti-offers-invite-cta"));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("复制失败，点击打开邀请页");
      expect(screen.getByTestId("mbti-offers-invite-fallback-hint")).toHaveTextContent(
        "复制失败，请手动打开邀请页或手动复制链接。",
      );
    });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("opens invite page only when user explicitly clicks after copy failure", async () => {
    const assignSpy = vi.mocked(assignWindowLocation);
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard blocked"));
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderDefaultShell({ lockedInviteCtaHref: INVITE_TAKE_HREF });
    const inviteCta = screen.getByTestId("mbti-offers-invite-cta");

    fireEvent.click(inviteCta);
    await waitFor(() => {
      expect(inviteCta).toHaveTextContent("复制失败，点击打开邀请页");
    });
    expect(assignSpy).not.toHaveBeenCalled();

    fireEvent.click(inviteCta);
    expect(assignSpy).toHaveBeenCalledWith(INVITE_TAKE_HREF);
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("keeps default navigation suppressed while invite copy is in progress", async () => {
    const assignSpy = vi.mocked(assignWindowLocation);
    const writeText = vi.fn(() => new Promise<void>(() => {}));
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderDefaultShell({ lockedInviteCtaHref: INVITE_TAKE_HREF });
    const inviteCta = screen.getByTestId("mbti-offers-invite-cta");

    expect(fireEvent.click(inviteCta)).toBe(false);
    expect(writeText).toHaveBeenCalledTimes(1);

    expect(fireEvent.click(inviteCta)).toBe(false);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(assignSpy).not.toHaveBeenCalled();
  });
});
