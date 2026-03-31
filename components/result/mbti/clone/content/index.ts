import type { MbtiBaseCode, MbtiDesktopCloneContent, MbtiDesktopCloneContentPatch, MbtiFullCode } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { MBTI_FULL_CODES } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { mergeMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";
import ENFJ_ZH_CONTENT from "@/components/result/mbti/clone/content/enfj.zh";
import ENFP_ZH_CONTENT from "@/components/result/mbti/clone/content/enfp.zh";
import ENTJ_ZH_CONTENT from "@/components/result/mbti/clone/content/entj.zh";
import ENTP_ZH_CONTENT from "@/components/result/mbti/clone/content/entp.zh";
import ESFJ_ZH_CONTENT from "@/components/result/mbti/clone/content/esfj.zh";
import ESFP_ZH_CONTENT from "@/components/result/mbti/clone/content/esfp.zh";
import ESTJ_ZH_CONTENT from "@/components/result/mbti/clone/content/estj.zh";
import ESTP_ZH_CONTENT from "@/components/result/mbti/clone/content/estp.zh";
import INFJ_ZH_CONTENT from "@/components/result/mbti/clone/content/infj.zh";
import INFP_ZH_CONTENT from "@/components/result/mbti/clone/content/infp.zh";
import INTJ_ZH_CONTENT from "@/components/result/mbti/clone/content/intj.zh";
import INTP_ZH_CONTENT from "@/components/result/mbti/clone/content/intp.zh";
import ISFJ_ZH_CONTENT from "@/components/result/mbti/clone/content/isfj.zh";
import ISFP_ZH_CONTENT from "@/components/result/mbti/clone/content/isfp.zh";
import ISTJ_ZH_CONTENT from "@/components/result/mbti/clone/content/istj.zh";
import ISTP_ZH_CONTENT from "@/components/result/mbti/clone/content/istp.zh";
import INTJ_A_PATCH from "@/components/result/mbti/clone/content/variants/intj-a.zh";
import INTJ_T_PATCH from "@/components/result/mbti/clone/content/variants/intj-t.zh";
import INTP_A_PATCH from "@/components/result/mbti/clone/content/variants/intp-a.zh";
import INTP_T_PATCH from "@/components/result/mbti/clone/content/variants/intp-t.zh";
import ENTJ_A_PATCH from "@/components/result/mbti/clone/content/variants/entj-a.zh";
import ENTJ_T_PATCH from "@/components/result/mbti/clone/content/variants/entj-t.zh";
import ENTP_A_PATCH from "@/components/result/mbti/clone/content/variants/entp-a.zh";
import ENTP_T_PATCH from "@/components/result/mbti/clone/content/variants/entp-t.zh";
import INFJ_A_PATCH from "@/components/result/mbti/clone/content/variants/infj-a.zh";
import INFJ_T_PATCH from "@/components/result/mbti/clone/content/variants/infj-t.zh";
import INFP_A_PATCH from "@/components/result/mbti/clone/content/variants/infp-a.zh";
import INFP_T_PATCH from "@/components/result/mbti/clone/content/variants/infp-t.zh";
import ENFJ_A_PATCH from "@/components/result/mbti/clone/content/variants/enfj-a.zh";
import ENFJ_T_PATCH from "@/components/result/mbti/clone/content/variants/enfj-t.zh";
import ENFP_A_PATCH from "@/components/result/mbti/clone/content/variants/enfp-a.zh";
import ENFP_T_PATCH from "@/components/result/mbti/clone/content/variants/enfp-t.zh";
import ISTJ_A_PATCH from "@/components/result/mbti/clone/content/variants/istj-a.zh";
import ISTJ_T_PATCH from "@/components/result/mbti/clone/content/variants/istj-t.zh";
import ISFJ_A_PATCH from "@/components/result/mbti/clone/content/variants/isfj-a.zh";
import ISFJ_T_PATCH from "@/components/result/mbti/clone/content/variants/isfj-t.zh";
import ESTJ_A_PATCH from "@/components/result/mbti/clone/content/variants/estj-a.zh";
import ESTJ_T_PATCH from "@/components/result/mbti/clone/content/variants/estj-t.zh";
import ESFJ_A_PATCH from "@/components/result/mbti/clone/content/variants/esfj-a.zh";
import ESFJ_T_PATCH from "@/components/result/mbti/clone/content/variants/esfj-t.zh";
import ISTP_A_PATCH from "@/components/result/mbti/clone/content/variants/istp-a.zh";
import ISTP_T_PATCH from "@/components/result/mbti/clone/content/variants/istp-t.zh";
import ISFP_A_PATCH from "@/components/result/mbti/clone/content/variants/isfp-a.zh";
import ISFP_T_PATCH from "@/components/result/mbti/clone/content/variants/isfp-t.zh";
import ESTP_A_PATCH from "@/components/result/mbti/clone/content/variants/estp-a.zh";
import ESTP_T_PATCH from "@/components/result/mbti/clone/content/variants/estp-t.zh";
import ESFP_A_PATCH from "@/components/result/mbti/clone/content/variants/esfp-a.zh";
import ESFP_T_PATCH from "@/components/result/mbti/clone/content/variants/esfp-t.zh";

export const MBTI_DESKTOP_CLONE_BASE_CONTENT_ZH = {
  INTJ: INTJ_ZH_CONTENT,
  INTP: INTP_ZH_CONTENT,
  ENTJ: ENTJ_ZH_CONTENT,
  ENTP: ENTP_ZH_CONTENT,
  INFJ: INFJ_ZH_CONTENT,
  INFP: INFP_ZH_CONTENT,
  ENFJ: ENFJ_ZH_CONTENT,
  ENFP: ENFP_ZH_CONTENT,
  ISTJ: ISTJ_ZH_CONTENT,
  ISFJ: ISFJ_ZH_CONTENT,
  ESTJ: ESTJ_ZH_CONTENT,
  ESFJ: ESFJ_ZH_CONTENT,
  ISTP: ISTP_ZH_CONTENT,
  ISFP: ISFP_ZH_CONTENT,
  ESTP: ESTP_ZH_CONTENT,
  ESFP: ESFP_ZH_CONTENT,
} satisfies Record<MbtiBaseCode, MbtiDesktopCloneContent>;

export const MBTI_DESKTOP_CLONE_VARIANT_PATCHES_ZH_32 = {
  "INTJ-A": INTJ_A_PATCH,
  "INTJ-T": INTJ_T_PATCH,
  "INTP-A": INTP_A_PATCH,
  "INTP-T": INTP_T_PATCH,
  "ENTJ-A": ENTJ_A_PATCH,
  "ENTJ-T": ENTJ_T_PATCH,
  "ENTP-A": ENTP_A_PATCH,
  "ENTP-T": ENTP_T_PATCH,
  "INFJ-A": INFJ_A_PATCH,
  "INFJ-T": INFJ_T_PATCH,
  "INFP-A": INFP_A_PATCH,
  "INFP-T": INFP_T_PATCH,
  "ENFJ-A": ENFJ_A_PATCH,
  "ENFJ-T": ENFJ_T_PATCH,
  "ENFP-A": ENFP_A_PATCH,
  "ENFP-T": ENFP_T_PATCH,
  "ISTJ-A": ISTJ_A_PATCH,
  "ISTJ-T": ISTJ_T_PATCH,
  "ISFJ-A": ISFJ_A_PATCH,
  "ISFJ-T": ISFJ_T_PATCH,
  "ESTJ-A": ESTJ_A_PATCH,
  "ESTJ-T": ESTJ_T_PATCH,
  "ESFJ-A": ESFJ_A_PATCH,
  "ESFJ-T": ESFJ_T_PATCH,
  "ISTP-A": ISTP_A_PATCH,
  "ISTP-T": ISTP_T_PATCH,
  "ISFP-A": ISFP_A_PATCH,
  "ISFP-T": ISFP_T_PATCH,
  "ESTP-A": ESTP_A_PATCH,
  "ESTP-T": ESTP_T_PATCH,
  "ESFP-A": ESFP_A_PATCH,
  "ESFP-T": ESFP_T_PATCH,
} satisfies Record<MbtiFullCode, MbtiDesktopCloneContentPatch>;

function resolveBaseCode(fullCode: MbtiFullCode): MbtiBaseCode {
  return fullCode.slice(0, 4) as MbtiBaseCode;
}

export const MBTI_DESKTOP_CLONE_CONTENT_ZH_32 = Object.fromEntries(
  MBTI_FULL_CODES.map((fullCode) => {
    const baseCode = resolveBaseCode(fullCode);
    return [fullCode, mergeMbtiDesktopCloneContent(MBTI_DESKTOP_CLONE_BASE_CONTENT_ZH[baseCode], MBTI_DESKTOP_CLONE_VARIANT_PATCHES_ZH_32[fullCode])];
  }),
) as Record<MbtiFullCode, MbtiDesktopCloneContent>;
