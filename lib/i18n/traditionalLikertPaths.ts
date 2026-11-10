const profiles = {
  "people-pleaser": ["needs", "responsibility", "expectations"],
  "trust-issues-test": ["initial-opening", "gradual-building", "agreement-clarity", "protective-distance"],
  "toxic-positivity-test": ["self-pressure-reading", "conversations-reading", "uncertainty-reading"],
  "toxic-trait": ["unchecked-retelling", "comparison-turns", "indirect-objections", "explanation-first", "past-dispute-carryover"],
  "difficult-person-test": ["callousness", "grandiosity", "domineering", "manipulation", "suspiciousness", "aggression", "risk-taking"],
  "interpersonal-preferences": ["invite", "be-included", "coordinate", "receive-coordination", "offer-warmth", "receive-warmth"],
  "social-attitudes-reflection": ["reviewing-rules", "gender-roles", "gay-lesbian-inclusion", "racial-context"],
  "cultural-dimensions": ["authority", "autonomy", "achievement", "certainty", "adaptation", "enjoyment"],
  "social-battery-test": ["interaction-load", "coordination-load", "quiet-recovery", "easy-company"],
  "humor-style-test": ["deadpan", "wordplay", "absurdist", "shared-humor", "self-deprecating", "banter"],
  "work-activity-interests": ["hands-on-tasks", "investigation-tasks", "creative-tasks", "support-tasks", "initiative-tasks", "organizing-tasks"],
  "work-ethics": ["commitments-reading", "quality-reading", "honesty-reading", "repair-reading"],
  "culture-fit": ["coordination-reading", "decision-room-reading", "change-rhythm-reading", "feedback-rhythm-reading"],
  "competency-test": ["message-checking-reading", "problem-framing-reading", "agreed-action-reading", "work-planning-reading", "response-to-change-reading", "shared-delivery-reading"],
  "relationship-worry-habits": ["direct-reassurance", "rival-attention", "giving-for-connection", "indirect-checks"],
  "relationship-habits": ["space-and-pauses", "fairness-tally", "talk-delay", "overextension"],
  "dating-outlook": ["possibility", "practice", "guarded-expectations", "fixed-conditions"],
  "intimacy-values": ["privacy", "play", "steadiness", "trust", "closeness"],
  "relationship-commitment": ["continuing-intention", "current-satisfaction", "outside-options", "relationship-linked-investment"],
  "apology-language": ["regret-reading", "responsibility-reading", "repair-reading", "change-reading", "forgiveness-choice-reading"],
  "conflict-styles": ["pressing-own-plan", "joint-problem-solving", "trading-concessions", "stepping-back", "yielding-choice"],
  "love-fight-style": ["verbal-escalation-reading", "pause-reading", "return-reading", "repair-reading"],
  "friendship-compatibility": ["agreements-and-priorities", "room-to-speak", "shared-effort", "space-and-privacy", "different-strengths"],
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
