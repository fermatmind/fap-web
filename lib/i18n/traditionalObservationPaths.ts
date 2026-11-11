const profiles: Readonly<Record<string, readonly string[]>> = {
  "care-feelings-reflection": ["remembered-emotional-attention-reading", "remembered-feelings-responses-reading", "remembered-comfort-and-support-reading", "feelings-and-support-now-reading"],
  "connection-belonging-check-in": ["felt-distance-reading", "wanted-listening-reading", "finding-belonging-reading"],
  "disconnection-experiences-reflection": ["experience-of-self-reading", "experience-of-surroundings-reading", "absorption-and-attention-reading", "everyday-recall-uncertainty-reading"],
  "emotions-connections-reflection": ["separation-feelings-reading", "changing-views-reading", "self-understanding-reading", "quick-decisions-reading", "feeling-shifts-reading", "emptiness-experiences-reading", "anger-experiences-reading"],
  "feelings-connection-reflection": ["feelings-and-settling-reading", "closeness-and-boundaries-reading"],
  "social-context-reflection": ["being-observed-reading", "conversations-and-contact-reading", "changing-social-plans-reading", "sensations-in-social-context-reading"],
  "communication-routines-context": ["joining-an-exchange-reading", "communication-clarity-reading", "changes-and-routines-reading", "details-and-interest-reading", "visual-arrangements-reading"],
  "focus-energy-context-reflection": ["attention-in-activities-reading", "restlessness-in-activities-reading", "feelings-and-energy-context-reading", "interpreting-social-experiences-reading"],
  "number-context-reflection": ["noticing-written-numbers-reading", "following-calculation-steps-reading", "time-and-measure-context-reading", "prices-and-daily-records-reading"],
  "spatial-thinking-reflection": ["spatial-relationships-reading"],
  "unfamiliar-experiences-reflection": ["sensory-impressions-reading", "following-thoughts-reading", "wariness-and-meaning-reading", "contact-and-participation-reading", "everyday-routines-reading"],
  "written-language-context-reflection": ["following-written-text-reading", "putting-words-on-page-reading", "unfamiliar-words-and-sequences-reading", "ways-of-accessing-text-reading"],
  "after-childbirth-context-reflection": ["mood-and-interest-after-childbirth-reading", "worry-and-self-blame-after-childbirth-reading", "rest-and-demands-after-childbirth-reading", "connection-with-self-after-childbirth-reading"],
  "menstrual-cycle-context-reflection": ["feelings-before-a-period-reading", "irritation-before-a-period-reading", "body-and-routine-before-a-period-reading", "recalled-cycle-timing-reading"],
  "time-of-year-context-reflection": ["mood-and-energy-across-the-year-reading", "sleep-across-the-year-reading", "appetite-across-the-year-reading", "recalled-time-of-year-patterns-reading"],
  "sleep-experiences-reflection": ["settling-to-sleep-reading", "waking-during-rest-reading", "waking-before-planned-reading", "daytime-experiences-reading", "thoughts-about-sleep-reading"],
  "eating-experiences-reflection": ["body-thoughts-reading", "limiting-eating-reading", "loss-of-control-reading", "undoing-eating-reading", "mental-space-reading"],
  "drinking-experiences-reflection": ["plans-and-pull-reading", "daily-effects-reading", "situations-and-choices-reading", "body-experiences-reading"],
  "after-bereavement-reflection": ["missing-the-person-reading", "changed-roles-reading", "distance-from-reminders-reading", "future-and-activities-reading", "feelings-and-support-reading"],
  "child-focus-activity-observations": ["shared-activity-attention-reading", "movement-during-activities-reading", "turns-and-starts-reading", "observed-context-and-support-reading"],
  "gender-experiences-reflection": ["own-words-reading", "embodied-experience-reading", "social-address-reading", "daily-context-reading"],
  "health-worries-reflection": ["attention-to-sensations-reading", "requests-and-care-decisions-reading", "serious-possibilities-reading"],
  "sudden-fear-reflection": ["sudden-waves-reading", "sensations-and-thoughts-reading", "worry-about-returning-reading", "changes-to-plans-reading"],
  "trauma-response-reflection": ["unwanted-reminders-reading", "keeping-distance-reading", "mood-and-connection-reading", "feeling-on-edge-reading"],
  "everyday-worry-reflection": ["recurring-worries-reading", "tension-and-restlessness-reading", "worry-in-daily-activities-reading"],
  "feedback-self-worth-reflection": ["feedback-feelings-reading", "feedback-and-worth-reading", "returning-attention-reading"],
  "recent-mood-reflection": ["mood-and-interest-reading", "sleep-and-appetite-reading", "energy-attention-and-self-talk-reading"],
  "uncertainty-ease-reflection": ["ease-with-uncertainty-reading"],
  "unwanted-thoughts-actions-reflection": ["cleaning-concerns-reading", "checking-again-reading", "order-and-repetition-reading", "unwanted-thoughts-reading", "keeping-and-discarding-reading"],
};

export function hasTraditionalObservation(slug: string) {
  return Object.hasOwn(profiles, slug);
}

export function traditionalObservationRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/u.exec(path);
  if (!match) return null;
  const [, slug, take, profile] = match;
  if (!hasTraditionalObservation(slug)) return null;
  if (profile && !profiles[slug].includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
