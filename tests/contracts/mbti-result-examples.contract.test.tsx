import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MbtiResultExamples } from "@/components/tests/MbtiResultExamples";

describe("public MBTI teaching examples", () => {
  it("restores the late-mounted section itself without taking over other fragments", () => {
    const pending = new Map<number, FrameRequestCallback>();
    let index = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { pending.set(++index, callback); return index; });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => pending.delete(id));
    const original = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
    const scroll = vi.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: scroll });
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    const flush = () => act(() => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach((callback) => callback(0)); });
    window.history.replaceState(null, "", "#result-examples");
    const view = render(<MbtiResultExamples />);
    try {
      flush();
      expect(scroll.mock.instances[0]).toBe(screen.getByTestId("mbti-result-examples"));
      scroll.mockClear();
      window.history.replaceState(null, "", "#choose-version");
      window.dispatchEvent(new HashChangeEvent("hashchange")); flush();
      expect(scroll).not.toHaveBeenCalled();
    } finally {
      view.unmount();
      window.history.replaceState(null, "", "/");
      vi.unstubAllGlobals();
      if (original) Object.defineProperty(Element.prototype, "scrollIntoView", original);
      else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    }
  });

  it("distinguishes synthetic clearer and midpoint readings from personal results", () => {
    render(<MbtiResultExamples />);
    const section = screen.getByTestId("mbti-result-examples");
    expect(within(section).getAllByRole("article")).toHaveLength(2);
    expect(section).toHaveTextContent("not scored attempts, real user reports, or your result");
    expect(section).toHaveTextContent("I 70% / E 30%");
    expect(section).toHaveTextContent("I 51% / E 49%");
    expect(section).toHaveTextContent("No scoring version, response-quality assessment, or population reference is supplied");
    expect(section).toHaveTextContent("A/T is a separate additional description");
    expect(section).toHaveTextContent("retry or recovery option");
    expect(within(section).getByRole("link", { name: "guide to understanding and using your results" })).toHaveAttribute("href", "/en/articles/mbti-full-report-career-relationship-communication");
    expect(within(section).getByRole("link", { name: "choose the 93- or 144-question version" })).toHaveAttribute("href", "#choose-version");
    for (const [name, extension] of [["TXT", "txt"], ["Markdown", "md"]]) {
      const link = within(section).getByRole("link", { name: `observation record (${name})` });
      expect(link).toHaveAttribute("href", `/resources/mbti/fermatmind-personality-observation-en.${extension}`);
      expect(link).toHaveAttribute("download");
    }
    expect(section).toHaveTextContent("no automatic upload or cloud save");
    expect(section.querySelectorAll("form, input, button")).toHaveLength(0);
  });
});
