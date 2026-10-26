"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { InkblotStimulus } from "@/lib/questionnaires/inkblotStimuli";

export function QuestionnaireInkblotStimulus({ stimulus, locale, onAvailabilityChange }: {
  stimulus: InkblotStimulus | undefined;
  locale: Locale;
  onAvailabilityChange: (available: boolean) => void;
}) {
  const descriptionId = useId(), zh = locale === "zh";
  const [failed, setFailed] = useState(false);
  const label = zh ? `原创墨迹图 ${stimulus?.questionId.slice(-2) ?? ""}` : `Original inkblot ${stimulus?.questionId.slice(-2) ?? ""}`;
  if (!stimulus || failed) return <p role="alert" className="my-5 rounded-lg bg-amber-50 p-4 leading-7">{zh ? "图像暂不可用，无法继续本题。请退出并重新开始，或稍后再试；也可直接阅读公开结果说明。" : "The image is unavailable, so this question cannot continue. Exit and restart, or try later. You can also read the public result guides."}</p>;
  return <figure className="my-5" data-inkblot-stimulus={stimulus.questionId}>
    <Image unoptimized src={stimulus.src} width={720} height={480} alt={label} aria-describedby={descriptionId} className="h-auto w-full rounded-lg border border-slate-200 bg-white" onLoad={() => onAvailabilityChange(true)} onError={() => { setFailed(true); onAvailabilityChange(false); }} />
    <figcaption className="mt-3 text-sm leading-7 text-slate-600"><span>{label}{zh ? " · 费马原创视觉素材" : " · FermatMind original visual"}</span><p id={descriptionId}>{stimulus.description[locale]}</p></figcaption>
  </figure>;
}
