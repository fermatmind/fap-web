import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";

export function generateMetadata(): Metadata {
  return traditionalSearchMetadata("/zh-TW/business", {
    title: "企業服務",
    description: "了解組織如何運用測評探索團隊溝通需求，以及費馬測試可提供的服務範圍。",
    alternates: { canonical: "/zh-TW/business" },
    robots: { index: false, follow: true },
  });
}

const pillars = [
  {
    title: "組織使用範圍",
    body: "人格與興趣測評結果不能取代能力、工作樣本和實際工作表現，也不能作為篩選依據。",
  },
  {
    title: "團隊溝通",
    body: "團隊可以根據成員自願分享的溝通偏好，討論具體的協作問題。分工不應由人格類型或測評分數決定。",
  },
  {
    title: "個人發展",
    body: "按照個人設定的目標記錄具體行動與回饋。不同測評次數之間的分數變化，不能用來證明能力提升或介入成效。",
  },
];

export default function TraditionalBusinessPage() {
  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-md)]">
        <h1 className="m-0 font-serif text-4xl font-semibold text-[var(--fm-text)]">企業測評服務</h1>
        <p className="m-0 max-w-3xl text-[var(--fm-text-muted)]">
          費馬測試可用於探索團隊的自我觀察與溝通需求。測評內容不適用於招募篩選、錄用、升遷或職務適配判斷。請聯絡客服確認可提供的服務範圍。
        </p>
        <Link href="/zh-TW/help/contact" className={buttonVariants({})}>聯絡企業服務</Link>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map(({ title, body }) => (
          <Card key={title} className="h-full border-[var(--fm-border)] bg-[var(--fm-surface)]">
            <CardHeader><CardTitle className="font-serif text-xl text-[var(--fm-text)]">{title}</CardTitle></CardHeader>
            <CardContent><p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{body}</p></CardContent>
          </Card>
        ))}
      </section>
    </Container>
  );
}
