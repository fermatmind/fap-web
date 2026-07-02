import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { cmsManagedMediaUrl } from "@/lib/cms/media";
import {
  captureAttributionFromLocation,
  readStoredTrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import { isSecurity122Web07AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ATTRIBUTION_STORAGE_KEY = "fm_attribution_v1";
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/tracking/attribution.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-take-attribution.contract.test.tsx",
  "tests/contracts/security-122-web-07-tracking-attribution-sanitization.contract.test.ts",
];

function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }

  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files.length > 0 || process.env.GITHUB_ACTIONS !== "true" ? files : CI_DIFF_FALLBACK_FILES;
}

afterEach(() => {
  window.localStorage.clear();
});

describe("SECURITY-122-WEB-07 tracking attribution and media beacon sanitization", () => {
  it("stores private landing and referrer paths as stable route-family markers", () => {
    const payload = captureAttributionFromLocation({
      pathname: "/zh/share/share-clear-123456",
      search: "?utm_source=wechat&utm_campaign=invite&utm_content=share-clear-123456",
      referrer: "https://fermatmind.com/zh/result/attempt-clear-123456?report_url=https%3A%2F%2Fevil.example%2Fprivate",
    });

    expect(payload).toMatchObject({
      utm_source: "wechat",
      utm_campaign: "invite",
      landing_path: "private_route:share",
      current_path: "private_route:share",
      referrer: "private_route:result",
    });

    const stored = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY) ?? "";
    expect(stored).toContain("private_route:share");
    expect(stored).toContain("private_route:result");
    expect(stored).not.toContain("share-clear-123456");
    expect(stored).not.toContain("attempt-clear-123456");
    expect(stored).not.toContain("report_url");
  });

  it("sanitizes legacy stored attribution before returning it to browser tracking payloads", () => {
    window.localStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({
        first_touch: {
          utm_source: "wechat",
          landing_path: "/zh/share/share-clear-123456?utm_source=wechat",
          current_path: "/zh/share/share-clear-123456?utm_source=wechat",
          referrer: "https://fermatmind.com/zh/result/attempt-clear-123456",
          captured_at: "2026-07-01T00:00:00.000Z",
        },
        last_touch: {
          utm_source: "wechat",
          landing_path: "/zh/share/share-clear-123456?utm_source=wechat",
          current_path: "/zh/share/share-clear-123456?utm_source=wechat",
          referrer: "https://fermatmind.com/zh/result/attempt-clear-123456",
          captured_at: "2026-07-01T00:00:00.000Z",
        },
        updated_at: "2026-07-01T00:00:00.000Z",
      }),
    );

    const payload = readStoredTrackingAttributionPayload("/zh/share/share-next-789?utm_source=wechat");

    expect(payload).toMatchObject({
      utm_source: "wechat",
      landing_path: "private_route:share",
      current_path: "private_route:share",
      referrer: "private_route:result",
    });
    expect(JSON.stringify(payload)).not.toContain("share-clear-123456");
    expect(JSON.stringify(payload)).not.toContain("share-next-789");
    expect(JSON.stringify(payload)).not.toContain("attempt-clear-123456");
  });

  it("keeps third-party CMS hero/media URLs out of rendered media surfaces", () => {
    expect(cmsManagedMediaUrl("https://assets.fermatmind.com/static/personality/type-icons/intj.png")).toBe(
      "https://assets.fermatmind.com/static/personality/type-icons/intj.png",
    );
    expect(cmsManagedMediaUrl("https://api.fermatmind.com/static/share/mbti_wide_1200x630.png")).toBe(
      "https://api.fermatmind.com/static/share/mbti_wide_1200x630.png",
    );
    expect(cmsManagedMediaUrl("https://tracking.example/pixel.gif?uid=private-user")).toBeNull();
    expect(cmsManagedMediaUrl("https://cdn.example.com/hero.jpg?beacon=1")).toBeNull();
  });

  it("keeps the WEB-07 diff inside the declared tracking attribution and beacon scope", () => {
    expect(changedFiles()).not.toHaveLength(0);
    expect(changedFiles().filter((file) => !isSecurity122Web07AllowedFile(file))).toEqual([]);
  });
});
