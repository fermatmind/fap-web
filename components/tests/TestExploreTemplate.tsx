import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { StartTestButton } from "@/components/tests/StartTestButton";
import styles from "./test-explore-template.module.css";

type ExploreLink = { href: string; label: string };
type ExploreProfile = {
  id?: string;
  guideSummary?: string;
  range: string;
  title: string;
  lead: string;
  scene?: string;
  friction?: string;
  image?: { src: string; alt: string };
  link?: ExploreLink;
  followUp?: ExploreLink;
  badges?: readonly string[];
};
type ExploreCopy = {
  title: string; headline: string; description: string; start: string; stylesLink: string; trust: string;
  benefitsTitle: string; facts: string; benefits: readonly (readonly [string, string])[];
  stylesTitle: string; scene: string; friction: string;
  exploreTitle: string; explore: readonly (readonly [string, string, string])[];
  compareTitle: string; columns: readonly string[]; compare: readonly (readonly string[])[];
  faqTitle: string; faq: readonly (readonly [string, string])[];
  method: string; formula: string; guide: string;
};

type ExploreTemplateProps = {
  copy: ExploreCopy;
  start: string;
  guideHref: string;
  sample: ReactNode;
  insight: ReactNode;
  afterProfiles?: ReactNode;
  rules: ReactNode;
  characterSlot?: boolean;
  slot?: "A" | "B" | "C";
  heading?: ReactNode;
  endStartLabel?: string;
  heroLinks?: ReactNode;
  methodSupplement?: ReactNode;
  relatedSupplement?: ReactNode;
  profilesId: string;
  profiles: readonly ExploreProfile[];
  exploreLinks: readonly string[];
  compareLinks: readonly (string | null)[];
  rootAttributes?: Record<`data-${string}`, string>;
};

export function TestExploreTemplate({
  copy, start, guideHref, sample, insight, afterProfiles, rules, profilesId, profiles, exploreLinks, compareLinks, rootAttributes, characterSlot, heading, endStartLabel, heroLinks, methodSupplement, relatedSupplement, slot,
}: ExploreTemplateProps) {
  const activeSlot = slot ?? (characterSlot ? "C" : undefined);
  const contractMarker = (name: string) => activeSlot ? name : undefined;
  return <main className={styles.page} data-test-explore-template data-ent-landing={contractMarker("")} data-ent-slot={activeSlot} {...rootAttributes}>
    <section className={styles.hero} data-ent-module={contractMarker("hero")}>
      <div className={styles.heroInner}>
        <div>
          <p className={styles.eyebrow}>{copy.headline}</p>
          <h1>{heading ?? copy.title}</h1>
          <p className={styles.lead}>{copy.description}</p>
          <div id="take-test" className={styles.actions} data-questionnaire-take-entry>
            <StartTestButton href={start} className={styles.primary} characterLanding={Boolean(activeSlot)}>{copy.start}<span aria-hidden> →</span></StartTestButton>
            <a href={`#${profilesId}`}>{copy.stylesLink}<span aria-hidden> ↓</span></a>
          </div>
          <p className={styles.trust}>{copy.trust}</p>
          {heroLinks}
        </div>
        {sample}
      </div>
    </section>

    <section className={styles.section} data-ent-module={contractMarker("summary")}>
      <h2>{copy.benefitsTitle}</h2>
      <p className={styles.facts} data-ent-summary={contractMarker("")}>{copy.facts}</p>
      <div className={styles.threeColumns}>{copy.benefits.map(([title, body]) =>
        <article key={title} data-ent-deliverable={contractMarker("")}><h3>{title}</h3><p>{body}</p></article>
      )}</div>
    </section>

    <section className={styles.insightBand} data-ent-module={contractMarker("method")}>
      <div className={styles.insightInner}>{insight}</div>
      {methodSupplement}
    </section>

    <section id={profilesId} className={styles.section} data-ent-module={contractMarker("profiles")}>
      <h2>{copy.stylesTitle}</h2>
      <div className={styles.styleGrid}>{profiles.map(({ id, range, title, lead, scene, friction, image, link, followUp, badges, guideSummary }) =>
        <article key={id ?? title} className={styles.styleCard} data-ent-result-id={id}>
          {image && !guideSummary && <Image className={styles.profileImage} src={image.src} alt={image.alt} width={540} height={540} unoptimized />}
          <p className={styles.range}>{range}</p>
          <h3 data-ent-title={contractMarker("")}>{title}</h3><p data-ent-hook={contractMarker("")}>{lead}</p>
          {badges && <ul className={styles.profileBadges}>{badges.map(badge => <li key={badge}>{badge}</li>)}</ul>}
          {(scene || friction) && <dl>
            {scene && <div data-ent-scene={contractMarker("")}><dt>{copy.scene}</dt><dd>{scene}</dd></div>}
            {friction && <div><dt>{copy.friction}</dt><dd>{friction}</dd></div>}
          </dl>}
          {(link || followUp) && <div className={styles.profileLinks}>
            {link && <Link href={link.href} prefetch={false} data-ent-guide={contractMarker("")}>
              {guideSummary && image && <Image className={styles.profileImage} src={image.src} alt={image.alt} width={540} height={322} unoptimized />}
              <span>{link.label}<span aria-hidden> →</span></span>
              {guideSummary && <p>{guideSummary}</p>}
            </Link>}
            {followUp && <Link href={followUp.href} data-ent-assessment={contractMarker("")}>{followUp.label}<span aria-hidden> →</span></Link>}
          </div>}
        </article>
      )}</div>
    </section>

    {afterProfiles && <div data-test-explore-editorial data-ent-module={contractMarker("interpretation")}>{afterProfiles}</div>}

    <section className={styles.section} data-ent-module={contractMarker("related")}>
      <h2>{copy.exploreTitle}</h2>
      <div className={styles.threeColumns}>{copy.explore.map(([title, body, label], index) =>
        <article key={title}><h3>{title}</h3><p>{body}</p><Link href={exploreLinks[index]}>{label}<span aria-hidden> →</span></Link></article>
      )}</div>
      {relatedSupplement}
    </section>

    <section className={styles.section} aria-labelledby="test-explore-compare" data-ent-module={contractMarker("comparison")}>
      <h2 id="test-explore-compare">{copy.compareTitle}</h2>
      <table className={styles.compare} role="table" aria-labelledby="test-explore-compare">
        <thead role="rowgroup"><tr role="row">{copy.columns.map(label => <th role="columnheader" scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody role="rowgroup">{copy.compare.map(([name, ...cells], index) => {
          const target = compareLinks[index];
          return <tr role="row" key={name}>
            <th role="rowheader" scope="row">{target ? <Link href={target}>{name}</Link> : name}</th>
            {cells.map((cell, column) => <td role="cell" key={cell}><span className={styles.mobileLabel} aria-hidden>{copy.columns[column + 1]}</span>{cell}</td>)}
          </tr>;
        })}</tbody>
      </table>
    </section>

    <div data-test-explore-reference data-ent-module={contractMarker("reference")}>
      <section className={styles.section}>
        <h2 id="questionnaire-faq">{copy.faqTitle}</h2>
        <div className={styles.faq}>{copy.faq.map(([question, answer], index) =>
          <details key={question} open={index < 3} data-ent-faq={contractMarker("")}><summary>{question}</summary><p data-ent-faq-answer={contractMarker("")}>{answer}</p></details>
        )}</div>
      </section>

      <section className={styles.method} aria-labelledby="questionnaire-method">
        <div className={styles.section}>
          <h2 id="questionnaire-method">{copy.method}</h2>
          <p className={styles.formula} data-ent-formula={contractMarker("")}>{copy.formula}</p>
          {rules}
          <div className={styles.actions}>
            <StartTestButton href={start} className={styles.primary}>{endStartLabel ?? copy.start}<span aria-hidden> →</span></StartTestButton>
            <Link href={guideHref}>{copy.guide}<span aria-hidden> →</span></Link>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
