import { describe, expect, it } from "vitest";
import { localizeEnneagramPresentationText } from "@/lib/enneagram/presentationTerminology";

describe("enneagram presentation terminology contract", () => {
  it("maps historical mixed-language labels to the approved Chinese vocabulary", () => {
    const source = [
      "E105 标准版",
      "FC144 深度版",
      "Top1 / Top2 / Top3",
      "All9",
      "Confidence band",
      "Close-call",
      "diffuse",
      "score space",
      "forced-choice",
      "Technical Note",
      "当前 form / 跨 form",
    ].join(" | ");

    expect(localizeEnneagramPresentationText(source, "zh")).toBe(
      "E105 五点量表版 | FC144 二选一迫选版 | 第一候选 / 第二候选 / 前三候选 | 九型完整轮廓 | 解释稳定性 | 接近型辨析 | 分布较分散 | 计分空间 | 二选一迫选 | 技术说明 | 当前题型 / 跨题型"
    );
  });

  it("removes hierarchy claims from historical English form labels", () => {
    expect(localizeEnneagramPresentationText("E105 Standard Form / FC144 Deep Form", "en")).toBe(
      "E105 Five-point Likert Form / FC144 Two-option Forced-choice Form"
    );
  });
});
