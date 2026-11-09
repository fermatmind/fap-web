import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { GlobalHistoryDisplayAd } from "@/components/entertainment/GlobalHistoryDisplayAd";
import { StartTestButton } from "@/components/tests/StartTestButton";
import {
  GLOBAL_HISTORY_MINUTES, globalHistoryDescription, globalHistoryImagePath, globalHistoryMethod,
  globalHistoryPath, globalHistoryPortraitPath, globalHistoryTitle,
} from "@/lib/entertainment/global-history/config";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { CANONICAL_SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";
import styles from "@/components/entertainment/GlobalHistory.module.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const coverId = "mansa-musa";

export async function generateMetadata({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  return buildPageMetadata({
    locale, pathname: globalHistoryPath(locale), title: globalHistoryTitle[locale], description: globalHistoryDescription[locale],
    imagePath: globalHistoryImagePath(locale, coverId),
    alternatesByLocale: { zh: globalHistoryPath("zh"), en: globalHistoryPath("en"), xDefault: globalHistoryPath("en") },
  });
}

export default async function Page({ params, searchParams }: Props) {
  const locale = resolveLocale((await params).locale);
  const zh = locale === "zh";
  const requestHeaders = await headers();
  const nonce = requestHeaders.get("x-nonce");
  const query = await searchParams;
  const queryCount = Object.keys(query).length;
  // Allow Google's consent preview without requesting a live ad impression.
  const previewConsent = queryCount === 2 && query.fc === "alwaysshow"
    && (query.fctype === "gdpr" || query.fctype === "ccpa");
  const loadAdSense = !isConfiguredStagingSiteUrl()
    && requestHeaders.get("host") === new URL(CANONICAL_SITE_URL).host
    && (queryCount === 0 || previewConsent);
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
      {loadAdSense && nonce && (
        <GlobalHistoryDisplayAd label={zh ? "广告" : "Advertisements"} nonce={nonce} showUnit={!previewConsent} />
      )}
    </Container>
  </main>;
}
