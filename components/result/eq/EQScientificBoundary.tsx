import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";

export function EQScientificBoundary({ viewModel }: { viewModel: EqV5ViewModel }) {
  const contract = viewModel.assets.scientific_contract;
  const rows = [
    contract.test_definition,
    contract.self_report_statement,
    contract.non_clinical_statement,
    contract.non_hiring_statement,
    contract.non_ability_statement,
    contract.norm_status_statement,
    contract.quality_rules_statement,
    contract.version_statement,
  ].filter(Boolean);

  return (
    <section data-testid="eq-scientific-boundary" className="space-y-4">
      <SectionHeading title={viewModel.locale === "zh" ? "科学边界" : "Scientific Boundary"} />
      <div className="rounded-[8px] border border-slate-200 bg-white p-4">
        <ul className="space-y-2 text-sm leading-6 text-slate-700">
          {rows.map((row) => (
            <li key={row} className="border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
              {row}
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <BoundaryMeta label="norm_status" value={viewModel.methodology.norm_status} />
          <BoundaryMeta label="scoring_version" value={viewModel.methodology.scoring_version} />
          <BoundaryMeta label="content_version" value={viewModel.methodology.content_version} />
        </dl>
      </div>
    </section>
  );
}

function BoundaryMeta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-[8px] bg-slate-50 p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}
