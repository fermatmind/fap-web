import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import TraditionalHistoryLayout from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/layout";
import HistoryTake from "@/app/(localized)/[locale]/tests/play/global-history-quiz/take/page";
import { GlobalHistoryResultV2 } from "@/components/entertainment/GlobalHistoryResultV2";
import { setAnalyticsConsent } from "@/lib/consent/store";
import { globalHistoryPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { globalHistoryResultKey } from "@/lib/entertainment/global-history/local-result";
import { findHistoryPerson } from "@/lib/entertainment/global-history/people";
import { getHistoryResult } from "@/lib/entertainment/global-history/result-v2";

const tracking = vi.hoisted(() => {
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  return vi.fn();
});
vi.mock("@/lib/tracking/client", () => ({ trackClientEvent: tracking }));
vi.mock("@/lib/tracking/internalTraffic", async (load) => ({
  ...await load<typeof import("@/lib/tracking/internalTraffic")>(),
  shouldAllowBrowserAnalyticsRuntime: () => ({ allowed: true }),
}));
vi.mock("@/lib/tracking/vibeCafe", () => ({ trackVibeCafePageView: vi.fn() }));
vi.mock("@/lib/entertainment/activity", () => ({ recordEntertainmentActivity: vi.fn() }));
vi.mock("next/navigation", async (load) => ({
  ...await load<typeof import("next/navigation")>(),
  usePathname: () => window.location.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

const initialPath = window.location.pathname;
const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.removeItem("fm_consent_v1");
  window.history.replaceState(null, "", initialPath);
  if (originalShare) Object.defineProperty(navigator, "share", originalShare);
  else Reflect.deleteProperty(navigator, "share");
  if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
  else Reflect.deleteProperty(navigator, "clipboard");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  tracking.mockClear();
});

function renderMatchedShare(coarsePointer: boolean) {
  const person = findHistoryPerson("martin-luther-king-jr")!;
  const result = getHistoryResult(person)!;
  sessionStorage.setItem(globalHistoryResultKey, JSON.stringify({ id: person.id, vector: person.vector }));
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: coarsePointer })));
  const share = vi.fn().mockResolvedValue(undefined);
  const copy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: copy } });
  render(<GlobalHistoryResultV2 person={person} result={result} locale="en" traditionalCopy={text => text} />);
  const title = `${person.name.en} · ${result.personality_benchmark.inferred_mbti} · ${result.personality_benchmark.title.en}`;
  return { share, copy, title, quote: result.one_line_hook.en, path: globalHistoryResultPath("en", person.id) };
}

it("shows the matched portrait and invokes mobile system share with the quote and canonical URL", async () => {
  const { share, copy, title, quote, path } = renderMatchedShare(true);
  expect(screen.getByRole("heading", { level: 1, name: "Martin Luther King Jr." })).toBeVisible();
  const traits = screen.getByRole("list", { name: "Core traits" });
  expect(traits.children).toHaveLength(3);
  expect(traits).toHaveTextContent("Birmingham Letter");
  expect(screen.queryByText("Copy profile citation")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Share result" }));
  await waitFor(() => expect(share).toHaveBeenCalledWith({
    title, text: `${title}\n${quote}`, url: expect.stringContaining(path),
  }));
  expect(copy).not.toHaveBeenCalled();
});

it("copies the complete desktop share text and shows confirmation", async () => {
  const { share, copy, title, quote, path } = renderMatchedShare(false);
  fireEvent.click(screen.getByRole("button", { name: "Share result" }));
  expect(await screen.findByText("Share text copied")).toBeVisible();
  expect(copy).toHaveBeenCalledWith(expect.stringContaining(`${title}\n${quote}\n`));
  expect(copy.mock.calls[0][0]).toContain(path);
  expect(share).not.toHaveBeenCalled();
});

it.each([
  "perplexity.ai", "chatgpt.com", "chat.openai.com", "gemini.google.com",
  "copilot.microsoft.com", "doubao.com", "yuanbao.tencent.com",
])("carries %s from the Taiwan landing tracker to start_test after an internal navigation", async (host) => {
  setAnalyticsConsent("granted");
  const landingPath = globalHistoryPath("zh-TW");
  window.history.replaceState(null, "", landingPath);
  const referrer = vi.spyOn(document, "referrer", "get").mockReturnValue(`https://${host}/search`);
  const landing = render(<TraditionalHistoryLayout><div /></TraditionalHistoryLayout>);
  expect(tracking).toHaveBeenCalledWith(expect.objectContaining({ eventName: "landing_pv" }));
  landing.unmount();

  window.history.replaceState(null, "", `${landingPath}/take`);
  referrer.mockReturnValue(window.location.origin + landingPath);
  render(await HistoryTake({ params: Promise.resolve({ locale: "zh-TW" }) }));
  const start = await screen.findByRole("button", { name: /走進展館/ });
  await act(async () => { fireEvent.click(start); });
  expect(tracking).toHaveBeenCalledWith(expect.objectContaining({
    eventName: "start_test",
    payload: expect.objectContaining({ slug: "global-history-quiz", locale: "zh-TW", referrer_host: host }),
  }));
});
