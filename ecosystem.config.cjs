/* eslint-disable @typescript-eslint/no-require-imports */
const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");

// Private runtime settings follow the active release, including an LKG switch.
const runtimeKeys = ["CONTENT_RELEASE_REVALIDATE_SECRET", "CONTENT_RELEASE_REVALIDATE_REDIS_URL", "CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN"];
const runtimeEnv = Object.fromEntries(runtimeKeys.map(key => [key, ""]));
const runtimeFile = path.join(__dirname, ".next/standalone/.content-release-runtime.json");
if (fs.existsSync(runtimeFile)) {
  const stat = fs.lstatSync(runtimeFile);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 || stat.size > 32768) throw new Error("Unsafe content release runtime configuration");
  const values = JSON.parse(fs.readFileSync(runtimeFile, "utf8"));
  if (Object.keys(values).length !== runtimeKeys.length || runtimeKeys.some(key => typeof values[key] !== "string" || !values[key])) throw new Error("Invalid content release runtime configuration");
  for (const key of runtimeKeys) runtimeEnv[key] = values[key];
}

// Tracking remains disabled for old releases. Never retain a newer token on LKG.
const trackingKeys = ["TRACK_INGEST_TOKEN", "TRACK_INGEST_API_ORIGIN"];
const trackingEnv = Object.fromEntries(trackingKeys.map(key => [key, ""]));
const trackingFile = path.join(__dirname, ".next/standalone/.tracking-runtime.json");
if (fs.existsSync(trackingFile)) {
  try {
    const stat = fs.lstatSync(trackingFile);
    if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 || stat.uid !== process.getuid() || stat.size > 16384) throw new Error("Unsafe tracking runtime configuration");
    const values = JSON.parse(fs.readFileSync(trackingFile, "utf8"));
    if (Object.keys(values).length !== trackingKeys.length || typeof values.TRACK_INGEST_TOKEN !== "string"
      || values.TRACK_INGEST_TOKEN.length < 32 || values.TRACK_INGEST_TOKEN.length > 8192 || !/^[A-Za-z0-9_-]+$/.test(values.TRACK_INGEST_TOKEN)
      || !["https://api.fermatmind.com", "https://staging-api.fermatmind.com"].includes(values.TRACK_INGEST_API_ORIGIN)) throw new Error("Invalid tracking runtime configuration");
    for (const key of trackingKeys) trackingEnv[key] = values[key];
  } catch {
    throw new Error("Invalid or unsafe tracking runtime configuration");
  }
}

function resolveDefaultInstances() {
  if (typeof os.availableParallelism === "function") {
    return Math.max(2, os.availableParallelism());
  }

  const cpuCount = Array.isArray(os.cpus()) ? os.cpus().length : 2;
  return Math.max(2, cpuCount);
}

const parsedInstances = Number.parseInt(process.env.PM2_INSTANCES ?? "", 10);
const APP_INSTANCES = Number.isFinite(parsedInstances) ? Math.max(2, parsedInstances) : resolveDefaultInstances();

module.exports = {
  apps: [
    {
      name: "fap-web",
      script: ".next/standalone/server.js",
      cwd: "/opt/apps/fap-web",
      // Expected to resolve to Node 24.x; deploy_web_pm2.sh enforces this preflight.
      interpreter: "/usr/bin/node",
      exec_mode: "cluster",
      instances: APP_INSTANCES,
      env: {
        ...runtimeEnv,
        ...trackingEnv,
        NODE_ENV: "production",
        PORT: "3000",
      },
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
