import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnimatedCounter } from "@/components/design/AnimatedCounter";

let reducedMotion = true;
let listeners: Set<() => void>;

beforeEach(() => {
  reducedMotion = true;
  listeners = new Set();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: reducedMotion,
      media: query,
      onchange: null,
      addEventListener: (_event: "change", callback: () => void) => listeners.add(callback),
      removeEventListener: (_event: "change", callback: () => void) => listeners.delete(callback),
      addListener: (callback: () => void) => listeners.add(callback),
      removeListener: (callback: () => void) => listeners.delete(callback),
      dispatchEvent: () => true,
    })),
  });
});

function setReducedMotion(next: boolean): void {
  reducedMotion = next;
  act(() => {
    for (const listener of listeners) {
      listener();
    }
  });
}

describe("AnimatedCounter reduced motion contract", () => {
  it("renders the target value while reduced motion is enabled", () => {
    render(<AnimatedCounter value={1234} prefix="$" suffix="+" />);

    expect(screen.getByText("$1,234+")).toBeInTheDocument();
  });

  it("does not freeze at zero when reduced motion is disabled after mount", async () => {
    render(<AnimatedCounter value={9876} />);

    expect(screen.getByText("9,876")).toBeInTheDocument();

    setReducedMotion(false);

    await waitFor(() => {
      expect(screen.getByText("9,876")).toBeInTheDocument();
    });
  });
});
