export const MBTI_DESKTOP_ANCHOR_IDS = {
  hero: "mbti-desktop-hero",
  traits: "mbti-desktop-traits",
  career: "mbti-desktop-career",
  growth: "mbti-desktop-growth",
  relationships: "mbti-desktop-relationships",
  offerFull: "mbti-desktop-offer-full",
} as const;

export type MbtiDesktopAnchorSectionKey = keyof typeof MBTI_DESKTOP_ANCHOR_IDS;

export function getMbtiDesktopAnchorId(key: MbtiDesktopAnchorSectionKey): string {
  return MBTI_DESKTOP_ANCHOR_IDS[key];
}

export function getMbtiDesktopAnchorHash(key: MbtiDesktopAnchorSectionKey): `#${string}` {
  return `#${getMbtiDesktopAnchorId(key)}`;
}

export function isMbtiDesktopAnchorHash(hash: string): boolean {
  return Object.values(MBTI_DESKTOP_ANCHOR_IDS).some((id) => `#${id}` === hash);
}
