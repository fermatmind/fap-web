import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("non-IQ take UI MBTI parity", () => {
  it("keeps Big Five on the shared MBTI-like take shell instead of the legacy matrix layout", () => {
    const source = readRepoFile("app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx");

    expect(source).toContain("@/components/quiz/QuizShell");
    expect(source).toContain("@/components/quiz/QuizTakeHeaderV2");
    expect(source).toContain("@/components/quiz/immersive/AdaptiveOptionGroup");
    expect(source).toContain("@/components/quiz/immersive/SubmitPhaseOverlay");
    expect(source).not.toContain("@/components/quiz/matrix/MatrixProgressHeader");
    expect(source).not.toContain("@/components/big5/quiz/QuestionNavigator");
    expect(source).not.toContain("@/components/big5/quiz/QuestionCard");
  });

  it("keeps RIASEC and EQ on the shared MBTI-like QuizTakeClient path without pulling IQ into parity", () => {
    const pageSource = readRepoFile("app/(localized)/[locale]/tests/[slug]/take/page.tsx");
    const quizSource = readRepoFile("app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx");

    expect(pageSource).toMatch(/test\.scale_code === "RIASEC"[\s\S]*?<QuizTakeClient/);
    expect(pageSource).not.toContain("RiasecTakeClient");
    expect(pageSource).toMatch(/test\.scale_code === "BIG5_OCEAN"[\s\S]*?<Big5TakeClient/);
    expect(pageSource).toMatch(/test\.scale_code === "ENNEAGRAM"[\s\S]*?<EnneagramTakeClient/);
    expect(pageSource).toMatch(/test\.scale_code === "EQ_SJT_16"[\s\S]*?<EqSjtTakeClient/);

    expect(quizSource).toContain("function isEqScaleCode");
    expect(quizSource).toContain('normalized === "EQ_60"');
    expect(quizSource).toContain('normalized === "EQ_SJT_16"');
    expect(quizSource).toMatch(/const showsTitleQuizChrome =[\s\S]*!isCanonicalIqScaleCode\(scaleCode\)[\s\S]*isEqScaleCode\(scaleCode\)/);
    expect(quizSource).toContain("const isIqScale = useMemo(() => isCanonicalIqScaleCode(normalizedScaleCode)");
  });
});
