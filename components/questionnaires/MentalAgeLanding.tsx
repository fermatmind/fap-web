import { JsonLd } from "@/components/seo/JsonLd";
import { TestExploreTemplate } from "@/components/tests/TestExploreTemplate";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import { SITE_URL } from "@/lib/site";
import { mentalAgeLandingConfig } from "@/lib/questionnaires/mentalAgeLandingConfig";
import { mentalAgeStyles } from "@/lib/questionnaires/mentalAge";
import { mentalAgeLandingCopy, type MentalAgeLandingLocale } from "@/lib/questionnaires/mentalAgeLandingCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { MentalAgeSamples, MentalAgeSpectrum } from "./MentalAgeLandingInteractions";
import { mentalAgeReadingCopy } from "@/lib/questionnaires/mentalAgeReadingCopy";
import layout from "@/components/tests/test-explore-template.module.css";
import styles from "./mental-age-landing.module.css";

const { styleLinks, exploreLinks, compareLinks, visibleRules } = mentalAgeLandingConfig;
const currencies = { zh: "CNY", "zh-TW": "TWD", en: "USD" } as const;

export function MentalAgeLanding({ quiz, locale }: { quiz: Questionnaire; locale: MentalAgeLandingLocale }) {
  const copy = mentalAgeLandingCopy[locale];
  const reading = mentalAgeReadingCopy[locale];
  const contentLocale = locale === "en" ? "en" : "zh";
  const path = questionnairePath(locale, quiz.slug);
  const start = `${path}/take?start=1`;
  const profile = quiz.profiles[0];
  const year = new Date().getUTCFullYear();
  const localLink = (target: string) => displayNavigationPath(target, locale);
  const canonical = new URL(path, SITE_URL).toString();
  const { sample, age, actual, gap, year: yearLabel, years, card, sampleNote, spectrum, spectrumEnds } = copy;
  const sampleCopy = { sample, age, actual, gap, year: yearLabel, years, card, sampleNote, styleTitles: copy.rhythm.map(([title]) => title) };
  const spectrumCopy = { spectrum, spectrumEnds, years, styles: copy.rhythm.map(([title, reading]) => [title, reading] as const) };

  const examples = mentalAgeLandingConfig.sampleQuestionIds
    .map(id => quiz.questions.find(question => question.id === id))
    .filter(question => question !== undefined);
  const visible = profile.sections.filter(section => visibleRules.some(id => id === section.id));
  const supplemental = profile.sections.filter(section => !visibleRules.some(id => id === section.id));
  const profiles = mentalAgeStyles.map((band, index) => {
    const [title, lead, scene, friction, label] = copy.rhythm[index];
    return { range: `${band.min}–${band.max} ${copy.years}`, title, lead, scene, friction, link: { href: localLink(styleLinks[index]), label } };
  });

  return <>
    <JsonLd id="mental-age-classic-structured-data" data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebApplication", "@id": `${canonical}#webapp`, url: canonical, name: copy.title,
          description: copy.description, applicationCategory: "EntertainmentApplication", isAccessibleForFree: true,
          inLanguage: locale === "zh" ? "zh-CN" : locale, offers: { "@type": "Offer", price: "0", priceCurrency: currencies[locale] } },
        { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: copy.faq.map(([name, text]) => ({
          "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text },
        })) },
      ],
    }} />
    <TestExploreTemplate copy={copy} start={start} guideHref={`${path}/results/${profile.id}`}
      rootAttributes={{ "data-mental-age-classic-public": "" }}
      profilesId="life-styles" profiles={profiles} exploreLinks={exploreLinks.map(localLink)}
      compareLinks={compareLinks.map(target => target ? localLink(target) : null)}
      sample={<MentalAgeSamples locale={locale} year={year} copy={sampleCopy} />}
      insight={<><div><h2>{copy.insightTitle}</h2><p>{copy.insight}</p></div><MentalAgeSpectrum copy={spectrumCopy} /></>}
      afterProfiles={<>
        <section className={layout.section} aria-labelledby="mental-age-topics">
          <h2 id="mental-age-topics">{reading.coverage}</h2>
          <p className={layout.facts}>{reading.coverageNote}</p>
          <div className={styles.readingGrid}>
            <dl className={styles.topicList}>{reading.topics.map(([name, description]) =>
              <div key={name}><dt>{name}</dt><dd>{description}</dd></div>
            )}</dl>
            <div>
              <h3>{reading.examples}</h3>
              <p>{reading.scoring}</p>
              <ol className={styles.examples}>{examples.map(question =>
                <li key={question.id} data-mental-age-sample-question={question.id}>
                  <p>{question.prompt[contentLocale]}</p>
                  <dl>{question.options.map(option =>
                    <div key={option.id}>
                      <dt>{option.label[contentLocale]}</dt><dd>{option.score} {reading.points}</dd>
                    </div>
                  )}</dl>
                </li>
              )}</ol>
            </div>
          </div>
        </section>
        <section className={layout.section} aria-labelledby="mental-age-gap">
          <h2 id="mental-age-gap">{reading.gap}</h2>
          <p className={layout.facts}>{reading.gapNote}</p>
          <div className={layout.threeColumns}>{reading.bands.map(([title, example, suggestion]) =>
            <article key={title}><h3>{title}</h3><p>{example}</p><p>{suggestion}</p></article>
          )}</div>
        </section>
      </>}
      rules={<>
        {visible.map(section =>
          <div id={`report-${section.id}`} key={section.id}><h3>{section.title[contentLocale]}</h3>{section.id === "examples" ? <p>{copy.calculationExample}</p> : section.paragraphs.map(p => <p key={p[contentLocale]}>{p[contentLocale]}</p>)}</div>
        )}
        <details className={styles.supplemental}>
          <summary>{reading.details}</summary>
          <p>{quiz.instructions?.[contentLocale]}</p>
          {supplemental.map(section =>
            <div id={`report-${section.id}`} key={section.id}><h3>{section.title[contentLocale]}</h3>{section.paragraphs.map(p => <p key={p[contentLocale]}>{p[contentLocale]}</p>)}</div>
          )}
        </details>
      </>}
    />
  </>;
}
