import { z } from "zod";

const text = z.string().min(1);
const card = z.object({ title: text, body: text });
const codes = z.enum(["SA", "ER", "EM", "RM"]);
const formulation = z.enum(["aware_but_unregulated", "high_empathy_low_recovery", "sensitive_absorber", "calm_but_distant", "relationship_first_self_later", "self_clear_repair_weak", "steady_collaborator", "developing_foundation", "balanced_integrated", "low_confidence_result"]);
const bandCode = z.enum(["baseline", "developing", "competent", "proficient", "exceptional"]);
const contentLocale = z.enum(["zh-CN", "en", "zh-TW"]);
const localizedText = z.record(contentLocale, text);
const label = z.object({ title: text, description: text });
const copy = z.object({
  title: text, summary_title: text, summary: text,
  sample_notice: text, chart_title: text,
  sections: z.array(text).length(10),
  labels: z.record(z.string(), text),
  dimensions: z.array(z.object({
    code: codes, name: text, en_name: text, band_code: bandCode, raw: z.number().int().min(15).max(75),
    score: z.number().min(55).max(145), color: z.string().regex(/^#[0-9a-f]{6}$/i),
    lead: text, paragraphs: z.array(text).min(2), strengths: z.array(text).min(4),
    growth: z.array(text).min(4), script: text,
  })).length(4).refine(items => new Set(items.map(item => item.code)).size === 4),
  careers: z.array(z.object({ title: text, match_label: text, match_display: z.number().min(0).max(100), codes: z.array(codes).length(2), body: text, question: text, experiment: text })).length(8),
  work: z.array(card).length(3),
  stress: z.object({ intro: text, pattern: card, patterns: z.array(text).length(4), methods: z.array(text).length(6) }),
  money: z.object({ intro: text, cards: z.array(card).length(3), tips: z.array(text).length(4) }),
  relationships: z.array(card).length(3),
  people: z.array(z.object({ name: text, initials: text, role: text, body: text, takeaway: text, source: text })).length(6),
  plan_intro: text,
  plan: z.array(z.object({ period: text, time: text, title: text, body: text, why: text })).length(7),
  insights: z.array(card).length(7), science: z.array(card).length(4),
});

export const eqRedesignPreviewSchema = z.object({
  schema: z.literal("eq60.result_redesign_preview.v1"),
  status: z.literal("local_editorial_candidate"),
  locales: z.tuple([z.literal("zh-CN"), z.literal("en"), z.literal("zh-TW")]),
  result_labels: z.record(formulation, z.object({ kind: z.enum(["self_report_pattern", "quality_state"]), "zh-CN": label, en: label, "zh-TW": label })),
  dimension_bands: z.array(z.object({ code: bandCode, min: z.number(), max_exclusive: z.number(), labels: localizedText })).length(5),
  sample: z.object({
    formulation_id: formulation,
    id: text, synthetic: z.literal(true), reference_version: z.literal("bootstrap_v1"),
    score_range: z.tuple([z.literal(55), z.literal(145)]),
    global_raw: z.number().int().min(60).max(300), global_standard: z.number().min(55).max(145),
  }),
  sources: z.array(z.object({ id: text, title: text, url: z.url().startsWith("https://"), scope: localizedText })).min(1),
  copy: z.record(contentLocale, copy),
}).superRefine((data, ctx) => {
  const expectedBounds = [55, 85, 93, 108, 116, 146];
  const expectedCodes = bandCode.options;
  data.dimension_bands.forEach((band, i) => {
    if (band.code !== expectedCodes[i] || band.min !== expectedBounds[i] || band.max_exclusive !== expectedBounds[i + 1]) {
      ctx.addIssue({ code: "custom", message: "Display bands must preserve scoring thresholds", path: ["dimension_bands", i] });
    }
  });
  for (const id of formulation.options) {
    const kind = id === "low_confidence_result" ? "quality_state" : "self_report_pattern";
    if (data.result_labels[id].kind !== kind) ctx.addIssue({ code: "custom", message: "Invalid result-label kind", path: ["result_labels", id] });
  }
  for (const locale of data.locales) {
    const c = data.copy[locale];
    if (c.people.some(person => !data.sources.some(source => source.id === person.source))) {
      ctx.addIssue({ code: "custom", message: "Unresolved source", path: ["copy", locale, "people"] });
    }
    const sum = c.dimensions.reduce((total, d) => total + d.raw, 0);
    const mean = c.dimensions.reduce((total, d) => total + d.score, 0) / 4;
    if (sum !== data.sample.global_raw || mean !== data.sample.global_standard) {
      ctx.addIssue({ code: "custom", message: "Inconsistent sample scores", path: ["copy", locale, "dimensions"] });
    }
    for (const d of c.dimensions) {
      const band = data.dimension_bands.find(b => b.min <= d.score && d.score < b.max_exclusive);
      if (band?.code !== d.band_code) ctx.addIssue({ code: "custom", message: "Incorrect display band", path: ["copy", locale, "dimensions"] });
      const expected = Math.max(55, Math.min(145, 100 + 15 * (d.raw - 53.5) / 7.5));
      if (expected !== d.score) ctx.addIssue({ code: "custom", message: "Sample does not match bootstrap scoring", path: ["copy", locale, "dimensions"] });
    }
  }
});

export type EqRedesignCandidate = z.infer<typeof eqRedesignPreviewSchema>;
export type EqRedesignCopy = EqRedesignCandidate["copy"]["zh-CN"];

const normalFormulation = formulation.exclude(["low_confidence_result"]);
const dynamicCopy = copy.pick({ summary_title: true, summary: true, careers: true, work: true, stress: true, money: true, relationships: true, plan_intro: true, plan: true });
const sharedCopy = copy.omit({ summary_title: true, summary: true, dimensions: true, careers: true, work: true, stress: true, money: true, relationships: true, plan_intro: true, plan: true });
const dimensionEditorial = copy.shape.dimensions.element.pick({ lead: true, paragraphs: true, strengths: true, growth: true, script: true });
const qualityCopy = z.object({ summary_title: text, summary: text, reasons_title: text, reasons: z.array(text).length(3), steps: z.array(card).length(3) });

export const eqRedesignLibrarySchema = z.object({
  schema: z.literal("eq60.result_redesign_library.v2"), status: z.literal("local_editorial_candidate"),
  locales: z.tuple([z.literal("zh-CN"), z.literal("en"), z.literal("zh-TW")]), default_result: formulation,
  reference_version: z.literal("bootstrap_v1"),
  result_labels: eqRedesignPreviewSchema.shape.result_labels,
  dimension_bands: eqRedesignPreviewSchema.shape.dimension_bands,
  dimension_meta: z.array(z.object({ code: codes, en_name: text, color: z.string().regex(/^#[0-9a-f]{6}$/i), labels: localizedText })).length(4)
    .refine(items => new Set(items.map(item => item.code)).size === 4),
  dimension_cards: z.record(codes, z.record(bandCode, z.record(contentLocale, dimensionEditorial))),
  profiles: z.record(normalFormulation, z.object({ raw_scores: z.tuple([z.number().int().min(15).max(75), z.number().int().min(15).max(75), z.number().int().min(15).max(75), z.number().int().min(15).max(75)]), "zh-CN": dynamicCopy, en: dynamicCopy, "zh-TW": dynamicCopy })),
  shared: z.record(contentLocale, sharedCopy),
  quality_result: z.record(contentLocale, qualityCopy),
  sources: eqRedesignPreviewSchema.shape.sources,
});
export type EqRedesignLibrary = z.infer<typeof eqRedesignLibrarySchema>;
export type EqPreviewResultId = z.infer<typeof formulation>;
export type EqPreviewQuality = z.infer<typeof qualityCopy>;

export function resolveEqRedesignPreview(library: EqRedesignLibrary, result: string) {
  const id = formulation.parse(result);
  const profile = library.profiles[id === "low_confidence_result" ? library.default_result === "low_confidence_result" ? "aware_but_unregulated" : library.default_result : id];
  // These scores belong only to synthetic local examples, never a user's report.
  const scores = profile.raw_scores.map(raw => Math.max(55, Math.min(145, 100 + 2 * (raw - 53.5))));
  const assembledCopy = Object.fromEntries(library.locales.map(locale => {
    const dimensions = library.dimension_meta.map((meta, index) => {
      const score = scores[index];
      const band = library.dimension_bands.find(b => b.min <= score && score < b.max_exclusive);
      if (!band) throw new Error("Missing EQ preview dimension band");
      return { code: meta.code, name: meta.labels[locale], en_name: meta.en_name, color: meta.color,
        raw: profile.raw_scores[index], score, band_code: band.code, ...library.dimension_cards[meta.code][band.code][locale] };
    });
    return [locale, { ...library.shared[locale], ...profile[locale], dimensions }];
  }));
  return eqRedesignPreviewSchema.parse({ schema: "eq60.result_redesign_preview.v1", status: library.status, locales: library.locales,
    result_labels: library.result_labels, dimension_bands: library.dimension_bands, sources: library.sources,
    sample: { id, formulation_id: id, synthetic: true, reference_version: library.reference_version, score_range: [55,145],
      global_raw: profile.raw_scores.reduce((sum, n) => sum + n, 0), global_standard: scores.reduce((sum, n) => sum + n, 0) / 4 },
    copy: assembledCopy });
}

export const eqPreviewResultIds = formulation.options;
