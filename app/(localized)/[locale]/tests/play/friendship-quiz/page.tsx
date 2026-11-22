import Link from "next/link";
import { ExploreLandingSchema } from "@/components/tests/ExploreLandingSchema";
import { FriendshipEvidenceReading } from "@/components/friendship/FriendshipEvidenceReading";
import { FriendshipLandingSamples } from "@/components/friendship/FriendshipLandingSamples";
import { FriendshipNav, resourceMetadata } from "@/components/friendship/PublicContent";
import RikaidoComparison from "@/components/friendship/RikaidoComparison";
import { resolveLocale } from "@/lib/i18n/getDict";
import { PUBLIC_PATH, title } from "@/lib/friendship/core";
import { friendshipLandingCopy } from "@/lib/friendship/landingCopy";
import { friendshipCopy, friendshipSourceLocale } from "@/lib/friendship/traditional";
import styles from "@/components/tests/test-explore-template.module.css";
import friendshipStyles from "@/components/friendship/friendship-landing.module.css";
import "@/components/friendship/friendship.css";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return resourceMetadata(locale === "zh-TW" ? locale : resolveLocale(locale), "home");
}

const scoreBands = [90, 73, 50, 27, 0];
const resourcePaths = ["/how-to-play", "/questions", "/scores"] as const;

export default async function Page({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw === "zh-TW" ? raw : resolveLocale(raw);
  const base = `/${locale}${PUBLIC_PATH}`;
  const copy = friendshipLandingCopy[locale];
  const localized = friendshipCopy(locale);
  const [eyebrow, heading, lead, trust, start] = copy.hero;
  const [joinLink, offlineLink, sampleLink, compareLink] = copy.heroLinks;
  const [summaryTitle, facts] = copy.summary;
  const [methodTitle, formula, exampleTitle, example] = copy.method;
  const [profilesTitle, profilesIntro, scoreGuide] = copy.profiles;
  const [interpretationTitle, interpretations] = copy.interpretation;
  const [relatedTitle, related] = copy.related;
  const [referenceTitle, boundaryTitle, boundary] = copy.reference;

  return <>
    <main className={styles.page} data-test-explore-template data-ent-landing data-ent-slot="B">
      <section className={styles.hero} data-ent-module="hero">
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1>{heading}</h1>
            <p className={styles.lead}>{lead}</p>
            <div id="create" className={`${styles.actions} scroll-mt-24`}>
              <a className={styles.primary} href={`${base}/take`} data-ent-start>{start}<span aria-hidden> →</span></a>
              <a href="#friendship-bands">{profilesTitle}<span aria-hidden> ↓</span></a>
            </div>
            <p className={styles.trust}>{trust}</p>
            <div className={friendshipStyles.heroLinks}>
              <Link href={`${base}/how-to-play#received-invite`}>{joinLink}</Link>
              <Link href={`${base}/questions#quick-round`}>{offlineLink}</Link>
              <Link href={`${base}/scores#sample-score`}>{sampleLink}</Link>
              <a href="#rikaido-alternative">{compareLink}</a>
            </div>
          </div>
          <FriendshipLandingSamples locale={locale} copy={copy.sample} />
        </div>
      </section>

      <section className={styles.section} data-ent-module="summary">
        <h2>{summaryTitle}</h2>
        <p className={styles.facts} data-ent-summary>{facts}</p>
        <div className={styles.threeColumns}>
          {copy.deliverables.map(([name, description]) => <article key={name} data-ent-deliverable>
            <h3>{name}</h3>
            <p>{description}</p>
          </article>)}
        </div>
      </section>

      <section className={styles.insightBand} data-ent-module="method">
        <div className={styles.insightInner}>
          <div>
            <h2>{methodTitle}</h2>
            <p className={styles.formula} data-ent-formula>{formula}</p>
            <h3>{exampleTitle}</h3>
            <p>{example}</p>
          </div>
          <ol className={friendshipStyles.methodSteps}>
            {copy.steps.map(([name, description]) => <li key={name}>
              <h3>{name}</h3>
              <p>{description}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section id="friendship-bands" className={styles.section} data-ent-module="profiles">
        <h2>{profilesTitle}</h2>
        <p>{profilesIntro}</p>
        <div className={styles.styleGrid}>
          {scoreBands.map((min, index) => <article key={min} className={styles.styleCard} data-friendship-band={min}>
            <p className={styles.range}>{min}–{index === 0 ? 100 : scoreBands[index - 1] - 1}%</p>
            <h3>{localized(title(min, friendshipSourceLocale(locale)))}</h3>
            <p>{copy.bandNotes[index]}</p>
          </article>)}
        </div>
        <p className={friendshipStyles.guide}><Link href={`${base}/scores`}>{scoreGuide}<span aria-hidden> →</span></Link></p>
      </section>

      <section className={styles.section} data-ent-module="interpretation">
        <h2>{interpretationTitle}</h2>
        <div className={styles.threeColumns}>
          {interpretations.map(([name, description]) => <article key={name} data-ent-interpretation>
            <h3>{name}</h3>
            <p>{description}</p>
          </article>)}
        </div>
      </section>

      <section className={styles.section} data-ent-module="related">
        <h2>{relatedTitle}</h2>
        <div className={styles.threeColumns}>
          {related.map(([name, description, link], index) => <article key={name}>
            <h3>{name}</h3>
            <p>{description}</p>
            <Link href={`${base}${resourcePaths[index]}`}>{link}<span aria-hidden> →</span></Link>
          </article>)}
        </div>
        <FriendshipNav locale={locale} />
      </section>

      <div className={`${styles.section} ${friendshipStyles.comparison}`} data-ent-module="comparison">
        <RikaidoComparison locale={locale} />
      </div>

      <section className={styles.section} data-ent-module="reference">
        <h2>{referenceTitle}</h2>
        <div className={styles.faq}>
          {copy.faq.map(([question, answer], index) => <details key={question} open={index < 3} data-ent-faq>
            <summary>{question}</summary>
            <p data-ent-faq-answer>{answer}</p>
          </details>)}
          <details data-ent-boundary>
            <summary>{boundaryTitle}</summary>
            <p>{boundary}</p>
            <FriendshipEvidenceReading locale={locale} />
          </details>
        </div>
        <div className={styles.actions}>
          <a className={styles.primary} href={`${base}/take`}>{start}<span aria-hidden> →</span></a>
        </div>
      </section>
    </main>
    <ExploreLandingSchema id={`friendship-game-${locale}`} title={heading} description={facts} path={base} locale={locale} faq={copy.faq} />
  </>;
}
