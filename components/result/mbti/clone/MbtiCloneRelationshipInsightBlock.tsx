"use client";

import type { RelationshipInsightBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { MbtiCloneInsightListBlock } from "@/components/result/mbti/clone/MbtiCloneInsightListBlock";

type MbtiCloneRelationshipInsightBlockProps = {
  data: RelationshipInsightBlock;
  locale: "zh" | "en";
  testId: string;
};

export function MbtiCloneRelationshipInsightBlock({
  data,
  locale,
  testId,
}: MbtiCloneRelationshipInsightBlockProps) {
  return <MbtiCloneInsightListBlock data={data} locale={locale} testId={testId} />;
}
