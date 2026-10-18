import type { Locale } from "@/lib/i18n/locales";

type HeroCategory = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  upright?: boolean;
  color: string;
  ink: string;
  copy: Record<Locale, { label: string; fontSize: number; lines?: readonly string[] }>;
};

// Five book silhouettes match the reference composition; IQ and EQ share one spine.
// Text stays independent of the illustration. Coordinates use the 600 × 434 scene.
export const HOME_HERO_CATEGORIES: readonly HeroCategory[] = [
  {
    id: "iq-eq", x: 198, y: 307, width: 23, height: 123, angle: 15, upright: true,
    color: "#e9c38e", ink: "#315766",
    copy: { zh: { label: "智商与情商", fontSize: 11 }, en: { label: "IQ and EQ", fontSize: 11 } },
  },
  {
    id: "mbti", x: 222, y: 318, width: 98, height: 38, angle: 3,
    color: "#a4d5e2", ink: "#315766",
    copy: {
      zh: { label: "MBTI", fontSize: 11 },
      en: { label: "MBTI", fontSize: 11 },
    },
  },
  {
    id: "personality", x: 210, y: 356, width: 111, height: 22, angle: 2,
    color: "#cde9f1", ink: "#315766",
    copy: { zh: { label: "人格测试", fontSize: 11.5 }, en: { label: "Personality Test", fontSize: 11.5 } },
  },
  {
    id: "holland", x: 217, y: 378, width: 155, height: 21, angle: 0,
    color: "#f8fcfd", ink: "#315766",
    copy: {
      zh: { label: "霍兰德职业兴趣测试", fontSize: 11 },
      en: { label: "Holland Career Interest Test", fontSize: 10 },
    },
  },
  {
    id: "career-planning", x: 210, y: 400, width: 155, height: 30, angle: 0,
    color: "#99cddd", ink: "#315766",
    copy: { zh: { label: "职业规划", fontSize: 11.5 }, en: { label: "Career Planning", fontSize: 11.5 } },
  },
];
