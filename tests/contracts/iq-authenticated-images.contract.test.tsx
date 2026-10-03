import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IqImageGraphic } from "@/components/quiz/iq/IqStemSvg";
import { fetchIqImageBlob } from "@/lib/iq/imageAsset";
import { setFmToken } from "@/lib/auth/fmToken";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("@/lib/auth/fmToken", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/fmToken")>(),
  requestGuestToken: refresh,
}));

const token = "fm_00000000-0000-4000-8000-000000000001";
const origin = "https://api.fermatmind.com";
function imageUrl(question: number, filename = `q${question}-question.webp`) {
  return `${origin}/api/v0.3/iq-owner-original-30/assets/iq_owner_original_30/q${String(question).padStart(2, "0")}/${filename}?attempt_id=fixture-attempt`;
}
function imageResponse() {
  return new Response(new Blob(["webp"]), { headers: { "Content-Type": "image/webp" } });
}

describe("attempt-bound IQ image delivery", () => {
  beforeEach(() => {
    setFmToken(token);
    refresh.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => imageResponse()));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:iq-fixture") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  });

  it("loads all 30 stems and 180 options with authorization and releases their blobs", async () => {
    const assets = Array.from({ length: 30 }, (_, index) => {
      const n = index + 1;
      return [imageUrl(n), ..."abcdef".split("").map((code) => imageUrl(n, `q${n}-option-${code}.webp`))];
    }).flat();
    for (const src of assets) {
      const view = render(<IqImageGraphic image={{ src, alt: "IQ fixture" }} />);
      // The protected URL must never be assigned directly to an img.
      expect(screen.queryByRole("img")).toBeNull();
      await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("src", "blob:iq-fixture"));
      view.unmount();
    }
    expect(fetch).toHaveBeenCalledTimes(210);
    for (const [url, init] of vi.mocked(fetch).mock.calls) {
      expect(assets).toContain(url);
      expect(init).toMatchObject({
        headers: { Authorization: `Bearer ${token}` }, redirect: "error", cache: "no-store",
      });
    }
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(210);
  });

  it("retries an expired token once using the existing guest identity", async () => {
    const renewed = "fm_00000000-0000-4000-8000-000000000002";
    refresh.mockImplementation(async () => { setFmToken(renewed); return renewed; });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));
    await fetchIqImageBlob(imageUrl(1), new AbortController().signal);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith(expect.objectContaining({ anonId: expect.any(String) }));
    expect(vi.mocked(fetch).mock.calls[1]?.[1]?.headers).toMatchObject({ Authorization: `Bearer ${renewed}` });
  });

  it("never sends the token to a different asset host", async () => {
    await expect(fetchIqImageBlob(imageUrl(1).replace(origin, "https://assets.fermatmind.com"), new AbortController().signal)).rejects.toThrow("Invalid IQ image endpoint");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("supports the same-origin API proxy", async () => {
    await fetchIqImageBlob(imageUrl(1).replace(origin, ""), new AbortController().signal);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(window.location.origin), expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) }));
  });

  it("loads PNG stems and JPEG assets while rejecting active SVG responses", async () => {
    for (const type of ["image/png", "image/jpeg"]) {
      vi.mocked(fetch).mockResolvedValueOnce(new Response(new Blob([type]), { headers: { "Content-Type": type } }));
      await expect(fetchIqImageBlob(imageUrl(8, "q8-question.png"), new AbortController().signal)).resolves.toBeInstanceOf(Blob);
    }
    vi.mocked(fetch).mockResolvedValueOnce(new Response("<svg />", { headers: { "Content-Type": "image/svg+xml" } }));
    await expect(fetchIqImageBlob(imageUrl(1), new AbortController().signal)).rejects.toThrow("Invalid IQ image response");
  });

  it("shows a visible failure for denied or non-image responses", async () => {
    for (const response of [new Response(null, { status: 404 }), new Response("{}", { headers: { "Content-Type": "application/json" } })]) {
      vi.mocked(fetch).mockResolvedValueOnce(response);
      const view = render(<IqImageGraphic image={{ src: imageUrl(1) }} />);
      await screen.findByText(/Image failed to load|图片加载失败/);
      expect(screen.queryByRole("img")).toBeNull();
      view.unmount();
    }
    expect(refresh).not.toHaveBeenCalled();
  });

  it("cancels obsolete question requests and never displays a late response", async () => {
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const view = render(<IqImageGraphic image={{ src: imageUrl(1) }} />);
    const signal = vi.mocked(fetch).mock.calls[0]?.[1]?.signal;
    view.rerender(<IqImageGraphic image={{ src: imageUrl(2) }} />);
    await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("src", "blob:iq-fixture"));
    await act(async () => { finish(imageResponse()); });
    expect(signal?.aborted).toBe(true);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });
});
