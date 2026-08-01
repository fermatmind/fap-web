import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const QA_DIRECTORY = `${ROOT}/generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae`;

function sha256(path: string): string {
  return createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

describe("EN-PARITY-W9-W3-ARTICLES-INDEPENDENT-QA-01", () => {
  it("validates the immutable evidence without rebuilding it", () => {
    const result = JSON.parse(execFileSync("node", ["scripts/seo/validate-w3-articles-w9-qa.mjs"], { encoding: "utf8" }));
    expect(result).toMatchObject({ ok: true, rows: 17, pass_rows: 16, blocked_asset: "Article:53" });
  });

  it("retains an exact immutable producer snapshot for a later CONTROL-only reset", () => {
    const frozenManifestPath = `${QA_DIRECTORY}/frozen_package/sha256_manifest.json`;
    const frozenLedgerPath = `${QA_DIRECTORY}/frozen_package/source_ledger.json`;
    const frozenManifest = JSON.parse(fs.readFileSync(frozenManifestPath, "utf8")) as {
      package_sha256: string;
      files: Array<{ path: string; sha256: string }>;
    };
    const projection = JSON.parse(
      fs.readFileSync(`${QA_DIRECTORY}/frozen_source_ledger_identity_projection.json`, "utf8")
    ) as {
      package_sha256: string;
      sha256_manifest_sha256: string;
      source_ledger_sha256: string;
      rows: Array<{
        row_id: string;
        source_identity: string;
        source_article_id: number;
        source_revision_id: number;
        slug: string;
      }>;
      permissions: Record<string, boolean>;
    };
    const sourceLedger = JSON.parse(fs.readFileSync(frozenLedgerPath, "utf8")) as {
      rows: Array<{
        row_id: string;
        source_article_id: number;
        source_revision_id: number;
        slug: string;
      }>;
    };

    expect(projection).toMatchObject({
      package_sha256: "2c228eae88ce6fc3edb32c1dda9aabf1e2d51d6a885ef7b90d4a7c1864c0e33e",
      sha256_manifest_sha256: "68ea36d17b80ed049df053e80876bdec12f8895cd4f94c1b90bc7c56fea998c1",
      source_ledger_sha256: "6c9afee493506d7f066bf9e130dd8d165dd75e8bf51e56635ab7f44404266850",
    });
    expect(sha256(frozenManifestPath)).toBe(projection.sha256_manifest_sha256);
    expect(sha256(frozenLedgerPath)).toBe(projection.source_ledger_sha256);
    expect(frozenManifest.package_sha256).toBe(projection.package_sha256);
    expect(frozenManifest.files.find((file) => file.path === "source_ledger.json")?.sha256).toBe(
      projection.source_ledger_sha256
    );
    expect(projection.rows).toHaveLength(17);
    expect(new Set(projection.rows.map((row) => row.row_id)).size).toBe(17);
    expect(projection.rows).toEqual(
      sourceLedger.rows.map((row) => ({
        row_id: row.row_id,
        source_identity: `Article:${row.source_article_id}@revision:${row.source_revision_id}`,
        source_article_id: row.source_article_id,
        source_revision_id: row.source_revision_id,
        slug: row.slug,
      }))
    );
    expect(Object.values(projection.permissions)).toEqual(Array(7).fill(false));
    expect(sha256(`${QA_DIRECTORY}/qa_report.json`)).toBe(
      "f9684362929ba66f9f9570ca71bbf72ff1e0027de757d4440581fe655138b9b1"
    );
    expect(sha256(`${QA_DIRECTORY}/qa_row_matrix.json`)).toBe(
      "1a7c5619d083846c9cc57670e29a48fc2245c8647cfccb5613aaa01a4ea78e17"
    );
  });
});
