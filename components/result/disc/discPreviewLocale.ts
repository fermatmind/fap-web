import type { DisplayLocale } from "@/lib/i18n/locales";
import { contents, discDirections, discPreviewProfiles, type DiscPreviewContent, type DiscPreviewId } from "./discPreviewProfiles";
import { discSharedEvidence } from "./discPreviewContent";
import zhUi from "./discPreviewUi.zh.json";
import enProfiles from "./discPreviewContent.en.json";
import en from "./discPreviewLocale.en.json";
import traditional from "./discPreviewLocale.zh-TW.json";

type Bundle = {
  profiles: Record<DiscPreviewId, DiscPreviewContent>;
  ui: Record<keyof typeof zhUi, string>;
  directions: { title: string; body: string }[];
  alts: string[];
  evidence: { science: readonly { title: string; body: string; reference: string }[]; sources: readonly { id: string; title: string; detail: string; url: string }[] };
};

// Locale changes only human-readable content. Identities, scores and artwork stay in the shared registry.
export const discPreviewLocales = {
  zh: {
    profiles: contents,
    ui: zhUi,
    directions: discDirections.map(direction => ({ title: direction.title, body: direction.body })),
    alts: discPreviewProfiles.map(profile => profile.alt),
    evidence: discSharedEvidence,
  },
  en: { ...en, profiles: enProfiles },
  "zh-TW": traditional,
} satisfies Record<DisplayLocale, Bundle>;

export function discResultPreviewPath(locale: DisplayLocale, id: string) {
  return `/${locale}/reports/samples/disc?result=${encodeURIComponent(id)}`;
}

export function discUnlockPreviewPath(locale: DisplayLocale, id: string) {
  return `/${locale}/dev/mainstream-unlock?form=disc24&result=${encodeURIComponent(id)}`;
}
