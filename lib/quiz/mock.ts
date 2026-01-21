export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  title: string;
  options: QuizOption[];
  type?: "single";
};

export const questionsBySlug: Record<string, QuizQuestion[]> = {
  "personality-mbti-test": [
    {
      id: "q1",
      title: "In social situations, you tend to...",
      options: [
        { id: "a", text: "Start conversations and meet new people" },
        { id: "b", text: "Wait for others to approach you" },
        { id: "c", text: "Stick with a small group you know well" },
        { id: "d", text: "Observe first, then decide" }
      ],
      type: "single"
    },
    {
      id: "q2",
      title: "When making decisions, you rely more on...",
      options: [
        { id: "a", text: "Logic and objective analysis" },
        { id: "b", text: "Personal values and empathy" },
        { id: "c", text: "A balance of both" },
        { id: "d", text: "What feels right in the moment" }
      ],
      type: "single"
    },
    {
      id: "q3",
      title: "Your workspace is usually...",
      options: [
        { id: "a", text: "Organized and structured" },
        { id: "b", text: "Flexible and a bit messy" },
        { id: "c", text: "Clean when needed" },
        { id: "d", text: "Creative chaos" }
      ],
      type: "single"
    },
    {
      id: "q4",
      title: "When planning a trip, you prefer to...",
      options: [
        { id: "a", text: "Plan everything in advance" },
        { id: "b", text: "Keep a loose outline" },
        { id: "c", text: "Go with the flow" },
        { id: "d", text: "Decide as you go" }
      ],
      type: "single"
    },
    {
      id: "q5",
      title: "After a busy week, you recharge by...",
      options: [
        { id: "a", text: "Spending time with friends" },
        { id: "b", text: "Having quiet time alone" },
        { id: "c", text: "Doing a mix of both" },
        { id: "d", text: "Exploring something new" }
      ],
      type: "single"
    }
  ]
};

export function getQuestionsForSlug(slug: string): QuizQuestion[] {
  return questionsBySlug[slug] ?? [];
}
