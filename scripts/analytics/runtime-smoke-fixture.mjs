#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import process from "node:process";

function parsePort(argv) {
  const index = argv.indexOf("--port");
  const value = index === -1 ? "4173" : argv[index + 1];
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("--port must be an integer between 1 and 65535");
  }
  return port;
}

function publicHtml(nonce) {
  return `<!doctype html>
<html lang="zh">
  <head><meta charset="utf-8"><title>Analytics runtime smoke fixture</title></head>
  <body>
    <div data-cookie-banner="true">
      <button type="button" data-testid="cookie-banner-accept">接受</button>
    </div>
    <script id="fm-analytics-bootstrap" data-analytics-bootstrap="true" nonce="${nonce}">
      (function () {
        var scriptNonce = document.currentScript?.nonce || "";
        function loadProviders(event) {
          if (event?.detail?.analytics !== "granted") return;
          function load(id, src) {
            if (document.getElementById(id)) return;
            var script = document.createElement("script");
            script.id = id;
            script.async = true;
            script.src = src;
            script.nonce = scriptNonce;
            document.head.appendChild(script);
          }
          load("fm-google-tag-script", "https://www.googletagmanager.com/gtag/js?id=G-SYNTHETIC1");
          load("fm-baidu-tongji-script", "https://hm.baidu.com/hm.js?0000000000000000");
        }
        window.addEventListener("fm:analytics-consent-updated", loadProviders);
      })();
    </script>
    <script nonce="${nonce}">
      (function () {
        function trackLandingPageview(event) {
          if (event?.detail?.analytics !== "granted") return;
          var marker = "fm_landing_pv_sent_v1:" + window.location.pathname + window.location.search;
          if (window.sessionStorage.getItem(marker) === "1") return;
          window.sessionStorage.setItem(marker, "1");
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventName: "landing_pv", path: window.location.pathname })
          }).catch(function () {});
        }
        window.addEventListener("fm:analytics-consent-updated", trackLandingPageview);
      })();
    </script>
    <script nonce="${nonce}">
      document.querySelector('[data-testid="cookie-banner-accept"]').addEventListener("click", function () {
        var detail = { analytics: "granted" };
        window.localStorage.setItem("fm_consent_v1", JSON.stringify({
          analytics: detail.analytics,
          updatedAt: new Date().toISOString()
        }));
        document.querySelector('[data-cookie-banner="true"]').remove();
        window.dispatchEvent(new CustomEvent("fm:analytics-consent-updated", { detail: detail }));
      });
    </script>
  </body>
</html>`;
}

const port = parsePort(process.argv.slice(2));
const server = createServer((request, response) => {
  const nonce = randomBytes(18).toString("base64url");
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://hm.baidu.com`,
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");
  response.setHeader("Content-Security-Policy", policy);
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "private, no-store");

  if (request.url?.startsWith("/zh/result/")) {
    response.end("<!doctype html><html><body><main>Private synthetic fixture</main></body></html>");
    return;
  }

  response.end(publicHtml(nonce));
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`analytics-runtime-smoke-fixture-ready http://127.0.0.1:${port}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
