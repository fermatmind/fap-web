import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { personalityCareerHref } from "@/lib/mbti/personalityCareerHref";
import { MBTI_TYPE_GROUPS } from "@/lib/mbti/mbtiTypeContentPack";

export function MbtiTopicTypeGrid({ locale }: { locale: DisplayLocale }) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid="mbti-topic-type-grid"
    >
      <div className="space-y-2">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {/* Contract marker: MBTI type continue grid */}
          {locale === "zh-TW" ? "延伸閱讀 MBTI 16 型人格" : locale === "zh" ? "MBTI 类型延伸入口" : "Continue with MBTI types"}
        </h2>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
          {locale === "zh-TW"
            ? "先了解模型基礎與適用範圍，再閱讀各類型說明或探索職涯。選擇職業或科系時，也要考量興趣、能力與現實條件。"
            : locale === "zh"
            ? "先读模型基础与使用边界，再选择类型说明或职业探索内容；职业与专业选择还需结合兴趣、能力和现实条件。"
            : "Read the model basics and limits first, then continue to type descriptions or career exploration. Career and major choices also require interests, skills, and real constraints."}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(Object.entries(MBTI_TYPE_GROUPS) as Array<[keyof typeof MBTI_TYPE_GROUPS, readonly string[]]>).map(([groupKey, typeCodes]) => (
          <Card key={groupKey} className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{groupKey}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              {typeCodes.map((typeCode) => {
                const personalityHref = `/${locale}/personality/${typeCode.toLowerCase()}-a`;
                const recommendationHref = personalityCareerHref(locale, typeCode);

                return (
                  <div key={typeCode} className="space-y-1 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
                    <p className="m-0 font-medium text-[var(--fm-text)]">{typeCode}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={personalityHref} className="fm-help-chip-link">
                        {locale === "zh-TW" ? "類型說明" : locale === "zh" ? "类型页" : "Personality"}
                      </Link>
                      <Link href={recommendationHref} className="fm-help-chip-link">
                        {locale === "zh-TW" ? "職涯探索" : locale === "zh" ? "职业探索" : "Career exploration"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
