module.exports = {
  apps: [
    {
      name: "fap-web",
      script: ".next/standalone/server.js",
      cwd: "/opt/apps/fap-web",
      interpreter: "/usr/bin/node",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
        PORT: "3000",
      },
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
