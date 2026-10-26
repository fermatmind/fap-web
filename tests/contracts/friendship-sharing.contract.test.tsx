import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShareTools } from "@/components/friendship/ShareTools";
import { invitationMessage, publicInvitation } from "@/lib/friendship/sharing";
import type { Result } from "@/lib/friendship/core";

const mocks = vi.hoisted(() => ({ event: vi.fn(), qr: vi.fn() }));
vi.mock("@/lib/friendship/analytics", () => ({ friendshipEvent: mocks.event }));
vi.mock("qrcode", () => ({ default: { toCanvas: mocks.qr } }));
const url = "https://fermatmind.com/en/share/friendship/synthetic";
const result: Result = { nickname: "Private player", correct: 22, total: 30, percent: 73, categories: {}, answers: [0], guesses: [1], preview: false, entries: [{ id: "private-id", nickname: "Other private player", correct: 0, hidden: false, categories: {} }] };
let write: ReturnType<typeof vi.fn>;
beforeEach(() => {
  mocks.event.mockReset(); mocks.qr.mockReset(); mocks.qr.mockImplementation(async (canvas, _url, options) => { canvas.width = options.width; canvas.height = options.width; });
  write = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: write } });
  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function canvasMocks() {
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  const ctx = { fillRect: vi.fn(), fillText: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), stroke: vi.fn(), drawImage: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(callback => callback(new Blob(["synthetic PNG"], { type: "image/png" })));
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:synthetic") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  return { ctx, click };
}

describe("friendship sharing and creator handoff", () => {
  it("accepts only a credential-free public FermatMind invitation", () => {
    expect(publicInvitation(url)).toBe(url);
    for (const unsafe of ["", "https://evil.example/en/share/friendship/synthetic", `${url}/manage`, `${url}#key=private`, `${url}?key=private`, "https://secret:password@fermatmind.com/en/share/friendship/synthetic", "http://fermatmind.com/en/share/friendship/synthetic"]) expect(publicInvitation(unsafe)).toBeNull();
  });
  it.each(["en", "zh"] as const)("gives %s creators, friends and previews distinct honest messages", locale => {
    expect(invitationMessage(locale)).not.toMatch(/22|Private/);
    expect(invitationMessage(locale, result)).toContain("22/30");
    expect(invitationMessage(locale, result)).not.toMatch(/my choices|我的选择|Private/);
    expect(invitationMessage(locale, { ...result, preview: true })).toMatch(/preview|预演/);
  });
  it("shares a friend's score with the creator's public invitation, never the answer key or other nicknames", async () => {
    const share = vi.fn().mockResolvedValue(undefined); Object.defineProperty(navigator, "share", { configurable: true, value: share });
    render(<ShareTools locale="en" url={url} result={result} />);
    fireEvent.click(screen.getByRole("button", { name: "Share score & this quiz" }));
    await waitFor(() => expect(share).toHaveBeenCalledWith({ title: "Friendship quiz · FermatMind", text: "I got 22/30. Can you beat my score on this quiz?", url }));
    expect(JSON.stringify(share.mock.calls)).not.toMatch(/Private|private-id|answers|guesses/);
    expect(mocks.event).toHaveBeenCalledWith("share_result", "en", "friend", "share_sheet_completed");
  });
  it("offers a prepared WhatsApp message without calling it sent", () => {
    render(<ShareTools locale="en" url={url} result={result} />);
    const link = screen.getByRole("link", { name: "WhatsApp ↗" });
    expect(new URL(link.getAttribute("href")!).searchParams.get("text")).toBe(`${invitationMessage("en", result)}\n${url}`);
    fireEvent.click(link); expect(mocks.event).toHaveBeenCalledWith("share_result", "en", "friend", "whatsapp_opened");
  });
  it("falls back to the complete message and invitation when native sharing is unavailable", async () => {
    render(<ShareTools locale="en" url={url} result={result} />);
    fireEvent.click(screen.getByRole("button", { name: "Share score & this quiz" }));
    await waitFor(() => expect(write).toHaveBeenCalledWith(`${invitationMessage("en", result)}\n${url}`));
    expect(mocks.event).not.toHaveBeenCalledWith("share_result", expect.anything(), expect.anything(), expect.anything());
  });
  it("keeps a cancelled share cancelled, and gives a manual fallback on other failures", async () => {
    const share = vi.fn().mockRejectedValueOnce(new DOMException("cancelled", "AbortError")).mockRejectedValueOnce(new Error("unavailable"));
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    render(<ShareTools locale="en" url={url} />);
    fireEvent.click(screen.getByRole("button", { name: "Share my challenge" })); await screen.findByText("Sharing cancelled.");
    expect(mocks.event).not.toHaveBeenCalled(); expect(screen.queryByRole("textbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Share my challenge" }));
    expect(await screen.findByLabelText("Message and invite link")).toHaveValue(`${invitationMessage("en")}\n${url}`);
  });
  it("starts the Story link copy in the click gesture and encodes only the public invitation in the actual image", async () => {
    const { ctx, click } = canvasMocks(); let fontsReady!: () => void;
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: new Promise<void>(resolve => { fontsReady = resolve; }) } });
    render(<ShareTools locale="en" url={url} result={result} />);
    fireEvent.click(screen.getByRole("button", { name: "Stories: image + link" })); expect(write).toHaveBeenCalledWith(url); expect(mocks.qr).not.toHaveBeenCalled();
    fontsReady(); await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect(mocks.qr).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), url, expect.objectContaining({ width: 280, margin: 4 }));
    expect(ctx.drawImage).toHaveBeenCalled(); expect(ctx.fillText.mock.calls.flat().join(" ")).not.toMatch(/Private|private-id/);
    await screen.findByText(/Story image download started and invite link copied/);
    expect(screen.getByLabelText("Invite link (for your Story's Link sticker)")).toHaveValue(url);
    expect(mocks.event).toHaveBeenCalledWith("share_result", "en", "friend", "story_image_download_started");
  });
  it("still downloads a Story with its QR when clipboard access is denied", async () => {
    const { click } = canvasMocks(); write.mockRejectedValue(new Error("denied"));
    render(<ShareTools locale="zh" url={url.replace("/en/", "/zh/")} questionCount={30} />);
    fireEvent.click(screen.getByRole("button", { name: "Stories：竖图和链接" }));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    await screen.findByText(/链接未能自动复制/); expect(screen.getByLabelText("分享文案和链接")).toHaveValue(`${invitationMessage("zh")}\n${url.replace("/en/", "/zh/")}`);
  });
  it("exposes a retryable invitation when canvas export fails and disables unsafe links", async () => {
    canvasMocks(); vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(cb => cb(null));
    const view = render(<ShareTools locale="en" url={url} />);
    fireEvent.click(screen.getByRole("button", { name: "Save image" })); await screen.findByText(/Image couldn't be created/);
    expect(mocks.event).not.toHaveBeenCalled(); view.rerender(<ShareTools locale="en" url={`${url}/manage#key=private`} />);
    expect(screen.getAllByRole("button").every(b => (b as HTMLButtonElement).disabled)).toBe(true); expect(screen.queryByRole("link")).toBeNull();
  });
});
