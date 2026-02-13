"use client";

import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionarySync } from "@/lib/i18n/getDictionary";
import { getLocaleFromPathname } from "@/lib/i18n/locales";

type ResultSummaryProps = {
  title?: string;
  typeCode?: string;
  summary?: string;
};

export function ResultSummary({ title, typeCode, summary }: ResultSummaryProps) {
  const pathname = usePathname() ?? "/";
  const dict = getDictionarySync(getLocaleFromPathname(pathname));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? dict.result.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-slate-700">
        {typeCode ? (
          <p className="m-0 text-sm">
            <span className="font-semibold">Type:</span> {typeCode}
          </p>
        ) : null}
        <p className="m-0 text-sm">{summary ?? "Report summary is being prepared."}</p>
      </CardContent>
    </Card>
  );
}
