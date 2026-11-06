import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { StartTestButton } from "@/components/tests/StartTestButton";
import {
  GLOBAL_HISTORY_MINUTES, globalHistoryDescription, globalHistoryImagePath, globalHistoryMethod,
  globalHistoryPath, globalHistoryPortraitPath, globalHistoryTitle,
} from "@/lib/entertainment/global-history/config";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "@/components/entertainment/GlobalHistory.module.css";

type Props = { params: Promise<{ locale: string }> };
const coverId = "mansa-musa";

export async function generateMetadata({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  return buildPageMetadata({
    locale, pathname: globalHistoryPath(locale), title: globalHistoryTitle[locale], description: globalHistoryDescription[locale],
    imagePath: globalHistoryImagePath(locale, coverId),
    alternatesByLocale: { zh: globalHistoryPath("zh"), en: globalHistoryPath("en"), xDefault: globalHistoryPath("en") },
  });
}

export default async function Page({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  const zh = locale === "zh";
  return <main className={styles.page}>
    <Container className={`max-w-4xl ${styles.inner}`}>
      <Link prefetch={false} href={`/${locale}/tests#interactive-stories`} className={styles.back}>
        {zh ? "返回互动故事" : "Back to interactive stories"}
      </Link>
      <section className={`${styles.hero} ${styles.landingHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{zh ? "费马测试 · 全球历史人物" : "FermatMind · Historical Figures"}</p>
          <h1>{globalHistoryTitle[locale]}</h1>
          <p>{globalHistoryDescription[locale]}</p>
          <p className={styles.muted}>{zh
            ? `${historyScenes.length} 题 · 约 ${GLOBAL_HISTORY_MINUTES} 分钟 · ${historyPeople.length} 位人物 · 免费`
            : `${historyScenes.length} scenes · About ${GLOBAL_HISTORY_MINUTES} minutes · ${historyPeople.length} figures · Free`}</p>
          <StartTestButton href={`${globalHistoryPath(locale)}/take`} className={styles.primary}>
            {zh ? "开始测试" : "Start quiz"} <span aria-hidden="true">→</span>
          </StartTestButton>
        </div>
        <Image className={styles.portrait} src={globalHistoryPortraitPath(coverId)} width={720} height={720}
          unoptimized loading="eager" alt={zh ? "曼萨·穆萨的费马插画" : "FermatMind illustration of Mansa Musa"} />
      </section>
      <section className={styles.panel} aria-labelledby="history-method">
        <h2 id="history-method">{zh ? "结果怎样产生？" : "How does the match work?"}</h2>
        <p>{globalHistoryMethod[locale]}</p>
        <Link className={styles.source} prefetch={false} href={`/${locale}/tests/play/changan-history-quiz`}>
          {zh ? "也可以去玩长安卷" : "You can also play the Chang’an Edition"}
        </Link>
      </section>
    </Container>
  </main>;
}
