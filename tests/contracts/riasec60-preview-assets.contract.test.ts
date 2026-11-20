import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadRiasec60DesignReport } from "@/components/result/riasec/riasec60PreviewData";

const readFileMock = vi.hoisted(() => vi.fn());
vi.mock("node:fs/promises", async importOriginal => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, readFile: readFileMock, default: { ...actual, readFile: readFileMock } };
});
vi.mock("@/lib/tests/traditionalAssessmentDisplay", () => ({ loadTraditionalAssessmentText: () => { throw new Error("Independent assets must not use display conversion"); } }));
afterEach(() => vi.unstubAllEnvs());

function packageBytes(withTraditional: boolean) {
  const dimensions = ["R", "I", "A", "S", "E", "C"].map(code => ({ dimension_code: code,
    title: `${code} 原生繁體標籤`, user_visible_boundary: "原生繁體邊界",
    desktop_atlas_by_decile: Array.from({ length: 10 }, () => ({ reading: "原生繁體正文", next_step: "原生繁體行動" })),
  }));
  const assets = withTraditional ? {
    "dimension_deep_copy_v1.zh-TW.json": { dimensions },
    "top3_code_chain_strategy_v1.zh-TW.jsonl": [{ unordered_top3_key: "I_A_S", first_experiment: "原生繁體試做", activity_chain: "原生繁體活動" }],
  } : {};
  const bytes = Buffer.from(JSON.stringify({ assets, source_hash: "source", compiled_hash: "compiled" }));
  const manifest = JSON.stringify({ artifacts: [{ path: "private_result.compiled.json", sha256: createHash("sha256").update(bytes).digest("hex") }], source_hash: "source", compiled_hash: "compiled" });
  readFileMock.mockImplementation(async path => String(path).endsWith("manifest.json") ? manifest : bytes);
}

describe("Independent RIASEC preview assets", () => {
  it("reads Taiwan copy from its own compiled source without a display converter", async () => {
    vi.stubEnv("NODE_ENV", "development");
    packageBytes(true);
    const result = await loadRiasec60DesignReport("zh-TW");
    expect(result.model.dimensions[0].label).toBe("R 原生繁體標籤");
    expect(result.premium.dimensions[0].detail).toBe("原生繁體正文");
    expect(result.premium.actions[0]).toBe("原生繁體試做");
  });

  it("does not fall back to Chinese when Taiwan assets are absent", async () => {
    vi.stubEnv("NODE_ENV", "development");
    packageBytes(false);
    await expect(loadRiasec60DesignReport("zh-TW")).rejects.toThrow();
  });

  it("does not read a local private source package outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    readFileMock.mockClear();
    await expect(loadRiasec60DesignReport("en")).rejects.toThrow("LOCAL_PREVIEW_ONLY");
    expect(readFileMock).not.toHaveBeenCalled();
  });
});
