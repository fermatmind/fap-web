import { normalizeQuizQuestions } from "@/lib/quiz/normalizeQuestions";

describe("quiz question normalization", () => {
  it("normalizes IQ question title from stem and keeps visual options", () => {
    const questions = normalizeQuizQuestions({
      items: [
        {
          question_id: "MATRIX_Q01",
          text: null,
          order: 1,
          stem: {
            prompt_zh: "哪个选项适合？",
            prompt_en: "Which option fits?",
            svg: {
              view_box: "0 0 100 100",
              paths: [{ d: "M 0 0 L 10 10", fill: "#000" }],
            },
          },
          options: [
            {
              code: "A",
              svg: {
                view_box: "0 0 20 20",
                paths: [{ d: "M 1 1 L 5 5", fill: "#111" }],
              },
            },
            {
              code: "B",
              text: "Option B",
            },
          ],
        },
      ],
      locale: "en",
    });

    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      id: "MATRIX_Q01",
      title: "Which option fits?",
    });
    expect(questions[0].stem?.svg?.viewBox).toBe("0 0 100 100");
    expect(questions[0].options).toHaveLength(2);
    expect(questions[0].options[0].text).toBe("A");
    expect(questions[0].options[0].svg?.viewBox).toBe("0 0 20 20");
  });

  it("fills EQ options from meta.option_anchors when question options are missing", () => {
    const questions = normalizeQuizQuestions({
      items: [
        {
          question_id: "1",
          text: "I can identify my emotion right now.",
          options: [],
        },
      ],
      locale: "en",
      meta: {
        option_anchors: [
          { code: "A", label: "Strongly Disagree" },
          { code: "B", label: "Disagree" },
          { code: "C", label: "Neutral" },
          { code: "D", label: "Agree" },
          { code: "E", label: "Strongly Agree" },
        ],
      },
    });

    expect(questions).toHaveLength(1);
    expect(questions[0].options.map((item) => item.id)).toEqual(["A", "B", "C", "D", "E"]);
    expect(questions[0].options[0].text).toBe("Strongly Disagree");
  });

  it("keeps question.options as first priority over anchors/format fallbacks", () => {
    const questions = normalizeQuizQuestions({
      items: [
        {
          question_id: "q1",
          text: "Prompt",
          options: [
            { code: "X", text: "from question" },
            { code: "Y", text: "from question 2" },
          ],
        },
      ],
      locale: "en",
      meta: {
        option_anchors: [
          { code: "A", label: "from anchors" },
          { code: "B", label: "from anchors 2" },
        ],
      },
      optionsFormat: ["from format"],
    });

    expect(questions[0].options.map((item) => item.id)).toEqual(["X", "Y"]);
    expect(questions[0].options[0].text).toBe("from question");
  });
});
