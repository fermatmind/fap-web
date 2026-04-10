"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import {
  getCloneAssetSlot,
  resolveAssetSlotUrl,
} from "@/components/result/mbti/clone/mbtiDesktopClone.assets";
import type { MbtiDesktopCloneAssetSlotId } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";

type MbtiCloneAssetSlotProps = {
  slotId: MbtiDesktopCloneAssetSlotId;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
  fallbackLabel: string;
  className: string;
  labelClassName: string;
  imageClassName?: string;
  testId?: string;
};

export function MbtiCloneAssetSlot({
  slotId,
  assetSlots,
  fallbackLabel,
  className,
  labelClassName,
  imageClassName,
  testId,
}: MbtiCloneAssetSlotProps) {
  const [assetLoadFailed, setAssetLoadFailed] = useState(false);

  const slot = useMemo(
    () => getCloneAssetSlot(assetSlots, slotId),
    [assetSlots, slotId],
  );

  const resolvedUrl = useMemo(() => resolveAssetSlotUrl(slot), [slot]);

  const slotLabel = slot?.label?.trim() || fallbackLabel;
  const slotAlt = slot?.alt?.trim() || slotLabel;
  const mode: "ready" | "placeholder" | "disabled" = slot?.status === "disabled"
    ? "disabled"
    : slot?.status === "ready" && !assetLoadFailed && Boolean(resolvedUrl)
      ? "ready"
      : "placeholder";
  const showSlotLabel = mode === "ready";

  return (
    <div
      data-testid={testId}
      data-slot-id={slotId}
      data-slot-mode={mode}
      className={clsx(
        className,
        mode === "ready" && styles.assetSlotReady,
        mode === "disabled" && styles.assetSlotDisabled,
      )}
    >
      {mode === "ready" && resolvedUrl ? (
        <Image
          src={resolvedUrl}
          alt={slotAlt}
          fill
          sizes="(max-width: 960px) 100vw, 640px"
          unoptimized
          loading="lazy"
          className={clsx(styles.assetSlotImage, imageClassName)}
          onError={() => {
            setAssetLoadFailed(true);
          }}
        />
      ) : null}
      {showSlotLabel ? <p className={labelClassName}>{slotLabel}</p> : null}
    </div>
  );
}
