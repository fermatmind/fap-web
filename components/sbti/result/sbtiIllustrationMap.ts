import type { StaticImageData } from "next/image";
import imsbIllustration from "@/components/sbti/result/assets/imsb.png";
import bossIllustration from "@/components/sbti/result/assets/boss.png";
import mumIllustration from "@/components/sbti/result/assets/mum.png";
import fakeIllustration from "@/components/sbti/result/assets/fake.png";
import deadIllustration from "@/components/sbti/result/assets/dead.png";
import zzzzIllustration from "@/components/sbti/result/assets/zzzz.png";
import gogoIllustration from "@/components/sbti/result/assets/gogo.png";
import fuckIllustration from "@/components/sbti/result/assets/fuck.png";
import ctrlIllustration from "@/components/sbti/result/assets/ctrl.png";
import hhhhIllustration from "@/components/sbti/result/assets/hhhh.png";
import sexyIllustration from "@/components/sbti/result/assets/sexy.png";
import ojbkIllustration from "@/components/sbti/result/assets/ojbk.png";
import poorIllustration from "@/components/sbti/result/assets/poor.png";
import ohNoIllustration from "@/components/sbti/result/assets/oh-no.png";
import monkIllustration from "@/components/sbti/result/assets/monk.png";
import shitIllustration from "@/components/sbti/result/assets/shit.png";
import thankIllustration from "@/components/sbti/result/assets/than-k.png";
import maloIllustration from "@/components/sbti/result/assets/malo.png";
import atmErIllustration from "@/components/sbti/result/assets/atm-er.png";
import thinKIllustration from "@/components/sbti/result/assets/thin-k.png";
import soloIllustration from "@/components/sbti/result/assets/solo.png";
import loveRIllustration from "@/components/sbti/result/assets/love-r.png";
import wocIllustration from "@/components/sbti/result/assets/woc.png";
import drunkIllustration from "@/components/sbti/result/assets/drunk.png";
import imfwIllustration from "@/components/sbti/result/assets/imfw.png";
import type { SbtiRawTypeCode } from "@/lib/sbti/types";

export type SbtiIllustrationAsset = StaticImageData | string;

export const SBTI_ILLUSTRATION_MAP = {
  IMSB: imsbIllustration,
  BOSS: bossIllustration,
  MUM: mumIllustration,
  FAKE: fakeIllustration,
  DEAD: deadIllustration,
  ZZZZ: zzzzIllustration,
  GOGO: gogoIllustration,
  FUCK: fuckIllustration,
  CTRL: ctrlIllustration,
  HHHH: hhhhIllustration,
  SEXY: sexyIllustration,
  OJBK: ojbkIllustration,
  POOR: poorIllustration,
  "OH-NO": ohNoIllustration,
  MONK: monkIllustration,
  SHIT: shitIllustration,
  "THAN-K": thankIllustration,
  MALO: maloIllustration,
  ATM: atmErIllustration,
  "THIN-K": thinKIllustration,
  SOLO: soloIllustration,
  "LOVE-R": loveRIllustration,
  WOC: wocIllustration,
  DRUNK: drunkIllustration,
  IMFW: imfwIllustration,
} satisfies Record<SbtiRawTypeCode, SbtiIllustrationAsset>;

export function getSbtiIllustration(typeCode: string): SbtiIllustrationAsset | null {
  return SBTI_ILLUSTRATION_MAP[typeCode as SbtiRawTypeCode] ?? null;
}

export function resolveSbtiIllustrationSrc(illustration: SbtiIllustrationAsset): string {
  return typeof illustration === "string" ? illustration : illustration.src;
}
