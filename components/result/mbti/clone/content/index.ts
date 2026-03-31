import type { MbtiBaseCode, MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
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

export const MBTI_DESKTOP_CLONE_CONTENT_ZH = {
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
