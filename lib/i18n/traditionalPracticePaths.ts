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
  "abstract-reasoning": ["series", "analogies", "classification", "transformations"],
  "logical-reasoning": ["quantifiers", "conditions", "deduction", "constraints"],
  "mechanical-reasoning": ["levers", "gears", "pulleys", "springs", "fluids"],
  "verbal-reasoning": ["vocabulary", "analogies", "reading", "logic"],
  "numerical-reasoning": ["arithmetic", "percentages", "ratios", "data", "rates"],
  "spatial-reasoning": ["rotations", "reflections", "folds", "cube-turns", "layouts"],
  "english-proficiency": ["grammar", "vocabulary", "reading", "functional"],
  "german-proficiency": ["articles-and-cases", "german-verb-forms", "sentence-structure", "short-german-texts"],
  "grammar-test": ["tense-forms", "agreement-reference", "function-words", "sentence-editing"],
  "spanish-proficiency": ["grammar", "vocabulary", "reading", "functional"],
  "spelling-test": ["double-consonants", "vowel-choices", "letter-order", "word-endings"],
  "java-test": ["values-and-expressions", "branches-and-loops", "methods-and-objects", "collections-and-failures"],
  "javascript-test": ["values-and-operators", "bindings-and-functions", "arrays-and-objects", "promises-and-errors"],
  "python-test": ["values-and-text", "loops-and-functions", "collections-and-aliases", "errors-and-objects"],
  "sql-test": ["filters-and-nulls", "joins-and-matches", "groups-and-aggregates", "windows-and-constraints"],
  "word-skills": ["paragraphs-and-formatting", "styles-and-structure", "sections-and-tables", "fields-and-mail-merge", "review-and-templates"],
  "excel-skills": ["formulas-and-references", "conditions-and-lookup", "data-handling", "presentation-and-summaries"],
  "financial-accounting": ["entries", "income", "balance", "accrual", "depreciation", "working-capital"],
  "ai-literacy": ["models-and-data", "prompts-and-tools", "checking-outputs", "privacy-and-judgement"],
  "communication-adaptability": ["audience-purpose-review", "channel-record-review", "context-access-review", "understanding-review", "communication-modes-review"],
  "personal-finance-literacy": ["budget-and-spending", "saving-and-risk", "pay-and-benefits"],
  "problem-solving-critical-thinking": ["problem-steps", "decision-tools", "review-and-learning"],
  "project-management": ["scope-and-change", "schedule-and-capacity", "risk-and-response", "communication-and-decisions", "budget-and-quantities"],
};

export const traditionalPracticeSlugs = Object.keys(practiceProfiles);

export function traditionalPracticeRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !Object.hasOwn(practiceProfiles, match[1])) return null;
  const [, slug, take, profile] = match;
  if (profile && !practiceProfiles[slug].includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}
