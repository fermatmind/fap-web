import type { QuestionsMeta, ScaleQuestionItem, ScaleQuestionOption } from "@/lib/api/v0_3";
import type { QuizOption, QuizQuestion, QuizQuestionStem, QuizVectorGraphic, QuizVectorPath } from "@/lib/quiz/types";

type Locale = "en" | "zh";

type OptionAnchor = {
  code?: string;
  label?: string;
  text?: string;
};

function toNonEmptyString(value: unknown): string {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized;
}

function toSvgPaths(value: unknown): QuizVectorPath[] {
  if (!Array.isArray(value)) return [];

  const out: QuizVectorPath[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const node = item as Record<string, unknown>;
    const d = toNonEmptyString(node.d);
    if (!d) continue;

    out.push({
      d,
      ...(toNonEmptyString(node.fill) ? { fill: toNonEmptyString(node.fill) } : {}),
      ...(toNonEmptyString(node.fill_rule) ? { fillRule: toNonEmptyString(node.fill_rule) } : {}),
      ...(toNonEmptyString(node.stroke) ? { stroke: toNonEmptyString(node.stroke) } : {}),
      ...(typeof node.stroke_width === "number" || typeof node.stroke_width === "string"
        ? { strokeWidth: node.stroke_width }
        : {}),
    });
  }

  return out;
}

function toQuizVectorGraphic(value: unknown): QuizVectorGraphic | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const node = value as Record<string, unknown>;
  const viewBox = toNonEmptyString(node.view_box ?? node.viewBox);
  const paths = toSvgPaths(node.paths);
  if (!viewBox || paths.length === 0) return null;
  return {
    viewBox,
    paths,
  };
}

function toQuizStem(question: ScaleQuestionItem, locale: Locale): QuizQuestionStem | null {
  const stemNode = question.stem;
  if (!stemNode || typeof stemNode !== "object" || Array.isArray(stemNode)) return null;

  const promptZh = toNonEmptyString((stemNode as Record<string, unknown>).prompt_zh);
  const promptEn = toNonEmptyString((stemNode as Record<string, unknown>).prompt_en);
  const prompt = locale === "zh" ? promptZh || promptEn : promptEn || promptZh;
  const svg = toQuizVectorGraphic((stemNode as Record<string, unknown>).svg);

  if (!prompt && !svg) return null;
  return {
    ...(prompt ? { prompt } : {}),
    ...(svg ? { svg } : {}),
  };
}

function normalizeQuestionOptions(options: ScaleQuestionOption[] | null | undefined): QuizOption[] {
  if (!Array.isArray(options)) return [];

  const out: QuizOption[] = [];
  for (const option of options) {
    const code = toNonEmptyString(option?.code);
    if (!code) continue;

    const text = toNonEmptyString(option?.text) || toNonEmptyString(option?.label) || code;
    const svg = toQuizVectorGraphic(option?.svg);
    out.push({
      id: code,
      text,
      ...(svg ? { svg } : {}),
    });
  }
  return out;
}

function normalizeAnchorOptions(meta: QuestionsMeta | undefined): QuizOption[] {
  const anchors = Array.isArray(meta?.option_anchors) ? (meta.option_anchors as OptionAnchor[]) : [];
  const out: QuizOption[] = [];
  for (const anchor of anchors) {
    const code = toNonEmptyString(anchor?.code);
    if (!code) continue;
    const text = toNonEmptyString(anchor?.label) || toNonEmptyString(anchor?.text) || code;
    out.push({ id: code, text });
  }
  return out;
}

function normalizeFormatOptions(format: string[] | undefined): QuizOption[] {
  if (!Array.isArray(format)) return [];

  const out: QuizOption[] = [];
  for (let idx = 0; idx < format.length; idx += 1) {
    const raw = toNonEmptyString(format[idx]);
    if (!raw) continue;
    const code = String.fromCharCode(65 + idx);
    out.push({ id: code, text: raw });
  }
  return out;
}

function resolveQuestionTitle({
  question,
  stem,
  locale,
  index,
}: {
  question: ScaleQuestionItem;
  stem: QuizQuestionStem | null;
  locale: Locale;
  index: number;
}): string {
  const text = toNonEmptyString(question.text);
  if (text) return text;
  if (stem?.prompt) return stem.prompt;
  return locale === "zh" ? `第 ${index + 1} 题` : `Question ${index + 1}`;
}

export function normalizeQuizQuestions({
  items,
  locale,
  meta,
  optionsFormat,
}: {
  items: ScaleQuestionItem[];
  locale: Locale;
  meta?: QuestionsMeta;
  optionsFormat?: string[];
}): QuizQuestion[] {
  const anchorOptions = normalizeAnchorOptions(meta);
  const formatOptions = normalizeFormatOptions(optionsFormat);

  return items.map((question, index) => {
    const stem = toQuizStem(question, locale);
    const questionOptions = normalizeQuestionOptions(question.options);
    const options = questionOptions.length > 0 ? questionOptions : anchorOptions.length > 0 ? anchorOptions : formatOptions;
    const title = resolveQuestionTitle({ question, stem, locale, index });

    return {
      id: question.question_id,
      title,
      options,
      stem,
    };
  });
}
