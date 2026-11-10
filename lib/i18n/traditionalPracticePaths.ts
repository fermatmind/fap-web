const practiceProfiles: Readonly<Record<string, readonly string[]>> = {
  "attention-to-detail": ["records", "rules", "quantities", "formats"],
  "cybersecurity-awareness": ["phishing", "accounts", "devices", "sharing", "response"],
  "workplace-technology": ["handover", "settings", "shared-work", "work-change"],
  "computer-literacy": ["files", "browser", "email", "office"],
  "digital-ethics-citizenship": ["privacy", "security", "information", "communication", "access"],
  "customer-service-aptitude": ["listening-and-clarifying", "rules-and-resolution", "clear-service-messages", "records-and-follow-through"],
  "sales-aptitude": ["discovery", "fit", "follow-up", "sales-maths"],
  "situational-judgement": ["priorities", "ownership", "updates", "permissions", "teamwork"],
  "aptitude-test": ["numerical", "verbal", "deductive", "patterns", "error-checking"],
};

export const traditionalPracticeSlugs = Object.keys(practiceProfiles);

export function traditionalPracticeRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !Object.hasOwn(practiceProfiles, match[1])) return null;
  const [, slug, take, profile] = match;
  if (profile && !practiceProfiles[slug].includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
