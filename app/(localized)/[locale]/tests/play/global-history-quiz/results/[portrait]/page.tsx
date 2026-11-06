import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { GlobalHistoryReport, GlobalHistoryShare } from "@/components/entertainment/GlobalHistoryReport";
import {
  globalHistoryImagePath, globalHistoryMethod, globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath,
} from "@/lib/entertainment/global-history/config";
import { historyProfileHighlights } from "@/lib/entertainment/global-history/matching";
import { findHistoryPerson, getHistoryGalleryPage, historyPeople } from "@/lib/entertainment/global-history/people";
import { resolveLocale } from "@/lib/i18n/getDict";
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
  return { locale: resolveLocale(input), person };
}

export async function generateMetadata({ params }: Props) {
  const { locale, person } = await loadPortrait(params);
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
  const { locale, person } = await loadPortrait(params);
  const gallery = getHistoryGalleryPage((await searchParams).page);
  const zh = locale === "zh";
  const title = person.name[locale];
  const resultPath = globalHistoryResultPath(locale, person.id);
  return <main className={styles.page}>
    <Container className={`max-w-4xl ${styles.inner}`}>
      <Link prefetch={false} className={styles.back} href={globalHistoryPath(locale)}>
        {zh ? "返回全球卷" : "Back to the World Edition"}
      </Link>
      <section className={styles.hero} data-global-history-result={person.id}>
        <Image className={styles.portrait} src={globalHistoryPortraitPath(person.id)} width={720} height={720} unoptimized loading="eager"
          alt={zh ? `${title}的费马插画` : `FermatMind illustration of ${title}`} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{zh ? "全球卷 · 历史人物卡" : "World Edition · Historical Portrait"}</p>
          <h1>{title}</h1>
          <p>{person.region[locale]} · {person.field[locale]}</p>
          <ul className={styles.tags} aria-label={zh ? "故事画像关键词" : "Story profile tags"}>
            {historyProfileHighlights(person.vector).map(tag => <li key={tag.en}>{tag[locale]}</li>)}
          </ul>
          <GlobalHistoryShare id={person.id} locale={locale} />
          <p className={styles.muted}>{zh ? "手机上也可打开图片，长按保存。" : "On mobile, open the image and press and hold to save."}</p>
        </div>
      </section>
      <section className={styles.panel} aria-labelledby="history-background">
        <p className={styles.kicker}>01</p>
        <h2 id="history-background">{zh ? "人物背景" : "About the figure"}</h2>
        <p>{person.bio[locale]}</p>
        <p><a className={styles.source} href={`https://www.wikidata.org/wiki/${person.qid}`} target="_blank" rel="noopener noreferrer">
          {zh ? "查看人物资料与来源 ↗" : "See the biographical record and sources ↗"}
        </a></p>
      </section>
      <GlobalHistoryReport id={person.id} profile={person.vector} locale={locale} />
      <section className={styles.panel} aria-labelledby="history-about-match">
        <h2 id="history-about-match">{zh ? "怎样读这张人物卡？" : "How should I read this portrait?"}</h2>
        <p>{globalHistoryMethod[locale]}</p>
        <div className={styles.actions}><Link className={styles.secondary} prefetch={false} href={`${globalHistoryPath(locale)}/take`}>
          {zh ? "再玩一次" : "Play again"}
        </Link></div>
      </section>
      <section className={styles.panel} id="people" aria-labelledby="history-gallery">
        <h2 id="history-gallery">{zh ? `浏览全部 ${historyPeople.length} 位人物` : `Explore all ${historyPeople.length} figures`}</h2>
        <p>{zh ? "这里按人物名单浏览。" : "Browse the figures in collection order."}</p>
        <ul className={styles.gallery}>
          {gallery.people.map(item => <li key={item.id}>
            <Link prefetch={false} href={globalHistoryResultPath(locale, item.id)}>
              <Image src={globalHistoryPortraitPath(item.id)} width={160} height={160} sizes="150px" loading="lazy" alt="" />
              <span>{item.name[locale]}</span>
            </Link>
          </li>)}
        </ul>
        <nav className={styles.actions} aria-label={zh ? "人物图库分页" : "Portrait gallery pages"}>
          {gallery.page > 1 && <Link className={styles.secondary} prefetch={false} href={`${resultPath}?page=${gallery.page - 1}#people`}>
            {zh ? "上一页" : "Previous page"}
          </Link>}
          <span className={styles.secondary}>{zh ? `第 ${gallery.page} / ${gallery.total} 页` : `Page ${gallery.page} of ${gallery.total}`}</span>
          {gallery.page < gallery.total && <Link className={styles.secondary} prefetch={false} href={`${resultPath}?page=${gallery.page + 1}#people`}>
            {zh ? "下一页" : "Next page"}
          </Link>}
        </nav>
      </section>
    </Container>
  </main>;
}
