const profiles = {
  "time-management": ["priorities-and-capacity", "steps-and-estimates", "attention-and-return", "review-and-renegotiation"],
  "procrastinator-type-test": ["perfectionist", "dreamer", "worrier", "defier", "crisis-maker", "over-doer"],
  "everyday-control-style": ["reasons", "consultation", "decisions", "agreements", "support", "handoffs"],
  "growth-mindset-fixed-mindset": ["belief-continuum"],
  "grit-test": ["goal-continuity", "effort-return"],
  "tech-savvy": ["reading-your-confidence"],
  "locus-of-control": ["control-continuum"],
  hexaco: ["honesty-humility", "emotionality", "extraversion", "agreeableness", "conscientiousness", "openness-to-experience"],
  "work-traits-reflection": ["composure-reading", "initiative-reading", "follow-through-reading", "social-contact-reading", "consideration-reading", "dependability-reading", "curiosity-reading"],
  "character-strengths": ["appreciation-of-beauty", "love", "teamwork", "curiosity", "fairness", "forgiveness", "gratitude", "hope", "humor", "perseverance", "honesty", "judgment", "kindness", "leadership", "love-of-learning", "humility", "creativity", "perspective", "prudence", "self-regulation", "social-intelligence", "spirituality", "bravery", "zest"],
  empathy: ["compassion-reading"],
  "social-intelligence-test": ["social-understanding-guide"],
} as const;

export function traditionalLikertRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (!match) return null;
  const [, slug, take, profile] = match;
  if (!Object.hasOwn(profiles, slug)) return null;
  const supported: readonly string[] = profiles[slug as keyof typeof profiles];
  if (profile && !supported.includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
