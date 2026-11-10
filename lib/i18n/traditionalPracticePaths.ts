const practiceProfiles: Readonly<Record<string, readonly string[]>> = {
  "attention-to-detail": ["records", "rules", "quantities", "formats"],
  "cybersecurity-awareness": ["phishing", "accounts", "devices", "sharing", "response"],
  "workplace-technology": ["handover", "settings", "shared-work", "work-change"],
};

export const traditionalPracticeSlugs = Object.keys(practiceProfiles);

export function traditionalPracticeRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !Object.hasOwn(practiceProfiles, match[1])) return null;
  const [, slug, take, profile] = match;
  if (profile && !practiceProfiles[slug].includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
