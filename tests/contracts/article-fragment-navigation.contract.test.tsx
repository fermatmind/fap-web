import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleFragmentNavigation } from "@/components/articles/ArticleFragmentNavigation";

describe("streamed article fragment navigation", () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrame: number;
  let fontsReady: () => void;
  const scroll = vi.fn();
  const flush = () => act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });

  beforeEach(() => {
    frames = new Map();
    nextFrame = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: scroll });
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: new Promise<void>((resolve) => { fontsReady = resolve; }) } });
    window.history.replaceState(null, "", "/en/articles/guide");
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); scroll.mockClear(); });

  function article() {
    return render(<ArticleFragmentNavigation><article><h2 id="article-body-markdown-block-37">Example 4</h2><h2 id="另一节">另一节</h2></article></ArticleFragmentNavigation>);
  }

  it("restores an initial fragment when the delayed article body mounts", () => {
    window.history.replaceState(null, "", "#article-body-markdown-block-37");
    expect(document.getElementById("article-body-markdown-block-37")).toBeNull();
    article();
    expect(scroll).not.toHaveBeenCalled();
    flush();
    expect(scroll).toHaveBeenCalledWith({ block: "start", behavior: "instant" });
    expect(scroll.mock.instances[0]).toBe(document.getElementById("article-body-markdown-block-37"));
  });

  it("follows a decoded same-page fragment change", () => {
    article(); flush();
    window.history.replaceState(null, "", "#%E5%8F%A6%E4%B8%80%E8%8A%82");
    window.dispatchEvent(new HashChangeEvent("hashchange")); flush();
    expect(scroll.mock.instances[0]).toBe(document.getElementById("另一节"));
  });

  it.each(["", "#missing", "#outside", "#%broken"])("leaves scroll alone for %s", (hash) => {
    document.body.insertAdjacentHTML("beforeend", '<h2 id="outside">Outside article</h2>');
    window.history.replaceState(null, "", `/en/articles/guide${hash}`);
    article(); flush();
    expect(scroll).not.toHaveBeenCalled();
    document.getElementById("outside")?.remove();
  });

  it.each(["wheel", "pointerdown"])("does not pull the reader back after %s or unmount", async (eventType) => {
    window.history.replaceState(null, "", "#article-body-markdown-block-37");
    const view = article(); flush(); scroll.mockClear();
    window.dispatchEvent(new Event(eventType));
    await act(async () => { fontsReady(); await Promise.resolve(); });
    window.dispatchEvent(new Event("load")); flush();
    expect(scroll).not.toHaveBeenCalled();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    view.unmount(); flush();
    expect(scroll).not.toHaveBeenCalled();
  });
});
