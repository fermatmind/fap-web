import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildDeployedRevisionResponse,
  readDeployedRevision,
} from "@/app/revision/route";

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

  it("reads an explicit absolute live marker for a standalone runtime and rejects relative configuration", () => {
    const runtimeDirectory = tempDirectory();
    const markerDirectory = tempDirectory();
    const markerPath = path.join(markerDirectory, "REVISION");
    fs.writeFileSync(markerPath, `${REVISION}\n`, { mode: 0o444 });

    expect(readDeployedRevision(runtimeDirectory, markerPath)).toBe(REVISION);
    expect(readDeployedRevision(runtimeDirectory, "relative/REVISION")).toBeNull();
  });

  it("atomically publishes one live marker after either runtime manager succeeds and smokes both origins", () => {
    const deployScript = fs.readFileSync("scripts/deploy_web_pm2.sh", "utf8");
    const nginxConfig = fs.readFileSync("deploy/nginx/fap-web.conf", "utf8");
    const systemdUnit = fs.readFileSync("deploy/systemd/fap-web.service", "utf8");
    const documentedSystemdUnit = fs.readFileSync("docs/deploy/systemd-fap-web.service", "utf8");
    const runtimeChecks = deployScript.indexOf('log "runtime checks"');
    const liveMarkerWrite = deployScript.indexOf(
      'write_deployed_revision "$DEPLOYED_REVISION" "${APP_DIR}/REVISION"',
    );
    const localRevisionSmoke = deployScript.indexOf(
      'require_deployed_revision_endpoint "http://${APP_HOST}:${APP_PORT}${REVISION_PATH}" "$DEPLOYED_REVISION"',
    );

    expect(deployScript).toContain('DEPLOYED_REVISION="$(git rev-parse HEAD)"');
    expect(deployScript).toContain('REVISION_PATH="${REVISION_PATH:-/revision}"');
    expect(deployScript).not.toContain("/api/deployment/revision");
    expect(nginxConfig).toContain("location /api/");
    expect(liveMarkerWrite).toBeGreaterThan(runtimeChecks);
    expect(localRevisionSmoke).toBeGreaterThan(liveMarkerWrite);
    expect(deployScript).not.toContain(
      'write_deployed_revision "$DEPLOYED_REVISION" "${APP_DIR}/.next/standalone/REVISION"',
    );
    expect(systemdUnit).toContain(
      "Environment=FERMATMIND_DEPLOYED_REVISION_FILE=/opt/apps/fap-web/REVISION",
    );
    expect(documentedSystemdUnit).toContain(
      "Environment=FERMATMIND_DEPLOYED_REVISION_FILE=/opt/apps/fap-web/REVISION",
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
