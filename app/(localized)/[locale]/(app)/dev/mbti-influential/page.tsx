import { FullReportPreview } from "./FullReportPreview";
import { readFile } from "node:fs/promises";
import { notFound } from "next/navigation";
import { normalizeDesktopCloneResponse } from "@/lib/cms/personality-desktop-clone";
import { MbtiCloneInfluentialTraitsCard } from "@/components/result/mbti/clone/MbtiCloneInfluentialTraitsCard";
import { MbtiCloneStrengthWeaknessBlock } from "@/components/result/mbti/clone/MbtiCloneStrengthWeaknessBlock";
import { MbtiCloneIdeaListBlock } from "@/components/result/mbti/clone/MbtiCloneIdeaListBlock";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "影响因素 · 本地验收", robots: { index: false, follow: false } };

export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ locked?: string; view?: string }>;
}) {
  if (process.env.NODE_ENV !== "development" || (await params).locale !== "zh") notFound();
  const file = process.env.MBTI_INFLUENTIAL_PREVIEW_FILE;
  const payload = file ? await readFile(file, "utf8").then(JSON.parse).catch(() => null) : null;
  const data = payload ? normalizeDesktopCloneResponse(payload, payload.full_code, "zh-CN") : null;
  if (!data) return <p role="alert">预览内容不可用，请配置已发布的公开内容快照。</p>;
  const dimensionFile = process.env.MBTI_PREVIEW_DIMENSIONS_FILE;
  const dimensionSnapshot = dimensionFile ? await readFile(dimensionFile, "utf8").then(JSON.parse).catch(() => null) : null;
  const dimensions = dimensionSnapshot?.fullCode === data.fullCode && Array.isArray(dimensionSnapshot.dimensions)
    ? dimensionSnapshot.dimensions : [];
  const listsOnly = (await searchParams).view === "lists";
  const isUnlocked = (await searchParams).locked !== "1";
  if ((await searchParams).view === "full") return <>
    <aside style={{ padding: "12px 24px", background: "#e8f2ec", color: "#223c30", fontSize: 13 }}>
      {data.fullCode} · 本地版式验收 · 成长与关系四模块为后端未发布样稿；其余使用公开内容及维度快照，不包含作答记录。<a href={isUnlocked ? "?view=full&locked=1" : "?view=full"}>{isUnlocked ? " 查看未解锁版" : " 查看完整内容"}</a>
    </aside>
    <FullReportPreview dimensions={dimensions} data={data} isUnlocked={isUnlocked} reportId={process.env.MBTI_PREVIEW_REPORT_ID} />
  </>;
  const chapters = [["career", "职业路径"], ["growth", "个人成长"], ["relationships", "关系模式"]] as const;
  return <div className={styles.cloneRoot}>
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px" }}>
      <header id="preview" style={{ marginBottom: 40 }}>
        <p style={{ color: "#21825c", fontSize: 12, letterSpacing: ".1em" }}>{data.fullCode} · 本地验收</p>
        <h1 style={{ fontSize: 28, fontWeight: 650, margin: "12px 0" }}>结果报告 · 版式预览</h1>
        <p style={{ fontSize: 13, color: "#737b86", marginBottom: 16 }}>采用已发布的后端公开内容快照。仅预览排版，未提交、未发布。</p>
        <nav aria-label="预览导航" style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 14 }}>
          {chapters.map(([id, title]) => <a key={id} href={`#${id}`}>{title}</a>)}
          <a href={isUnlocked ? "?locked=1" : "?"}>{isUnlocked ? "查看未解锁状态" : "查看完整内容"}</a>
        </nav>
      </header>
      {chapters.map(([id, title], index) => {
        const chapter = data.content.chapters[id];
        return <section key={id} id={id} style={{ marginBottom: 64, scrollMarginTop: 90 }}>
          <h2 style={{ fontSize: 26, fontWeight: 650, marginBottom: 20 }}>{index + 2}. {title}</h2>
          <div className={styles.sectionParagraphs} style={{ marginBottom: 24 }}>
            {chapter.intro.map((text, i) => <p key={i}>{text}</p>)}
          </div>
          {!listsOnly && <MbtiCloneInfluentialTraitsCard sectionId={id} locale="zh" traits={chapter.influentialTraits}
            traitsUnlock={chapter.traitsUnlock} isUnlocked={isUnlocked}
            unlockHref="#preview" unlockPayLabel="解锁完整报告" />}
          {chapter.strengths && <MbtiCloneStrengthWeaknessBlock data={chapter.strengths} testId={`mbti-p0-${id}-strengths`} />}
          {chapter.weaknesses && <MbtiCloneStrengthWeaknessBlock data={chapter.weaknesses} tone="weakness" testId={`mbti-p0-${id}-weaknesses`} />}
          {id === "career" && isUnlocked && data.content.chapters.career.careerIdeas && <MbtiCloneIdeaListBlock data={data.content.chapters.career.careerIdeas} testId="mbti-p1-career-career-ideas" />}
          {id === "career" && isUnlocked && data.content.chapters.career.workStyles && <MbtiCloneIdeaListBlock data={data.content.chapters.career.workStyles} testId="mbti-p1-career-work-styles" />}
        </section>;
      })}
    </div>
  </div>;
}
