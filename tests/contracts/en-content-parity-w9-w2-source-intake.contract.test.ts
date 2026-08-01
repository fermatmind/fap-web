import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageSha = 'a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b';
const root = join(process.cwd(), 'generated/en-content-parity/W9-independent-qa/W2-big-five');
const snapshotDir = join(root, readdirSync(root).find((entry) => entry.startsWith('a41816a8-renderer-')) ?? 'missing');
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

describe('W2 independent-QA immutable source intake', () => {
  it('binds the exact frozen envelope, authoritative snapshots, and 118 deterministic identities', () => {
    const frozenManifest = JSON.parse(readFileSync(join(snapshotDir, 'frozen_package/sha256_manifest.json'), 'utf8'));
    const envelope = frozenManifest.files.filter((entry: { path: string }) => !['sha256_manifest.json', 'master_manifest_patch.candidate.json'].includes(entry.path));
    expect(envelope).toHaveLength(8);
    expect(createHash('sha256').update(envelope.map((entry: { path: string; sha256: string }) => `${entry.path}:${entry.sha256}`).join('\n')).digest('hex')).toBe(packageSha);
    expect(frozenManifest.files).toHaveLength(8);
    expect(readdirSync(join(snapshotDir, 'frozen_package')).sort()).toEqual([
      'assets.jsonl', 'claim_boundary_report.json', 'dry_run_readiness.json', 'editorial_review.json', 'handoff.md',
      'master_manifest_patch.candidate.json', 'scope_manifest.json', 'sha256_manifest.json', 'source_ledger.json', 'translation_map.json',
    ]);
    for (const entry of frozenManifest.files) expect(sha256(join(snapshotDir, 'frozen_package', entry.path))).toBe(entry.sha256);

    const en52 = JSON.parse(readFileSync(join(snapshotDir, 'source_snapshots/en52-release/release-package.json'), 'utf8'));
    expect([en52.asset_count, en52.claims_count, en52.faq_count, en52.media_supported]).toEqual([52, 170, 261, false]);
    expect(en52.family_counts).toEqual({ domain: 5, facet_detail: 30, facet_hub: 1, hub: 1, polarity: 15 });
    expect(readdirSync(join(snapshotDir, 'source_snapshots/en52-release/assets'))).toHaveLength(52);

    const historical = JSON.parse(readFileSync(join(snapshotDir, 'source_snapshots/historical-revisions/en-parity-w2-big-five-draft-inventory.v1.json'), 'utf8'));
    expect([historical.rows.length, historical.counts.independent_current_drafts, historical.counts.current_working_equals_published]).toEqual([50, 0, 50]);
    const result = JSON.parse(readFileSync(join(snapshotDir, 'source_snapshots/w2-result-content-v1/package_manifest.json'), 'utf8'));
    expect([result.inventory_unit_count, result.content_asset_count, result.runtime_use, result.ready_for_runtime, result.ready_for_production, result.production_use_allowed]).toEqual([16, 16, 'draft_review_only', false, false, false]);

    const projection = JSON.parse(readFileSync(join(snapshotDir, 'frozen_source_ledger_identity_projection.json'), 'utf8'));
    expect(projection.reviewed_row_count).toBe(118);
    expect(new Set(projection.rows.map((row: { row_id: string }) => row.row_id)).size).toBe(118);
    expect(new Set(projection.rows.map((row: { frozen_row_sha256: string }) => row.frozen_row_sha256)).size).toBe(118);
    for (const row of projection.rows) expect(row.identity_kind).toBe('row_id_plus_frozen_canonical_row_sha256');

    const sourceManifest = JSON.parse(readFileSync(join(snapshotDir, 'source_snapshot_manifest.json'), 'utf8'));
    expect(sourceManifest.package_sha256).toBe(packageSha);
    expect(sourceManifest.source_ledger_sha256).toBe('5f7c3e2c39a4301c8d0ad79028a3757ec0e541d1b532570c643f64727476fb3f');
    expect(existsSync(join(snapshotDir, 'independent_qa_report.json'))).toBe(false);
    for (const entry of sourceManifest.files) {
      const path = join(snapshotDir, entry.path);
      expect(lstatSync(path).isSymbolicLink()).toBe(false);
      expect(sha256(path)).toBe(entry.sha256);
    }
    const shaManifest = JSON.parse(readFileSync(join(snapshotDir, 'source_snapshot_sha256_manifest.json'), 'utf8'));
    for (const entry of shaManifest.files) expect(sha256(join(snapshotDir, entry.path))).toBe(entry.sha256);
  });
});
