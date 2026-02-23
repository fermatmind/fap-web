export type SocialLogo = {
  id: string;
  label: string;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  quote: string;
  testSlug: string;
  testLabel: string;
};

export const SOCIAL_LOGOS: SocialLogo[] = [
  { id: "learning_lab", label: "Learning Lab" },
  { id: "growth_review", label: "Growth Review" },
  { id: "people_ops_daily", label: "People Ops Daily" },
  { id: "career_studio", label: "Career Studio" },
  { id: "mindset_forum", label: "Mindset Forum" },
  { id: "team_design_hub", label: "Team Design Hub" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "review_1",
    author: "A. Chen",
    role: "Product Manager",
    quote: "The structure is clear and the final explanation is practical enough to discuss with my team immediately.",
    testSlug: "big-five-personality-test",
    testLabel: "Big Five test",
  },
  {
    id: "review_2",
    author: "M. Carter",
    role: "Career Coach",
    quote: "Clients finish it quickly and we can directly use the trait breakdown to plan next actions.",
    testSlug: "personality-mbti-test",
    testLabel: "MBTI test",
  },
  {
    id: "review_3",
    author: "S. Li",
    role: "Team Lead",
    quote: "The report language is easy to align around, especially for communication and role-fit discussions.",
    testSlug: "disc-personality-test",
    testLabel: "DISC test",
  },
  {
    id: "review_4",
    author: "R. Gomez",
    role: "Operations Analyst",
    quote: "I like the no-friction flow and the way it keeps the focus on useful decisions rather than labels.",
    testSlug: "stress-level-check",
    testLabel: "Stress level check",
  },
];
