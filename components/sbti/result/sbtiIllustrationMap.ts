import type { SbtiRawTypeCode } from "@/lib/sbti/types";

export type SbtiIllustrationAsset = {
  src: string;
  width: number;
  height: number;
};

export const SBTI_ILLUSTRATION_MAP: Record<SbtiRawTypeCode, SbtiIllustrationAsset> = {
  IMSB: { src: "/static/sbti/illustrations/IMSB.png", width: 92, height: 114 },
  BOSS: { src: "/static/sbti/illustrations/BOSS.png", width: 75, height: 127 },
  MUM: { src: "/static/sbti/illustrations/MUM.png", width: 75, height: 109 },
  FAKE: { src: "/static/sbti/illustrations/FAKE.png", width: 109, height: 126 },
  DEAD: { src: "/static/sbti/illustrations/DEAD.png", width: 182, height: 104 },
  ZZZZ: { src: "/static/sbti/illustrations/ZZZZ.png", width: 202, height: 111 },
  GOGO: { src: "/static/sbti/illustrations/GOGO.png", width: 64, height: 105 },
  FUCK: { src: "/static/sbti/illustrations/FUCK.png", width: 150, height: 128 },
  CTRL: { src: "/static/sbti/illustrations/CTRL.png", width: 82, height: 102 },
  HHHH: { src: "/static/sbti/illustrations/HHHH.png", width: 113, height: 124 },
  SEXY: { src: "/static/sbti/illustrations/SEXY.png", width: 70, height: 122 },
  OJBK: { src: "/static/sbti/illustrations/OJBK.png", width: 91, height: 117 },
  POOR: { src: "/static/sbti/illustrations/POOR.png", width: 118, height: 128 },
  "OH-NO": { src: "/static/sbti/illustrations/OH-NO.png", width: 164, height: 125 },
  MONK: { src: "/static/sbti/illustrations/MONK.png", width: 75, height: 108 },
  SHIT: { src: "/static/sbti/illustrations/SHIT.png", width: 84, height: 100 },
  "THAN-K": { src: "/static/sbti/illustrations/THAN-K.png", width: 78, height: 109 },
  MALO: { src: "/static/sbti/illustrations/MALO.png", width: 104, height: 107 },
  ATM: { src: "/static/sbti/illustrations/ATM.png", width: 91, height: 119 },
  "THIN-K": { src: "/static/sbti/illustrations/THIN-K.png", width: 178, height: 128 },
  SOLO: { src: "/static/sbti/illustrations/SOLO.png", width: 80, height: 108 },
  "LOVE-R": { src: "/static/sbti/illustrations/LOVE-R.png", width: 95, height: 128 },
  WOC: { src: "/static/sbti/illustrations/WOC.png", width: 90, height: 115 },
  DRUNK: { src: "/static/sbti/illustrations/DRUNK.png", width: 113, height: 125 },
  IMFW: { src: "/static/sbti/illustrations/IMFW.png", width: 62, height: 107 },
};

export function getSbtiIllustration(typeCode: string): SbtiIllustrationAsset | null {
  return SBTI_ILLUSTRATION_MAP[typeCode as SbtiRawTypeCode] ?? null;
}
