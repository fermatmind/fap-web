#!/usr/bin/env node

import { readFileSync } from "node:fs";

export const CATEGORIES = [
  "docs_rules_tests_only",
  "application_ui",
  "content_adapter_contract",
  "ingress_runtime_config",
  "deployment_infrastructure",
];

const normalize = (path) => path.replace(/^\.\//, "").replaceAll("\\", "/");
const matches = (path, expressions) => expressions.some((expression) => expression.test(path));

export function classifyPaths(inputPaths) {
  const paths = [...new Set(inputPaths.map(normalize).filter(Boolean))].sort();
  if (paths.length === 0) throw new Error("changed path set must not be empty");
  const flags = Object.fromEntries(CATEGORIES.map((category) => [category, false]));
  const reasons = Object.fromEntries(CATEGORIES.map((category) => [category, []]));
  let testsChanged = false;

  for (const path of paths) {
    const selected = [];
    // Generated inventories are verified by CI; their referenced runtime paths
    // determine deployment independently in the same changed-path union.
    const docsOnly = matches(path, [
      /(^|\/)AGENTS\.md$/,
      /(^|\/)README(?:\.[^/]+)?$/,
      /^(?:docs|\.agents)\//,
      /^\.github\/trunk\/classify-paths(?:\.test)?\.mjs$/,
      /^playwright\.config\.ts$/,
      /^(?:tests?|__tests__)\//,
      /(^|\/)__tests__\//,
      /\.test\.[cm]?[jt]sx?$/,
      /(?:^|\/)(?:test_[^/]+|[^/]+_test)\.(?:py|sh)$/,
    ]);
    const testPath = matches(path, [
      /^(?:tests?|__tests__)\//,
      /(^|\/)__tests__\//,
      /\.test\.[cm]?[jt]sx?$/,
      /(?:^|\/)(?:test_[^/]+|[^/]+_test)\.(?:py|sh)$/,
    ]);
    testsChanged ||= testPath;
    if (docsOnly) {
      selected.push("docs_rules_tests_only");
      flags.docs_rules_tests_only = true;
      reasons.docs_rules_tests_only.push(path);
      continue;
    }
    if (matches(path, [
      /^(?:app|components|lib|hooks|styles|public)\//,
      /^(?:next\.config\.[cm]?[jt]s|middleware\.[cm]?[jt]s|package\.json|pnpm-lock\.yaml)$/,
    ])) selected.push("application_ui");
    if (matches(path, [
      /(?:content|cms|adapter|contract|schema|authority)/i,
      /^tests\/contracts\//,
      /^lib\/career\/displaySurface\.ts$/,
    ])) selected.push("content_adapter_contract");
    if (matches(path, [
      /^deploy\/openresty\//,
      /^lib\/tracking\/serverRuntime\.ts$/,
      /(?:openresty|nginx|ingress|runtime-config|ecosystem\.config)/i,
    ])) selected.push("ingress_runtime_config");
    if (matches(path, [
      /^\.github\//,
      /^(?:deploy|infrastructure|infra)\//,
      /^scripts\/(?:deploy|ops|release)\//,
      /^scripts\/(?:deploy_web_pm2|install_standalone_release)\.sh$/,
      /(?:Dockerfile|docker-compose|deployment)/i,
    ])) selected.push("deployment_infrastructure");
    if (selected.length === 0) selected.push("application_ui");

    for (const category of selected) {
      flags[category] = true;
      reasons[category].push(path);
    }
  }

  const categories = CATEGORIES.filter((category) => flags[category]);
  return {
    schema_version: "fermatmind.trunk-path-classification.v1",
    paths,
    categories,
    mixed: categories.length > 1,
    deploy: categories.some((category) => category !== "docs_rules_tests_only"),
    tests_changed: testsChanged,
    // CodeQL extracts JS/TS (including tools/tests and embedded frontend code).
    // Dependency and workflow/config changes can alter extraction or analysis.
    codeql_required: paths.some((path) => /\.(?:[cm]?[jt]sx?|html?|vue|svelte|json)$/.test(path)
      || /^\.github\/(?:workflows|codeql)\//.test(path)
      || /^(?:pnpm-lock\.yaml|yarn\.lock)$/.test(path)),
    flags,
    reasons,
  };
}

function cli() {
  const input = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  process.stdout.write(`${JSON.stringify(classifyPaths(input.split(/\0|\r?\n/)), null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) cli();
