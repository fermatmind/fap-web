import { execFileSync } from "node:child_process";
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ClinicalTakeClient from "@/app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient";
import { useClinicalAttemptStore } from "@/lib/clinical/attemptStore";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

type ChildrenProps = {
  children?: ReactNode;
};

const hoisted = vi.hoisted(() => ({
  pathname: "/en/tests/clinical-depression-anxiety-assessment-professional-edition/take",
  search: "",
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  fetchClinicalQuestions: vi.fn(),
  startClinicalAttempt: vi.fn(),
  submitClinicalAttempt: vi.fn(),
  recoverStaleAttemptSubmit: vi.fn(),
  trackEvent: vi.fn(),
  ensureFmTokenReady: vi.fn(async () => "existing" as const),
}));

function currentChangedFiles(): string[] {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], {
    cwd: process.cwd(),
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
  useRouter: () => ({
    push: hoisted.routerPush,
    replace: hoisted.routerReplace,
  }),
}));

vi.mock("@/components/clinical/quiz/ModuleTransitionCard", () => ({
  ModuleTransitionCard: () => null,
}));

vi.mock("@/components/clinical/quiz/QuestionCard", () => ({
  QuestionCard: ({
    question,
    onSelect,
  }: {
    question: { question_id: string; text?: string | null };
    onSelect: (questionId: string, code: string) => void;
  }) => (
    <section>
      <h2>{question.text}</h2>
      <button type="button" onClick={() => onSelect(question.question_id, "A")}>
        Answer current
      </button>
    </section>
  ),
}));

vi.mock("@/components/clinical/quiz/QuizShell", () => ({
  QuizShell: ({ children }: ChildrenProps) => <section>{children}</section>,
}));

vi.mock("@/components/quiz/immersive/AdaptiveOptionGroup", () => ({
  AdaptiveOptionGroup: () => <div data-testid="adaptive-option-group" />,
}));

vi.mock("@/components/quiz/immersive/ImmersiveTakeLayout", () => ({
  ImmersiveTakeLayout: ({ children, footerSlot }: ChildrenProps & { footerSlot?: ReactNode }) => (
    <div>
      {children}
      {footerSlot}
    </div>
  ),
}));

vi.mock("@/components/quiz/immersive/SubmitPhaseOverlay", () => ({
  SubmitPhaseOverlay: () => null,
}));

vi.mock("@/components/quiz/immersive/useAutoAdvanceFlow", () => ({
  useAutoAdvanceFlow: () => ({
    transitionDirection: "forward",
    isTransitioning: false,
    selectAndAdvance: (applySelection: () => void) => applySelection(),
    goPrevious: () => undefined,
    cancelPending: () => undefined,
  }),
}));

vi.mock("@/components/quiz/StaleDraftResetPrompt", () => ({
  StaleDraftResetPrompt: ({ message }: { message: string }) => <div data-testid="stale-reset">{message}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_clinical_take",
  queuePendingAnonLinkAttempt: () => undefined,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: hoisted.ensureFmTokenReady,
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  isGuestTokenEndpointMissingError: () => false,
  isGuestTokenRequestError: () => false,
}));

vi.mock("@/lib/clinical/api", () => ({
  fetchClinicalQuestions: hoisted.fetchClinicalQuestions,
  startClinicalAttempt: hoisted.startClinicalAttempt,
  submitClinicalAttempt: hoisted.submitClinicalAttempt,
}));

vi.mock("@/lib/observability/httpError", () => ({
  classifyApiError: () => ({
    statusGroup: "5xx",
    statusCode: 500,
    errorCode: "TEST_ERROR",
  }),
}));

vi.mock("@/lib/observability/sentry", () => ({
  captureError: () => undefined,
}));

vi.mock("@/lib/quiz/uxFlags", () => ({
  isImmersiveSingleFlowEnabled: () => false,
}));

vi.mock("@/lib/attempt/resolveResultAttemptId", () => ({
  resolveResultAttemptId: (
    response: { attempt_id?: string },
    fallbackAttemptId: string
  ) => response.attempt_id ?? fallbackAttemptId,
}));

vi.mock("@/lib/attempt/staleAttempt", async () => {
  const actual = await vi.importActual<typeof import("@/lib/attempt/staleAttempt")>("@/lib/attempt/staleAttempt");

  return {
    ...actual,
    createTakeFlowController: () => ({
      beginRun: () => 1,
      isActive: () => true,
      cancelCurrentRun: () => undefined,
      schedule: () => 0,
      wait: async () => true,
      dispose: () => undefined,
    }),
    recoverStaleAttemptSubmit: hoisted.recoverStaleAttemptSubmit,
    resolveStaleDraftResetMessage: () => "Draft reset required.",
  };
});

function buildClinicalQuestionsResponse() {
  return {
    ok: true,
    scale_code: "SDS_20",
    questions: {
      schema: "fap.questions.v1",
      items: [
        {
          question_id: "cq1",
          order: 1,
          text: "Clinical question 1",
          module_code: "SDS",
          options: [
            { code: "A", text: "Rarely" },
            { code: "B", text: "Sometimes" },
          ],
        },
        {
          question_id: "cq2",
          order: 2,
          text: "Clinical question 2",
          module_code: "SDS",
          options: [
            { code: "A", text: "Rarely" },
            { code: "B", text: "Sometimes" },
          ],
        },
        {
          question_id: "cq3",
          order: 3,
          text: "Clinical question 3",
          module_code: "SDS",
          options: [
            { code: "A", text: "Rarely" },
            { code: "B", text: "Sometimes" },
          ],
        },
      ],
    },
    options: {
      format: ["Rarely", "Sometimes", "Often", "Always"],
    },
    meta: {
      consent: {
        version: "clinical-v1",
        text: "Please accept clinical consent.",
      },
    },
  };
}

describe("clinical take consent gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    useClinicalAttemptStore.getState().resetAll();
    hoisted.pathname = "/en/tests/clinical-depression-anxiety-assessment-professional-edition/take";
    hoisted.search = "";
    hoisted.fetchClinicalQuestions.mockResolvedValue(buildClinicalQuestionsResponse());
    hoisted.startClinicalAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-clinical-start-001",
    });
    hoisted.submitClinicalAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-clinical-start-001",
    });
    hoisted.recoverStaleAttemptSubmit.mockResolvedValue({
      kind: "ignored",
    });
  });

  afterEach(() => {
    useClinicalAttemptStore.getState().resetAll();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("blocks direct clinical runner access until consent is accepted", async () => {
    render(
      <ClinicalTakeClient
        slug="clinical-depression-anxiety-assessment-professional-edition"
        scaleCode="SDS_20"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Please accept clinical consent.")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Agree and start" })).toBeDisabled();
    expect(screen.queryByText("Clinical question 1")).toBeNull();
    expect(hoisted.startClinicalAttempt).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("I have read and agree to the statement above"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Agree and start" })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Agree and start" }));

    await waitFor(() => {
      expect(screen.getByText("Clinical question 1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Answer current" }));
    await waitFor(() => {
      expect(useClinicalAttemptStore.getState().answers.cq1).toBe("A");
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(hoisted.startClinicalAttempt).toHaveBeenCalledTimes(1);
    });
    expect(hoisted.startClinicalAttempt).toHaveBeenCalledWith(expect.objectContaining({
      scaleCode: "SDS_20",
      consent: {
        accepted: true,
        version: "clinical-v1",
        locale: "en",
      },
    }));
    expect(hoisted.submitClinicalAttempt).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText("Clinical question 2")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Answer current" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      expect(screen.getByText("Clinical question 3")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Answer current" }));
    await waitFor(() => {
      expect(useClinicalAttemptStore.getState().answers.cq3).toBe("A");
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(hoisted.submitClinicalAttempt).toHaveBeenCalledTimes(1);
    });
    expect(hoisted.submitClinicalAttempt).toHaveBeenCalledWith(expect.objectContaining({
      attemptId: "attempt-clinical-start-001",
      consent: {
        accepted: true,
        version: "clinical-v1",
        locale: "en",
      },
    }));
  });

  it("clears URL auth parameters without bypassing the clinical consent gate", async () => {
    hoisted.search = "token=fm_query_token&authToken=fm_query_other&utm_source=organic";

    render(<ClinicalTakeClient slug="clinical-depression-anxiety-assessment-professional-edition" scaleCode="SDS_20" />);

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/tests/clinical-depression-anxiety-assessment-professional-edition/take?utm_source=organic",
        { scroll: false }
      );
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Agree and start" })).toBeInTheDocument();
    });

    expect(hoisted.ensureFmTokenReady).toHaveBeenCalledWith({
      anonId: "anon_clinical_take",
      locale: "en",
      forceRefresh: true,
    });
    expect(hoisted.startClinicalAttempt).not.toHaveBeenCalled();
  });

  it("continues to the report when clinical report sessionStorage cache fails", async () => {
    vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("session storage disabled");
    });
    hoisted.submitClinicalAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-clinical-start-001",
      report: { summary: "accepted" },
    });

    render(
      <ClinicalTakeClient
        slug="clinical-depression-anxiety-assessment-professional-edition"
        scaleCode="SDS_20"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Please accept clinical consent.")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText("I have read and agree to the statement above"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Agree and start" })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Agree and start" }));

    await waitFor(() => {
      expect(screen.getByText("Clinical question 1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Answer current" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByText("Clinical question 2")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Answer current" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      expect(screen.getByText("Clinical question 3")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Answer current" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(hoisted.submitClinicalAttempt).toHaveBeenCalledTimes(1);
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/attempts/attempt-clinical-start-001/report");
    });
  });

  it("documents the PR-WEB-SEC-31 scope boundary", () => {
    const changed = currentChangedFiles();

    expect(changed.every(isCurrentRiasecPack12AllowedFile), changed.join("\n")).toBe(true);
  });
});
