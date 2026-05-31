#!/usr/bin/env node
import assert from 'node:assert/strict';

export const IQ_LAUNCH_SLUG = 'iq-test-intelligence-quotient-assessment';
export const IQ_CANONICAL_SCALE_CODES = ['IQ_INTELLIGENCE_QUOTIENT', 'IQ_RAVEN'];

export const IQ_FORBIDDEN_PUBLIC_FIELDS = [
  'answer_key',
  'answerKey',
  'correct_answer',
  'correctAnswer',
  'solution_rule',
  'solutionRule',
  'asset_hashes',
  'assetHashes',
  'generator_metadata',
  'generatorMetadata',
];

export const IQ_FORBIDDEN_COMMERCE_TERMS = [
  'checkout',
  'payment_intent',
  'price_id',
  'stripe',
  'unlock_sku',
  'purchase_required',
];

export const IQ_LAUNCH_SMOKE_PLAN = [
  {
    id: 'lookup',
    method: 'GET',
    path: `/api/v0.3/scales/lookup?slug=${IQ_LAUNCH_SLUG}&locale=en`,
    requiresAuth: false,
    validates: ['canonical_scale_identity', 'landing_surface_available', 'no_answer_key_leakage'],
  },
  {
    id: 'questions',
    method: 'GET',
    path: `/api/v0.3/assessments/questions?slug=${IQ_LAUNCH_SLUG}&locale=en`,
    requiresAuth: false,
    validates: ['structured_iq_assets_available', 'six_options', 'no_answer_key_leakage'],
  },
  {
    id: 'take_page',
    method: 'GET',
    path: `/en/tests/${IQ_LAUNCH_SLUG}/take`,
    requiresAuth: false,
    validates: ['x_robots_noindex', 'no_commerce_leakage', 'no_answer_key_leakage'],
  },
  {
    id: 'submit',
    method: 'POST',
    path: '/api/v0.3/attempts/{attempt_id}/submit',
    requiresAuth: true,
    validates: ['raw_score_only', 'no_answer_key_leakage', 'no_formal_iq_claim'],
  },
  {
    id: 'result',
    method: 'GET',
    path: '/api/v0.3/attempts/{attempt_id}/result',
    requiresAuth: true,
    validates: ['nullable_iq_estimate', 'nullable_percentile', 'no_answer_key_leakage', 'no_commerce_leakage'],
  },
  {
    id: 'report',
    method: 'GET',
    path: '/api/v0.3/attempts/{attempt_id}/report',
    requiresAuth: true,
    validates: ['nullable_iq_estimate', 'nullable_percentile', 'no_answer_key_leakage', 'commerce_unlock_absent'],
  },
  {
    id: 'canonical',
    method: 'GET',
    path: `/en/tests/${IQ_LAUNCH_SLUG}`,
    requiresAuth: false,
    validates: ['canonical_self_reference', 'safe_iq_claim_copy', 'no_software_application_schema'],
  },
  {
    id: 'private_noindex',
    method: 'GET',
    path: `/en/tests/${IQ_LAUNCH_SLUG}/take`,
    requiresAuth: false,
    validates: ['x_robots_noindex', 'robots_noindex'],
  },
  {
    id: 'answer_key_leakage',
    method: 'STATIC',
    path: 'public_payload_recursive_scan',
    requiresAuth: false,
    validates: ['forbidden_answer_key_fields_absent'],
  },
  {
    id: 'commerce_leakage',
    method: 'STATIC',
    path: 'public_payload_text_scan',
    requiresAuth: false,
    validates: ['checkout_payment_unlock_terms_absent'],
  },
];

export function assertSmokePlanComplete(plan = IQ_LAUNCH_SMOKE_PLAN) {
  const ids = new Set(plan.map((item) => item.id));
  for (const required of ['lookup', 'questions', 'take_page', 'submit', 'result', 'report', 'canonical', 'private_noindex', 'answer_key_leakage', 'commerce_leakage']) {
    assert.equal(ids.has(required), true, `missing IQ launch smoke item: ${required}`);
  }
}

export function collectForbiddenFieldPaths(payload, path = '$') {
  if (!payload || typeof payload !== 'object') return [];

  const paths = [];
  for (const [key, value] of Object.entries(payload)) {
    const currentPath = `${path}.${key}`;
    if (IQ_FORBIDDEN_PUBLIC_FIELDS.includes(key)) {
      paths.push(currentPath);
    }
    paths.push(...collectForbiddenFieldPaths(value, currentPath));
  }

  return paths;
}

export function assertNoAnswerKeyLeakage(payload) {
  const leaks = collectForbiddenFieldPaths(payload);
  assert.deepEqual(leaks, [], `IQ public payload leaked private fields: ${leaks.join(', ')}`);
}

export function assertNoCommerceLeakage(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const normalized = text.toLowerCase();
  const leaks = IQ_FORBIDDEN_COMMERCE_TERMS.filter((term) => normalized.includes(term));
  assert.deepEqual(leaks, [], `IQ public payload leaked commerce terms: ${leaks.join(', ')}`);
}

async function fetchText(baseUrl, path) {
  const response = await fetch(new URL(path, baseUrl));
  const text = await response.text();
  return { response, text };
}

export async function runReadOnlyLiveSmoke({ baseUrl }) {
  assertSmokePlanComplete();

  const publicReadChecks = IQ_LAUNCH_SMOKE_PLAN.filter((item) => item.method === 'GET' && !item.requiresAuth);
  const results = [];

  for (const item of publicReadChecks) {
    const { response, text } = await fetchText(baseUrl, item.path);
    assert.equal(response.ok, true, `${item.id} returned HTTP ${response.status}`);
    assertNoCommerceLeakage(text);
    if (item.validates.includes('x_robots_noindex')) {
      assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/i, `${item.id} must send X-Robots-Tag noindex`);
    }
    results.push({ id: item.id, status: response.status });
  }

  return { ok: true, checked: results };
}

async function main() {
  const baseUrlArg = process.argv.find((arg) => arg.startsWith('--base-url='));
  const baseUrl = baseUrlArg ? baseUrlArg.slice('--base-url='.length) : process.env.IQ_LIVE_BASE_URL;

  assertSmokePlanComplete();

  if (!baseUrl) {
    console.log(JSON.stringify({ ok: true, mode: 'plan-only', plan: IQ_LAUNCH_SMOKE_PLAN }, null, 2));
    return;
  }

  const result = await runReadOnlyLiveSmoke({ baseUrl });
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
