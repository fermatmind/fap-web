import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Text } from "@/lib/questionnaires/types";
import { questionnairePath } from "@/lib/questionnaires/paths";

const links: Record<string, { slug: string; text: Text }[]> = {
  "hogwarts-house-quiz": [
    {
      "slug": "patronus-quiz",
      "text": {
        "zh": "想探索守护形象？另做哈利波特守护神测试；它不分配学院。",
        "en": "Explore a guardian image in the separate Patronus quiz; it does not assign a Hogwarts house."
      }
    }
  ],
  "spirit-animal": [
    {
      "slug": "patronus-quiz",
      "text": {
        "zh": "想探索哈利波特守护意象？另做独立守护神测试，题目与九动物比喻不同。",
        "en": "Explore Harry Potter-inspired guardian images in the separate Patronus quiz, with its own questions and results."
      }
    }
  ],
  "patronus-quiz": [
    {
      "slug": "hogwarts-house-quiz",
      "text": {
        "zh": "想探索学院？另做霍格沃茨分院测试，学院与守护神分开解读。",
        "en": "Explore house themes in the separate Hogwarts house quiz; a house and a Patronus are different results."
      }
    },
    {
      "slug": "spirit-animal",
      "text": {
        "zh": "想看日常动物比喻？另做精神动物测试，不将它换算成守护神。",
        "en": "Explore everyday animal metaphors in the separate spirit animal quiz, without converting them into a Patronus."
      }
    }
  ],
  "avatar-bender-quiz": [
    {
      "slug": "what-element-am-i",
      "text": {
        "zh": "想比较日常元素比喻？另做四元素测试，题目与御术故事风格不同。",
        "en": "Explore everyday elemental metaphors in the separate four-element quiz, with different questions from these bending stories."
      }
    }
  ]
};

/** Public entries only: these related themes have independent question sets. */
export function RelatedFantasyQuizzes({ slug, locale }: { slug: string; locale: Locale }) {
  const entries = links[slug];
  if (!entries) return null;
  return <nav aria-label={locale === "zh" ? "相关主题测试" : "Related themed quizzes"} className="my-6 space-y-3">
    {entries.map(entry => <Link key={entry.slug} prefetch={false} target="_blank" rel="noopener" className="block min-h-11 py-2 leading-7 underline" href={questionnairePath(locale, entry.slug)}>
      {entry.text[locale]} {locale === "zh" ? "（新标签页）" : "(new tab)"}
    </Link>)}
  </nav>;
}
