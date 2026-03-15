const parsedInstances = Number.parseInt(process.env.PM2_INSTANCES ?? "2", 10);
const APP_INSTANCES = Number.isFinite(parsedInstances) ? Math.max(2, parsedInstances) : 2;

module.exports = {
  apps: [
    {
      name: "fap-web",
      script: ".next/standalone/server.js",
      cwd: "/opt/apps/fap-web",
      // Expected to resolve to Node 20.x; deploy_web_pm2.sh enforces this preflight.
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
