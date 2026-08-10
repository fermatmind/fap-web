#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ARTIFACT_SCHEMA = "fermatmind.web.standalone.v1";
const CHECKSUM_FILE = "SHA256SUMS";
const MANIFEST_FILE = "RELEASE_MANIFEST.json";
const REVISION_FILE = "REVISION";
const REVISION_METADATA_FILE = "REVISION_METADATA.json";
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const RUNTIME_DIRECTORY_ALLOWLIST = new Set([".next", "generated", "node_modules", "public"]);
const RUNTIME_FILE_ALLOWLIST = new Set([
  CHECKSUM_FILE,
  MANIFEST_FILE,
  REVISION_FILE,
  REVISION_METADATA_FILE,
  "package.json",
  "server.js",
]);
const BUILD_CONFIG_KEYS = [
  "NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE",
  "NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS",
  "NEXT_PUBLIC_ANALYTICS_ENABLED",
  "NEXT_PUBLIC_ANALYTICS_ENV",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_ARTICLES_ENABLED",
  "NEXT_PUBLIC_BAIDU_SITE_VERIFICATION",
  "NEXT_PUBLIC_BAIDU_TONGJI_ID",
  "NEXT_PUBLIC_CAREER_RECOMMEND_ENABLED",
  "NEXT_PUBLIC_CDN_URL",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL",
  "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
  "NEXT_PUBLIC_IMMERSIVE_SINGLE_FLOW_ENABLED",
  "NEXT_PUBLIC_MBTI_PRIORITY_MODE",
  "NEXT_PUBLIC_RELEASE",
  "NEXT_PUBLIC_REPORT_404_RETRY_ENABLED",
  "NEXT_PUBLIC_REPORT_404_RETRY_MAX",
  "NEXT_PUBLIC_REPORT_404_RETRY_SCHEDULE_MS",
  "NEXT_PUBLIC_SCALE_CODE_MODE",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_TOPICS_ENABLED",
  "NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY",
  "NEXT_PUBLIC_VERCEL_ENV",
].sort();

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const [command, ...tokens] = argv;
  const options = {};
  for (const token of tokens) {
    if (!token.startsWith("--")) {
      fail(`unexpected argument: ${token}`);
    }
    const separator = token.indexOf("=");
    if (separator === -1) {
      options[token.slice(2)] = true;
      continue;
    }
    options[token.slice(2, separator)] = token.slice(separator + 1);
  }
  return { command, options };
}

function requireOption(options, name) {
  const value = options[name];
  if (typeof value !== "string" || value.length === 0) {
    fail(`missing required option: --${name}=...`);
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeRelative(filePath) {
  return filePath.split(path.sep).join("/");
}

function isForbiddenFile(relativePath) {
  const basename = path.posix.basename(relativePath).toLowerCase();
  return (
    /^\.env(?:\.|$)/.test(basename) ||
    /\.(?:key|pem|p12|pfx)$/.test(basename) ||
    basename === "id_rsa" ||
    basename === "id_ed25519" ||
    basename === "credentials"
  );
}

function assertSafeSymlink(root, absolutePath, relativePath) {
  const target = readlinkSync(absolutePath);
  if (path.isAbsolute(target)) {
    fail(`absolute symlink is not permitted: ${relativePath}`);
  }
  const resolved = path.resolve(path.dirname(absolutePath), target);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    fail(`escaping symlink is not permitted: ${relativePath}`);
  }
  return target;
}

function walk(rootDirectory) {
  const root = realpathSync(rootDirectory);
  const entries = [];

  function visit(directory, prefix = "") {
    for (const name of readdirSync(directory).sort()) {
      const absolutePath = path.join(directory, name);
      const relativePath = normalizeRelative(path.join(prefix, name));
      const stat = lstatSync(absolutePath);
      if (stat.isDirectory()) {
        visit(absolutePath, relativePath);
      } else if (stat.isFile()) {
        entries.push({ path: relativePath, type: "file", absolutePath });
      } else if (stat.isSymbolicLink()) {
        assertSafeSymlink(root, absolutePath, relativePath);
        entries.push({ path: relativePath, type: "symlink", absolutePath });
      } else {
        fail(`unsupported artifact entry type: ${relativePath}`);
      }
    }
  }

  visit(root);
  return entries;
}

function digestEntry(entry) {
  if (entry.type === "symlink") {
    return sha256(`symlink:${readlinkSync(entry.absolutePath)}`);
  }
  return sha256(readFileSync(entry.absolutePath));
}

function assertNoSensitiveFiles(entries) {
  const forbidden = entries.filter((entry) => isForbiddenFile(entry.path)).map((entry) => entry.path);
  if (forbidden.length > 0) {
    fail(`forbidden secret or private configuration files: ${forbidden.join(", ")}`);
  }
}

function assertRuntimeAllowlist(entries) {
  const forbidden = entries
    .map((entry) => entry.path)
    .filter((entryPath) => {
      const [root] = entryPath.split("/");
      return !RUNTIME_DIRECTORY_ALLOWLIST.has(root) && !RUNTIME_FILE_ALLOWLIST.has(entryPath);
    });
  if (forbidden.length > 0) {
    fail(`non-runtime standalone content is not permitted: ${forbidden.join(", ")}`);
  }
}

function buildConfigSnapshot(env) {
  const values = BUILD_CONFIG_KEYS.map((name) => `${name}=${env[name] ?? ""}`).join("\n");
  return {
    keys: BUILD_CONFIG_KEYS,
    sha256: sha256(`${values}\n`),
  };
}

function validateProductionConfig(env, gitSha) {
  const violations = [];
  const requireExact = (name, expected) => {
    if (env[name] !== expected) {
      violations.push(`${name} must equal ${expected}`);
    }
  };

  requireExact("NEXT_PUBLIC_API_URL", "https://api.fermatmind.com");
  requireExact("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
  requireExact("NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY", "false");
  requireExact("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  requireExact("NEXT_PUBLIC_ANALYTICS_ENV", "production");
  requireExact("NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS", "fermatmind.com,www.fermatmind.com");
  requireExact("NEXT_PUBLIC_RELEASE", gitSha);

  if (!/^G-[A-Z0-9]{4,32}$/.test(env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "")) {
    violations.push("NEXT_PUBLIC_GA_MEASUREMENT_ID is missing or malformed");
  }
  if (!/^[a-f0-9]{16,64}$/.test(env.NEXT_PUBLIC_BAIDU_TONGJI_ID ?? "")) {
    violations.push("NEXT_PUBLIC_BAIDU_TONGJI_ID is missing or malformed");
  }
  if (violations.length > 0) {
    fail(`production build configuration is unsafe:\n- ${violations.join("\n- ")}`);
  }
}

function assertReleaseShape(entries) {
  const paths = new Set(entries.map((entry) => entry.path));
  for (const required of ["server.js", ".next/static", "public"]) {
    const present =
      required === "server.js"
        ? paths.has(required)
        : [...paths].some((entryPath) => entryPath.startsWith(`${required}/`));
    if (!present) {
      fail(`standalone release is missing required content: ${required}`);
    }
  }
}

function copyStandaloneTree(source, output) {
  const sourceRoot = realpathSync(source);

  function copyEntry(sourcePath, targetPath) {
    const sourceStat = lstatSync(sourcePath);

    if (sourceStat.isSymbolicLink()) {
      const relativePath = normalizeRelative(path.relative(sourceRoot, sourcePath));
      const target = assertSafeSymlink(sourceRoot, sourcePath, relativePath);
      symlinkSync(target, targetPath);
      return;
    }

    if (sourceStat.isDirectory()) {
      mkdirSync(targetPath, { recursive: true, mode: sourceStat.mode });
      for (const name of readdirSync(sourcePath).sort()) {
        copyEntry(path.join(sourcePath, name), path.join(targetPath, name));
      }
      return;
    }

    if (sourceStat.isFile()) {
      copyFileSync(sourcePath, targetPath);
      return;
    }
    fail(`unsupported standalone source entry: ${sourcePath}`);
  }

  copyEntry(sourceRoot, output);
}

function packageRelease(options) {
  const source = path.resolve(requireOption(options, "source"));
  const output = path.resolve(requireOption(options, "output"));
  const gitSha = requireOption(options, "git-sha");
  const buildTimestamp = requireOption(options, "build-timestamp");
  const workflowRunId = requireOption(options, "workflow-run-id");
  const workflowRunAttempt = requireOption(options, "workflow-run-attempt");

  if (!SHA_PATTERN.test(gitSha)) {
    fail("--git-sha must be an exact lowercase 40-character commit SHA");
  }
  if (!Number.isInteger(Date.parse(buildTimestamp))) {
    fail("--build-timestamp must be an ISO-8601 timestamp");
  }
  if (!/^[1-9][0-9]*$/.test(workflowRunId) || !/^[1-9][0-9]*$/.test(workflowRunAttempt)) {
    fail("workflow run id and attempt must be positive integers");
  }
  if (!existsSync(path.join(source, "server.js"))) {
    fail(`standalone source is missing server.js: ${source}`);
  }
  if (output === source || output.startsWith(`${source}${path.sep}`)) {
    fail("release output must not be inside the standalone source");
  }
  if (options["require-production-config"]) {
    validateProductionConfig(process.env, gitSha);
  }

  const sourceEntries = walk(source);
  assertNoSensitiveFiles(sourceEntries);
  assertRuntimeAllowlist(sourceEntries);
  assertReleaseShape(sourceEntries);

  rmSync(output, { recursive: true, force: true });
  mkdirSync(path.dirname(output), { recursive: true });
  copyStandaloneTree(source, output);

  const copiedEntries = walk(output);

  const config = buildConfigSnapshot(process.env);
  writeFileSync(path.join(output, REVISION_FILE), `${gitSha}\n`, { mode: 0o444 });

  const protectedPaths = [
    ...copiedEntries.map(({ path: entryPath, type }) => ({ path: entryPath, type })),
    { path: MANIFEST_FILE, type: "file" },
    { path: REVISION_FILE, type: "file" },
    { path: REVISION_METADATA_FILE, type: "file" },
  ].sort((left, right) => left.path.localeCompare(right.path));

  const releaseManifest = {
    schema: ARTIFACT_SCHEMA,
    git_sha: gitSha,
    build_config: config,
    protected_paths: protectedPaths,
  };
  writeFileSync(path.join(output, MANIFEST_FILE), canonicalJson(releaseManifest), { mode: 0o444 });

  const revisionMetadata = {
    schema: ARTIFACT_SCHEMA,
    git_sha: gitSha,
    build_timestamp: buildTimestamp,
    workflow_run_id: workflowRunId,
    workflow_run_attempt: workflowRunAttempt,
    build_config_sha256: config.sha256,
    release_manifest_sha256: sha256(readFileSync(path.join(output, MANIFEST_FILE))),
  };
  writeFileSync(path.join(output, REVISION_METADATA_FILE), canonicalJson(revisionMetadata), { mode: 0o444 });

  const finalEntries = walk(output).filter((entry) => entry.path !== CHECKSUM_FILE);
  assertNoSensitiveFiles(finalEntries);
  assertRuntimeAllowlist(finalEntries);
  const checksums = finalEntries
    .sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0))
    .map((entry) => `${digestEntry(entry)}  ${entry.path}`)
    .join("\n");
  writeFileSync(path.join(output, CHECKSUM_FILE), `${checksums}\n`, { mode: 0o444 });

  verifyRelease({ artifact: output });
  console.log(`Packaged immutable standalone release: ${output}`);
}

function parseJsonFile(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function verifyRelease(options) {
  const artifact = path.resolve(requireOption(options, "artifact"));
  const entries = walk(artifact);
  assertNoSensitiveFiles(entries);
  assertRuntimeAllowlist(entries);
  assertReleaseShape(entries);

  const entryByPath = new Map(entries.map((entry) => [entry.path, entry]));
  for (const required of [CHECKSUM_FILE, MANIFEST_FILE, REVISION_FILE, REVISION_METADATA_FILE]) {
    if (!entryByPath.has(required)) {
      fail(`release metadata is missing: ${required}`);
    }
  }

  const revision = readFileSync(path.join(artifact, REVISION_FILE), "utf8").trim();
  if (!SHA_PATTERN.test(revision)) {
    fail("REVISION is not an exact lowercase 40-character commit SHA");
  }
  if (options["expected-git-sha"] !== undefined) {
    const expectedGitSha = requireOption(options, "expected-git-sha");
    if (!SHA_PATTERN.test(expectedGitSha) || revision !== expectedGitSha) {
      fail("release REVISION does not match the requested exact git SHA");
    }
  }

  const manifest = parseJsonFile(path.join(artifact, MANIFEST_FILE), MANIFEST_FILE);
  const metadata = parseJsonFile(path.join(artifact, REVISION_METADATA_FILE), REVISION_METADATA_FILE);
  if (manifest.schema !== ARTIFACT_SCHEMA || metadata.schema !== ARTIFACT_SCHEMA) {
    fail("release metadata schema does not match the supported artifact schema");
  }
  if (manifest.git_sha !== revision || metadata.git_sha !== revision) {
    fail("release revision metadata does not bind to REVISION");
  }
  if (metadata.build_config_sha256 !== manifest.build_config?.sha256) {
    fail("revision metadata build configuration digest does not match the release manifest");
  }
  if (options["require-production-config"]) {
    validateProductionConfig(process.env, revision);
    const expectedBuildConfig = buildConfigSnapshot(process.env);
    if (manifest.build_config?.sha256 !== expectedBuildConfig.sha256) {
      fail("release build configuration is incompatible with the required production configuration");
    }
  }
  if (metadata.release_manifest_sha256 !== sha256(readFileSync(path.join(artifact, MANIFEST_FILE)))) {
    fail("revision metadata release manifest digest does not match");
  }

  const actualProtected = entries
    .filter((entry) => entry.path !== CHECKSUM_FILE)
    .map(({ path: entryPath, type }) => ({ path: entryPath, type }))
    .sort((left, right) => left.path.localeCompare(right.path));
  if (canonicalJson(manifest.protected_paths) !== canonicalJson(actualProtected)) {
    fail("release manifest protected path set does not match the artifact");
  }

  const checksumLines = readFileSync(path.join(artifact, CHECKSUM_FILE), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);
  const expectedPaths = new Set(actualProtected.map((entry) => entry.path));
  const observedPaths = new Set();
  for (const line of checksumLines) {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    if (!match || match[2] === CHECKSUM_FILE || observedPaths.has(match[2])) {
      fail(`malformed or duplicate SHA256SUMS entry: ${line}`);
    }
    const entry = entryByPath.get(match[2]);
    if (!entry || digestEntry(entry) !== match[1]) {
      fail(`SHA256 verification failed: ${match[2]}`);
    }
    observedPaths.add(match[2]);
  }
  if (
    observedPaths.size !== expectedPaths.size ||
    [...expectedPaths].some((entryPath) => !observedPaths.has(entryPath))
  ) {
    fail("SHA256SUMS does not cover the exact protected path set");
  }

  console.log(`Verified immutable standalone release: ${artifact} (${observedPaths.size} protected entries)`);
}

try {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === "package") {
    packageRelease(options);
  } else if (command === "verify") {
    verifyRelease(options);
  } else {
    fail("usage: standalone-release.mjs <package|verify> [--key=value]");
  }
} catch (error) {
  console.error(`standalone release error: ${error.message}`);
  process.exit(1);
}
