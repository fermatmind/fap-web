import Link from "next/link";
import { WrittenCoordinationGrid } from "@/components/questionnaires/WrittenCoordinationGrid";
import { isAfqt32ConfigurationValid } from "@/lib/questionnaires/afqt32";
import { isCritical30ConfigurationValid } from "@/lib/questionnaires/critical30";
import { isReasoning18ConfigurationValid } from "@/lib/questionnaires/reasoning18";
import { isTechnical30ConfigurationValid } from "@/lib/questionnaires/technical30";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isWrittenCoordinationConfigurationValid } from "@/lib/questionnaires/writtenCoordination";

export function TraditionalWorkReasoningContext({ quiz, profile }: { quiz: Questionnaire; profile?: string }) {
  const edition = isAfqt32ConfigurationValid(quiz) ? quiz.afqt32
    : isTechnical30ConfigurationValid(quiz) ? quiz.technical30
      : isReasoning18ConfigurationValid(quiz) ? quiz.reasoning18
        : isCritical30ConfigurationValid(quiz) ? quiz.critical30 : undefined;
  if (edition) return <>
    <aside className="space-y-3 rounded-lg border p-4 leading-7">
      <p>{edition.attribution.zh}</p>
      <p>{edition.editionNotice.zh}</p>
    </aside>
    {!profile && <section className="space-y-2">
      <h2 className="text-xl font-semibold">探索職業興趣</h2>
      <p>可另外探索自己喜歡的活動。職業興趣測驗與這項練習分開運作，連結不會附帶你的答案。</p>
      <Link className="inline-block min-h-11 py-2 underline" href="/zh-TW/tests/holland-career-interest-test-riasec">查看 RIASEC 職業興趣測驗</Link>
    </section>}
  </>;
  if (isWrittenCoordinationConfigurationValid(quiz)) return <>
    <aside className="space-y-3 rounded-lg border p-4 leading-7">
      <p>卡片、題目、規則、地圖和結果指南皆為費馬原創。此練習沒有 CritiCall 或 Biddle Consulting Group 的關聯、授權或背書，也不能用來判定調度員資格。</p>
      <p>練習採用英文材料，另提供繁體說明與解析。虛構地圖及排序不能用於真實來電或導航。這項練習尚未建立常模、招聘效度、訓練效果或英中文表現等值。</p>
    </aside>
    {(!profile || profile === "map") && <WrittenCoordinationGrid grid={quiz.coordination.grid} locale="zh" traditional idPrefix="written-public-grid" />}
  </>;
  if (quiz.kind === "distributed-work24") return <aside className="space-y-3 rounded-lg border p-4 leading-7">
    <p>這 24 組協作選擇及四篇指南由費馬原創。次數來自同一組相對選擇，不能視為四個獨立的特質分數。即使全部未計分，仍可閱讀四篇全文。</p>
    <p>目前尚未建立常模、心理計量驗證、訓練效果或英中文等值。這項回顧無法評估誠信、工作表現或遠距工作的適任性。公開工作實務資料供背景參考。</p>
  </aside>;
  return null;
}
