import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  isSeoCmsDraftPackageContract01AllowedFile,
  isSeoOpportunityQueueContract01AllowedFile,
  isSeoWeeklyAutomationControlPacket02AllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PACKET_PATH = "docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json";

type WeeklyPacketFixture = {
  mode: string;
  gpt55_handoff: {
    required: boolean;
    authority_boundary: string;
  };
  automation_context: {
    read_only: boolean;
    automation_toml_change_allowed: boolean;
    required_output_blocks: string[];
    post_merge_authorization: string;
  };
  candidate_actions: Array<{
    id: string;
    lane: string;
    verdict: string;
    requires_approval: boolean;
  }>;
};

function readPacket(): WeeklyPacketFixture {
  return JSON.parse(fs.readFileSync(path.join(ROOT, PACKET_PATH), "utf8")) as WeeklyPacketFixture;
}

function writeTempPacket(packet: WeeklyPacketFixture): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-control-packet-"));
  const filePath = path.join(tempDir, "packet.json");
  fs.writeFileSync(filePath, JSON.stringify(packet, null, 2));
  return filePath;
}

function runChecker(packetPath: string): { status: number; stdout: string } {
  try {
    const stdout = execFileSync("node", ["scripts/seo/check-seo-agent-weekly-control-packet.mjs", packetPath], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout };
  } catch (error) {
    const execError = error as { status?: number; stdout?: Buffer | string };
    return { status: execError.status ?? 1, stdout: String(execError.stdout || "") };
  }
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("SEO Agent weekly automation control packet", () => {
  it("accepts the weekly example as read-only and GPT-reviewable", () => {
    const result = runChecker(PACKET_PATH);
    const report = JSON.parse(result.stdout);

    expect(result.status).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.boundaries).toMatchObject({
      automation_toml_modified: false,
      cms_or_search_writes_attempted: false,
      provider_calls_attempted: false,
      network_calls_attempted: false,
    });
  });

  it("requires the four weekly output blocks", () => {
    const packet = readPacket();
    packet.automation_context.required_output_blocks = ["CONTROL_PACKET_JSON"];
    const result = runChecker(writeTempPacket(packet));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("human_weekly_summary");
    expect(result.stdout).toContain("GPT55_HANDOFF_PROMPT");
    expect(result.stdout).toContain("APPROVAL_MATRIX");
  });

  it("rejects automation config edits and non-read-only packets", () => {
    const packet = readPacket();
    packet.mode = "approved_execution";
    packet.automation_context.read_only = false;
    packet.automation_context.automation_toml_change_allowed = true;
    const result = runChecker(writeTempPacket(packet));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("mode=read_only");
    expect(result.stdout).toContain("automation_toml_change_allowed");
  });

  it("requires GPT 5.5 handoff to remain review-only", () => {
    const packet = readPacket();
    packet.gpt55_handoff.required = false;
    packet.gpt55_handoff.authority_boundary = "GPT may approve execution.";
    const result = runChecker(writeTempPacket(packet));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("gpt55_handoff.required");
    expect(result.stdout).toContain("cannot approve");
  });

  it("keeps mutation-sensitive lanes held without exact approvals", () => {
    const packet = readPacket();
    const cmsAction = packet.candidate_actions.find((action) => action.lane === "CMS_DRAFT_PACKAGE_DRY_RUN");
    expect(cmsAction).toBeDefined();
    cmsAction!.verdict = "GO";
    const result = runChecker(writeTempPacket(packet));

    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("mutation-sensitive candidate cannot be GO");
  });

  it("does not edit local automation TOML or runtime SEO behavior", () => {
    const docs = fs.readFileSync(path.join(ROOT, "docs/seo/agent/WEEKLY_AUTOMATION_CONTROL_PACKET.md"), "utf8");
    const script = fs.readFileSync(path.join(ROOT, "scripts/seo/check-seo-agent-weekly-control-packet.mjs"), "utf8");
    const pkg = fs.readFileSync(path.join(ROOT, "package.json"), "utf8");

    expect(docs).toContain("does not edit local automation TOML");
    expect(script).toContain("automation_toml_modified: false");
    expect(pkg).toContain("\"seo:weekly-control-packet\"");
    expect(changedFiles().some((file) => file.includes(".codex/automations") || file.endsWith(".toml"))).toBe(false);
  });

  it("keeps current PR changed files inside the approved weekly packet scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(
      files.every(
        (file) =>
          isSeoWeeklyAutomationControlPacket02AllowedFile(file) ||
          isSeoOpportunityQueueContract01AllowedFile(file) ||
          isSeoCmsDraftPackageContract01AllowedFile(file),
      ),
      files.join("\n"),
    ).toBe(true);
  });
});
