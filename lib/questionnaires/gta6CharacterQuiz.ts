import content from "./data/gta-6-character-quiz.json";
import { questionnaireGuidePath, questionnairePath } from "./paths";
import type { DisplayLocale } from "@/lib/i18n/locales";

export const gta6Slug = "gta-6-character-quiz";
export const gta6Portrait = (id: string) => `/images/gta6/${id}.webp`;
export const gta6Cover = "/images/test-covers/gta6-waterfront.webp";
export const gta6Name = { zh: "GTA 6 角色测试", en: "GTA 6 Character Quiz", "zh-TW": "GTA 6 角色測驗" };
export const gta6Draft = { kind: "archetype", version: "1.1" } as const;
export const gta6DraftKey = `fm_questionnaire_draft:${gta6Slug}`;
export const gta6Questions = content.questions;
export const gta6Profiles = content.profiles;
export type Gta6Profile = (typeof gta6Profiles)[number];

export function isGta6PublicPath(path: string) {
  const match = path.match(/^\/(?:zh|en|zh-TW)\/tests\/explore\/gta-6-character-quiz(?:\/(take)|\/results\/([a-z-]+))?\/?$/);
  return !!match && (!match[2] || !!gta6Profile(match[2]));
}

export function gta6LandingPath(locale: DisplayLocale) {
  return questionnairePath(locale, gta6Slug);
}

export function gta6TakePath(locale: DisplayLocale, invite?: string) {
  return `${gta6LandingPath(locale)}/take${invite ? `?with=${encodeURIComponent(invite)}` : ""}`;
}

export function gta6ResultPath(locale: DisplayLocale, role: string) {
  return questionnaireGuidePath(locale, gta6Slug, role);
}

export function gta6Profile(id: string | null | undefined) {
  return gta6Profiles.find((profile) => profile.id === id);
}

export function gta6InviteRole(query: string, hash: string) {
  const values = new URLSearchParams(query).getAll("with");
  const candidates = values.length ? values : new URLSearchParams(hash.slice(1)).getAll("with");
  return candidates.length === 1 ? gta6Profile(candidates[0]) : undefined;
}

export function scoreGta6(_config: typeof gta6Draft, answers: unknown) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return { status: "invalid" } as const;
  const selections = new Map(Object.entries(answers));
  const ranked = gta6Profiles.map((profile) => ({ profile, votes: 0, midnight: 0, mask: 0 }));
  const byId = new Map(ranked.map((entry) => [entry.profile.id, entry]));

  for (const [index, question] of gta6Questions.entries()) {
    if (!selections.has(question.id)) continue;
    const option = question.options.find((item) => item.id === selections.get(question.id));
    const role = option && byId.get(option.role);
    if (!role) return { status: "invalid" } as const;
    selections.delete(question.id);
    role.votes++;
    if (index >= 8) role.midnight++;
    role.mask |= 1 << index;
  }
  if (selections.size) return { status: "invalid" } as const;
  const total = ranked.reduce((sum, item) => sum + item.votes, 0);
  if (total !== gta6Questions.length) return { status: "incomplete" } as const;

  ranked.sort((a, b) => b.votes - a.votes || b.midnight - a.midnight || b.mask - a.mask);
  const [primary, runnerUp] = ranked;
  return {
    status: "complete",
    primary: primary.profile,
    secondary: runnerUp.votes > 0 && primary.votes - runnerUp.votes <= 1 ? runnerUp.profile : undefined,
  } as const;
}
