#!/usr/bin/env node

const DEFAULT_VALIDATION_MODE = "canonical";
const MODE_CONFIG = {
  canonical: {
    requiredNodeMajor: 20,
  },
  readiness: {
    requiredNodeMajor: 24,
  },
};
const validationMode = String(process.env.RUNTIME_VALIDATION_MODE ?? DEFAULT_VALIDATION_MODE).trim() || DEFAULT_VALIDATION_MODE;
const detectedNodeVersion = `v${process.versions.node}`;
const detectedNodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);
const packageManagerUserAgent = String(process.env.npm_config_user_agent ?? "").trim();

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

if (!Object.hasOwn(MODE_CONFIG, validationMode)) {
  fail([
    `[check-runtime] Unsupported RUNTIME_VALIDATION_MODE: ${validationMode}`,
    `[check-runtime] Allowed values: ${Object.keys(MODE_CONFIG).join(", ")}.`,
  ]);
}

const { requiredNodeMajor } = MODE_CONFIG[validationMode];

if (!Number.isInteger(detectedNodeMajor) || detectedNodeMajor !== requiredNodeMajor) {
  if (validationMode === "canonical") {
    fail([
      `[check-runtime] Unsupported Node.js version: ${detectedNodeVersion}`,
      `[check-runtime] This repository requires Node.js ${requiredNodeMajor}.x.`,
      "[check-runtime] Run `nvm use` (or switch to Node 20.x) and try again.",
    ]);
  }

  fail([
    `[check-runtime] Unsupported Node.js version for readiness mode: ${detectedNodeVersion}`,
    `[check-runtime] Readiness mode requires Node.js ${requiredNodeMajor}.x only.`,
    "[check-runtime] Set `RUNTIME_VALIDATION_MODE=readiness` and switch to Node 24.x.",
  ]);
}

if (packageManagerUserAgent && !packageManagerUserAgent.startsWith("pnpm/")) {
  fail([
    `[check-runtime] Unsupported package manager: ${packageManagerUserAgent}`,
    "[check-runtime] This repository is pnpm-only.",
    "[check-runtime] Use `pnpm install` instead of npm or yarn.",
  ]);
}

if (validationMode === "readiness") {
  if (packageManagerUserAgent) {
    console.log(
      `[check-runtime] OK: readiness mode for Node ${requiredNodeMajor}.x (${detectedNodeVersion}) with ${packageManagerUserAgent}`
    );
  } else {
    console.log(`[check-runtime] OK: readiness mode for Node ${requiredNodeMajor}.x (${detectedNodeVersion})`);
  }
} else if (packageManagerUserAgent) {
  console.log(`[check-runtime] OK: ${detectedNodeVersion} with ${packageManagerUserAgent}`);
} else {
  console.log(`[check-runtime] OK: ${detectedNodeVersion}`);
}
