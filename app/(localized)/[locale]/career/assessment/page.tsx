import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { CareerAssessmentForm } from "./CareerAssessmentForm";

type Props = { params: Promise<{ locale: string }> };

function title(locale: string) {
  return locale === "zh" ? "费马职业测试（94 题）" : "FermatMind Career Assessment (94 questions)";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: title(locale), robots: { index: false, follow: true } };
}

export default async function CareerAssessmentPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  const zh = locale === "zh";

  return (
    <Container as="main" className="max-w-3xl space-y-6 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/${locale}/career/tests`} className="text-sm font-medium text-slate-700 underline">
          {zh ? "返回职业测试指南" : "Back to the career test guide"}
        </Link>
        <Link href={zh ? "/en/career/assessment" : "/zh/career/assessment"} lang={zh ? "en" : "zh-CN"} className={buttonVariants({ variant: "outline", size: "sm" })}>
          {zh ? "English" : "简体中文"}
        </Link>
      </div>
      <header className="space-y-3">
        <h1 className="m-0 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title(locale)}</h1>
        <p className="m-0 text-base leading-7 text-slate-700">
          {zh
            ? "了解你喜欢做什么、偏好怎样工作，以及选工作时看重哪些条件。提交后可在此页查看分数。"
            : "Explore what you enjoy doing, how you prefer to work, and what matters to you in a job. See your scores on this page after submitting."}
        </p>
        <p className="m-0 text-sm text-slate-600">
          {zh ? "答卷仅用于本次计分。离开前可在当前标签页继续作答。" : "Your answers are used to score this submission. You can resume in this browser tab."}
        </p>
      </header>
      <CareerAssessmentForm locale={locale} />
    </Container>
  );
}
