import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const EXPECTED_INDEXNOW_KEY_SHA256 =
  "e9a3eca3e7c107d6e0ac63c1fdba24068d970aecb4bdf18ed69735e8b77cf143";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const ARTIFACT_PATH = path.join(
  process.cwd(),
  "docs/seo/generated/search-channel-live-zh-mbti-01a-indexnow-keylocation-fix.v1.json",
);

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function indexNowVerificationFiles(): Array<{ fileName: string; body: string }> {
  return readdirSync(PUBLIC_DIR)
    .filter((fileName) => /^[a-f0-9]{32}\.txt$/i.test(fileName))
    .map((fileName) => ({
      fileName,
      body: readFileSync(path.join(PUBLIC_DIR, fileName), "utf8"),
    }));
}

describe("IndexNow keyLocation public verification file", () => {
  it("serves a durable apex public verification key without relying on staging", () => {
    const matching = indexNowVerificationFiles().find(({ body }) => {
      return sha256(body.trim()) === EXPECTED_INDEXNOW_KEY_SHA256;
    });

    expect(matching).toBeDefined();
    expect(matching?.body).toHaveLength(32);
    expect(matching?.body).toMatch(/^[a-f0-9]{32}$/i);
    expect(`${matching?.body}.txt`).toBe(matching?.fileName);
  });

  it("records the safety report without printing the raw public key", () => {
    const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8")) as {
      keylocation_url?: string;
      keylocation_host?: string;
      keylocation_path?: string;
      raw_key_printed?: boolean;
      key_body_hash_matches_config_expected?: boolean;
      live_submission_performed?: boolean;
      external_api_call_performed?: boolean;
      enqueue_performed?: boolean;
      production_env_edit_performed?: boolean;
      staging_authority_used?: boolean;
      next_task?: string;
    };
    const matching = indexNowVerificationFiles().find(({ body }) => {
      return sha256(body.trim()) === EXPECTED_INDEXNOW_KEY_SHA256;
    });

    expect(artifact.keylocation_url).toBe("https://fermatmind.com/<indexnow-key>.txt");
    expect(artifact.keylocation_host).toBe("fermatmind.com");
    expect(artifact.keylocation_path).toBe("/<indexnow-key>.txt");
    expect(artifact.raw_key_printed).toBe(false);
    expect(artifact.key_body_hash_matches_config_expected).toBe(true);
    expect(artifact.live_submission_performed).toBe(false);
    expect(artifact.external_api_call_performed).toBe(false);
    expect(artifact.enqueue_performed).toBe(false);
    expect(artifact.production_env_edit_performed).toBe(false);
    expect(artifact.staging_authority_used).toBe(false);
    expect(artifact.next_task).toBe("DEPLOY-READINESS｜Deploy IndexNow keyLocation fix");
    expect(JSON.stringify(artifact)).not.toContain(matching?.body);
  });
});
