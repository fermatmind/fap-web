"use client";

import Image from "next/image";
import { getSbtiIllustration } from "@/components/sbti/result/sbtiIllustrationMap";

export function SbtiResultIllustrationCard({
  typeCode,
  displayName,
}: {
  typeCode: string;
  displayName: string;
}) {
  const illustration = getSbtiIllustration(typeCode);

  if (!illustration) {
    return null;
  }

  return (
    <div
      data-testid="sbti-result-illustration"
      className="flex min-h-[168px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:min-h-[220px] sm:px-6 sm:py-5"
    >
      <Image
        src={illustration}
        alt={`${displayName} 人格插画`}
        priority
        unoptimized
        className="h-auto max-h-[160px] w-auto max-w-full object-contain sm:max-h-[220px]"
      />
    </div>
  );
}
