import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";

const avatarPrefix = "/images/global-history/";
const poster = "/og/fun/global-history-quiz";
const dynamicProbe = "/og/fun/fap-load-probe";
const home = "/";
const article = "/zh/tests/explore/global-history-quiz/results/wu-zetian";
const career = "/zh/career";

function runUpstream(portFile) {
  const hits = { avatars: 0, historicalPosters: 0, dynamicActive: 0, dynamicPeak: 0 };
  const server = http.createServer((req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    if (path === "/_fixture_counts") {
      res.end(JSON.stringify(hits));
      return;
    }
    if (path.startsWith(avatarPrefix)) hits.avatars++;
    if (path === poster) hits.historicalPosters++;
    if (path === dynamicProbe) {
      hits.dynamicActive++;
      hits.dynamicPeak = Math.max(hits.dynamicPeak, hits.dynamicActive);
      setTimeout(() => {
        hits.dynamicActive--;
        res.end("dynamic fixture");
      }, 600);
      return;
    }
    const upstream = http.get({
      hostname: "127.0.0.1", port: 3000, path: req.url,
      headers: { host: "staging.fermatmind.com", "user-agent": req.headers["user-agent"] ?? "history-ingress-smoke", "x-forwarded-proto": "https" },
    }, (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    });
    upstream.on("error", () => { res.writeHead(502); res.end(); });
  });
  server.listen(0, "127.0.0.1", () => writeFileSync(portFile, String(server.address().port)));
}

async function runProbe(port, certificate, upstream, version, phase) {
  const ca = readFileSync(certificate);
  const agent = new https.Agent({ keepAlive: true, maxSockets: 96, ca });
  function get(path, { address, userAgent } = {}) {
    return new Promise((resolve, reject) => {
      const request = https.get({
        hostname: "127.0.0.1", servername: "fermatmind.com", port, path,
        headers: { host: "fermatmind.com", "user-agent": userAgent ?? "history-ingress-smoke" },
        ca, agent: address ? false : agent, localAddress: address, timeout: 12000,
      }, (response) => {
        response.resume();
        response.on("end", () => resolve({ status: response.statusCode, headers: response.headers }));
        response.on("error", reject);
      });
      request.on("timeout", () => request.destroy(new Error(`timed out: ${path}`)));
      request.on("error", reject);
    });
  }

  const bare = await get(`${avatarPrefix}wu-zetian.jpg`);
  assert.equal(bare.status, 200);
  assert.equal(bare.headers["cache-control"], "public, max-age=86400");
  assert.equal(bare.headers["access-control-allow-origin"], "*");
  const versioned = await get(`${avatarPrefix}${version}/wu-zetian.jpg`);
  assert.equal(versioned.status, 200);
  assert.equal(versioned.headers["cache-control"], "public, max-age=31536000, immutable");
  const missing = await get(`${avatarPrefix}missing.jpg`);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers["cache-control"], "no-store");
  if (phase === "final") {
    for (const query of ["", "&format=poster", "&download=1", "&format=poster&download=1"]) {
      const preview = await get(`${poster}?locale=zh-TW&portrait=wu-zetian${query}`);
      assert.equal(preview.status, 200);
      assert.equal(preview.headers["content-type"], "image/jpeg");
      assert.equal(preview.headers["x-robots-tag"], "noindex, nofollow, noarchive, nocache");
      assert.equal(preview.headers["content-disposition"], undefined);
    }
    assert.equal((await get(`${poster}?portrait=../wu-zetian`)).status, 404);
    assert.equal((await get(poster)).status, 404);
  } else {
    const originalPoster = await get(`${poster}?locale=en&portrait=wu-zetian&format=poster&download=1`);
    assert.equal(originalPoster.status, 200);
    assert.equal(originalPoster.headers["content-type"], "image/png");
  }

  const files = readdirSync("public/images/global-history").filter((name) => /^[a-z0-9][a-z0-9-]*[.]jpg$/.test(name)).sort();
  assert(files.length >= 364);
  const portraits = files.slice(0, 364);
  const labels = ["Googlebot", "PerplexityBot"];
  const html = [home, article, career];
  let htmlOk = 0;
  async function verifyHtml() {
    for (const userAgent of labels) {
      const results = await Promise.all(html.map((url) => get(url, { userAgent })));
      for (const result of results) assert.equal(result.status, 200);
      htmlOk += results.length;
    }
  }

  const perIP = Promise.all(Array.from({ length: 40 }, () => get(dynamicProbe, { address: "127.0.0.200" })));
  const distributed = Promise.all(Array.from({ length: 40 }, (_, i) => get(dynamicProbe, { address: `127.0.0.${i + 10}` })));
  const isolatedHtml = verifyHtml();
  const assets = Array.from({ length: phase === "final" ? 4415 : 3903 }, (_, i) => i < 3903
    ? `${avatarPrefix}${portraits[i % 364]}`
    : `${poster}?locale=en&portrait=${portraits[i % 186].slice(0, -4)}&format=poster&download=1`);
  for (let i = 0; i < assets.length; i += 96) {
    const burst = await Promise.all(assets.slice(i, i + 96).map((path) => get(path)));
    for (const [index, result] of burst.entries()) assert.equal(result.status, 200, assets[i + index]);
    if (i % 960 === 0) await verifyHtml();
  }
  await isolatedHtml;
  const rejectedLocal = (await perIP).filter(({ status }) => status === 429).length;
  const rejectedDistributed = (await distributed).filter(({ status }) => status === 429).length;
  const counts = await (await fetch(`http://127.0.0.1:${upstream}/_fixture_counts`)).json();
  assert(rejectedLocal > 0 && rejectedDistributed > 0);
  assert(counts.dynamicPeak > 0 && counts.dynamicPeak <= 16);
  assert.equal(counts.avatars, 0);
  assert.equal(counts.historicalPosters, phase === "final" ? 0 : 1);
  agent.destroy();
  console.log(JSON.stringify({
    phase, avatarRequests: 3903, avatarsToNext: counts.avatars, posterRequests: phase === "final" ? 512 : 1,
    postersToNext: counts.historicalPosters, html200: htmlOk, html504: 0,
    rejectedLocal, rejectedDistributed, peakDynamicUpstream: counts.dynamicPeak,
  }));
}

const [mode, ...args] = process.argv.slice(2);
if (mode === "upstream") runUpstream(args[0]);
else if (mode === "probe") await runProbe(...args);
else throw new Error("Unknown test mode");
