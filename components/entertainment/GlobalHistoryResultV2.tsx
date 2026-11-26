import { historyStandardNarrative, historyStandards } from "@/lib/entertainment/global-history/standard-profiles";
import { historyFlagships } from "@/lib/entertainment/global-history/flagship-profiles";
import { historyProfileExpansions } from "@/lib/entertainment/global-history/profile-evidence";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArchiveQuestionnaireNextStep } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { Container } from "@/components/layout/Container";
import { SITE_URL } from "@/lib/site";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { GLOBAL_HISTORY_QUESTION_COUNT, GLOBAL_HISTORY_SLUG, globalHistoryPath, globalHistoryPortraitPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { coxStudy, getCoxEstimate, getHistoryResult, historyResultPeers, resultCopy } from "@/lib/entertainment/global-history/result-v2";
import { findHistoryPerson, historyPeople, type HistoryPerson } from "@/lib/entertainment/global-history/people";
import wikidataSitelinks from "@/lib/entertainment/global-history/wikidata-sitelinks.json";
import { globalHistoryGeoEditorial } from "@/lib/entertainment/global-history/geo-editorial";
import { historyAxes } from "@/lib/entertainment/global-history/questions";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import { GlobalHistoryBehaviorTrack, GlobalHistoryDirectory, GlobalHistoryResultFollowup, GlobalHistoryReveal } from "./GlobalHistoryResultInteractive";
import { GlobalHistoryCitation } from "./GlobalHistoryAtlasCitation";
import { coxCoverageCopy, GlobalHistoryCoxReference } from "./GlobalHistoryReferenceSections";
import { historyDecisionAxes, historyEraAndRegion, historyProfileNotes, historyReferenceCitation, historyReferenceRevision } from "@/lib/entertainment/global-history/reference";
import { GlobalHistoryAtlasLinks } from "./GlobalHistoryAtlasLinks";
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
  const rosterPerson = findHistoryPerson(person.id) ?? person;
  const original = historyProfileNotes[person.id];
  const taiwanName = displayHistoryPerson(rosterPerson, "zh-TW").name.zh;
  const path = globalHistoryResultPath(locale, person.id);
  const canonical = `${SITE_URL}${path}`;
  const image = globalHistoryPortraitPath(person.id);
  const geo = globalHistoryGeoEditorial[person.id];
  const sitelinks = (wikidataSitelinks as Readonly<Record<string, { en: string; zh?: string }>>)[person.qid];
  const sameAs = [
    `https://www.wikidata.org/wiki/${person.qid}`,
    ...Object.entries(sitelinks ?? {}).map(([language, article]) =>
      `https://${language}.wikipedia.org/wiki/${encodeURIComponent(article.replaceAll(" ", "_"))}`
    ),
  ];
  const benchmark = result.iq_benchmark;
  const personality = result.personality_benchmark;
  const coxDates = benchmark.has_cox_data ? benchmark.estimate.dates.split("-") : undefined;
  const schemaYear = (index: 0 | 1) => {
    const year = result.years[index];
    return year > 0 && (!coxDates || /^\d+$/.test(coxDates[index])) ? String(year) : undefined;
  };
  const hook = result.one_line_hook[locale];
  const shareTraits = result.tags[locale].slice(0, 3).map(trait =>
    locale === "en" ? trait.replace(/([a-z])([A-Z])/g, "$1 $2") : trait);
  const title = result.archetype_title[locale];
  const axes = historyAxes.map(axis => traditionalCopy(axis[lang]));
  const flagship = historyFlagships[person.id];
  const evidenceAxes = flagship?.episodes[0].axes ?? historyDecisionAxes[person.id] ?? [];
  const standard = historyStandards[person.id];
  const expansion = standard ? undefined : historyProfileExpansions[person.id];
  const evidence = geo ? [
    { ...geo.decision, axes: evidenceAxes },
    ...(flagship?.evidence ?? expansion?.evidence ?? []),
  ] : [];
  const selectedAxes = historyAxes.flatMap((axis, index) => evidenceAxes.includes(axis.en) ? [axes[index]] : []);
  const evidenceAxisText = selectedAxes.join(locale === "en" ? " / " : "、");
  const peers = historyResultPeers(person);
  const gift = benchmark.has_cox_data ? null : benchmark.cognitive_gift_tag[locale];
  const coverage = benchmark.has_cox_data ? [] : coxCoverageCopy(person.id, name, result.years[0], locale);
  const coxAnswer = benchmark.has_cox_data
    ? t(`Cox 表 ${benchmark.estimate.table} 的两阶段修正估值是 ${benchmark.estimate.childhood_corrected} 和 ${benchmark.estimate.youth_corrected}。它们来自传记回推，不能换算成现代 IQ。`,
      `Cox 表 ${benchmark.estimate.table} 的兩階段修正估值是 ${benchmark.estimate.childhood_corrected} 與 ${benchmark.estimate.youth_corrected}。它們來自傳記回推，無法換算為現代 IQ。`,
      `Cox’s Table ${benchmark.estimate.table} gives corrected estimates of ${benchmark.estimate.childhood_corrected} and ${benchmark.estimate.youth_corrected}. These biographical estimates do not convert to modern IQ scores.`)
    : coverage.join(" ");
  const exampleNumbers = evidence.map((_, index) => `[E${index + 1}]`).join(locale === "en" ? ", " : "、");
  const documentedAxes = historyAxes.flatMap((axis, index) => evidence.some(item => item.axes.includes(axis.en)) ? [axes[index]] : []);
  const documentedAxisText = documentedAxes.join(locale === "en" ? ", " : "、");
  const synthesis = flagship ? t(
    `${exampleNumbers} 提供了${documentedAxisText}的传记线索。六维表中的相应编号可追到具体情境。编码位置和人格类型仍是编辑解读。`,
    `${exampleNumbers} 提供${documentedAxisText}的傳記線索。六維表的編號可追查各項事例。編碼位置與人格類型仍屬編輯判讀。`,
    `${exampleNumbers} document examples relevant to ${documentedAxisText}. Each linked code in the table leads to its episode. Scale positions and the personality type remain editorial interpretations.`,
  ) : original?.synthesis?.[locale] ?? t(
    `整份传记画像对照六个行为维度。本页案例尤其能用来讨论${evidenceAxisText}。其他位置是编辑编码，单凭这一案例无法验证。`,
    `整份傳記畫像對照六個行為面向。本頁案例尤其能用來討論${evidenceAxisText}。其他位置是編輯編碼，單憑這項事例無法驗證。`,
    `The profile compares six aspects of behavior. This episode is most relevant to ${evidenceAxisText}. The remaining positions are editorial codes with no direct support from this episode.`,
  );
  const typeAnswer = flagship?.typeAnswer[locale] ?? standard?.personalityAnswer[locale] ?? original?.typeAnswer?.[locale] ?? t(
    `费马暂读作 ${personality.inferred_mbti}。可从 [E1] 核查${evidenceAxisText}的线索，四个字母仍是编辑判断。`,
    `費馬暫讀為 ${personality.inferred_mbti}。可從 [E1] 查證${evidenceAxisText}的線索，四個字母仍是編輯判斷。`,
    `FermatMind provisionally uses ${personality.inferred_mbti}. See [E1] for an example of ${evidenceAxisText}. The four letters remain an editorial reading.`,
  );
  const portraitFeature = result.cognitive_gift_tag?.[locale] ?? result.six_dimensions
    .reduce((strongest, item) => Math.abs(item.score - 3) > Math.abs(strongest.score - 3) ? item : strongest)
    .labels[locale];
  const alternatives = flagship ? [flagship.alternative] : standard ? [] : original?.alternatives ?? [];
  const followup = flagship?.followup ?? expansion;
  const faq = [
    { q: standard?.personalityQuestion[locale] ?? t(`${name}的传记 MBTI 是什么？费马依据什么？`, `${name}的傳記 MBTI 是什麼？費馬依據什麼？`, `What is FermatMind’s MBTI reading of ${name}, and why?`), a: typeAnswer },
    { q: t(`Cox（1926）给${name}估值了吗？`, `Cox（1926）為${name}提供估值了嗎？`, `Did Cox (1926) give ${name} an IQ estimate?`), a: coxAnswer },
    ...(geo ? [{ q: geo.question[locale], a: geo.answer[locale] }] : []),
    ...(followup ? [{ q: followup.question[locale], a: followup.answer[locale] }] : []),
  ];
  const profileTitle = t(`${name} · 传记行为参考档案`, `${name} · 傳記行為參考檔案`, `${name}: Biographical behavior reference`);
  const citations = historyReferenceCitation(profileTitle, canonical, t("参考档案", "參考檔案", "Reference profile"));
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
    { label: t("同传记类型人物", "同傳記類型人物", "Figures with the same biographical type"), people: peers.sameType, key: "same-type" },
    { label: t("行为画像反差较大的人物", "行為畫像差異較大的人物", "Figures with contrasting profiles"), people: peers.opposite, key: "opposite" },
  ];
  const birth = schemaYear(0);
  const death = schemaYear(1);
  const birthYear = result.years[0];
  const deathYear = result.years[1];
  const yearLabel = (year: number) => year < 0 ? t(`公元前 ${-year} 年`, `西元前 ${-year} 年`, `${-year} BCE`) : String(year);
  const displayDates = benchmark.has_cox_data && (!birth || !death) ? benchmark.estimate.dates
    : birthYear && deathYear ? `${yearLabel(birthYear)}–${yearLabel(deathYear)}` : "";
  const lifeSpan = displayDates ? ` · ${displayDates}` : "";
  const alternativeTitles = new Map(alternatives.map(({ url, title }) => [url, title]));
  const references = [
    ...(original?.primaryWork ? [{ ...original.primaryWork, label: original.primaryWork.title }] : []),
    ...evidence.map(item => item.source),
    ...alternatives.map(reading => ({ ...reading, label: reading.title })),
  ].filter((source, index, sources) =>
    source.url !== sameAs[0] && (!benchmark.has_cox_data || source.url !== coxStudy)
    && sources.findIndex(item => item.url === source.url) === index
  );

  return <main className={styles.page} style={{ "--history-accent": result.accent } as React.CSSProperties} data-global-history-result={person.id}>
    <JsonLd id="world-edition-profile" data={{
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${canonical}#person`,
      name,
      image: `${SITE_URL}${image}`,
      description: person.bio[lang],
      birthDate: birth,
      deathDate: death,
      knowsAbout: person.field[lang],
      sameAs,
    }} />
    <Container className={styles.inner}>
      <GlobalHistoryReveal id={person.id} locale={locale} axisNames={axes} profile={person.vector} canonical={canonical}
        poster={{ name, title: `${personality.inferred_mbti} · ${personality.title[locale] || title}`, description: hook, traits: shareTraits }}
        identity={<div className={styles.identity}>
          <h1 id="history-person-name">{name}</h1>
          <p className={styles.identityMeta}>{result.era[locale]} · {person.field[lang]}{lifeSpan}</p>
          <p className={styles.identitySummary}>{geo?.summary[locale] ?? person.bio[lang]}</p>
        </div>}
        portrait={<Image className={styles.poster} src={image} unoptimized preload width={900} height={1200}
          alt={t(
            `${name}的全球卷插画肖像｜${personality.inferred_mbti} 传记原型，${portraitFeature}｜费马测试 FermatMind`,
            `${name}的全球卷插畫肖像｜${personality.inferred_mbti} 傳記原型，${portraitFeature}｜費馬測試 FermatMind`,
            `FermatMind World Edition illustration of ${name} · ${personality.inferred_mbti} biographical interpretation · ${portraitFeature}`,
          )} />}
        labels={{
          start: t("测测我与哪位历史人物同频", "測測我與哪位歷史人物同頻", "Find my historical match"),
          questionCount: t(`（${GLOBAL_HISTORY_QUESTION_COUNT}题）`, `（${GLOBAL_HISTORY_QUESTION_COUNT}題）`, ` · ${GLOBAL_HISTORY_QUESTION_COUNT} questions`),
          match: t("最像你的历史人物是…", "最像你的歷史人物是…", "Your historical match is…"),
          traits: t("性格关键词", "性格關鍵字", "Core traits"),
          sync: t("灵魂同步率", "靈魂同步率", "story match"),
          similar: t("你们最像的两处", "你們最像的兩處", "Your two closest traits"),
          contrast: t("最反差的一处", "反差最大的一處", "Biggest difference"),
          tie: t("六维完全吻合", "六維完全吻合", "All six dimensions match"),
          save: t("保存高清人物卡（PNG）", "儲存高畫質人物卡（PNG）", "Save portrait (PNG)"),
          open: t("打开图片 / 长按保存", "開啟圖片／長按儲存", "Open image / press and hold"),
          share: t("分享结果", "分享結果", "Share result"),
          shareProfile: t("复制人物页链接", "複製人物頁連結", "Copy profile link"),
          copiedProfile: t("人物页链接已复制", "已複製人物頁連結", "Profile link copied"),
          copied: t("分享文案已复制", "已複製分享文案", "Share text copied"),
          shareFallback: t("选中文案并复制", "選取文字並複製", "Select the text to copy it"),
          retake: t("再测一次", "再測一次", "Play again"),
          own: t("你", "你", "You"), figure: name,
        }}
        languages={<nav aria-label={t("语言", "語言", "Language")} className={styles.languages}>
          <Link href={globalHistoryPath(locale)} prefetch={false}>{t("全球卷首页", "全球卷首頁", "World Edition home")}</Link>
          {(["zh", "zh-TW", "en"] as const).map((language, index) => <Link key={language} href={globalHistoryResultPath(language, person.id)}
            hrefLang={language === "zh" ? "zh-CN" : language} aria-current={language === locale ? "page" : undefined} prefetch={false}>{["简体", "繁體", "English"][index]}</Link>)}
        </nav>}
        credit={result.portrait && <a className={styles.textLink} href={result.portrait.source} data-history-portrait-credit>
            {t("肖像来源", "肖像來源", "Portrait source")} · {result.portrait.license === "Public domain"
              ? t("公有领域", "公有領域", "Public domain")
              : result.portrait.license}
          </a>}
      />

      <section className={styles.section} id="core-facts" aria-labelledby="core-facts-heading">
        <h2 id="core-facts-heading">{t("客观核心档案", "客觀核心檔案", "Core biographical facts")}</h2>
        <table className={styles.facts} aria-labelledby="core-facts-heading">
          <tbody>
            <tr><th scope="row">{t("简体中文名", "簡體中文名", "Simplified Chinese name")}</th><td lang="zh-CN">{rosterPerson.name.zh}</td></tr>
            <tr><th scope="row">{t("繁体中文名", "繁體中文名", "Traditional Chinese name")}</th><td lang="zh-TW">{taiwanName}</td></tr>
            <tr><th scope="row">{t("英文名", "英文名", "English name")}</th><td lang="en">{rosterPerson.name.en}</td></tr>
            {original?.originalName && <tr><th scope="row">{t("文献所载名", "文獻所載名", "Name in historical records")}</th><td>{original.originalName}</td></tr>}
            {displayDates && <tr><th scope="row">{t("生卒年", "生卒年", "Life dates")}</th><td>{displayDates}</td></tr>}
            <tr><th scope="row">{t("时代与地区", "時代與地區", "Era and region")}</th><td>{historyEraAndRegion(result.era[locale], person.region[lang])}</td></tr>
            <tr><th scope="row">{t("主要领域", "主要領域", "Primary field")}</th><td>{person.field[lang]}</td></tr>
            {original?.primaryWork && <>
              <tr><th scope="row">{t("代表性一手文献", "代表性一手文獻", "Representative primary source")}</th><td>{original.primaryWork.title[locale]}</td></tr>
              <tr><th scope="row">{t("馆藏或原文", "館藏或原文", "Collection or original text")}</th><td><a href={original.primaryWork.url}>{original.primaryWork.locator[locale]}</a></td></tr>
            </>}
            <tr><th scope="row">Wikidata QID</th><td><a href={sameAs[0]}>{person.qid}</a></td></tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section} id="decision-evidence" aria-labelledby="decision-evidence-heading" data-history-flagship={flagship ? "true" : undefined}>
        <h2 id="decision-evidence-heading">{t("关键决策与证据", "關鍵決策與證據", "Key decision and evidence")}</h2>
        {evidence.map(({ year, title: evidenceTitle, fact, interpretation, axes: related, source }, index) => (
          <article key={source.url} id={`e${index + 1}`} className={styles.evidence}>
            <h3>[E{index + 1}] · {typeof year === "number" ? year : year[locale]} · {evidenceTitle[locale]}</h3>
            <dl>
              <div><dt>{t("史实", "史實", "Documented event")}</dt><dd>{fact[locale]}</dd></div>
              <div><dt>{t("本例的行为线索", "本例的行為線索", "Behavior in this episode")}</dt><dd>{interpretation[locale]}</dd></div>
              <div><dt>{t("对应维度", "對應面向", "Related dimensions")}</dt><dd><a href="#behavior-coding">{historyAxes.flatMap((axis, axisIndex) => related.includes(axis.en) ? [axes[axisIndex]] : []).join(locale === "en" ? " / " : "、")}</a></dd></div>
              <div><dt>{t("出处定位", "出處定位", "Source locator")}</dt><dd><a href={source.url} data-archive-tier={source.archiveTier}>{source.label[locale]} · {source.locator[locale]}</a></dd></div>
            </dl>
            {flagship?.episodes[index].paragraphs[locale].split("\n\n").map((paragraph, paragraphIndex) =>
              <p className={styles.prose} data-flagship-narrative key={paragraphIndex}>{paragraph}</p>)}
            {standard && index === 0 && historyStandardNarrative(standard.narrative[locale]).map((paragraph, paragraphIndex) =>
              <p className={styles.prose} data-standard-narrative key={paragraphIndex}>{paragraph}</p>)}
          </article>
        ))}
      </section>

      <GlobalHistoryCoxReference locale={locale} estimate={benchmark.has_cox_data ? benchmark.estimate : undefined} coverage={coverage} />

      <section className={styles.section} id="behavior-coding" aria-labelledby="behavior-coding-heading">
        <h2 id="behavior-coding-heading">{t("六维行为编码与传记人格", "六維行為編碼與傳記人格", "Behavior coding and biographical personality")}</h2>
        <div className={styles.tableScroll}>
          <table className={`${styles.facts} ${styles.behaviorTable}`} aria-labelledby="behavior-coding-heading">
            <caption>{t(
              "0–6 双极连续刻度。数值标记从左极至右极的位置，与能力高低无关。",
              "0–6 雙極連續刻度。數值標記從左極至右極的位置，與能力高低無關。",
              "Bipolar scale, 0–6. Values mark position between the two endpoints and do not rate ability.",
            )}</caption>
            <thead><tr>
              <th scope="col">{t("行为维度", "行為面向", "Behavior dimension")}</th>
              <th scope="col">{t("左极（0）↔ 右极（6）", "左極（0）↔ 右極（6）", "Left endpoint (0) ↔ right endpoint (6)")}</th>
              <th scope="col">{t("编码位置", "編碼位置", "Coded position")}</th>
              <th scope="col">{t("传记证据编号", "傳記證據編號", "Biographical evidence")}</th>
            </tr></thead>
            <tbody>{result.six_dimensions.map(({ axis, score }, index) => <tr key={axis.en} data-history-axis={axis.en}>
              <th scope="row">{axes[index]}</th>
              <td>{traditionalCopy(axis.low[lang])} ↔ {locale === "zh-TW" && "zh-TW" in axis.high
                ? axis.high["zh-TW"] : traditionalCopy(axis.high[lang])}</td>
              <td className={styles.axisPosition}>{score} / 6
                <GlobalHistoryBehaviorTrack id={person.id} index={index} score={score} ownLabel={t("你的作答", "你的作答", "Your answers")} />
              </td>
              <td>{evidence.some(item => item.axes.includes(axis.en))
                ? evidence.map((item, itemIndex) => item.axes.includes(axis.en)
                  ? <a key={itemIndex} href={`#e${itemIndex + 1}`}>[E{itemIndex + 1}]</a> : null)
                : t("本页暂无直接例证", "本頁暫無直接例證", "No direct example on this page")}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className={styles.note}>{t("编号只指向相关案例，单条史料无法验证精确编码位置。", "編號只指向相關案例，單項史料無法驗證精確編碼位置。", "A reference points to a relevant episode. One source cannot validate an exact position on the scale.")}</p>
        <div className={styles.coordinate}>
          <h3>{t("传记人格参考", "傳記人格參考", "Biographical personality reading")}</h3>
          <p className={styles.type}>{personality.inferred_mbti} <span>· {personality.title[locale]}</span></p>
          <p className={styles.prose} data-history-synthesis>{synthesis}</p>
          {gift && <p className={styles.note}>{t("作品解读", "作品解讀", "Interpretation of the work")} · {gift}</p>}
          {personality.big_five_traits[locale].length > 0 && <ul className={styles.traits}>{personality.big_five_traits[locale].map(trait => <li key={trait}>{trait}</li>)}</ul>}
        </div>
        <GlobalHistoryResultFollowup id={person.id}>
          <div className={styles.matchNotes} aria-labelledby="history-why">
            <h3 id="history-why">{t("为什么是你", "為什麼是你", "Why this is your match")}</h3>
            <div className={styles.stories}>
              <div><h4>{t("你的隐藏超能力", "你的隱藏超能力", "Your hidden superpower")}</h4><p>{result.superpower[locale]}</p></div>
              <div><h4>{t("你的致命怪癖与暗面", "你的致命怪癖與暗面", "The quirk that trips you up")}</h4><p>{result.quirk_or_blindspot[locale]}</p></div>
            </div>
          </div>
        </GlobalHistoryResultFollowup>
      </section>

      <section className={styles.section} id="alternative-readings" aria-labelledby="alternative-heading">
        <h2 id="alternative-heading">{t("解释分歧与方法边界", "解釋分歧與方法邊界", "Alternative readings and method limits")}</h2>
        <p className={styles.prose}>{t(
          "六维和 MBTI 属于费马的传记解读。这些人物没有接受过费马测评；具体事件只能说明当时的做法。大五编辑标签与 MBTI 字母分别解释，不能相互推定。",
          "六維和 MBTI 屬於費馬的傳記解讀。這些人物沒有接受過費馬測驗；具體事件只能說明當時的做法。大五編輯標籤與 MBTI 字母分別解釋，不能相互推定。",
          "The six dimensions and MBTI labels are FermatMind’s readings of biographies. The figures never took FermatMind’s assessment, and an episode can only document an approach in that setting. Big Five labels and MBTI letters are separate interpretations.",
        )}</p>
        {alternatives.length ? <div className={styles.evidence} data-history-alternative>
          <h3>{t("有出处的其他解读", "有出處的其他解讀", "Documented alternative readings")}</h3>
          <ul>{alternatives.map(reading => <li key={reading.url}>
            <a href={reading.url}>{reading.title[locale]}</a> · {reading.locator[locale]}<p>{reading.rationale[locale]}</p>
          </li>)}</ul>
        </div> : null}
        <nav className={styles.references} aria-label={t("现代测评", "現代測驗", "Modern assessments")}>
          <Link href={`/${locale}/tests/mbti-personality-test-16-personality-types`} prefetch={false}>{t("16 型人格测评", "16 型人格測驗", "16-type personality quiz")}</Link>
          <Link href={`/${locale}/tests/big-five-personality-test-ocean-model`} prefetch={false}>{t("大五人格测评", "大五人格測驗", "Big Five assessment")}</Link>
          <Link href={`/${locale}/tests/iq-test-intelligence-quotient-assessment`} prefetch={false}>{t("抽象与空间推理测评", "抽象與空間推理測驗", "Abstract and spatial reasoning test")}</Link>
        </nav>
      </section>

      <section className={styles.section} id="faq" aria-labelledby="history-faq-heading">
        <h2 id="history-faq-heading">{t("人物核查问答", "人物查證問答", "Questions about this figure")}</h2>
        <dl className={styles.details}>{faq.map(({ q, a }) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl>
      </section>

      <section className={styles.section} id="related-figures" aria-labelledby="related-heading">
        <h2 id="related-heading">{t("对照人物与图鉴", "對照人物與圖鑑", "Related figures and atlases")}</h2>
        <p><Link className={styles.textLink} href={`/${locale}/personality/${personality.inferred_mbti.toLowerCase()}`} prefetch={false}>
          {t(`阅读 ${personality.inferred_mbti} 人格百科`, `閱讀 ${personality.inferred_mbti} 人格百科`, `Read the ${personality.inferred_mbti} personality guide`)}
        </Link></p>
        <GlobalHistoryAtlasLinks locale={locale} />
        {groupRows.filter(group => group.people.length > 0).map(group => <div className={styles.peerGroup} data-peer-group={group.key} key={group.key}>
          <h3>{group.label}</h3>
          <ul className={styles.peers}>{group.people.map(source => {
            const item = displayHistoryPerson(source, locale);
            const estimate = group.key === "benchmark" && benchmark.has_cox_data ? getCoxEstimate(item.id) : undefined;
            return <li key={item.id}><Link href={globalHistoryResultPath(locale, item.id)} prefetch={false}>
              <Image src={globalHistoryPortraitPath(item.id)} alt="" width={72} height={72} unoptimized />
              <span><strong>{item.name[lang]}</strong><small>{item.field[lang]}{estimate && ` · Cox ${estimate.youth_corrected}`}</small></span>
            </Link></li>;
          })}</ul>
        </div>)}
        <GlobalHistoryDirectory labels={{
          summary: t(`浏览全部 ${directory.length} 位历史人物`, `瀏覽全部 ${directory.length} 位歷史人物`, `Browse all ${directory.length} historical figures`),
          all: t("全部", "全部", "All"), region: t("大洲", "大洲", "Continent"), field: t("领域", "領域", "Field"),
          band: t("Cox 青年估值区间", "Cox 青年估值區間", "Cox youth estimate"), empty: t("这个组合下没有人物。", "這個組合下沒有符合的人物。", "No figures match these filters."),
        }}
          regions={Object.entries(continents).map(([id, label]) => ({ id, label: label[locale] }))}
          fields={[...new Map(directory.map(item => [item.field, item.fieldLabel]))].map(([id, label]) => ({ id, label }))}
          bands={[...bands.map(({ label }) => ({ id: label, label })), { id: "none", label: noEstimate }]}
          entries={directory} />
        <GlobalHistoryResultFollowup id={person.id}>
          <ArchiveQuestionnaireNextStep slug={GLOBAL_HISTORY_SLUG} locale={locale} />
        </GlobalHistoryResultFollowup>
      </section>

      <section className={styles.section} id="references" aria-labelledby="references-heading">
        <h2 id="references-heading">{t("史料与参考文献", "史料與參考文獻", "Sources and references")}</h2>
        <ol className={styles.sourceList}>
          {references.map(source => <li key={source.url}>
            <a href={source.url} data-archive-tier={"archiveTier" in source ? source.archiveTier : undefined}>{(alternativeTitles.get(source.url) ?? source.label)[locale]}</a>
            {"locator" in source && <> · {source.locator[locale]}</>}
          </li>)}
          {benchmark.has_cox_data && <li><a href={coxStudy}>{t("Cox（1926）研究原书", "Cox（1926）研究原書", "Catharine M. Cox (1926)")}</a> · <cite>{t("《三百位杰出人物的早年心智能力特征》", "《三百位傑出人物的早年心智能力特徵》", "The Early Mental Traits of Three Hundred Geniuses")}</cite> · {benchmark.estimate.table} / {benchmark.estimate.sheet_row}</li>}
          <li><a href={sameAs[0]}>{t("维基数据", "維基數據", "Wikidata")} · {person.qid}</a> · {t("实体标识", "實體識別碼", "Entity identifier")}</li>
        </ol>
        <GlobalHistoryCitation citations={citations} labels={{
          heading: t("引用本页", "引用本頁", "Cite this profile"), copy: t("复制", "複製", "Copy"),
          copied: t("已复制", "已複製", "Copied"),
          manual: t("请复制已选中的引用文字。", "請複製已選取的引用文字。", "Copy the selected citation text."),
        }} />
      </section>

      <section className={styles.section} id="audit-log" aria-labelledby="audit-log-heading">
        <h2 id="audit-log-heading">{t("档案版本与修订", "檔案版本與修訂", "Record version and revisions")}</h2>
        <p className={styles.prose}>
          {t("参考档案第三版 · 模板修订", "參考檔案第三版 · 版型修訂", "Reference profile, revision 3 · template revised")}{" "}
          <time dateTime={historyReferenceRevision}>{historyReferenceRevision}</time>
        </p>
        <p className={styles.note}>{t(
          "本轮核查覆盖页面结构、字段和证据编号。史料定位以各条参考文献所列为准。",
          "本輪查核涵蓋頁面結構、欄位和證據編號。史料定位以各項參考文獻所列為準。",
          "This revision checks the structure, fields and evidence links. Consult the cited locators for the source material.",
        )}</p>
        <Link className={styles.textLink} href={`/${locale}/support`} prefetch={false}>{t("反馈档案勘误", "回報檔案勘誤", "Report a correction")}</Link>
      </section>
    </Container>
  </main>;
}
