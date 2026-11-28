import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { extname } from "node:path";
import { parseArgs } from "node:util";

const comparisonUrl = new URL("../../lib/career/modularComparison.ts", import.meta.url);
const registryUrl = new URL("./modularComparisons/", comparisonUrl);
// Node 24 strips types. Resolve the registry's relative TS imports as Next's bundler does.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.startsWith(registryUrl.href) && specifier.startsWith(".") && !extname(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === comparisonUrl.href || (url.startsWith(registryUrl.href) && url.endsWith(".ts"))) {
      return nextLoad(url, { ...context, format: "module-typescript" });
    }
    return nextLoad(url, context);
  },
});

const [
  { listModularComparisonSpecs },
  { buildModularComparisonView, pruneModularComparisonSpec, resolveEffectiveModularPluginFlags, resolveModularPluginFlags },
] = await Promise.all([
  import(new URL("index.ts", registryUrl)),
  import(comparisonUrl),
]).finally(() => hooks.deregister());

const pluginKeys = ["ai", "thirtyDay"];
const presets = [
  ["none", { ai: false, thirtyDay: false }],
  ["ai", { ai: true, thirtyDay: false }],
  ["30day", { ai: false, thirtyDay: true }],
  ["all", { ai: true, thirtyDay: true }],
];
const coreSections = ["topology", "matrix", "incident", "certs", "checklist", "trial", "tools", "faq"];
const samplePair = "information-security-analysts-vs-information-security-engineers";

function assertUnique(items, label) {
  const ids = items.map(({ id }) => id);
  assert(ids.every((id) => typeof id === "string" && id.trim()), `${label}: missing ID`);
  assert.equal(new Set(ids).size, ids.length, `${label}: duplicate ID`);
}

function assertLinks(spec, label) {
  const external = [
    spec.matrix.hybridRoleNote,
    ...spec.payAndCerts.certs.flatMap(({ officialLinks }) => officialLinks ?? []),
    ...spec.desktopExercise.publicLinks,
    ...spec.sourceGroups.flatMap(({ links }) => links),
    ...(spec.aiPlugin?.evidenceRecords ?? []),
  ].filter(Boolean);
  for (const { href } of external) {
    const url = URL.canParse(href) ? new URL(href) : null;
    assert(href.startsWith("https://") && !/[\s\\]/.test(href) && url?.hostname && !url.username && !url.password,
      `${label}: invalid HTTPS link ${href}`);
  }

  for (const { href } of [...spec.tools.cards, ...spec.tools.profileLinks]) {
    assert(/^\/(?!\/)/.test(href) && !/[\s\\]/.test(href), `${label}: invalid site path ${href}`);
  }
}

function fingerprints(spec, key) {
  const scoped = [...spec.faqs, ...spec.sourceGroups].filter(({ requiresPlugin }) => requiresPlugin === key);
  if (key === "ai") {
    return [
      '"aiPlugin":',
      "deliverableWhenAiEnabled",
      ...scoped.map(({ id }) => id),
      spec.aiPlugin?.title,
      ...(spec.aiPlugin?.evidenceRecords.map(({ href }) => href) ?? []),
      ...(spec.pairId === samplePair && spec.locale === "zh" ? ["arXiv:2411", "CSI_MCP_SECURITY", "faq-ai-boundary", "src-ai"] : []),
    ].filter(Boolean);
  }
  return [
    '"thirtyDayPlugin":',
    "sec-30days",
    ...scoped.map(({ id }) => id),
    spec.thirtyDayPlugin?.title,
    ...(spec.pairId === samplePair && spec.locale === "zh" ? ["轨道 A", "轨道 B", "30 天", "30天"] : []),
  ].filter(Boolean);
}

function assertNoLeaks(content, spec, flags, label) {
  for (const key of pluginKeys) {
    if (flags[key]) continue;
    for (const marker of fingerprints(spec, key)) {
      assert(!content.includes(marker), `${label}: disabled ${key} leaked ${marker}`);
    }
  }
}

function verifyStatic(specs) {
  const forbidden = ["cveId", "NGINX", "CVE-2024", "error.log", "access.log",
    "skill-analyst", "cond-engineer", "skill-engineer", "cond-analyst", "安全分析师", "安全工程师"];
  for (const path of ["../../lib/career/modularComparison.ts", "../../components/career/ModularCareerComparison.tsx"]) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    for (const marker of forbidden) assert(!source.includes(marker), `${path}: shared-layer literal ${marker}`);
  }

  assert(specs.length > 0, "Modular comparison registry is empty");
  assertUnique(specs.map(({ locale, pairId }) => ({ id: `${locale}/${pairId}` })), "registry");
  for (const spec of specs) {
    const label = `${spec.locale}/${spec.pairId}`;
    assertUnique(spec.faqs, `${label}: FAQ`);
    assertUnique(spec.sourceGroups, `${label}: source group`);
    assertUnique(spec.matrix.rows, `${label}: matrix`);
    assertUnique([...spec.checklist.skillsOptions, ...spec.checklist.conditionsOptions], `${label}: checklist`);
    assertLinks(spec, label);

    const variants = [
      ["registered", spec],
      ["both omitted", { ...spec, aiPlugin: undefined, thirtyDayPlugin: undefined }],
      ["AI omitted", { ...spec, aiPlugin: undefined }],
      ["30-day omitted", { ...spec, thirtyDayPlugin: undefined }],
    ];
    for (const [variant, input] of variants) {
      for (const [preset, requested] of presets) {
        const context = `${label} ${variant}/${preset}`;
        const expectedFlags = {
          ai: requested.ai && Boolean(input.aiPlugin),
          thirtyDay: requested.thirtyDay && Boolean(input.thirtyDayPlugin),
        };
        assert.deepEqual(resolveModularPluginFlags(input.defaultPlugins, preset), requested, context);
        assert.deepEqual(resolveEffectiveModularPluginFlags(input, requested), expectedFlags, context);

        const pruned = pruneModularComparisonSpec(input, requested);
        const originalView = buildModularComparisonView(input, requested);
        const prunedView = buildModularComparisonView(pruned, requested);
        assert.deepEqual(prunedView, originalView, `${context}: view after pruning`);
        assert.deepEqual(prunedView.flags, expectedFlags, context);
        assert.equal(Object.hasOwn(pruned, "aiPlugin"), expectedFlags.ai, context);
        assert.equal(Object.hasOwn(pruned, "thirtyDayPlugin"), expectedFlags.thirtyDay, context);
        assert.deepEqual(prunedView.sections.filter(({ isPlugin }) => !isPlugin).map(({ key }) => key),
          coreSections, `${context}: core sections`);
        assert.deepEqual(prunedView.sections.filter(({ isPlugin }) => isPlugin).map(({ key }) => key),
          pluginKeys.filter((key) => expectedFlags[key]), `${context}: optional sections`);
        assertUnique(prunedView.sections, `${context}: section`);

        const included = ({ requiresPlugin }) => !requiresPlugin || expectedFlags[requiresPlugin];
        assert.deepEqual(prunedView.faqs, spec.faqs.filter(included), `${context}: FAQ`);
        assert.deepEqual(prunedView.sourceGroups, spec.sourceGroups.filter(included), `${context}: source group`);
        assertNoLeaks(JSON.stringify(pruned), spec, expectedFlags, context);
      }
    }
    console.log(`PASS static ${label}: 4 presets × 4 availability cases, unique IDs and valid links`);
  }
}

function readPageScripts(html) {
  const types = new Set();
  const chunks = [];
  function collectTypes(value) {
    if (!value || typeof value !== "object") return;
    if (value["@type"]) {
      for (const type of [value["@type"]].flat()) types.add(type);
    }
    for (const child of Object.values(value)) collectTypes(child);
  }

  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json(?=\s|$))/i.test(attributes)) {
      collectTypes(JSON.parse(body));
    }
    const push = /^\s*self\.__next_f\.push\((\[[\s\S]*\])\)\s*;?\s*$/.exec(body);
    if (push) {
      const [channel, text] = JSON.parse(push[1]);
      if (channel === 1 && typeof text === "string") chunks.push(text);
    }
  }
  return { types, inlineFlight: chunks.join("") };
}

function assertFlight(content, spec, flags, label) {
  assert(content.includes(`"pairId":${JSON.stringify(spec.pairId)}`), `${label}: missing serialized spec`);
  const matches = Array.from(content.matchAll(/"pluginFlags":(\{[^{}]*\})/g));
  assert(matches.length > 0, `${label}: missing serialized plugin flags`);
  for (const [, serialized] of matches) assert.deepEqual(JSON.parse(serialized), flags, label);
  assertNoLeaks(content, spec, flags, label);
}

async function get(url, kind, headers) {
  const response = await fetch(url, { headers, redirect: "manual", signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, 200, `${kind} ${url}`);
  const contentType = kind === "RSC" ? "text/x-component" : "text/html";
  assert(response.headers.get("content-type")?.startsWith(contentType), `${kind} ${url}: expected ${contentType}`);
  return response.text();
}

async function verifyHttp(spec, baseUrl) {
  const base = new URL(baseUrl);
  assert(
    base.protocol === "http:" && ["127.0.0.1", "[::1]"].includes(base.hostname) &&
    !base.username && !base.password && base.pathname === "/" && !base.search && !base.hash,
    "--base-url must be a loopback HTTP origin"
  );

  for (const [preset, requested] of [[undefined, spec.defaultPlugins], ...presets]) {
    const url = new URL(`/${spec.locale}/career-compare/${encodeURIComponent(spec.pairId)}`, base);
    if (preset !== undefined) url.searchParams.set("plugins", preset);
    const label = preset ?? "default";
    const flags = resolveEffectiveModularPluginFlags(spec, requested);
    const expectedTag = `${flags.ai ? "ai" : "no-ai"}_${flags.thirtyDay ? "30day" : "no-30day"}`;
    const html = await get(url, "HTML");
    const main = html.match(/<main\b[^>]*\bdata-modular-comparison="v5\.0"[^>]*>/)?.[0];
    assert(main, `${label}: missing v5.0 main`);
    assert.equal(/\bdata-modular-plugins="([^"]+)"/.exec(main)?.[1], expectedTag, label);

    const { types, inlineFlight } = readPageScripts(html);
    assert(types.has("BreadcrumbList") && types.has("Article") && !types.has("FAQPage"), `${label}: JSON-LD types`);
    assertNoLeaks(html, spec, flags, `${label} raw HTML`);
    assertFlight(inlineFlight, spec, flags, `${label} inline Flight`);

    url.searchParams.set("_rsc", "");
    const rawFlight = await get(url, "RSC", { RSC: "1" });
    assertFlight(rawFlight, spec, flags, `${label} standalone Flight`);

    if (spec.pairId === samplePair && spec.locale === "zh") {
      for (const [source, body] of [["HTML", html], ["inline Flight", inlineFlight], ["RSC", rawFlight]]) {
        assert(body.includes("CVE-2024-24989") && body.includes("NGINX 1.25.3"), `${label} ${source}: missing exercise facts`);
        assert(!/1\.25\.0[–-]1\.25\.3/.test(body), `${label} ${source}: mixed affected version range`);
      }
    }
    console.log(`PASS HTTP/RSC ${label}: ${expectedTag}, BreadcrumbList + Article, no disabled plugin payload`);
  }
}

try {
  const { values } = parseArgs({
    options: {
      static: { type: "boolean" },
      "base-url": { type: "string" },
      locale: { type: "string" },
      pair: { type: "string" },
    },
  });
  const specs = listModularComparisonSpecs();
  if (values["base-url"] !== undefined) {
    assert(!values.static && values.locale && values.pair, "Use --base-url <loopback> --locale <locale> --pair <pair>");
    const spec = specs.find(({ locale, pairId }) => locale === values.locale && pairId === values.pair);
    assert(spec, `Unregistered comparison: ${values.locale}/${values.pair}`);
    await verifyHttp(spec, values["base-url"]);
  } else {
    assert(values.locale === undefined && values.pair === undefined, "--locale and --pair require --base-url");
    verifyStatic(specs);
  }
} catch (error) {
  console.error("FAIL:", error.message);
  process.exitCode = 1;
}
