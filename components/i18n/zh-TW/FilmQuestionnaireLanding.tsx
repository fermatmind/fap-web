import Link from "next/link";
import { notFound } from "next/navigation";
import { barbieLandingFaq, barbieLandingSections } from "@/components/questionnaires/BarbieLandingEditorial";
import { avengersLandingFaq, avengersLandingSections } from "@/components/questionnaires/AvengersLandingEditorial";
import { wednesdayLandingFaq, wednesdayLandingSections } from "@/components/questionnaires/WednesdayLandingEditorial";
import { twilightLandingFaq, twilightLandingSections } from "@/components/questionnaires/TwilightLandingEditorial";
import { strangerThingsLandingFaq, strangerThingsLandingSections } from "@/components/questionnaires/StrangerThingsLandingEditorial";
import { ginnyGeorgiaLandingFaq, ginnyGeorgiaLandingSections } from "@/components/questionnaires/GinnyGeorgiaLandingEditorial";
import { gilmoreGirlsLandingFaq, gilmoreGirlsLandingSections } from "@/components/questionnaires/GilmoreGirlsLandingEditorial";
import { dexterLandingFaq, dexterLandingSections } from "@/components/questionnaires/DexterLandingEditorial";
import { gossipGirlLandingFaq, gossipGirlLandingSections } from "@/components/questionnaires/GossipGirlLandingEditorial";
import { gameOfThronesLandingFaq, gameOfThronesLandingSections } from "@/components/questionnaires/GameOfThronesLandingEditorial";
import { harryPotterLandingFaq, harryPotterLandingSections } from "@/components/questionnaires/HarryPotterLandingEditorial";
import { euphoriaLandingFaq, euphoriaLandingSections } from "@/components/questionnaires/EuphoriaLandingEditorial";
import { hazbinHotelLandingFaq, hazbinHotelLandingSections } from "@/components/questionnaires/HazbinHotelLandingEditorial";
import { myHeroAcademiaLandingFaq, myHeroAcademiaLandingSections } from "@/components/questionnaires/MyHeroAcademiaLandingEditorial";
import { myLittlePonyLandingFaq, myLittlePonyLandingSections } from "@/components/questionnaires/MyLittlePonyLandingEditorial";
import { nanaLandingFaq, nanaLandingSections } from "@/components/questionnaires/NanaLandingEditorial";
import { southParkLandingFaq, southParkLandingSections } from "@/components/questionnaires/SouthParkLandingEditorial";
import { jujutsuKaisenLandingFaq, jujutsuKaisenLandingSections } from "@/components/questionnaires/JujutsuKaisenLandingEditorial";
import { digitalCircusLandingFaq, digitalCircusLandingSections } from "@/components/questionnaires/DigitalCircusLandingEditorial";
import { blueLockLandingFaq, blueLockLandingSections } from "@/components/questionnaires/BlueLockLandingEditorial";
import { animeStoryRolesLandingFaq, animeStoryRolesLandingSections } from "@/components/questionnaires/AnimeStoryRolesLandingEditorial";
import { QuestionnaireTakeEntry } from "@/components/questionnaires/QuestionnaireTakeEntry";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { archetypeEditorial } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

const editorials = {
  "barbie-character": { sections: barbieLandingSections, faq: barbieLandingFaq },
  "avengers-character": { sections: avengersLandingSections, faq: avengersLandingFaq },
  "wednesday-addams-character": { sections: wednesdayLandingSections, faq: wednesdayLandingFaq },
  "twilight-character": { sections: twilightLandingSections, faq: twilightLandingFaq },
  "stranger-things": { sections: strangerThingsLandingSections, faq: strangerThingsLandingFaq },
  "ginny-and-georgia-character-quiz": { sections: ginnyGeorgiaLandingSections, faq: ginnyGeorgiaLandingFaq },
  "gilmore-girls": { sections: gilmoreGirlsLandingSections, faq: gilmoreGirlsLandingFaq },
  "dexter": { sections: dexterLandingSections, faq: dexterLandingFaq },
  "gossip-girl": { sections: gossipGirlLandingSections, faq: gossipGirlLandingFaq },
  "game-of-thrones": { sections: gameOfThronesLandingSections, faq: gameOfThronesLandingFaq },
  "harry-potter-character": { sections: harryPotterLandingSections, faq: harryPotterLandingFaq },
  "euphoria-character-quiz": { sections: euphoriaLandingSections, faq: euphoriaLandingFaq },
  "hazbin-hotel-character-quiz": { sections: hazbinHotelLandingSections, faq: hazbinHotelLandingFaq },
  "my-hero-academia-character-quiz": { sections: myHeroAcademiaLandingSections, faq: myHeroAcademiaLandingFaq },
  "my-little-pony-character-quiz": { sections: myLittlePonyLandingSections, faq: myLittlePonyLandingFaq },
  "nana-character": { sections: nanaLandingSections, faq: nanaLandingFaq },
  "south-park": { sections: southParkLandingSections, faq: southParkLandingFaq },
  "jujutsu-kaisen-character": { sections: jujutsuKaisenLandingSections, faq: jujutsuKaisenLandingFaq },
  "amazing-digital-circus": { sections: digitalCircusLandingSections, faq: digitalCircusLandingFaq },
  "blue-lock": { sections: blueLockLandingSections, faq: blueLockLandingFaq },
  "anime-character-archetype-test": { sections: animeStoryRolesLandingSections, faq: animeStoryRolesLandingFaq },
};

export function hasFilmEditorial(slug: string): slug is keyof typeof editorials {
  return Object.hasOwn(editorials, slug);
}

function FilmCopy({ text, slug }: { text: string; slug: string }) {
  return text.split(/(\[\d+\])/g).map((part, index) => /^\[\d+\]$/.test(part)
    ? <sup key={index}><a className="underline" href={`#${slug}-reference-${part.slice(1, -1)}`}>{part}</a></sup>
    : part);
}

export function FilmQuestionnaireLanding({ quiz }: { quiz: Questionnaire }) {
  if (!hasFilmEditorial(quiz.slug)) notFound();
  const { slug } = quiz;
  const editorial = editorials[slug];
  const sections = [...quiz.guide, ...archetypeEditorial(slug, "sections", editorial.sections)];
  const faq = [...quiz.faq, ...archetypeEditorial(slug, "faq", editorial.faq)];
  return <div className="mx-auto max-w-3xl space-y-8">
    <ExploreTestIntro slug={slug} locale="zh">
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title.zh}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description.zh}</p>
      <QuestionnaireTakeEntry quiz={quiz} locale="zh" displayLocale="zh-TW" />
    </ExploreTestIntro>
    <p className="whitespace-pre-line leading-8"><FilmCopy text={quiz.introduction.zh} slug={slug} /></p>
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">全部角色指南</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border p-4">
          <Link href={questionnaireGuidePath("zh-TW", slug, profile.id)} className="inline-block min-h-11 py-2 font-semibold underline">{profile.title.zh}</Link>
          <p className="leading-7">{profile.summary.zh}</p>
        </li>)}
      </ul>
    </section>
    <section className="space-y-5 leading-8">
      <h2 className="text-2xl font-semibold">選角、計分與結果讀法</h2>
      {sections.map(section => <section key={section.id} className="space-y-2">
        <h3 className="text-xl font-semibold">{section.title.zh}</h3>
        {section.paragraphs.map((paragraph, index) => <p key={index}><FilmCopy text={paragraph.zh} slug={slug} /></p>)}
      </section>)}
    </section>
    <section className="space-y-4 leading-8">
      <h2 className="text-2xl font-semibold">常見問題</h2>
      {faq.map((item, index) => <div key={index}>
        <h3 className="text-xl font-semibold">{item.question.zh}</h3>
        <p><FilmCopy text={item.answer.zh} slug={slug} /></p>
      </div>)}
    </section>
    {quiz.references?.length ? <section className="space-y-3 leading-8">
      <h2 className="text-2xl font-semibold">來源與補充說明</h2>
      <ol>{quiz.references.map((item, index) => <li key={item.url} id={`${slug}-reference-${index + 1}`}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 underline">{index + 1}. {item.title.zh}</a>
      </li>)}</ol>
    </section> : null}
  </div>;
}
