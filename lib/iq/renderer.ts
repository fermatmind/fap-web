import type { IqQuestion, IqQuestionOption, IqStemPayload, IqStructuredSvg } from "@/lib/iq/contracts";
import type { QuizVectorGraphic } from "@/lib/quiz/types";

export type IqRenderableSvg = IqStructuredSvg | QuizVectorGraphic | null | undefined;

export type NormalizedIqSvgPath = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  fillRule?: string;
  opacity?: number | string;
};

export type NormalizedIqStructuredSvg = {
  viewBox: string;
  paths: NormalizedIqSvgPath[];
};

export type IqRendererOption = {
  code: string;
  text: string;
  label: string;
  svg?: NormalizedIqStructuredSvg | null;
};

export type IqRendererQuestion = {
  id: string;
  itemId?: string;
  prompt?: string;
  stem?: {
    prompt?: string;
    svg?: NormalizedIqStructuredSvg | null;
  } | null;
  options: IqRendererOption[];
};

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeCode(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return normalizeString(value);
}

export function normalizeIqStructuredSvg(svg: IqRenderableSvg): NormalizedIqStructuredSvg | null {
  if (!svg || typeof svg !== "object") {
    return null;
  }

  const rawViewBox =
    normalizeString((svg as { viewBox?: unknown }).viewBox) ?? normalizeString((svg as { view_box?: unknown }).view_box);
  const rawPaths = Array.isArray((svg as { paths?: unknown[] }).paths) ? (svg as { paths: unknown[] }).paths : [];

  if (!rawViewBox || rawPaths.length === 0) {
    return null;
  }

  const paths = rawPaths
    .map((path) => {
      if (!path || typeof path !== "object") {
        return null;
      }

      const normalizedPath: NormalizedIqSvgPath = {
        d: normalizeString((path as { d?: unknown }).d) ?? "",
      };

      const fill = normalizeString((path as { fill?: unknown }).fill);
      const stroke = normalizeString((path as { stroke?: unknown }).stroke);
      const fillRule =
        normalizeString((path as { fillRule?: unknown }).fillRule) ??
        normalizeString((path as { fill_rule?: unknown }).fill_rule);
      const strokeWidth =
        (path as { strokeWidth?: unknown }).strokeWidth ?? (path as { stroke_width?: unknown }).stroke_width;
      const opacity = (path as { opacity?: unknown }).opacity;

      if (!normalizedPath.d) {
        return null;
      }

      if (fill) normalizedPath.fill = fill;
      if (stroke) normalizedPath.stroke = stroke;
      if (fillRule) normalizedPath.fillRule = fillRule;
      if (typeof strokeWidth === "number" || typeof strokeWidth === "string") {
        normalizedPath.strokeWidth = strokeWidth;
      }
      if (typeof opacity === "number" || typeof opacity === "string") {
        normalizedPath.opacity = opacity;
      }

      return normalizedPath;
    })
    .filter((path): path is NormalizedIqSvgPath => path !== null);

  if (paths.length === 0) {
    return null;
  }

  return {
    viewBox: rawViewBox,
    paths,
  };
}

export function normalizeIqOptionForRenderer(option: IqQuestionOption | Record<string, unknown>): IqRendererOption | null {
  const code =
    normalizeCode((option as { option_code?: unknown }).option_code) ??
    normalizeCode((option as { code?: unknown }).code) ??
    normalizeCode((option as { id?: unknown }).id);

  if (!code) {
    return null;
  }

  const label = normalizeString((option as { label?: unknown }).label) ?? code;
  const text =
    normalizeString((option as { text?: unknown }).text) ??
    normalizeString((option as { label?: unknown }).label) ??
    code;
  const svg = normalizeIqStructuredSvg((option as { svg?: IqRenderableSvg }).svg);

  return {
    code,
    label,
    text,
    svg,
  };
}

export function normalizeIqStemForRenderer(stem: IqStemPayload | Record<string, unknown> | null | undefined): {
  prompt?: string;
  svg?: NormalizedIqStructuredSvg | null;
} | null {
  if (!stem || typeof stem !== "object") {
    return null;
  }

  const prompt =
    normalizeString((stem as { prompt?: unknown }).prompt) ??
    normalizeString((stem as { prompt_en?: unknown }).prompt_en) ??
    normalizeString((stem as { prompt_zh?: unknown }).prompt_zh) ??
    normalizeString((stem as { text?: unknown }).text);
  const svg = normalizeIqStructuredSvg((stem as { svg?: IqRenderableSvg }).svg);

  if (!prompt && !svg) {
    return null;
  }

  return {
    ...(prompt ? { prompt } : {}),
    ...(svg ? { svg } : {}),
  };
}

export function normalizeIqQuestionForRenderer(question: IqQuestion | Record<string, unknown>): IqRendererQuestion | null {
  const id =
    normalizeString((question as { question_id?: unknown }).question_id) ??
    normalizeString((question as { item_id?: unknown }).item_id);

  if (!id) {
    return null;
  }

  const itemId = normalizeString((question as { item_id?: unknown }).item_id);
  const prompt =
    normalizeString((question as { prompt?: unknown }).prompt) ??
    normalizeString((question as { text?: unknown }).text);
  const stem = normalizeIqStemForRenderer((question as { stem?: IqStemPayload | Record<string, unknown> | null }).stem);
  const rawOptions = Array.isArray((question as { options?: unknown[] }).options)
    ? ((question as { options: unknown[] }).options ?? [])
    : [];
  const options = rawOptions
    .map((option) => normalizeIqOptionForRenderer(option as IqQuestionOption | Record<string, unknown>))
    .filter((option): option is IqRendererOption => option !== null);

  return {
    id,
    ...(itemId ? { itemId } : {}),
    ...(prompt ? { prompt } : {}),
    ...(stem ? { stem } : {}),
    options,
  };
}

