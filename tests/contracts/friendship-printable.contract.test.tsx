import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { QuestionActivity } from "@/components/friendship/QuestionActivity";
import { resourceMetadata } from "@/components/friendship/PublicContent";
import preview from "@/lib/friendship/preview.json";
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });
describe("usable bilingual friendship activity", () => {
  it.each(["en", "zh"] as const)("keeps %s original numbers, live handoffs and real PDF assets", locale => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const { container } = render(<QuestionActivity locale={locale} />);
    const prompts = container.querySelectorAll('[data-question-id]');
    expect(Array.from(prompts, p => p.getAttribute('data-question-id'))).toEqual(preview.questions.map(q => q.id));
    preview.questions.forEach(q => q[locale].options.forEach(option => expect(container.textContent).toContain(option)));
    for (const size of ["a4", "letter"]) {
      const path = `/resources/friendship/friendship-quiz-${locale}-${size}.pdf`;
      expect(container.querySelector(`a[href="${path}"][download]`)).not.toBeNull();
      expect(readFileSync(`public${path}`).subarray(0, 5).toString()).toBe('%PDF-');
    }
    for (const category of Object.keys(preview.categories)) expect(container.querySelector(`a[href="/${locale}/tests/play/friendship-quiz?category=${category}#create"]`)).not.toBeNull();
    expect(container.querySelector(`a[href="/${locale === 'en' ? 'zh' : 'en'}/tests/play/friendship-quiz/questions"]`)).not.toBeNull();
    expect(resourceMetadata(locale, 'questions').alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/friendship-quiz/questions`);
  });
  it("explains a fixed common set, private roles, blank guesses, ties and actual online limits", () => {
    const { container } = render(<QuestionActivity locale="en" />);
    const text = container.textContent!;
    for (const part of ['same question numbers','entire round','folds the key','before revealing','miss or blank earns zero','Ties share a place','2 ÷ 4 × 100 = 50%','denominator becomes three','not single-topic editions','Custom questions are not currently supported']) expect(text).toContain(part);
    expect(text).not.toMatch(/[\u4e00-\u9fff]/);
  });
  it("keeps the Chinese hosting and scoring instructions equivalent", () => {
    const { container } = render(<QuestionActivity locale="zh" />);
    for (const part of ['同一组题号','对本轮所有人取消','收齐后再一起揭晓','猜错或空白得0分','同分并列','分母统一变成3','不是单类专属版','当前不支持添加自定义问题']) expect(container.textContent).toContain(part);
  });
});
