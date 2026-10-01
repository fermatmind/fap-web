import { describe, expect, it } from "vitest";
import { resolveCareerGuideMetadataTitle } from "@/lib/seo/careerGuideMetadataTitle";

describe("career guide metadata brand ownership", () => {
  it.each([
    ["职业决策｜FermatMind", "职业决策 | FermatMind"],
    ["Career decisions | FermatMind", "Career decisions | FermatMind"],
    ["职业决策｜FermatMind | FermatMind", "职业决策 | FermatMind"],
    ["FermatMind职业决策｜FermatMind", "FermatMind职业决策 | FermatMind"],
  ])("uses an absolute title for %s", (source, expected) => {
    expect(resolveCareerGuideMetadataTitle(source)).toEqual({ absolute: expected });
  });

  it.each(["Career decisions", "FermatMind career decisions", ""])(
    "preserves layout branding for an unbranded source: %s",
    (source) => expect(resolveCareerGuideMetadataTitle(source)).toBe(source),
  );
});
