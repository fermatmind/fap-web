import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Career94FreeReport } from "../Career94FreeReport";
import styles from "../CareerAssessmentResult.module.css";

const robots = { index: false, follow: true };
const zhTitle = "免费职业测试（94题）公开报告样例｜费马测试";
const zhDescription = "查看费马职业兴趣与工作偏好测评（94题）的公开合成报告样例，了解免费基础结果里的六维兴趣、三字代码和职业候选。";
const zhTake = "/zh/career/assessment/take";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "zh"
    ? { title: { absolute: zhTitle }, description: zhDescription, robots }
    : { title: "Career interest report sample | FermatMind", robots };
}

export default async function Career94SamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  if (locale === "en") return <main><Career94FreeReport locale={locale} sample /></main>;

  return (
    <main data-career94-public-sample>
      <header className={styles.publicSampleIntro}>
        <p><strong>费马职业兴趣与工作偏好测评（94题）</strong> · 公开合成示例</p>
        <p>以下使用虚构作答展示免费基础报告里的六维兴趣、三字代码和初步职业候选。</p>
        <Link className={styles.readingCta} href={zhTake} prefetch={false}>免费开始 94 题测试 →</Link>
      </header>
      <Career94FreeReport locale="zh" sample framedSample />
      <div className={styles.publicSampleFooter}>
        <Link className={styles.readingCta} href={zhTake} prefetch={false}>开始我的免费职业测试 →</Link>
      </div>
    </main>
  );
}
