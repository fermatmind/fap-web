import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";

describe("quiz ux flags contract", () => {
  const original = process.env.NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED;

  afterEach(() => {
    if (typeof original === "undefined") {
      delete process.env.NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED;
      return;
    }
    process.env.NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED = original;
  });

  it("defaults to immersive mode enabled", () => {
    delete process.env.NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED;
    expect(isImmersiveSingleFlowEnabled()).toBe(true);
  });

  it("supports explicit rollback switch", () => {
    process.env.NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED = "false";
    expect(isImmersiveSingleFlowEnabled()).toBe(false);
  });
});
