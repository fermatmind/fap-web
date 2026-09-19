import type { ReportResponse } from "@/lib/api/v0_3";
import { bindCanonicalEnneagramReport } from "./enneagramCanonicalAuthority";

const sectionIds = ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "3.1", "3.2", "3.3", "4.1", "4.2", "4.3", "5.1", "5.2", "5.3", "6.1", "6.2", "6.3", "6.4", "6.5"];

const moduleOf = (key: string, scope: string, formVariant: string, content: Record<string, unknown>) => ({ module_key: key, kind: key, visibility: "visible", state: scope, form_variant: formVariant, access_level: "free", content, data_refs: [], registry_refs: [], provenance: { projection_refs: [], registry_refs: [], policy_refs: [], content_maturity: "production_ready", evidence_level: "descriptive" } });

function candidate(typeId: string, rank: number, locale: "en" | "zh-CN") {
  const sections = sectionIds.map((sectionId) => ({
    section_id: sectionId, title: `${sectionId} ${locale === "en" ? "Section" : "小节"} ${typeId}`,
    lead: `Lead ${typeId}-${sectionId}`, paragraphs: [`Paragraph ${typeId}-${sectionId}`], points: [`Point ${typeId}-${sectionId}`],
    reflection_question: `Question ${typeId}-${sectionId}?`, evidence_level: sectionId === "6.4" || sectionId === "2.6" ? "theory_based" : "descriptive",
    content_maturity: "production_ready", fallback_policy: "required", source_refs: ["registry:test"],
    ...(sectionId === "2.6" ? { theory_refs: ["No score-based wing assignment"] } : {}),
    ...(sectionId === "6.4" ? { assignment_allowed: false, levels: Array.from({ length: 9 }, (_, index) => ({ level: index + 1, title: `Level ${index + 1}`, description: `Description ${index + 1}`, observation_prompt: `Observe ${index + 1}` })) } : {}),
  }));
  return { type_id: typeId, rank, candidate_role: ["primary", "secondary", "tertiary"][rank - 1], type_name: `${locale === "en" ? "Type" : "类型"} ${typeId}`, short_title: `Pattern ${typeId}`, score_norm: 1 - rank * .1, score_display: 100 - rank * 10, score_source: "form_local", sections, growth_actions: Array.from({ length: 5 }, (_, index) => ({ action_id: `type-${typeId}-action-${String(index + 1).padStart(2, "0")}`, title: `Action ${typeId}-${index + 1}`, instruction: `Do ${typeId}-${index + 1}`, observable_outcome: `Observe outcome ${typeId}-${index + 1}`, observation_days: [1, 3, 7] })) };
}

export function createSevenChapterReport({ locale = "en", formCode = "enneagram_likert_105", scope = "clear", top = [1, 6, 9] }: { locale?: "en" | "zh-CN"; formCode?: "enneagram_likert_105" | "enneagram_forced_choice_144"; scope?: "clear" | "close_call" | "diffuse" | "low_quality"; top?: number[] } = {}): ReportResponse {
  const formVariant = formCode === "enneagram_forced_choice_144" ? "fc144" : "e105";
  const candidates = top.map((type, index) => candidate(String(type), index + 1, locale));
  const distribution = Array.from({ length: 9 }, (_, index) => ({ type: String(index + 1), rank: index + 1, score_norm: .9 - index * .05, score_display: 90 - index * 5, score_source: "form_local" }));
  const modules = [moduleOf("result_overview", scope, formVariant, { title: `State ${scope}`, body: `body_for_${scope}`, methodology_copy: `method_${formVariant}`, score_space_boundary: "same model, separate score spaces" }), moduleOf("candidate_chapter", scope, "all", { selection_behavior: "reading_perspective_only", system_result_mutation_allowed: false }), moduleOf("growth_actions", scope, "all", { assignment_mode: "observation_evidence_only", feedback_days: [3, 7], system_result_mutation_allowed: false }), moduleOf("seven_day_observation", scope, "all", { steps: [] })];
  const pages = Array.from({ length: 7 }, (_, index) => ({ page_key: ["chapter_1_result", "chapter_2_core_pattern", "chapter_3_strength_cost", "chapter_4_relationships", "chapter_5_work", "chapter_6_stress_recovery", "chapter_7_observation"][index], number: String(index + 1).padStart(2, "0"), title: `Chapter ${index + 1}`, purpose: "test", visibility: "visible", section_ids: index === 0 || index === 6 ? [] : sectionIds.filter((id) => id.startsWith(`${index + 1}.`)), source_registry_refs: ["registry:test"], modules: index === 0 ? [modules[0]] : index === 1 ? [modules[1]] : index === 6 ? [modules[2], modules[3]] : [] }));
  const report = { ok: true, locale, enneagram_form_v1: { form_code: formCode, label: formVariant, short_label: formVariant, question_count: formVariant === "e105" ? 105 : 144, estimated_minutes: 15, scale_code: "ENNEAGRAM" }, enneagram_report_v2: { locale, schema_version: "enneagram.report.v2", scale_code: "ENNEAGRAM", form: { form_code: formCode, form_kind: formVariant, methodology_variant: formVariant }, registry: { registry_version: "v2", registry_release_hash: "registry-hash", content_maturity: "production_ready" }, classification: { interpretation_scope: scope, confidence_level: scope, interpretation_reason: `reason_${scope}` }, distribution, candidates, pages, modules, provenance: { report_schema_version: "enneagram.report.v2", report_engine_version: "2.1.0", interpretation_context_id: "ctx" } } } as unknown as ReportResponse;
  return bindCanonicalEnneagramReport(report, locale);
}
