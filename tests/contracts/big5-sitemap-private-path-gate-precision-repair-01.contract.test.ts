import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");

function shellPattern(name: string): string {
  const match = deployScript.match(new RegExp(`^${name}='([^']+)'$`, "m"));
  expect(match, `${name} must remain a literal auditable ERE`).not.toBeNull();
  return match?.[1] ?? "";
}

function matches(pattern: string, url: string): boolean {
  const xml = `<?xml version="1.0"?><urlset><url><loc>${url}</loc></url></urlset>`;
  const result = spawnSync("grep", ["-Eiq", pattern], { input: xml, encoding: "utf8" });
  expect([0, 1]).toContain(result.status);
  return result.status === 0;
}

describe("BIG5-SITEMAP-PRIVATE-PATH-GATE-PRECISION-REPAIR-01", () => {
  const privatePathPattern = shellPattern("PRIVATE_SITEMAP_PATH_PATTERN");
  const privateTestTakePattern = shellPattern("PRIVATE_TEST_TAKE_SITEMAP_PATH_PATTERN");

  it("allows the legitimate bilingual Big Five order Facet canonicals", () => {
    expect(matches(privatePathPattern, "https://fermatmind.com/en/personality/big-five/facets/order")).toBe(false);
    expect(matches(privatePathPattern, "https://fermatmind.com/zh/personality/big-five/facets/order")).toBe(false);
  });

  it.each([
    "https://fermatmind.com/result/private-report",
    "https://fermatmind.com/en/results/private-report",
    "https://fermatmind.com/zh/order/123",
    "https://fermatmind.com/en/orders/lookup",
    "https://fermatmind.com/zh/share/token",
    "https://fermatmind.com/en/pay/wait",
    "https://fermatmind.com/zh/payment/stripe/cancel",
    "https://fermatmind.com/en/payments/stripe/cancel",
    "https://fermatmind.com/zh/history?page=2",
  ])("continues to reject a real root-level private URL: %s", (url) => {
    expect(matches(privatePathPattern, url)).toBe(true);
  });

  it("continues to reject private test take routes without matching unrelated nested paths", () => {
    expect(matches(privateTestTakePattern, "https://fermatmind.com/tests/mbti/take")).toBe(true);
    expect(matches(privateTestTakePattern, "https://fermatmind.com/zh/tests/big-five/take?source=private")).toBe(true);
    expect(matches(privateTestTakePattern, "https://fermatmind.com/zh/career/tests/big-five/take")).toBe(false);
  });

  it("uses the precision patterns in the production sitemap health gate", () => {
    expect(deployScript).toContain('grep -Eiq "$PRIVATE_SITEMAP_PATH_PATTERN" "$body_file"');
    expect(deployScript).toContain('grep -Eiq "$PRIVATE_TEST_TAKE_SITEMAP_PATH_PATTERN" "$body_file"');
  });
});
