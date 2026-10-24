import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { listMbtiFormMetas } from "@/lib/mbti/forms";
import { toSeoAttributionIngestEnvelope } from "@/app/api/track/route";
import { filterTrackingPayload } from "@/lib/tracking/events";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); });

describe("entertainment result onward burden and real completion", () => {
  it.each(["en", "zh"] as const)("shows the actual version burdens only after a complete %s result", async locale => {
    const zh = locale === "zh";
    const quiz = (await loadFunQuiz("woodland-animal"))!;
    render(<FunQuizClient quiz={quiz} locale={locale} />);
    const linkName = zh ? "了解 MBTI 与题本选择" : "Explore MBTI and its versions";
    expect(screen.queryByRole("link", { name: linkName })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: zh ? "开始测试" : "Start quiz" }));
    expect(vi.mocked(trackEvent).mock.calls.filter(([event]) => event === "complete_test")).toHaveLength(0);
    for (let index = 0; index < quiz.questions.length; index++) {
      fireEvent.click(screen.getAllByRole("radio")[0]);
      fireEvent.click(screen.getByRole("button", { name: index === quiz.questions.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next") }));
    }
    const section = screen.getByRole("link", { name: linkName }).closest("section")!;
    for (const form of listMbtiFormMetas()) {
      expect(section).toHaveTextContent(zh ? `${form.questionCount} 题（约 ${form.estimatedMinutes} 分钟）` : `${form.questionCount} questions (about ${form.estimatedMinutes} min)`);
    }
    expect(vi.mocked(trackEvent).mock.calls.filter(([event]) => event === "start_test")).toHaveLength(1);
    expect(vi.mocked(trackEvent).mock.calls.filter(([event]) => event === "complete_test")).toHaveLength(1);
    expect(vi.mocked(trackEvent).mock.calls.filter(([event]) => event === "view_result")).toHaveLength(1);
    for (const [, payload] of vi.mocked(trackEvent).mock.calls) {
      const envelope = toSeoAttributionIngestEnvelope({ eventName: "view_result", anonymousId: "", path: `/${locale}/tests/play/woodland-animal`, timestamp: "2026-10-24T00:00:00Z", payload: filterTrackingPayload("view_result", payload ?? {}) });
      expect(envelope.payload).toMatchObject({ scale_code: "ENTERTAINMENT", form_code: "fun_woodland-animal_v1" });
      expect(payload).toMatchObject({ scale_code: "ENTERTAINMENT", form_code: "fun_woodland-animal_v1" });
      expect(payload).not.toHaveProperty("answers"); expect(payload).not.toHaveProperty("result");
    }
  });
});
