import type { EqV5ViewModel } from "./types";
import { SectionHeading } from "./EQEvidenceSnapshot";

export function EQScientificBoundary({ viewModel }: { viewModel: EqV5ViewModel }) {
  const contract = viewModel.assets.scientific_contract;
  const evidence = viewModel.assets.psychometric_evidence_status;
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
          {rows.map((row, index) => (
            <li key={`${index}-${row}`} className="border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
              {row}
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <BoundaryMeta label="norm_status" value={viewModel.methodology.norm_status} />
          <BoundaryMeta label="scoring_version" value={viewModel.methodology.scoring_version} />
          <BoundaryMeta label="content_version" value={viewModel.methodology.content_version} />
        </dl>
        {evidence.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {evidence.map((item) => (
              <article key={item.id ?? item.label} className="rounded-[8px] bg-slate-50 p-3 text-sm">
                <h3 className="font-semibold text-slate-900">
                  {item.user_facing_status_label || item.label || item.id}
                </h3>
                {item.status ? <p className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-500">{item.status}</p> : null}
                {item.what_this_means_for_user || item.user_meaning ? (
                  <p className="mt-2 leading-6 text-slate-700">
                    {item.what_this_means_for_user || item.user_meaning}
                  </p>
                ) : null}
                {item.next_validation_step || item.validation_step ? (
                  <p className="mt-2 leading-6 text-slate-600">
                    {item.next_validation_step || item.validation_step}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
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
