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
    <div className="flex min-h-[180px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white/90 px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:min-h-[220px]">
      <Image
        src={illustration.src}
        alt={`${displayName} 人格插画`}
        width={illustration.width}
        height={illustration.height}
        priority
        className="h-auto max-h-[180px] w-auto max-w-full object-contain sm:max-h-[220px]"
      />
    </div>
  );
}
