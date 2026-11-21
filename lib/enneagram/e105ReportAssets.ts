import { z } from "zod";

const text = z.string().trim().min(1);
const source = z.url({ protocol: /^https$/u });
const candidate = z.object({
  type_id: z.string().regex(/^[1-9]$/u),
  careers: z.array(z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    name: text,
    task: text,
    connection: text,
    verify: text,
    source,
  })).length(3),
  life_scenarios: z.object({
    work: text,
    stress: text,
    money: text,
    relationships: text,
  }),
  practice_experiment: text,
});
const reportAssets = z.object({
  candidates: z.array(candidate).length(3),
  plan: z.array(z.object({ period: text, duration: text, title: text, body: text })).length(8),
  science: z.array(z.object({ title: text, body: text })).length(3),
  science_sources: z.array(source).min(1),
  ai_prompt: text,
});

export type E105ReportAssets = z.infer<typeof reportAssets>;

export function parseE105ReportAssets(raw: unknown, candidateIds: string[]): E105ReportAssets | null {
  const parsed = reportAssets.safeParse(raw);
  if (!parsed.success || parsed.data.candidates.some((entry, index) => entry.type_id !== candidateIds[index])) {
    return null;
  }

  return parsed.data;
}
