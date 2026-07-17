import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildDeployedRevisionResponse,
  readDeployedRevision,
} from "@/app/api/deployment/revision/route";

const REVISION = "0123456789abcdef0123456789abcdef01234567";
const tempDirectories: string[] = [];

function tempDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "fap-web-revision-contract-"));
  tempDirectories.push(directory);
  return directory;
}

describe("same-origin deployed revision endpoint", () => {
  afterEach(() => {
    for (const directory of tempDirectories.splice(0)) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("returns only the exact lowercase deployed SHA with no-store and noindex headers", async () => {
    const directory = tempDirectory();
    fs.writeFileSync(path.join(directory, "REVISION"), `${REVISION}\n`, { mode: 0o444 });

    const revision = readDeployedRevision(directory);
    const response = buildDeployedRevisionResponse(revision);

    expect(revision).toBe(REVISION);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revision: REVISION });
    expect(response.headers.get("X-Revision")).toBe(REVISION);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("CDN-Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("fails closed without exposing a partial, uppercase, or malformed revision", async () => {
    const missingDirectory = tempDirectory();
    expect(readDeployedRevision(missingDirectory)).toBeNull();

    for (const value of [REVISION.toUpperCase(), REVISION.slice(0, 39), `${REVISION}extra`, "main"]) {
      const directory = tempDirectory();
      fs.writeFileSync(path.join(directory, "REVISION"), value);
      expect(readDeployedRevision(directory), value).toBeNull();
    }

    const response = buildDeployedRevisionResponse(null);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "revision_unavailable" });
    expect(response.headers.get("X-Revision")).toBeNull();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
  });

  it("atomically publishes the same revision for PM2 and standalone systemd runtimes and smokes both origins", () => {
    const deployScript = fs.readFileSync("scripts/deploy_web_pm2.sh", "utf8");

    expect(deployScript).toContain('DEPLOYED_REVISION="$(git rev-parse HEAD)"');
    expect(deployScript).toContain('write_deployed_revision "$DEPLOYED_REVISION" "${APP_DIR}/REVISION"');
    expect(deployScript).toContain(
      'write_deployed_revision "$DEPLOYED_REVISION" "${APP_DIR}/.next/standalone/REVISION"',
    );
    expect(deployScript).toContain('temporary="$(mktemp "${target}.tmp.XXXXXX")"');
    expect(deployScript).toContain('chmod 0444 "$temporary"');
    expect(deployScript).toContain(
      'require_deployed_revision_endpoint "http://${APP_HOST}:${APP_PORT}${REVISION_PATH}" "$DEPLOYED_REVISION"',
    );
    expect(deployScript).toContain(
      'require_deployed_revision_endpoint "${PUBLIC_BASE_URL%/}${REVISION_PATH}" "$DEPLOYED_REVISION"',
    );
  });
});
