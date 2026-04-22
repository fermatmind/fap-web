"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import type { RiasecResultViewModel } from "@/lib/riasec/resultAssembler";

const DIMENSION_COPY: Record<string, { en: string; zh: string }> = {
  R: { en: "Hands-on work, tools, equipment, implementation, and tangible outcomes.", zh: "偏好动手实践、工具设备、现场实施与可见成果。" },
  I: { en: "Research, analysis, evidence, systems, and independent problem solving.", zh: "偏好研究分析、证据推理、系统理解与独立解决问题。" },
  A: { en: "Original creation, expression, aesthetics, content, and open-ended tasks.", zh: "偏好原创表达、审美创作、内容塑造与开放式任务。" },
  S: { en: "Helping, teaching, listening, coordination, and human-centered work.", zh: "偏好助人支持、教学辅导、倾听协调与人际互动。" },
  E: { en: "Influence, leadership, business development, competition, and results.", zh: "偏好影响他人、主导推进、商业拓展、竞争突破与结果达成。" },
  C: { en: "Structure, detail, records, standards, operations, and reliable execution.", zh: "偏好结构流程、细节校验、记录规范、运营执行与稳定交付。" },
};

export function RiasecResultShell({
  locale,
  viewModel,
}: {
  locale: Locale;
  viewModel: RiasecResultViewModel;
}) {
  const isZh = locale === "zh";
  const enhancedVisible =
    Object.keys(viewModel.enhancedBreakdown.activity).length > 0 ||
    Object.keys(viewModel.enhancedBreakdown.environment).length > 0 ||
    Object.keys(viewModel.enhancedBreakdown.role).length > 0;

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      <section className="rounded-2xl border border-[var(--fm-border)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
          {isZh ? "霍兰德职业兴趣主码" : "Holland career interest code"}
        </div>
        <h1 className="mt-[var(--fm-space-2)] text-4xl font-bold text-[var(--fm-text)]">{viewModel.topCode}</h1>
        <p className="mt-[var(--fm-space-3)] max-w-3xl text-base leading-7 text-[var(--fm-text-muted)]">
          {isZh
            ? `你的前三个兴趣维度依次是 ${viewModel.primaryType}、${viewModel.secondaryType}、${viewModel.tertiaryType}。清晰度指数 ${viewModel.clarityIndex}，兴趣广度 ${viewModel.breadthIndex}。`
            : `Your top three interest dimensions are ${viewModel.primaryType}, ${viewModel.secondaryType}, and ${viewModel.tertiaryType}. Clarity index ${viewModel.clarityIndex}, breadth index ${viewModel.breadthIndex}.`}
        </p>
        {viewModel.qualityGrade !== "A" || viewModel.qualityFlags.length > 0 ? (
          <p className="mt-[var(--fm-space-3)] text-sm text-amber-700">
            {isZh ? "作答质量提示" : "Response quality"}: {viewModel.qualityGrade}
            {viewModel.qualityFlags.length > 0 ? ` · ${viewModel.qualityFlags.join(", ")}` : ""}
          </p>
        ) : null}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{isZh ? "六维兴趣分数" : "Six RIASEC scores"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[var(--fm-gap-sm)]">
          {viewModel.dimensions.map((dimension) => (
            <div key={dimension.code} className="space-y-2">
              <div className="flex items-center justify-between gap-[var(--fm-gap-sm)] text-sm font-semibold">
                <span>{dimension.code} · {dimension.label}</span>
                <span>{Math.round(dimension.score)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[var(--fm-trust-blue)]" style={{ width: `${Math.max(0, Math.min(100, dimension.score))}%` }} />
              </div>
              <p className="text-sm leading-6 text-[var(--fm-text-muted)]">
                {DIMENSION_COPY[dimension.code]?.[locale] ?? DIMENSION_COPY[dimension.code]?.en ?? ""}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {enhancedVisible ? (
        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "增强版分层结果" : "Enhanced form breakdown"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-[var(--fm-gap-sm)] md:grid-cols-3">
            {[
              [isZh ? "活动兴趣" : "Activity", viewModel.enhancedBreakdown.activity],
              [isZh ? "环境偏好" : "Environment", viewModel.enhancedBreakdown.environment],
              [isZh ? "角色偏好" : "Role", viewModel.enhancedBreakdown.role],
            ].map(([label, values]) => (
              <div key={String(label)} className="rounded-xl border border-[var(--fm-border)] p-[var(--fm-space-4)]">
                <div className="text-sm font-semibold text-[var(--fm-text)]">{String(label)}</div>
                <div className="mt-[var(--fm-space-3)] space-y-2 text-sm text-[var(--fm-text-muted)]">
                  {Object.entries(values as Record<string, number>).map(([code, value]) => (
                    <div key={code} className="flex justify-between">
                      <span>{code}</span>
                      <span>{Math.round(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
