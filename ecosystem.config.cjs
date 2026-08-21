/* eslint-disable @typescript-eslint/no-require-imports */
const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");

function resolveDefaultInstances() {
  if (typeof os.availableParallelism === "function") {
    return Math.max(2, os.availableParallelism());
  }

  const cpuCount = Array.isArray(os.cpus()) ? os.cpus().length : 2;
  return Math.max(2, cpuCount);
}

const parsedInstances = Number.parseInt(process.env.PM2_INSTANCES ?? "", 10);
const APP_INSTANCES = Number.isFinite(parsedInstances) ? Math.max(2, parsedInstances) : resolveDefaultInstances();
const APP_DIR = process.env.APP_DIR || "/opt/apps/fap-web";
const ACTIVE_SCRIPT = path.join(APP_DIR, ".next/standalone/server.js");
const IMMUTABLE_SCRIPT = fs.existsSync(ACTIVE_SCRIPT) ? fs.realpathSync(ACTIVE_SCRIPT) : ACTIVE_SCRIPT;

module.exports = {
  apps: [
    {
      name: "fap-web",
      script: IMMUTABLE_SCRIPT,
      cwd: APP_DIR,
      // Expected to resolve to Node 24.x; deploy_web_pm2.sh enforces this preflight.
      interpreter: "/usr/bin/node",
      exec_mode: "cluster",
      instances: APP_INSTANCES,
      env: {
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
