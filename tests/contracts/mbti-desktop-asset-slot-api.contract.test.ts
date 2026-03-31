import { describe, expect, it } from "vitest";
import {
  getCloneAssetSlot,
  indexAssetSlotsById,
  resolveAssetSlotUrl,
  type CloneResolvedAssetSlot,
} from "@/components/result/mbti/clone/mbtiDesktopClone.assets";
import { MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";

function createAssetSlots(): PersonalityDesktopCloneAssetSlot[] {
  return [
    {
      slotId: "hero-illustration",
      label: "Hero illustration",
      aspectRatio: "236:160",
      status: "ready",
      assetRef: {
        provider: "cdn",
        path: "mbti/desktop/hero/infj-a/v1.webp",
        url: "https://cdn.example.com/mbti/desktop/hero/infj-a/v1.webp",
        version: "v1",
        checksum: "sha256:hero",
      },
      alt: "Hero image",
      meta: null,
    },
    {
      slotId: "traits-illustration",
      label: "Traits illustration",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "traits-summary-illustration",
      label: "Traits summary",
      aspectRatio: "240:118",
      status: "disabled",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "career-illustration",
      label: "Career illustration",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "growth-illustration",
      label: "Growth illustration",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "relationships-illustration",
      label: "Relationships illustration",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "final-offer-illustration",
      label: "Final offer illustration",
      aspectRatio: "252:220",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
  ];
}

describe("MBTI desktop clone asset slot api contract", () => {
  it("indexes canonical asset slots by slot_id and does not rely on incoming order", () => {
    const reversed = [...createAssetSlots()].reverse();
    const indexed = indexAssetSlotsById(reversed);

    expect(Object.keys(indexed)).toEqual(MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS);
    expect(indexed["hero-illustration"]?.status).toBe("ready");
    expect(indexed["traits-summary-illustration"]?.status).toBe("disabled");
  });

  it("maps ready/placeholder/disabled correctly and resolves urls safely", () => {
    const slots = createAssetSlots();

    const ready = getCloneAssetSlot(slots, "hero-illustration") as CloneResolvedAssetSlot;
    const placeholder = getCloneAssetSlot(slots, "traits-illustration") as CloneResolvedAssetSlot;
    const disabled = getCloneAssetSlot(slots, "traits-summary-illustration") as CloneResolvedAssetSlot;

    expect(ready.status).toBe("ready");
    expect(resolveAssetSlotUrl(ready)).toBe("https://cdn.example.com/mbti/desktop/hero/infj-a/v1.webp");

    expect(placeholder.status).toBe("placeholder");
    expect(resolveAssetSlotUrl(placeholder)).toBeNull();

    expect(disabled.status).toBe("disabled");
    expect(resolveAssetSlotUrl(disabled)).toBeNull();
  });

  it("falls back to same-origin path when ready slot has path without explicit CDN host", () => {
    const slots = createAssetSlots();
    slots[0] = {
      ...slots[0],
      assetRef: {
        provider: "internal",
        path: "mbti/desktop/hero/infj-a/v2.webp",
        url: null,
        version: "v2",
        checksum: null,
      },
    };

    const ready = getCloneAssetSlot(slots, "hero-illustration");
    expect(resolveAssetSlotUrl(ready)).toBe("/mbti/desktop/hero/infj-a/v2.webp");
  });

  it("treats ready slots with missing/invalid asset_ref as placeholder path in renderer", () => {
    const slots = createAssetSlots();
    slots[0] = {
      ...slots[0],
      status: "ready",
      assetRef: {
        provider: "cdn",
        path: null,
        url: null,
        version: null,
        checksum: null,
      },
    };

    const readyBroken = getCloneAssetSlot(slots, "hero-illustration");
    expect(readyBroken?.status).toBe("ready");
    expect(resolveAssetSlotUrl(readyBroken)).toBeNull();
  });
});
