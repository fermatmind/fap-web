import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { StartTestButton } from "@/components/tests/StartTestButton";
import { GlobalHistoryLocaleLinks } from "@/components/entertainment/GlobalHistoryLocaleLinks";
import {
  GLOBAL_HISTORY_MINUTES, globalHistoryDescription, globalHistoryImagePath, globalHistoryMethod,
  globalHistoryPath, globalHistoryPortraitPath, globalHistoryTitle,
} from "@/lib/entertainment/global-history/config";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { historyScenes } from "@/lib/entertainment/global-history/questions";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { SITE_URL } from "@/lib/site";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "@/components/entertainment/GlobalHistory.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};
const coverId = "mansa-musa";

export async function generateMetadata({ params }: Props) {
  const input = (await params).locale;
  if (input === "zh-TW") {
    const copy = await loadTraditionalAssessmentText();
    const pathname = globalHistoryPath("zh-TW");
    const title = copy(globalHistoryTitle.zh), description = copy(globalHistoryDescription.zh);
    return { title, description, alternates: { canonical: `${SITE_URL}${pathname}` }, robots: { index: false, follow: true },
      openGraph: { title, description, locale: "zh_TW", url: pathname, images: [globalHistoryImagePath("zh-TW", coverId)] } };
  }
  const locale = resolveLocale(input);
  return buildPageMetadata({
    locale, pathname: globalHistoryPath(locale), title: globalHistoryTitle[locale], description: globalHistoryDescription[locale],
    imagePath: globalHistoryImagePath(locale, coverId),
    alternatesByLocale: { zh: globalHistoryPath("zh"), en: globalHistoryPath("en"), xDefault: globalHistoryPath("en") },
  });
}

export default async function Page({ params }: Props) {
  const input = (await params).locale;
  const traditional = input === "zh-TW";
  const locale = traditional ? "zh" : resolveLocale(input);
  const displayLocale = traditional ? "zh-TW" : locale;
  const copy = traditional ? await loadTraditionalAssessmentText() : (text: string) => text;
  const zh = locale === "zh";
  const Shell = traditional ? "div" : "main";
  return <Shell className={styles.page}>
    <Container className={`max-w-4xl ${styles.inner}`}>
      {traditional && <GlobalHistoryLocaleLinks />}
      <Link prefetch={false} href={`/${displayLocale}/tests#interactive-stories`} className={styles.back}>
        {zh ? copy("返回互动故事") : "Back to interactive stories"}
      </Link>
      <section className={`${styles.hero} ${styles.landingHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{zh ? copy("费马测试 · 全球历史人物") : "FermatMind · Historical Figures"}</p>
          <h1>{copy(globalHistoryTitle[locale])}</h1>
          <p>{copy(globalHistoryDescription[locale])}</p>
          <p className={styles.muted}>{zh
            ? copy(`${historyScenes.length} 题 · 约 ${GLOBAL_HISTORY_MINUTES} 分钟 · ${historyPeople.length} 位人物 · 免费`)
            : `${historyScenes.length} scenes · About ${GLOBAL_HISTORY_MINUTES} minutes · ${historyPeople.length} figures · Free`}</p>
          <StartTestButton href={`${globalHistoryPath(displayLocale)}/take`} className={styles.primary}>
            {zh ? copy("开始测试") : "Start quiz"} <span aria-hidden="true">→</span>
          </StartTestButton>
        </div>
        <Image className={styles.portrait} src={globalHistoryPortraitPath(coverId)} width={720} height={720}
          unoptimized loading="eager" alt={zh ? copy("曼萨·穆萨的费马插画") : "FermatMind illustration of Mansa Musa"} />
      </section>
      <section className={styles.panel} aria-labelledby="history-method">
        <h2 id="history-method">{zh ? copy("结果怎样产生？") : "How does the match work?"}</h2>
        <p>{copy(globalHistoryMethod[locale])}</p>
        <Link className={styles.source} prefetch={false} href={`/${locale}/tests/play/changan-history-quiz`}>
          {traditional ? "也可以玩長安卷（簡體中文）" : zh ? "也可以去玩长安卷" : "You can also play the Chang’an Edition"}
        </Link>
      </section>
    </Container>
  </Shell>;
}
