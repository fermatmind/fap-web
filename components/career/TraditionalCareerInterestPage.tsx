import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { CareerExplorationPilot } from "@/components/career/CareerExplorationPilot";
import { Container } from "@/components/layout/Container";
import { CAREER_INTEREST_TAIWAN_COPY } from "@/lib/career/explorationPilotTaiwan";
import { careerExplorationPilotPath, type CareerInterestPilot } from "@/lib/career/explorationPilot";
import { isConfiguredStagingSiteUrl } from "@/lib/site";

export function taiwanCareerInterestMetadata(code: CareerInterestPilot): Metadata {
  const { title, summary } = CAREER_INTEREST_TAIWAN_COPY[code];
  return {
    title,
    description: summary,
    alternates: { canonical: careerExplorationPilotPath("zh-TW", code) },
    robots: { index: false, follow: !isConfiguredStagingSiteUrl() },
  };
}

export function TraditionalCareerInterestPage({ code }: { code: CareerInterestPilot }) {
  const { title, summary } = CAREER_INTEREST_TAIWAN_COPY[code];
  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="article" className="max-w-4xl space-y-6 py-10 sm:py-14">
        <Breadcrumb items={[{ label: "首頁", href: "/zh-TW" }, { label: "職涯資料庫", href: "/zh-TW/career" }, { label: code.toUpperCase() }]} />
        <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
          <Link href={careerExplorationPilotPath("zh", code)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
          <Link href={careerExplorationPilotPath("en", code)} lang="en" className="min-h-11 py-2 underline">English</Link>
        </nav>
        <header className="space-y-3">
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="m-0 text-lg leading-8 text-slate-700">{summary}</p>
        </header>
        <CareerExplorationPilot pilot={code} locale="zh-TW" />
      </Container>
    </main>
  );
}
