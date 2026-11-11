const traitsSocialProfiles = {
  "caliper-style-assessment-test": ["context", "options", "finish", "details", "constraints", "understanding", "followup", "pause"],
  "introvert-extrovert": ["introvert", "ambivert-intro", "ambivert-extro", "extrovert"],
  "masking-test": ["overall", "compensation", "masking", "assimilation"],
  "mattering": ["general-mattering", "anti-mattering"],
  "optimism-pessimism": ["lower", "lower-middle", "middle", "upper-middle", "higher"],
  "tipi-10": ["extraversion-reading", "agreeableness-reading", "conscientiousness-reading", "emotional-stability-reading", "openness-reading"],
} as const;

export function hasTraditionalTraitsSocial(slug: string): boolean {
  return Object.hasOwn(traitsSocialProfiles, slug);
}

const valuesOrientationsProfiles = {
  "8-values-political": ["equality", "markets", "nation", "globe", "liberty", "authority", "progress", "tradition"],
  "conservatism": ["social", "economic"],
  "political-coordinates": ["left-communitarian", "left-liberal", "right-communitarian", "right-liberal"],
  "four-axes-test": ["gender", "personality", "lifestyle", "political"],
  "moral-alignment": ["lawful-good", "neutral-good", "chaotic-good", "lawful-neutral", "true-neutral", "chaotic-neutral", "lawful-evil", "neutral-evil", "chaotic-evil"],
  "arabic-personality-compass": ["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west", "east-north", "east-south", "west-north", "west-south"],
} as const;

export function hasTraditionalValuesOrientations(slug: string): boolean {
  return Object.hasOwn(valuesOrientationsProfiles, slug);
}

const stressCopingProfiles = {
  "anger-issues-screener": ["anger-occurrence", "outward-expression", "kept-inside", "perceived-choice"],
  "burnout-risk": ["personal", "work"],
  "overthinking-screener": ["total-reading", "core-reading", "unproductive-reading", "mental-capacity-reading"],
  "perceived-stress-scale-4": ["reading-pss4-total"],
  "stress-check-in-test": ["reading-your-check-in"],
  "holding-yourself-back": ["emotion-recovery-reading", "self-doubt-reading", "direction-attention-reading", "outward-actions-reading", "rigid-standards-reading", "imagined-scenarios-reading", "interest-engagement-reading"],
} as const;

export function hasTraditionalStressCoping(slug: string): boolean {
  return Object.hasOwn(stressCopingProfiles, slug);
}

const sensoryExecutiveProfiles = {
  "aphantasia-test": ["objects", "faces", "places", "motion"],
  "synesthesia-test": ["symbol-color", "sound-color", "sequence-space", "personification", "taste-touch"],
  "sensory-processing-test": ["spq92-total-reading"],
  "sensory-sensitivity": ["late-noticing", "input-seeking", "input-distraction", "input-reducing"],
  "misophonia-screener": ["overall", "symptom", "impairment"],
  "executive-function": ["overall-sum-reading", "working-memory-reading", "inhibition-reading"],
} as const;

export function hasTraditionalSensoryExecutive(slug: string): boolean {
  return Object.hasOwn(sensoryExecutiveProfiles, slug);
}

const selfEvaluationProfiles = {
  "imposter-syndrome": ["contribution", "feedback", "evaluation", "comparison", "preparation"],
  "inner-critic-voice-test": ["inadequate", "hated", "reassured"],
  "self-compassion": ["overall-mean", "self-kindness-reading", "self-judgment-reading", "common-humanity-reading", "isolation-reading", "mindfulness-reading", "over-identification-reading"],
  "self-esteem": ["score-reading"],
  perfectionism: ["standards-reading", "discrepancy-reading"],
} as const;

export function hasTraditionalSelfEvaluation(slug: string): boolean {
  return Object.hasOwn(selfEvaluationProfiles, slug);
}

const officeToolProfiles = {
  "data-entry": ["assets", "dispatch"],
  "ten-key-test": ["whole", "decimals", "references"],
  "typing-speed": ["english", "chinese"],
  "skills-audit": ["methods-reading", "tools-reading", "communication-reading", "domain-reading"],
  "work-role-reflection": ["problem-clarification-reading", "delivery-checking-reading", "shared-contribution-reading"],
} as const;

export function hasTraditionalOfficeTool(slug: string): boolean {
  return Object.hasOwn(officeToolProfiles, slug);
}

const relationshipSixProfiles = {
  "capacity-to-love-test": ["interest-reading", "trust-reading", "gratitude-reading", "shared-ideal-reading", "sexual-passion-reading", "loss-reading"],
  "love-languages": ["words", "acts", "gifts", "time", "touch"],
  "love-type-16": ["lcro", "lcre", "lcpo", "lcpe", "laro", "lare", "lapo", "lape", "fcro", "fcre", "fcpo", "fcpe", "faro", "fare", "fapo", "fape"],
  "mote-type": ["energy-presence-reading", "clarity-pacing-reading", "support-timing-reading", "sharing-boundary-reading"],
  "parenting-style": ["authoritative", "authoritarian", "permissive", "uninvolved"],
  "relationship-preferences": ["shared-participation", "personal-space", "certainty-planning", "flexible-experience", "contact-space-tie", "certainty-flexibility-tie"],
} as const;

export function hasTraditionalRelationshipSix(slug: string): boolean {
  return Object.hasOwn(relationshipSixProfiles, slug);
}

const workReasoningProfiles = {
  "asvab-practice-test": ["arithmetic-reasoning", "word-knowledge", "paragraph-comprehension", "mathematics-knowledge"],
  "asvab-science-mechanical-practice-test": ["general-science", "mechanical", "electronics", "auto-shop", "assembling"],
  "employer-reasoning-practice-test": ["verbal", "numerical", "logical"],
  "watson-glaser-practice-test": ["inference", "assumptions", "deduction", "interpretation", "arguments"],
  "written-coordination-practice": ["entry", "cross-reference", "memory", "priority", "map", "summary"],
  "distributed-work-choices": ["handover-reading", "visibility-reading", "blockers-reading", "time-windows-reading"],
  "freelance-ready": ["service-and-enquiries-reading", "project-agreement-reading", "operating-plan-reading", "delivery-routine-reading", "boundaries-and-review-reading"],
  "remote-work": ["setup-and-access-reading", "work-planning-reading", "handover-and-decisions-reading", "help-and-coordination-reading", "boundaries-and-recovery-reading"],
} as const;

export function hasTraditionalWorkReasoning(slug: string): boolean {
  return Object.hasOwn(workReasoningProfiles, slug);
}

const privateReflectionProfiles = {
  "annoying-person-test": ["directness-reading", "pause-reading", "expectations-reading", "updates-reading", "boundaries-reading"],
  "breakup-reflection-test": ["communication-review", "expectations-review", "boundaries-review", "external-pressure-review"],
  "conflict-boundary-behaviors-test": ["pressure-during-disagreements", "responding-to-no-and-pauses", "responding-to-behavioral-impact", "following-through-after-repair"],
  "coping-rhythm-test": ["trying-and-assessing", "expressing-and-processing-privately", "adapting-and-keeping-structure", "present-needs-and-future-plans"],
  "habit-patterns-test": ["cues-and-urges", "automatic-starts", "displaced-plans", "continuing-after-inconvenience", "everyday-effects"],
  "intimacy-preference-test": ["emotional-sharing", "physical-closeness-boundaries", "time-together-personal-space", "relationship-visibility-privacy"],
  "orientation-exploration-test": ["noticing-attraction", "different-forms-of-attraction", "current-patterns-and-uncertainty", "choosing-or-not-using-labels", "privacy-and-support"],
  "stress-response-patterns-test": ["stepping-back-and-delaying", "tightening-plans-and-checks", "agreeing-first-and-maintaining-harmony", "explaining-and-protecting-a-position", "speaking-less-and-holding-back"],
} as const;

export function hasTraditionalPrivateReflection(slug: string): boolean {
  return Object.hasOwn(privateReflectionProfiles, slug);
}

const profiles = {
  ...privateReflectionProfiles,
  ...workReasoningProfiles,
  ...relationshipSixProfiles,
  ...officeToolProfiles,
  ...selfEvaluationProfiles,
  ...sensoryExecutiveProfiles,
  ...stressCopingProfiles,
  ...valuesOrientationsProfiles,
  ...traitsSocialProfiles,
  "cognitive-functions-test": ["ni", "ne", "si", "se", "ti", "te", "fi", "fe"],
  "energy-flow": ["earlier-day", "effort-blocks", "focus-conditions", "pause-noticing"],
  "deep-desire": ["autonomy", "connection", "mastery", "security", "recognition", "exploration"],
  "light-triad-test": ["faith-in-humanity", "humanism", "kantianism"],
  "maturity-test": ["emotion-pause", "commitment-repair", "perspective-checking", "self-directed-choice"],
  "sdt-motivation": ["autonomy-satisfaction", "autonomy-frustration", "competence-satisfaction", "competence-frustration", "relatedness-satisfaction", "relatedness-frustration"],
  "sternberg-love": ["intimacy-reading", "passion-reading", "commitment-reading"],
  "jealousy-scale": ["thoughts-reading", "discomfort-reading", "responses-reading"],
  "wholesome-partner": ["realistic-follow-through", "respecting-autonomy", "responsive-checking-in", "requesting-support", "honest-preferences", "understanding-perspectives", "negotiating-expectations", "clear-repair-talk"],
  "freudian-personality": ["support", "guarded", "spontaneous", "structure", "overt", "argument", "expressive", "private"],
  "eras-of-you-test": ["fresh-attention", "trying-options", "keeping-rhythm", "changing-arrangement", "reviewing-notes", "passing-notes"],
  "rizz-test": ["showing-interest", "threading-a-reply", "offering-playfulness", "checking-the-invitation"],
  "feminine-energy": ["playful-warmth", "expressive-flair", "poetic-detail", "composed-clarity"],
  "music-taste-test": ["pop", "rock", "hip-hop", "electronic", "jazz", "western-classical", "acoustic-folk", "country"],
  "dark-triad": ["status-recognition", "instrumental-influence", "impact-distance"],
  "dark-tetrad-sd4": ["machiavellianism", "narcissism", "psychopathy", "sadism"],
  "values": ["self-direction", "stimulation", "hedonism", "achievement", "power", "security", "conformity", "tradition", "benevolence", "universalism"],
  "morality-6": ["care", "equality", "proportionality", "loyalty", "authority", "purity"],
  "libertarian": ["autonomy", "cooperation", "property", "coercion"],
  "body-frame-observations": ["rounded-outlines", "gradual-transitions", "joint-landmarks"],
  "face-self-image": ["face-view", "chosen-care", "photo-ease", "appearance-attention"],
  "outfit-line-preferences": ["long-line", "ease-and-room", "even-balance", "compact-contrast", "soft-drape"],
  "activity-engagement-patterns": ["self-starting", "responding-to-opportunities", "moving-between-interests", "invited-contribution", "observing-the-setting"],
  "attraction-experiences": ["romantic-presence", "bond-first-context", "sexual-continuity", "sexual-context-variation", "sexual-attraction-breadth"],
  "chakra": ["root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown"],
  "connection-meaning-reflection": ["felt-familiarity", "noticing-similarities", "pausing-after-intensity", "checking-understanding", "reflecting-on-meaning"],
  "eq-dashboard": ["joy", "trust", "fear", "surprise", "sadness", "disgust", "anger", "anticipation"],
  "egogram": ["critical-parent", "nurturing-parent", "adult", "free-child", "adapted-child"],
  "type-ab": ["time-urgency", "competitive-comparison", "waiting-irritation", "difficulty-stopping"],
  "learning-style": ["visual", "auditory", "reading-writing", "kinesthetic"],
  "multiple-intelligences": ["linguistic-reading", "logical-reading", "spatial-reading", "bodily-reading", "musical-reading", "interpersonal-reading", "intrapersonal-reading", "naturalist-reading"],
  "hsp-sensitivity-quiz": ["reflective-meaning-reading", "busy-input-reading", "emotional-response-reading", "small-changes-reading"],
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
