import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { isConfiguredStagingSiteUrl } from "@/lib/site";
import type { DisplayLocale } from "@/lib/i18n/locales";
import editorial from "@/lib/questionnaires/gta-6-landing.json";
import {
  gta6Cover, gta6LandingPath, gta6Profiles, gta6Portrait, gta6ResultPath, gta6TakePath,
} from "@/lib/questionnaires/gta6CharacterQuiz";
import { Gta6CareerSections, gta6CareerFaq } from "./Gta6CareerSections";
import styles from "./Gta6Landing.module.css";

const copy = {
  en: {
    h1: "Which GTA 6 Character Are You?",
    title: "Which GTA 6 Character Are You? (12-Question Quiz & Co-Op) | FermatMind",
    description: "Make 12 choices at a fictional Vice City waterfront party. Match one of eight GTA VI character entries, then invite a friend to compare your crew roles. Free and spoiler-free.",
    tags: "12 questions · ~2 min · Free & no login · 2-player co-op",
    start: "Start quiz",
    examples: "Result and co-op examples",
    examplesLink: "See worked & co-op examples",
    guides: "Eight character guides",
    guideLink: "Browse all 8 character guides",
    solo: "Single-player example",
    soloText: "Lucia gets four votes and Jason gets three. Lucia appears as the primary match, with the choices that led there. Jason appears as a secondary play style.",
    pair: "Two-player co-op example",
    pairText: "Lucia gets the first workable move underway. Jason checks what the crew already promised and who needs help. Agree who updates the team before either of you moves on.",
    overview: "Eight ways to handle one night in Vice City",
    overviewText: "A waterfront party in Leonida goes from a cordoned-off venue to group-chat rumors and a speaker failure. The eight result entries come from Rockstar’s Only in Leonida profiles for Grand Theft Auto VI. Real Dimez covers Bae-Luxe and Roxy as one result. The scene, decisions and crew roles are original.",
    method: "How the 12 choices are counted",
    methodText: "Each choice adds one vote to one character, for 12 votes in total. Each character appears twice per act, six times overall. A tie goes to the character with more midnight choices, then to the character with the latest matched answer. A runner-up with votes and within one vote appears as a secondary style. Votes describe choices in this story and do not represent similarity percentages, MBTI types or abilities.",
    privacy: "The quiz scores answers in your browser. Progress is kept in this tab only if you opt in. The link you send a friend is a public character guide. Its quiz button passes the character ID to the new attempt, which has 28 distinct cross-role or eight same-role pairings.",
    faq: "GTA 6 Character Quiz FAQ",
    sources: "Sources and independence",
    sourcesText: "Rockstar’s character profiles and launch announcement are the sources for names and basic setting. FermatMind independently created the party, questions and crew roles. Character artwork is sourced from Rockstar Games. This quiz is unofficial and unaffiliated.",
  },
  zh: {
    h1: "GTA 6 角色测试｜你是罪恶都市里的谁？",
    title: "GTA 6 角色测试：你是罪恶都市里的谁？（免费免登录/双人组队）｜费马测试",
    description: "用 12 道《侠盗猎车手6》罪恶都市海岸派对情境题找出你的救场角色，再和朋友查看双人组队分工。免费免登录，无主线剧透。",
    tags: "12 题 · 约 2 分钟 · 免费免登录 · 双人组队",
    start: "开始测试",
    examples: "结果与双人组队示例",
    examplesLink: "先看结果与组队示例",
    guides: "八种角色指南",
    guideLink: "先看八种角色指南",
    solo: "单人主匹配",
    soloText: "Lucia 得到 4 票，Jason 得到 3 票。结果先展示 Lucia 和支持这个匹配的具体选择，并用 Jason 的分工作为次要行事风格。",
    pair: "双人组队分工",
    pairText: "Lucia 先把能执行的第一步推出去，Jason 顾好原先的承诺和需要支援的队友。两人可以先约定，现场再有变化时由谁通知全队。",
    overview: "罪恶都市一夜的八种救场方式",
    overviewText: "莱昂尼达州（Leonida）的一场海岸派对还没开场，就遇到场地封控、群聊传闻和音箱故障。八组结果参考 Rockstar Games 的《侠盗猎车手6》专题 Only in Leonida。Bae-Luxe 和 Roxy 共同组成 Real Dimez。派对和每个选择都由费马创作。",
    method: "12 道题怎么计算角色",
    methodText: "每题给选中的角色加 1 票，全卷共 12 票。每组角色每幕出现 2 次，全卷出现 6 次。总票相同先比较午夜一幕的命中次数，仍相同则较晚命中的角色优先。第二名有票且落后至多 1 票时显示为次要行事风格。票数描述本次情境选择，无法换算相似度、MBTI 或能力分。",
    privacy: "作答和计分留在浏览器。你可以选择把进度保存在当前标签页。分享只发送公开角色页，好友从那里点击开测时再携带公开角色代号。两人完答可组合出 28 种不同角色搭配或 8 种同角色对照。",
    faq: "GTA 6 角色测试常见问题",
    sources: "创作背景与官方信源",
    sourcesText: "角色姓名和基础设定核对 Rockstar Games 的人物介绍及发行公告。派对剧情、题目和分工由费马独立创作。人物图来自 Rockstar Games。本测验为非官方娱乐作品。",
  },
  "zh-TW": {
    h1: "GTA 6 角色測驗｜你是罪惡城市裡的誰？",
    title: "GTA 6 角色測驗：你是罪惡城市裡的誰？（免費免註冊/雙人組隊）｜費馬測試",
    description: "《俠盜獵車手6》的罪惡城市今晚有場派對。選完 12 道情境題，找到你的救場角色，再揪朋友看雙人組隊分工。免費免註冊，避開主線劇情。",
    tags: "12 題 · 約 2 分鐘 · 免費免註冊 · 雙人組隊",
    start: "開始測驗",
    examples: "角色配對與雙人組隊範例",
    examplesLink: "先看配對與組隊範例",
    guides: "八組角色指南",
    guideLink: "瀏覽八組角色",
    solo: "自己玩一輪",
    soloText: "假設露西婭拿到 4 票、傑森拿到 3 票。你會先看到露西婭的結果，以及哪些選擇讓你配對到她。傑森會出現在次要行事風格。",
    pair: "揪朋友一起玩",
    pairText: "露西婭先跑一趟現場，做出能馬上執行的安排；傑森聯絡原班人馬，確認誰還需要支援。局面有變時，可以先講好由誰統一通知大家。",
    overview: "一場海岸派對，有八種救場做法",
    overviewText: "故事從雷歐奈達州（Leonida）的罪惡城市開始。演出還沒開場，碼頭先少了一半，群組又傳出取消消息。測驗的八組結果取自 Rockstar Games 的 Only in Leonida 人物專頁。Bae-Luxe 和 Roxy 是說唱搭檔，合在 Real Dimez 這組。這晚的派對和考題是費馬另外創作的情境。",
    method: "從十二次選擇算出你的角色",
    methodText: "選哪個做法，就給對應角色一票。每組角色每幕有兩次出現機會，三幕各四題，整份共十二票。票數打平先比午夜那一幕；還是相同，就看哪個角色較晚被選到。第二名有得票，且跟第一名差距最多一票時，也會顯示。這些票只描述測驗裡的做法。",
    privacy: "你的選項由瀏覽器計分。勾選儲存後，這個分頁才會保留進度。你傳給朋友的是公開指南，朋友從指南點進去才會帶入邀請。做完可以看 28 種跨角色分工或 8 種同角色對照。",
    faq: "GTA 6 角色測驗常見問題",
    sources: "角色出處與創作說明",
    sourcesText: "人物姓名和基本資料比對 Rockstar Games 的角色專頁與發售公告。派對、題目與分工是費馬自主創作，人物圖取自 Rockstar Games。費馬與遊戲發行方並無隸屬關係。",
  },
};

export function gta6Alternates(path: (locale: DisplayLocale) => string) {
  return { en: path("en"), "zh-Hans": path("zh"), "zh-TW": path("zh-TW"), "x-default": path("en") };
}

export function gta6PublishedRobots(hasQuery: boolean): Metadata["robots"] {
  if (process.env.NODE_ENV !== "production" || isConfiguredStagingSiteUrl()) return { index: false, follow: false };
  return { index: !hasQuery, follow: true };
}

export function gta6LandingMetadata(locale: DisplayLocale, hasQuery: boolean): Metadata {
  const page = copy[locale];
  const path = gta6LandingPath(locale);
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: path, languages: gta6Alternates(gta6LandingPath) },
    robots: gta6PublishedRobots(hasQuery),
    openGraph: { title: page.h1, description: page.description, url: path, images: [gta6Cover] },
  };
}

export function Gta6Landing({ locale }: { locale: DisplayLocale }) {
  const text = copy[locale];
  const { guide } = editorial[locale];
  const faq = [...editorial[locale].faq, gta6CareerFaq[locale]];
  const examples = [
    { names: "Lucia + Jason", roles: ["lucia-caminos", "jason-duval"], body: text.pairText },
    { names: "Boobie + Dre’Quan", roles: ["boobie-ike", "drequan-priest"], body: { en: "Boobie negotiates the budget and backup gear. Dre’Quan picks the part of the set worth protecting. Agree what can be cut before asking for more money.", zh: "Boobie 谈预算与备用设备，Dre’Quan 保住演出的关键段落。加预算前先说好哪部分能缩减。", "zh-TW": "布比談費用和備用器材，德雷・泉決定哪段節目一定要留。要追加預算前，先講好哪些地方可以縮。"}[locale] },
    { names: "Cal + Brian", roles: ["cal-hampton", "brian-heder"], body: { en: "Cal verifies the patrol rumor. Brian sets a backup entrance and names who can switch plans. Agree when to stop waiting for confirmation.", zh: "Cal 核实巡逻传闻，Brian 安排备用入场口并确定谁可以切换方案。两人先定消息最晚确认时间。", "zh-TW": "卡爾去問消息來源，布萊恩排好備用入口，交代由誰決定換方案。先約好幾點前要回覆。"}[locale] },
  ];
  return (
    <main className={styles.page}>
      <JsonLd id="gta6-faq" data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([name, answer]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
      <article className={`${styles.article} google-anno-skip`}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className="google-anno-skip">{text.h1}</h1>
            <p>{text.description}</p>
            <p className={styles.tags}>{text.tags}</p>
            <Link prefetch={false} href={gta6TakePath(locale)} className={styles.start}>{text.start} →</Link>
            <nav className={styles.anchors}>
              <a href="#examples">{text.examplesLink}</a>
              <a href="#characters">{text.guideLink}</a>
            </nav>
            <nav className={styles.anchors} aria-label="Language">
              {(["en", "zh", "zh-TW"] as const).map((lang) => {
                const label = ({ en: "English", zh: "简体中文", "zh-TW": "繁體中文" })[lang];
                return lang === locale
                  ? <span key={lang} lang={lang} aria-current="page">{label}</span>
                  : <Link key={lang} href={gta6LandingPath(lang)} lang={lang} prefetch={false}>{label}</Link>;
              })}
            </nav>
          </div>
        </header>
        <div className={styles.content}>
          <section id="examples">
            <h2>{text.examples}</h2>
            <figure className={styles.exampleResult}>
              <Image unoptimized src={gta6Portrait("lucia-caminos")} alt="" width={720} height={405} />
              <figcaption><h3>{text.solo}</h3><strong>Lucia Caminos · {gta6Profiles[0].title[locale]}</strong><p>{text.soloText}</p></figcaption>
            </figure>
            <h3>{text.pair}</h3>
            <div className={styles.pairs}>
              {examples.map(example => <div key={example.names}>
                <div className={styles.pairThumbs}>{example.roles.map(id => <Image key={id} unoptimized src={gta6Portrait(id)} alt="" width={44} height={44} />)}</div>
                <h3>{example.names}</h3><p>{example.body}</p>
              </div>)}
            </div>
          </section>
          <section>
            <h2>{text.overview}</h2>
            <p>{text.overviewText}</p>
            <ul className={styles.lenses}>{gta6Profiles.map((role) => <li key={role.id}><strong>{role.name}</strong> · {role.contribution[locale]}</li>)}</ul>
          </section>
          <section id="characters">
            <h2>{text.guides}</h2>
            <ul className={styles.guides}>
              {gta6Profiles.map((role, index) => (
                <li key={role.id}>
                  <Link prefetch={false} href={gta6ResultPath(locale, role.id)}>
                    <Image unoptimized src={gta6Portrait(role.id)} alt="" width={104} height={104} />
                    <div><h3>{role.name}</h3><strong>{role.title[locale]}</strong><p>{guide[index]}</p></div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <Gta6CareerSections locale={locale} />
          <section>
            <h2>{text.method}</h2><p>{text.methodText}</p><p>{text.privacy}</p>
          </section>
          <section className="faq-section google-anno-skip">
            <h2>{text.faq}</h2>
            {faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </section>
          <section>
            <h2>{text.sources}</h2><p>{text.sourcesText}</p>
            <ul><li><a href="https://www.rockstargames.com/VI/only-in-leonida">Rockstar Games · Only in Leonida</a></li><li><a href="https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available">Rockstar Games · Grand Theft Auto VI Now Available</a></li></ul>
          </section>
        </div>
      </article>
    </main>
  );
}
