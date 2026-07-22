#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  if (argv.length !== 2 || argv[0] !== "--config" || !argv[1]) {
    throw new Error("Usage: validate-web-public-ingress-config.mjs --config <path>");
  }
  return path.resolve(argv[1]);
}

function stripComments(source) {
  return source.replace(/#[^\n]*/g, "");
}

function extractBlocks(source, directive) {
  const blocks = [];
  const matcher = new RegExp(`(^|\\n)\\s*${directive}\\s+([^\\n{;]+)?\\s*\\{`, "g");
  for (const match of source.matchAll(matcher)) {
    const open = source.indexOf("{", match.index);
    let depth = 1;
    let index = open + 1;
    for (; index < source.length && depth > 0; index += 1) {
      if (source[index] === "{") depth += 1;
      if (source[index] === "}") depth -= 1;
    }
    if (depth !== 0) throw new Error(`unclosed ${directive} block`);
    blocks.push({
      argument: (match[2] || "").trim(),
      body: source.slice(open + 1, index - 1),
    });
  }
  return blocks;
}

function fail(message) {
  process.stderr.write(`web-public-ingress config invalid: ${message}\n`);
  process.exitCode = 1;
}

async function main() {
  const configPath = parseArgs(process.argv.slice(2));
  const source = stripComments(await readFile(configPath, "utf8"));
  const servers = extractBlocks(source, "server");
  const httpsServers = servers.filter(({ body }) => (
    [...body.matchAll(/\blisten\s+([^;]+);/g)].some(([, value]) => {
      const tokens = value.trim().split(/\s+/);
      const endpoint = tokens[0] || "";
      return /^(?:(?:[^:\s]+|\[[^\]]+\]):)?443$/.test(endpoint) && tokens.includes("ssl");
    })
  ));
  const publicHttpsServers = httpsServers.filter(({ body }) => (
    /\bserver_name\s+[^;]*\bfermatmind\.com\b[^;]*;/.test(body)
  ));
  const locations = servers.flatMap(({ body }) => extractBlocks(body, "location"));
  const publicHttpsLocations = publicHttpsServers.flatMap(({ body }) => extractBlocks(body, "location"));
  const cachedLocations = locations.filter(({ body }) => /\bproxy_cache\s+(?!off\b)[^;]+;/.test(body));
  const cachedArguments = new Set(cachedLocations.map(({ argument }) => argument.replace(/\s+/g, " ")));
  const generic = publicHttpsLocations.find(({ argument }) => argument.replace(/\s+/g, " ") === "/");
  const failures = [];

  if (servers.length !== 2) failures.push("candidate must contain exactly one HTTP and one HTTPS server block");
  if (publicHttpsServers.length !== 1) failures.push("candidate must contain exactly one public HTTPS vhost");
  if (cachedLocations.length !== 2) failures.push("only two explicit static proxy locations may cache");
  for (const argument of cachedArguments) {
    if (argument !== "^~ /_next/static/" && argument !== "= /favicon.ico") {
      failures.push(`proxy cache is forbidden outside the static allowlist: ${argument}`);
    }
  }
  if (!generic) failures.push("generic non-static location is missing");
  if (generic && !/\bproxy_cache\s+off\s*;/.test(generic.body)) failures.push("generic location must disable proxy_cache");
  if (generic && !/\bproxy_no_cache\s+1\s*;/.test(generic.body)) failures.push("generic location must set proxy_no_cache 1");
  if (generic && !/\bproxy_cache_bypass\s+1\s*;/.test(generic.body)) failures.push("generic location must set proxy_cache_bypass 1");
  if (generic && /\bproxy_(?:ignore_headers|hide_header)\b/.test(generic.body)) {
    failures.push("generic location must preserve upstream cache headers");
  }
  if (/\bs-maxage\s*=/.test(source)) failures.push("forced shared-cache s-maxage is forbidden");
  if (/\badd_header\s+Cache-Control\s+[^;]*(?:\bpublic\b|\bs-maxage\b)/.test(generic?.body || "")) {
    failures.push("generic location must not force public cache headers");
  }

  if (failures.length > 0) {
    failures.forEach(fail);
    return;
  }
  process.stdout.write("web-public-ingress config valid\n");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
