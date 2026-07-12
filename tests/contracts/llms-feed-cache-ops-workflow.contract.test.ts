import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/llms-feed-cache-ops.yml";

describe("llms feed cache-only ops workflow", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");

  it("is manual dispatch only and exposes the approved fixed inputs", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("workflow_run:");
    expect(workflow).not.toContain("push:");
    expect(workflow).not.toContain("pull_request:");

    for (const input of [
      "expected_frontend_sha:",
      "feed_path:",
      "operator_approval:",
      "expected_enneagram_count:",
      "expected_llms_full_mode:",
    ]) {
      expect(workflow).toContain(input);
    }

    expect(workflow).toContain("type: choice");
    expect(workflow).toContain("- /llms.txt");
    expect(workflow).toContain("- /llms-full.txt");
    expect(workflow).toContain("contents: read");
    expect(workflow).toContain("environment:\n      name: production");
  });

  it("keeps operator approval bound to SHA, feed path, count, and llms-full mode", () => {
    expect(workflow).toContain("[[ \"$EXPECTED_FRONTEND_SHA\" =~ ^[0-9a-f]{40}$ ]]");
    expect(workflow).toContain("[[ \"$EXPECTED_ENNEAGRAM_COUNT\" =~ ^[0-9]+$ ]]");
    expect(workflow).toContain("APPROVE_FAP_WEB_LLMS_FEED_CACHE_OPS:${EXPECTED_FRONTEND_SHA}:/llms.txt:${EXPECTED_ENNEAGRAM_COUNT}");
    expect(workflow).toContain("APPROVE_FAP_WEB_LLMS_FEED_CACHE_OPS:${EXPECTED_FRONTEND_SHA}:/llms-full.txt:${EXPECTED_ENNEAGRAM_COUNT}:complete");
    expect(workflow).toContain('test -z "$EXPECTED_LLMS_FULL_MODE"');
    expect(workflow).toContain('test "$EXPECTED_LLMS_FULL_MODE" = "complete"');
    expect(workflow).toContain("operator approval does not match the SHA/path/count/mode-bound phrase");
  });

  it("uses existing Node1 settings and verifies the deployed revision before cache-only reload", () => {
    for (const key of [
      "WEB_NODE1_DEPLOY_HOST",
      "WEB_NODE1_DEPLOY_USER",
      "WEB_NODE1_DEPLOY_PORT",
      "WEB_NODE1_APP_DIR",
      "WEB_NODE1_APP_NAME",
      "WEB_PUBLIC_BASE_URL",
    ]) {
      expect(workflow).toContain(`secrets.${key} || vars.${key}`);
    }

    expect(workflow).toContain("webfactory/ssh-agent@e83874834305fe9a4a2997156cb26c5de65a8555");
    expect(workflow).toContain("SSH_KNOWN_HOSTS");
    expect(workflow).toContain("git rev-parse HEAD");
    expect(workflow).toContain("[ -f REVISION ]");
    expect(workflow).toContain("remote revision does not match expected frontend SHA");
    expect(workflow).toContain("PM2 app ${appName} is not fully online");
  });

  it("reloads only the existing PM2 app and does not contain deploy or checkout mutation commands", () => {
    expect(workflow).toContain('pm2 reload "$APP_NAME"');

    for (const forbidden of [
      "git pull",
      "git reset",
      "git checkout",
      "git fetch",
      "deploy_web_pm2.sh",
      "rolling_reload_pm2.sh",
      "pm2 start",
      "pm2 restart",
      "pm2 delete",
      "ecosystem",
    ]) {
      expect(workflow).not.toContain(forbidden);
    }
  });

  it("checks exact Enneagram counts, URL hygiene counters, llms-full complete mode, and side-effect zeros", () => {
    expect(workflow).toContain("https://fermatmind.com");
    expect(workflow).toContain("/llms.txt");
    expect(workflow).toContain("/llms-full.txt");
    expect(workflow).toContain("enneagram_count");
    expect(workflow).toContain("duplicate_count");
    expect(workflow).toContain("malformed_count");
    expect(workflow).toContain("non_apex_count");
    expect(workflow).toContain("forbidden_count");
    expect(workflow).toContain("x-fermatmind-llms-full-mode");
    expect(workflow).toContain("target.headers.llms_full_mode !== expectedMode");

    for (const sideEffect of [
      "deploy: 0",
      "git_pull: 0",
      "git_reset: 0",
      "cms: 0",
      "search_queue: 0",
      "indexnow: 0",
      "secrets_or_permissions_mutation: 0",
    ]) {
      expect(workflow).toContain(sideEffect);
    }
  });

  it("keeps the readback node heredoc compatible with GitHub runner Node 22", () => {
    expect(workflow).toContain("const fs = require(\"node:fs\");");
    expect(workflow).toContain("async function main() {");
    expect(workflow).toContain("main().catch((error) => {");
    expect(workflow).not.toContain('\n          const llms = await readFeed("/llms.txt");');
    expect(workflow).not.toContain('\n          const llmsFull = await readFeed("/llms-full.txt");');
  });

  it("uploads JSON and Markdown audit summaries", () => {
    expect(workflow).toContain("actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4");
    expect(workflow).toContain("llms-feed-cache-ops-summary.json");
    expect(workflow).toContain("llms-feed-cache-ops-summary.md");
    expect(workflow).toContain("if-no-files-found: error");
  });
});
