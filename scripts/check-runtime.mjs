#!/usr/bin/env node

const REQUIRED_NODE_MAJOR = 20;
const detectedNodeVersion = `v${process.versions.node}`;
const detectedNodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);
const packageManagerUserAgent = String(process.env.npm_config_user_agent ?? "").trim();

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

if (!Number.isInteger(detectedNodeMajor) || detectedNodeMajor !== REQUIRED_NODE_MAJOR) {
  fail([
    `[check-runtime] Unsupported Node.js version: ${detectedNodeVersion}`,
    `[check-runtime] This repository requires Node.js ${REQUIRED_NODE_MAJOR}.x.`,
    "[check-runtime] Run `nvm use` (or switch to Node 20.x) and try again.",
  ]);
}

if (packageManagerUserAgent && !packageManagerUserAgent.startsWith("pnpm/")) {
  fail([
    `[check-runtime] Unsupported package manager: ${packageManagerUserAgent}`,
    "[check-runtime] This repository is pnpm-only.",
    "[check-runtime] Use `pnpm install` instead of npm or yarn.",
  ]);
}

if (packageManagerUserAgent) {
  console.log(`[check-runtime] OK: ${detectedNodeVersion} with ${packageManagerUserAgent}`);
} else {
  console.log(`[check-runtime] OK: ${detectedNodeVersion}`);
}
