import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
const checks = [
  'language_naturalness', 'chinese_leakage', 'source_equivalence_identity', 'claim_boundary',
  'internal_link_equivalence', 'field_leakage', 'asset_media_duplication_omission', 'page_api_alignment_applicable',
] as const;
const aggregates = {
  language_naturalness: 'language_naturalness', chinese_leakage: 'chinese_leakage', claim_boundary: 'claim_boundary',
  asset_duplication: 'asset_media_duplication_omission', field_leakage: 'field_leakage', page_api_alignment: 'page_api_alignment_applicable',
} as const;
const root = join(process.cwd(), 'generated/en-content-parity/W9-independent-qa/W2-big-five/a41816a8-w9-review');
const snapshotRoot = join(process.cwd(), 'generated/en-content-parity/W9-independent-qa/W2-big-five/a41816a8-renderer-b1f7589c');
const readJson = (name: string) => JSON.parse(readFileSync(join(root, name), 'utf8'));

describe('W2 complete independent W9 QA', () => {
  it('covers every frozen row and derives its report verdict from the eight row checks', () => {
    const frozen = JSON.parse(readFileSync(join(snapshotRoot, 'frozen_source_ledger_identity_projection.json'), 'utf8'));
    const evidence = readJson('w2_118_row_review_evidence.json');
    const report = readJson('independent_qa_report.json');
    const manifest = readJson('qa_sha256_manifest.json');
    expect([evidence.package_sha256, report.package_sha256]).toEqual([
      'a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b',
      'a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b',
    ]);
    expect([evidence.reviewed_row_count, report.reviewed_row_count, evidence.row_reviews.length]).toEqual([118, 118, 118]);
    expect(Object.values(report.permissions)).toEqual(Array(7).fill(false));
    const expected = new Map(frozen.rows.map((row: { row_id: string; frozen_row_sha256: string }) => [row.row_id, row.frozen_row_sha256]));
    expect(new Set(evidence.row_reviews.map((row: { row_id: string }) => row.row_id)).size).toBe(118);
    for (const row of evidence.row_reviews) {
      expect(expected.get(row.row_id)).toBe(row.frozen_row_sha256);
      expect(row.source_identity).toBe(`${row.row_id}@${row.frozen_row_sha256}`);
      expect(Object.keys(row.checks).sort()).toEqual([...checks].sort());
      for (const check of checks) expect(['PASS', 'BLOCKED']).toContain(row.checks[check]);
      expect(row.verdict).toBe(checks.every((check) => row.checks[check] === 'PASS') ? 'PASS' : 'BLOCKED');
    }
    expect(Object.keys(report.checks).sort()).toEqual(Object.keys(aggregates).sort());
    for (const [aggregate, rowCheck] of Object.entries(aggregates)) {
      const expectedAggregate = evidence.row_reviews.every((row: { checks: Record<string, string> }) => row.checks[rowCheck] === 'PASS') ? 'PASS' : 'BLOCKED';
      expect(report.checks[aggregate]).toBe(expectedAggregate);
    }
    expect(report.aggregate_evidence).toEqual({
      package_integrity: '8/8 PASS', source_snapshot_integrity: '80/80 PASS', frozen_identity_projection: '118/118 PASS',
      public_profile_control: '52/52 PASS', english_historical_revision_verification: '50/50 PASS', result_content: '16/16 PASS',
    });
    const blockedRows = evidence.row_reviews.filter((row: { verdict: string }) => row.verdict === 'BLOCKED');
    expect(report.verdict).toBe(blockedRows.length === 0 ? 'PASS' : 'BLOCKED');
    expect(report.verdict === 'PASS' ? blockedRows : existsSync(join(root, 'repair_batch_plan.json'))).toBeTruthy();
    for (const entry of manifest.files) expect(sha256(join(root, entry.path))).toBe(entry.sha256);
  });
});
