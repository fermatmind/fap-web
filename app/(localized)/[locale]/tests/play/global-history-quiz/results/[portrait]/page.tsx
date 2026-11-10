import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { GlobalHistoryReport, GlobalHistoryShare } from "@/components/entertainment/GlobalHistoryReport";
import { GlobalHistoryLocaleLinks } from "@/components/entertainment/GlobalHistoryLocaleLinks";
import {
  globalHistoryImagePath, globalHistoryMethod, globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath,
} from "@/lib/entertainment/global-history/config";
import { historyProfileHighlights } from "@/lib/entertainment/global-history/matching";
import { findHistoryPerson, getHistoryGalleryPage, historyPeople } from "@/lib/entertainment/global-history/people";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { SITE_URL } from "@/lib/site";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "@/components/entertainment/GlobalHistory.module.css";

type Props = {
  params: Promise<{ locale: string; portrait: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

async function loadPortrait(params: Props["params"]) {
  const { locale: input, portrait } = await params;
  const person = findHistoryPerson(portrait);
  if (!person) notFound();
  const locale = input === "zh-TW" ? "zh" : resolveLocale(input);
  const displayLocale: DisplayLocale = input === "zh-TW" ? input : locale;
  return { locale, displayLocale, person: displayHistoryPerson(person, displayLocale) };
}

export async function generateMetadata({ params }: Props) {
  const { locale, displayLocale, person } = await loadPortrait(params);
  if (displayLocale === "zh-TW") {
    const pathname = globalHistoryResultPath(displayLocale, person.id);
    const title = `${person.name.zh} · 全球卷人物卡`, description = `${person.region.zh} · ${person.field.zh}`;
    return { title, description, alternates: { canonical: `${SITE_URL}${pathname}` }, robots: { index: false, follow: true },
      openGraph: { title, description, locale: "zh_TW", url: pathname, images: [globalHistoryImagePath(displayLocale, person.id)] } };
  }
  return buildPageMetadata({
    locale, pathname: globalHistoryResultPath(locale, person.id),
    title: locale === "zh" ? `${person.name.zh} · 全球卷人物卡` : `${person.name.en} · World Edition Portrait`,
    description: `${person.region[locale]} · ${person.field[locale]}`,
    noindex: true, noindexFollow: true, imagePath: globalHistoryImagePath(locale, person.id),
    alternatesByLocale: {
      zh: globalHistoryResultPath("zh", person.id), en: globalHistoryResultPath("en", person.id),
    },
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { locale, displayLocale, person } = await loadPortrait(params);
  const traditional = displayLocale === "zh-TW";
  const copy = traditional ? await loadTraditionalAssessmentText() : (text: string) => text;
  const gallery = getHistoryGalleryPage((await searchParams).page);
  const zh = locale === "zh";
  const title = person.name[locale];
  const resultPath = globalHistoryResultPath(displayLocale, person.id);
  const share = <GlobalHistoryShare id={person.id} locale={locale} displayLocale={displayLocale} />;
  const report = <GlobalHistoryReport id={person.id} profile={person.vector} locale={locale} />;
  const Shell = traditional ? "div" : "main";
  return <Shell className={styles.page}>
    <Container className={`max-w-4xl ${styles.inner}`}>
      {traditional && <GlobalHistoryLocaleLinks portraitId={person.id} />}
      <Link prefetch={false} className={styles.back} href={globalHistoryPath(displayLocale)}>
        {zh ? copy("返回全球卷") : "Back to the World Edition"}
      </Link>
      <section className={styles.hero} data-global-history-result={person.id}>
        <Image className={styles.portrait} src={globalHistoryPortraitPath(person.id)} width={720} height={720} unoptimized loading="eager"
          alt={zh ? copy(`${title}的费马插画`) : `FermatMind illustration of ${title}`} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{zh ? copy("全球卷 · 历史人物卡") : "World Edition · Historical Portrait"}</p>
          <h1>{title}</h1>
          <p>{person.region[locale]} · {person.field[locale]}</p>
          <ul className={styles.tags} aria-label={zh ? copy("故事画像关键词") : "Story profile tags"}>
            {historyProfileHighlights(person.vector).map(tag => <li key={tag.en}>{copy(tag[locale])}</li>)}
          </ul>
          {share}
          <p className={styles.muted}>{zh ? copy("手机上也可打开图片，长按保存。") : "On mobile, open the image and press and hold to save."}</p>
        </div>
      </section>
      <section className={styles.panel} aria-labelledby="history-background">
        <p className={styles.kicker}>01</p>
        <h2 id="history-background">{zh ? copy("人物背景") : "About the figure"}</h2>
        <p>{person.bio[locale]}</p>
        <p><a className={styles.source} href={`https://www.wikidata.org/wiki/${person.qid}`} target="_blank" rel="noopener noreferrer">
          {zh ? copy("查看人物资料与来源 ↗") : "See the biographical record and sources ↗"}
        </a></p>
      </section>
      {traditional ? <TraditionalQuestionnaireCopy
        loadingText="正在準備人物卡解讀…"
        failureText="暫時無法載入人物卡解讀，請重新整理後再試。"
      >{report}</TraditionalQuestionnaireCopy> : report}
      <section className={styles.panel} aria-labelledby="history-about-match">
        <h2 id="history-about-match">{zh ? copy("怎样读这张人物卡？") : "How should I read this portrait?"}</h2>
        <p>{copy(globalHistoryMethod[locale])}</p>
        <div className={styles.actions}><Link className={styles.secondary} prefetch={false} href={`${globalHistoryPath(displayLocale)}/take`}>
          {zh ? copy("再玩一次") : "Play again"}
        </Link></div>
      </section>
      <section className={styles.panel} id="people" aria-labelledby="history-gallery">
        <h2 id="history-gallery">{zh ? copy(`浏览全部 ${historyPeople.length} 位人物`) : `Explore all ${historyPeople.length} figures`}</h2>
        <p>{zh ? copy("这里按人物名单浏览。") : "Browse the figures in collection order."}</p>
        <ul className={styles.gallery}>
          {gallery.people.map(item => <li key={item.id}>
            <Link prefetch={false} href={globalHistoryResultPath(displayLocale, item.id)}>
              <Image src={globalHistoryPortraitPath(item.id)} width={160} height={160} sizes="150px" loading="lazy" alt="" />
              <span>{displayHistoryPerson(item, displayLocale).name[locale]}</span>
            </Link>
          </li>)}
        </ul>
        <nav className={styles.actions} aria-label={zh ? copy("人物图库分页") : "Portrait gallery pages"}>
          {gallery.page > 1 && <Link className={styles.secondary} prefetch={false} href={`${resultPath}?page=${gallery.page - 1}#people`}>
            {zh ? copy("上一页") : "Previous page"}
          </Link>}
          <span className={styles.secondary}>{zh ? copy(`第 ${gallery.page} / ${gallery.total} 页`) : `Page ${gallery.page} of ${gallery.total}`}</span>
          {gallery.page < gallery.total && <Link className={styles.secondary} prefetch={false} href={`${resultPath}?page=${gallery.page + 1}#people`}>
            {zh ? copy("下一页") : "Next page"}
          </Link>}
        </nav>
      </section>
    </Container>
  </Shell>;
}
