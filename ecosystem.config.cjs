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
