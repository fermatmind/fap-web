"use client";

import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { Progress } from "@/components/ui/progress";

type Dimension = {
  key?: string;
  code?: string;
  label?: string;
  score?: number;
  percent?: number;
  value?: number;
  [key: string]: unknown;
};

function normalizePercent(value: Dimension): number {
  const candidates = [value.percent, value.score, value.value].filter(
    (item): item is number => typeof item === "number" && Number.isFinite(item)
  );

  if (candidates.length === 0) return 0;

  const raw = candidates[0];
  if (raw > 1 && raw <= 100) return raw;
  if (raw >= 0 && raw <= 1) return raw * 100;
  return Math.max(0, Math.min(100, raw));
}

export function DimensionBars({ dimensions }: { dimensions: Dimension[] }) {
  const pathname = usePathname() ?? "/";
  const dict = getDictSync(getLocaleFromPathname(pathname));

  if (!dimensions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.result.breakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-slate-600">{dict.result.noDimensions}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.result.breakdown}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((item, index) => {
          const label = item.label ?? item.code ?? item.key ?? `Dimension ${index + 1}`;
          const percent = normalizePercent(item);

          return (
            <div key={`${label}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>{label}</span>
                <span>{Math.round(percent)}%</span>
              </div>
              <Progress value={percent} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
