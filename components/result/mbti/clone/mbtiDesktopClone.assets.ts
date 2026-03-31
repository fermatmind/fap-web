import {
  MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS,
  type MbtiDesktopCloneAssetSlotId,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

export type CloneAssetRef = {
  provider: string | null;
  path: string | null;
  url: string | null;
  version: string | null;
  checksum: string | null;
};

export type CloneResolvedAssetSlot = {
  slotId: MbtiDesktopCloneAssetSlotId;
  label: string;
  aspectRatio: string;
  status: "placeholder" | "ready" | "disabled";
  assetRef: CloneAssetRef | null;
  alt: string | null;
  meta: Record<string, unknown> | null;
};

export function indexAssetSlotsById(
  assetSlots: PersonalityDesktopCloneAssetSlot[] | null | undefined,
): Record<MbtiDesktopCloneAssetSlotId, CloneResolvedAssetSlot | null> {
  const indexed = Object.fromEntries(
    MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS.map((slotId) => [slotId, null]),
  ) as Record<MbtiDesktopCloneAssetSlotId, CloneResolvedAssetSlot | null>;

  if (!assetSlots || assetSlots.length === 0) {
    return indexed;
  }

  for (const slot of assetSlots) {
    if (!slot || !MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS.includes(slot.slotId)) {
      continue;
    }

    indexed[slot.slotId] = {
      slotId: slot.slotId,
      label: slot.label,
      aspectRatio: slot.aspectRatio,
      status: slot.status,
      assetRef: slot.assetRef,
      alt: slot.alt,
      meta: slot.meta,
    };
  }

  return indexed;
}

export function getCloneAssetSlot(
  assetSlots: PersonalityDesktopCloneAssetSlot[] | null | undefined,
  slotId: MbtiDesktopCloneAssetSlotId,
): CloneResolvedAssetSlot | null {
  return indexAssetSlotsById(assetSlots)[slotId];
}

function normalizeUrl(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  const cdnBase = String(process.env.NEXT_PUBLIC_CDN_URL ?? "").trim().replace(/\/+$/, "");
  if (cdnBase) {
    return `${cdnBase}/${normalized.replace(/^\/+/, "")}`;
  }

  return `/${normalized.replace(/^\/+/, "")}`;
}

export function resolveAssetSlotUrl(slot: CloneResolvedAssetSlot | null): string | null {
  if (!slot || slot.status !== "ready" || !slot.assetRef) {
    return null;
  }

  return normalizeUrl(slot.assetRef.url) ?? normalizeUrl(slot.assetRef.path);
}
