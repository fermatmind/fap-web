"use client";

import type { EnergyBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { MbtiCloneInsightListBlock } from "@/components/result/mbti/clone/MbtiCloneInsightListBlock";

type MbtiCloneEnergyBlockProps = {
  data: EnergyBlock;
  locale: "zh" | "en";
  testId: string;
};

export function MbtiCloneEnergyBlock({
  data,
  locale,
  testId,
}: MbtiCloneEnergyBlockProps) {
  return <MbtiCloneInsightListBlock data={data} locale={locale} testId={testId} />;
}
