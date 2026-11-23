import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArchiveQuestionnaireNextStep } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { Container } from "@/components/layout/Container";
import { SITE_URL } from "@/lib/site";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { GLOBAL_HISTORY_QUESTION_COUNT, GLOBAL_HISTORY_SLUG, globalHistoryMethod, globalHistoryPath, globalHistoryPortraitPath, globalHistoryPosterPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { coxStudy, coxTranscription, getCoxEstimate, getHistoryResult, historyResultPeers, resultCopy } from "@/lib/entertainment/global-history/result-v2";
import { historyPeople, type HistoryPerson } from "@/lib/entertainment/global-history/people";
import { historyAxes } from "@/lib/entertainment/global-history/questions";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { GlobalHistoryDirectory, GlobalHistoryResultFollowup, GlobalHistoryReveal } from "./GlobalHistoryResultInteractive";
import styles from "./GlobalHistoryResultV2.module.css";

const continents = {
  asia: resultCopy("亚洲", "亞洲", "Asia"), europe: resultCopy("欧洲", "歐洲", "Europe"),
  americas: resultCopy("美洲", "美洲", "Americas"), africa: resultCopy("非洲", "非洲", "Africa"),
  oceania: resultCopy("大洋洲", "大洋洲", "Oceania"),
};
const regionToContinents: Record<string, string[]> = {
  "East Asia": ["asia"], "South and Southeast Asia": ["asia"], Europe: ["europe"], "North America": ["americas"],
  "Latin America and the Caribbean": ["americas"], "West and Central Asia, and North Africa": ["asia", "africa"],
  "Sub-Saharan Africa": ["africa"], Oceania: ["oceania"],
};
const bands = [
  { label: "180+", minimum: 180 }, { label: "160–179", minimum: 160 },
  { label: "140–159", minimum: 140 }, { label: "120–139", minimum: 120 }, { label: "<120", minimum: 0 },
];

export function GlobalHistoryResultV2({ person, locale, result, traditionalCopy }: {
  person: HistoryPerson; locale: DisplayLocale; result: NonNullable<ReturnType<typeof getHistoryResult>>; traditionalCopy: (text: string) => string;
}) {
  const t = (zh: string, traditional: string, en: string) => resultCopy(zh, traditional, en)[locale];
  const lang = locale === "zh-TW" ? "zh" : locale;
  const name = person.name[lang];
  const path = globalHistoryResultPath(locale, person.id);
  const canonical = `${SITE_URL}${path}`;
  const image = globalHistoryPosterPath(locale, person.id);
  const benchmark = result.iq_benchmark;
  const personality = result.personality_benchmark;
  const coxDates = benchmark.has_cox_data ? benchmark.estimate.dates.split("-") : undefined;
  const schemaYear = (index: 0 | 1) => {
    const year = result.years[index];
    return year > 0 && (!coxDates || /^\d+$/.test(coxDates[index])) ? String(year) : undefined;
  };
  const hook = result.one_line_hook[locale];
  const title = result.archetype_title[locale];
  const axes = historyAxes.map(axis => traditionalCopy(axis[lang]));
  const peers = historyResultPeers(person);
  const gift = benchmark.has_cox_data ? null : benchmark.cognitive_gift_tag[locale];
  const coxNote = t(
    "Cox（1926）根据早年传记回推早熟程度。历史估值与现代测验没有可换算关系，曲线仅作示意。",
    "Cox（1926）根據早年傳記回推早熟程度。歷史估值與現代測驗沒有可換算關係，曲線僅為示意。",
    "Cox (1926) estimated early development from biographies. The historical estimates and modern test scores have no conversion. The curve is illustrative.",
  );
  const noCox = t(
    `Cox 表未给${name}估值。这里呈现认知天赋，没有可核实的 IQ 或人群百分位。`,
    `Cox 表未提供${name}的估值。這裡呈現認知天賦，沒有可核實的 IQ 或人口百分位。`,
    `Cox’s tables give no estimate for ${name}. This gift is an editorial reading of the work. There’s no verified IQ score or population percentile.`,
  );
  const personalityNote = t(
    "MBTI 字母、倾向百分比和大五标签是传记原型的编辑演绎，用于角色比较。",
    "MBTI 字母、傾向百分比與大五標籤是傳記原型的編輯演繹，用於角色比較。",
    "The MBTI letters, tendency percentages and Big Five tags are editorial interpretations for comparing characters.",
  );
  const iqAnswer = benchmark.has_cox_data
    ? t(`童年修正估值 ${benchmark.estimate.childhood_corrected}，青年修正估值 ${benchmark.estimate.youth_corrected}。`, `童年修正估值 ${benchmark.estimate.childhood_corrected}，青年修正估值 ${benchmark.estimate.youth_corrected}。`, `Cox’s corrected estimates are ${benchmark.estimate.childhood_corrected} for childhood and ${benchmark.estimate.youth_corrected} for youth.`)
    : noCox;
  const faq = [
    { q: t(`${name}的 Cox 智力估值是多少？`, `${name}的 Cox 智力估值是多少？`, `What was Cox’s IQ estimate for ${name}?`), a: benchmark.has_cox_data ? `${iqAnswer} ${coxNote}` : iqAnswer },
    { q: t(`${name}接近哪种 MBTI 原型？`, `${name}接近哪種 MBTI 原型？`, `Which MBTI archetype fits ${name}?`), a: `${personality.inferred_mbti} · ${personality.title[locale]}. ${personalityNote}` },
  ];
  const directory = historyPeople.map(source => {
    const item = displayHistoryPerson(source, locale);
    const estimate = getCoxEstimate(item.id);
    return {
      id: item.id, href: globalHistoryResultPath(locale, item.id), name: item.name[lang],
      regions: regionToContinents[source.region.en] ?? [], field: source.field.en, fieldLabel: item.field[lang],
      band: estimate ? bands.find(band => estimate.youth_corrected >= band.minimum)?.label ?? "" : "none",
    };
  });
  const noEstimate = t("无 Cox 估值", "無 Cox 估值", "No Cox estimate");
  const groupRows = [
    { label: benchmark.has_cox_data ? t("智力梯队同级生", "智力梯隊同級生", "Closest Cox estimates") : t("同领域巅峰同行者", "同領域巔峰同行者", "Fellow trailblazers in the field"), people: peers.benchmark, key: "benchmark" },
    { label: t("性格同频的灵魂伴侣", "性格同頻的靈魂伴侶", "Kindred spirits"), people: peers.closest, key: "closest" },
    { label: t("与你截然相反的另一极", "與你截然相反的另一極", "Your polar opposites"), people: peers.opposite, key: "opposite" },
  ];
  const Shell = locale === "zh-TW" ? "div" : "main";

  return <Shell className={styles.page} style={{ "--history-accent": result.accent } as React.CSSProperties} data-global-history-result={person.id}>
    <JsonLd id="world-edition-profile" data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "ProfilePage", "@id": `${canonical}#profile`, url: canonical, name: `${name} · ${title}`, mainEntity: { "@id": `${canonical}#person` } },
        { "@type": "Person", "@id": `${canonical}#person`, name, image: `${SITE_URL}${globalHistoryPortraitPath(person.id)}`, description: person.bio[lang],
          birthDate: schemaYear(0), deathDate: schemaYear(1),
          knowsAbout: person.field[lang], sameAs: `https://www.wikidata.org/wiki/${person.qid}` },
        { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ],
    }} />
    <Container className={styles.inner}>
      <section className={styles.hero} aria-label={name}>
        <GlobalHistoryReveal id={person.id} locale={locale} axisNames={axes} profile={person.vector} canonical={canonical} hook={hook} image={image}
          labels={{
            start: t("测测我与哪位历史人物同频", "測測我與哪位歷史人物同頻", "Find my historical match"),
            questionCount: t(`（${GLOBAL_HISTORY_QUESTION_COUNT}题）`, `（${GLOBAL_HISTORY_QUESTION_COUNT}題）`, ` · ${GLOBAL_HISTORY_QUESTION_COUNT} questions`),
            sync: t("灵魂同步率", "靈魂同步率", "story match"),
            similar: t("你们最像的两处", "你們最像的兩處", "Your two closest traits"),
            contrast: t("最反差的一处", "反差最大的一處", "Biggest difference"),
            tie: t("六维完全吻合", "六維完全吻合", "All six dimensions match"),
            save: t("保存高清人物卡（PNG）", "儲存高畫質人物卡（PNG）", "Save portrait (PNG)"),
            open: t("打开图片 / 长按保存", "開啟圖片／長按儲存", "Open image / press and hold"),
            share: t("复制灵魂判词分享", "複製靈魂判詞分享", "Copy quote and link"),
            copied: t("判词和链接已复制", "已複製判詞與連結", "Quote and link copied"),
            shareFallback: t("选中文案并复制", "選取文字並複製", "Select the text to copy it"),
            retake: t("再测一次", "再測一次", "Play again"),
            own: t("你", "你", "You"), figure: name,
          }}
          languages={<nav aria-label={t("语言", "語言", "Language")} className={styles.languages}>
            <Link href={globalHistoryPath(locale)} prefetch={false}>{t("全球卷首页", "全球卷首頁", "World Edition home")}</Link>
            {(["zh", "zh-TW", "en"] as const).map((language, index) => <Link key={language} href={globalHistoryResultPath(language, person.id)}
              hrefLang={language === "zh" ? "zh-CN" : language} aria-current={language === locale ? "page" : undefined} prefetch={false}>{["简体", "繁體", "English"][index]}</Link>)}
          </nav>}
        >
          <h1 className="sr-only">{name} · {title}</h1>
          <Image className={styles.poster} src={image} unoptimized preload width={900} height={1200}
            alt={`${name} · ${title} · ${hook} · ${benchmark.has_cox_data ? iqAnswer : gift} · ${personality.inferred_mbti} ${personality.title[locale]} · ${result.tags[locale].join(" / ")}`} />
        </GlobalHistoryReveal>
        {result.portrait && <a className={styles.textLink} href={result.portrait.source}>
          {t("肖像来源", "肖像來源", "Portrait source")} · {result.portrait.license}
        </a>}
      </section>

      <section className={styles.section} aria-labelledby="history-why">
        <h2 id="history-why">{t("为什么是你", "為什麼是你", "Why this is your match")}</h2>
        <div className={styles.stories}>
          <div><h3>{t("你的隐藏超能力", "你的隱藏超能力", "Your hidden superpower")}</h3><p>{result.superpower[locale]}</p></div>
          <div><h3>{t("你的致命怪癖与暗面", "你的致命怪癖與暗面", "The quirk that trips you up")}</h3><p>{result.quirk_or_blindspot[locale]}</p>
            <a href={result.source}>{t("读史料 ↗", "讀史料 ↗", "See the source ↗")}</a></div>
        </div>
        <h3>{t("六维行为画像", "六維行為畫像", "Six ways you work")}</h3>
        <ul className={styles.axes}>
          {result.six_dimensions.map(({ axis, score, labels, baseline }) => (
            <li key={axis.en}>
              <strong>{labels[locale]}</strong><span>{traditionalCopy(axis[lang])} · {"zh-TW" in baseline ? baseline[locale] : traditionalCopy(baseline[lang])}</span>
              <div className={styles.axisTrack} aria-hidden="true"><i style={{ left: `${score / 6 * 100}%` }} /></div>
              <span className={styles.axisEnds}><span>{traditionalCopy(axis.low[lang])}</span><span>{traditionalCopy(axis.high[lang])}</span></span>
              <span className="sr-only">{score} / 6</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="history-coordinates">
        <h2 id="history-coordinates">{t("跨测同频坐标", "跨測同頻座標", "Explore your own profile")}</h2>
        <div className={styles.coordinates}>
          <div className={styles.coordinate}>
            <h3>{benchmark.has_cox_data ? t("智力分布坐标", "智力分布座標", "Reasoning and historical estimates") : t("同领域巅峰认知天赋", "同領域巔峰認知天賦", "Cognitive gift in context")}</h3>
            {benchmark.has_cox_data ? <div className={styles.curve}>
              <svg viewBox="0 0 360 116" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 115 C100 115 104 14 180 14 S260 115 360 115 Z" fill="currentColor" opacity=".12" />
                <path d="M0 115 C100 115 104 14 180 14 S260 115 360 115" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <GlobalHistoryResultFollowup id={person.id}><span className={styles.unlock}>{t("你的推理位置 · 待解锁", "你的推理位置 · 待解鎖", "Your reasoning · Locked")}</span></GlobalHistoryResultFollowup>
              <span className={styles.coxMarker}>Cox {benchmark.estimate.youth_corrected}</span>
            </div> : <div className={styles.giftCard}>
              <span>{t("作品里的认知天赋", "作品裡的認知天賦", "Cognitive gift in the work")}</span>
              <strong>{gift}</strong>
              <GlobalHistoryResultFollowup id={person.id}><small>{t("你的推理表现 · 待解锁", "你的推理表現 · 待解鎖", "Your reasoning · Locked")}</small></GlobalHistoryResultFollowup>
            </div>}
            {benchmark.has_cox_data && <p className={styles.iqValues}>{iqAnswer}</p>}
            <p className={styles.note}>{benchmark.has_cox_data ? coxNote : noCox}</p>
            <GlobalHistoryResultFollowup id={person.id}>
              <Link className={styles.conversion} prefetch={false} href={`/${locale}/tests/iq-test-intelligence-quotient-assessment`}>
                {t("测测你的抽象推理与空间逻辑 →", "測測你的抽象推理與空間邏輯 →", "Try the abstract and spatial reasoning test →")}
              </Link>
            </GlobalHistoryResultFollowup>
          </div>
          <div className={styles.coordinate}>
            <h3>{t("人格原型坐标", "人格原型座標", "Personality archetype")}</h3>
            <p className={styles.type}>{personality.inferred_mbti} <span>· {personality.title[locale]}</span></p>
            <ul className={styles.tendencies}>{personality.tendencies.map((score, index) => {
              const preference = personality.inferred_mbti[index];
              const names: Record<string, string> = {
                I: t("内倾", "內向", "Introversion"), E: t("外倾", "外向", "Extraversion"), N: t("直觉", "直覺", "Intuition"),
                T: t("思考", "思考", "Thinking"), F: t("情感", "情感", "Feeling"), J: t("判断", "判斷", "Judging"), P: t("感知", "知覺", "Perceiving"),
              };
              return <li key={preference}><span>{preference} · {names[preference]}</span><meter min={0} max={100} value={score} aria-label={names[preference]} /><strong>{score}%</strong></li>;
            })}</ul>
            <ul className={styles.traits}>{personality.big_five_traits[locale].map(trait => <li key={trait}>{trait}</li>)}</ul>
            <p className={styles.note}>{personalityNote}</p>
            <GlobalHistoryResultFollowup id={person.id}>
              <Link className={styles.conversion} prefetch={false} href={`/${locale}/tests/mbti-personality-test-16-personality-types`}>
                {t("你和他是同一型吗？进入 16 型人格测评 →", "你和他是同一型嗎？進入 16 型人格測驗 →", "Share the same type? Take the 16-type assessment →")}
              </Link>
              <Link className={styles.textLink} prefetch={false} href={`/${locale}/tests/big-five-personality-test-ocean-model`}>
                {t("测我的大五人格 ↗", "測我的大五人格 ↗", "Explore my Big Five traits ↗")}
              </Link>
            </GlobalHistoryResultFollowup>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="history-universe">
        <h2 id="history-universe">{t("同频宇宙", "同頻宇宙", "Explore the cast")}</h2>
        {groupRows.map(group => <div className={styles.peerGroup} data-peer-group={group.key} key={group.key}>
          <h3>{group.label}</h3>
          <ul className={styles.peers}>{group.people.map(source => {
            const item = displayHistoryPerson(source, locale);
            const estimate = group.key === "benchmark" && benchmark.has_cox_data ? getCoxEstimate(item.id) : undefined;
            return <li key={item.id}><Link href={globalHistoryResultPath(locale, item.id)} prefetch={false}>
              <Image src={globalHistoryPortraitPath(item.id)} alt="" width={72} height={72} unoptimized />
              <span><strong>{item.name[lang]}</strong><small>{getHistoryResult(item)?.archetype_title[locale] ?? item.field[lang]}{estimate && ` · Cox ${estimate.youth_corrected}`}</small></span>
            </Link></li>;
          })}</ul>
        </div>)}
      </section>

      <div className={styles.section}>
        <GlobalHistoryDirectory
          labels={{
            summary: t(`浏览全部 ${directory.length} 位历史人物`, `瀏覽全部 ${directory.length} 位歷史人物`, `Browse all ${directory.length} historical figures`),
            all: t("全部", "全部", "All"), region: t("大洲", "大洲", "Continent"), field: t("领域", "領域", "Field"),
            band: t("Cox 青年估值区间", "Cox 青年估值區間", "Cox youth estimate"), empty: t("这个组合下没有人物。", "這個組合下沒有符合的人物。", "No figures match these filters."),
          }}
          regions={Object.entries(continents).map(([id, label]) => ({ id, label: label[locale] }))}
          fields={[...new Map(directory.map(item => [item.field, item.fieldLabel]))].map(([id, label]) => ({ id, label }))}
          bands={[...bands.map(({ label }) => ({ id: label, label })), { id: "none", label: noEstimate }]}
          entries={directory}
        />
        <details className={styles.details} id="faq">
          <summary>{t("研究方法与数据边界", "研究方法與資料邊界", "Method and data limits")}</summary>
          <p>{traditionalCopy(globalHistoryMethod[lang])}</p>
          <p>{t("同步率是六维欧氏距离按最大距离归一化的娱乐指标；同频组优先跨地区或跨领域，反差组取距离最远者。", "同步率是以最大距離正規化的六維歐氏距離娛樂指標；同頻組優先跨地區或跨領域，反差組取距離最遠者。", "The story match is a just-for-fun score based on six-dimensional distance. Kindred spirits prioritize other regions or fields, and polar opposites are the furthest away.")}</p>
          <dl>{faq.map(({ q, a }) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl>
          <div className={styles.references}><a href={coxStudy}>Catharine Cox (1926) · 12A / 12B ↗</a>
            <a href={coxTranscription}>{t("折页转录 CSV ↗", "摺頁轉錄 CSV ↗", "Foldout transcription CSV ↗")}</a></div>
        </details>
        <GlobalHistoryResultFollowup id={person.id} matched>
          <ArchiveQuestionnaireNextStep slug={GLOBAL_HISTORY_SLUG} locale={locale} />
        </GlobalHistoryResultFollowup>
      </div>
    </Container>
  </Shell>;
}
