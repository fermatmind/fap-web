"use client";

import { DISC_LANDING_PATH } from "@/lib/questionnaires/discRoutes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight, Check, Flag, MessageCircle, Printer, Sprout, Users } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { LANGUAGE_MENU_LABELS } from "@/lib/i18n/locales";
import { discPreviewLocales, discResultPreviewPath, discUnlockPreviewPath } from "./discPreviewLocale";
import { discDirections as directions, discPreviewProfiles, findDiscPreviewProfile, isDiscPreviewScoreValid } from "./discPreviewProfiles";
import styles from "./disc-result-preview.module.css";

/** Shared presentation; live callers supply server-scored counts and identity. */
export function DiscResultDesignPreview({ counts, profileId = "single-d", locale = "zh", mode = "preview" }: { counts: Record<string, number>; profileId?: string; locale?: DisplayLocale; mode?: "preview" | "sample" | "result" }) {
  const router = useRouter();
  const profile = findDiscPreviewProfile(profileId);
  const bundle = discPreviewLocales[locale];
  const ui = bundle.ui;
  if (!profile || !isDiscPreviewScoreValid(counts, profile.leaders)) return <main className={styles.unavailable}><p role="status">{ui.unavailable}</p></main>;
  const copy = bundle.profiles[profile.id];
  const localizedDirections = directions.map((direction, index) => ({ ...direction, ...bundle.directions[index] }));
  const tied = profile.leaders.length > 1;
  const others = localizedDirections.filter(direction => !profile.leaders.includes(direction.code));

  const testPath = `/${locale}${DISC_LANDING_PATH}`;
  return <main className={styles.page} lang={locale === "zh" ? "zh-CN" : locale} data-disc-preview-root>
    <div className={styles.container}>
      {mode !== "result" && <div className={styles.sampleNote}><span><i /> {ui.sample}</span><p>{ui.sampleNote}</p><span>{ui.form}</span></div>}
      {mode === "preview" && <><label className={styles.previewControls}>{ui.switchResult}
        <select aria-label={ui.switchResult} value={profileId} onChange={event => router.push(discResultPreviewPath(locale, event.target.value))}>
          {discPreviewProfiles.map(item => <option value={item.id} key={item.id}>{item.leaders.join(" / ")}{item.leaders.length > 1 ? ` ${ui.tied}` : ` · ${bundle.profiles[item.id].title}`}</option>)}
        </select><span>{ui.previewCount}</span>
      </label>
      <nav className={styles.localeLinks} aria-label={ui.languages}>
        {(["zh", "zh-TW", "en"] as const).map(language => <Link key={language} aria-current={language === locale ? "page" : undefined} href={discResultPreviewPath(language, profile.id)}>{LANGUAGE_MENU_LABELS[language]}</Link>)}
        <Link href={discUnlockPreviewPath(locale, profile.id)}>{ui.unlock} ↗</Link>
      </nav>
      </>}
      {mode !== "result" && <nav aria-label={ui.breadcrumb} className={styles.breadcrumb}><Link href={`/${locale}/tests`}>{ui.tests}</Link><span>/</span><Link href={testPath}>DISC</Link><span>/</span><span>{copy.title}</span></nav>}

      <header className={styles.hero}>
        <div className={styles.art} data-group={tied || undefined}>
          <span className={styles.artLetter} aria-hidden="true">{profile.leaders.join(" / ")}</span>
          <Image src={profile.artwork} width={640} height={640} priority alt={bundle.alts[discPreviewProfiles.indexOf(profile)]} sizes="(max-width: 680px) 85vw, 420px" />
          <span className={styles.artCaption}>{ui.artNote}</span>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>FERMATMIND / DISC · {profile.leaders.join(" / ")}</p>
          <h1>{copy.title}</h1>
          <p className={styles.headline}>{copy.headline}</p>
          <p className={styles.introduction}>{copy.introduction}</p>
          <div className={styles.traits}><span>{tied ? ui.directionsLabel : ui.traits}</span><ul>{copy.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div>
          <a className={styles.primaryButton} href="#disc-portrait">{ui.readResult} <ArrowDown size={16} /></a>
        </div>
      </header>

      <section className={styles.scores} aria-labelledby="disc-scores-title">
        <div className={styles.scoreHeading}><h2 id="disc-scores-title">{ui.scores}</h2></div>
        <dl>{localizedDirections.map(({ code, id, title }) => <div key={code} data-leading={profile.leaders.includes(code) || undefined}>
          <dt><b>{code}</b><span>{title}</span></dt><dd><strong>{counts[id]}</strong><span> / 12</span></dd>
          <dd className={styles.meter} aria-hidden="true"><i style={{ width: `${counts[id] / 12 * 100}%` }} /></dd>
        </div>)}</dl>
        <p className={styles.scoreNote}>{ui.scoreNote}</p>
      </section>


      <section id="disc-portrait" className={styles.portrait} aria-labelledby="portrait-title">
        <h2 id="portrait-title">{tied ? ui.portraitTied : ui.portrait}</h2>
        <div>{copy.portrait.map((paragraph, index) => <p key={paragraph} className={index === 0 ? styles.lead : undefined}>{paragraph}</p>)}</div>
      </section>

      <section id="disc-strengths" className={styles.section} aria-labelledby="strengths-title">
        <div className={styles.sectionHeading}><span className={styles.sectionIcon}><Flag size={20} /></span><div><h2 id="strengths-title">{tied ? ui.strengthsTied : ui.strengths}</h2></div><span className={styles.sectionNumber}>01 /</span></div>
        <p className={styles.sectionIntro}>{ui.strengthsIntro}</p>
        <div className={styles.strengthGrid}>{copy.strengths.map((item, index) => <article key={item.title}><span className={styles.cardIndex}>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </section>

      <section id="disc-growth" className={styles.section} aria-labelledby="growth-title">
        <div className={styles.sectionHeading}><span className={styles.sectionIcon}><Sprout size={20} /></span><div><h2 id="growth-title">{ui.growth}</h2></div><span className={styles.sectionNumber}>02 /</span></div>
        <p className={styles.sectionIntro}>{ui.growthIntro}</p>
        <div className={styles.edgeGrid}>{copy.edges.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </section>

      <section id="disc-life" className={styles.lifeGrid} aria-label={ui.life}>
        {[{ icon: Flag, title: ui.work, paragraphs: copy.work }, { icon: Users, title: ui.relationships, paragraphs: copy.relationships }].map(item => <article key={item.title}><item.icon size={23} aria-hidden="true" /><h2>{item.title}</h2>{item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</article>)}
      </section>

      <section id="disc-career" className={styles.section} aria-labelledby="career-title">
        <div className={styles.sectionHeading}><span className={styles.sectionIcon}><ArrowUpRight size={21} /></span><div><h2 id="career-title">{ui.career}</h2></div><span className={styles.sectionNumber}>03 /</span></div>
        <p className={styles.sectionIntro}>{ui.careerIntro}</p>
        <ul className={styles.careers}>{copy.careers.map(item => <li key={item.title}><Check size={16} aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.detail}</p></div></li>)}</ul>
        <p className={styles.careerNote}>{ui.careerNote}</p>
      </section>

      <section className={styles.experiment} aria-labelledby="experiment-title"><h2 id="experiment-title">{copy.experiment.title}</h2><p>{copy.experiment.body}</p><blockquote><MessageCircle size={22} aria-hidden="true" />{copy.experiment.phrase}</blockquote><span>{copy.experiment.review}</span></section>


      {others.length > 0 && <section className={styles.section} aria-labelledby="others-title"><h2 id="others-title">{others.length === 3 ? ui.other3 : others.length === 2 ? ui.other2 : ui.other1}</h2><p className={styles.sectionIntro}>{ui.othersIntro}</p><div className={styles.otherGrid} data-count={others.length}>{others.map(item => <Link key={item.code} href={discResultPreviewPath(locale, item.guideId)}><span className={styles.otherCode}>{item.code}</span><ArrowUpRight size={18} aria-hidden="true" /><h3>{item.title}</h3><p>{item.body}</p></Link>)}</div></section>}


      <section id="disc-science" className={styles.science} aria-labelledby="disc-science-title">
        <h2 id="disc-science-title">{ui.science}</h2>
        <div className={styles.scienceCopy}>{bundle.evidence.science.map(item => <div key={item.title}>
          <h3>{item.title}</h3><p>{item.body}{item.reference && <span className={styles.citations}>{item.reference.includes("[1]") && <a href="#disc-source-1" aria-label={`${ui.source} 1`}>[1]</a>}{item.reference.includes("[2]") && <a href="#disc-source-2" aria-label={`${ui.source} 2`}>[2]</a>}</span>}</p>
        </div>)}</div>
        <ol className={styles.sources} aria-label={ui.source}>{bundle.evidence.sources.map((source, index) => <li id={source.id} key={source.id}>
          <span>{index + 1}</span><div><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">{ui.newWindow}</span></a><p>{source.detail}</p></div>
        </li>)}</ol>
        <Link className={styles.methodLink} href={`/${locale}/science`}>{ui.method} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </section>

      <footer className={styles.reportFooter}><button type="button" onClick={() => window.print()}><Printer size={17} /> {ui.print}</button></footer>
    </div>
  </main>;
}
