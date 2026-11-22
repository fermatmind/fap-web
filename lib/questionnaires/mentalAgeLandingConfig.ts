const bigFive = "/tests/big-five-personality-test-ocean-model";
const mbti = "/tests/mbti-personality-test-16-personality-types";
const career = "/career/assessment";

export const mentalAgeLandingConfig = {
  sampleQuestionIds: ["MAC_01", "MAC_02", "MAC_23"],
  samples: [{ age: 22, actual: 29 }, { age: 40, actual: 35 }, { age: 58, actual: 26 }],
  styleLinks: [bigFive, mbti, career, "/tests/eq-test-emotional-intelligence-assessment", "/career", mbti, "/tests/holland-career-interest-test-riasec"],
  exploreLinks: [bigFive, career, "/tests/explore/seven-sins-virtues-test"],
  compareLinks: [null, bigFive, mbti, career],
  visibleRules: ["arithmetic", "examples", "counterexamples", "method"],
} as const;
