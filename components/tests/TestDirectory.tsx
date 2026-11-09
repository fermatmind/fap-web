"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, ListChecks, Search, X } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import { DiscoveryCardArt, discoveryCardEditorial } from "./DiscoveryCardArt";
import { DirectoryCover } from "./DirectoryCover";
import { AssessmentStructureArt } from "./AssessmentStructureArt";
import "./tests-catalog.css";

type Item = {
  slug: string;
  category: string;
  title: string;
  description: string;
  href: string;
  hrefLang?: string;
  meta: string;
  kind?: "test" | "tool";
};
const CORE_IDENTITIES = [
  {
    code: "MBTI",
    label: {
      zh: "心理类型与四组偏好", "zh-TW": "心理類型與四組偏好",
      en: "Psychological type and four preference pairs",
    },
    description: {
      zh: "依据荣格心理类型及迈尔斯—布里格斯偏好框架，从注意指向、信息获取、判断依据与外部生活取向四个方面描述个体差异。结合四组偏好与16型结果，理解自己的信息加工和决策方式。", "zh-TW": "依據榮格心理類型及邁爾斯—布里格斯偏好框架，從注意指向、資訊獲取、判斷依據與外部生活取向四個方面描述個體差異。結合四組偏好與16型結果，理解自己的資訊加工和決策方式。",
      en: "Drawing on Jungian psychological type and the Myers–Briggs preference framework, explore differences in attention, information gathering, decision-making and orientation to the outer world through four preference pairs and 16-type results.",
    },
    purpose: { zh: "了解性格", "zh-TW": "了解性格", en: "Personality" },
    className: "mbti",
  },
  {
    code: "OCEAN",
    label: {
      zh: "五因素人格特质模型", "zh-TW": "五因素人格特質模型",
      en: "Five-factor personality traits",
    },
    description: {
      zh: "采用大五人格五因素框架，以开放性、尽责性、外向性、宜人性与神经质五个连续维度描述人格特质。通过本站改写题本的自评结果，理解探索新经验、组织行动、社会交往与情绪反应中的倾向。", "zh-TW": "採用大五人格五因素框架，以開放性、盡責性、外向性、親和性與神經質五個連續維度描述人格特質。透過本站改寫題本的自評結果，理解探索新經驗、組織行動、社會交往與情緒反應中的傾向。",
      en: "Explore openness, conscientiousness, extraversion, agreeableness and neuroticism as continuous traits. Self-report results from FermatMind’s adapted forms describe tendencies in exploring experiences, organizing action, social interaction and emotional responses.",
    },
    purpose: { zh: "了解性格", "zh-TW": "了解性格", en: "Personality" },
    className: "ocean",
    titleZh: "大五人格测试（OCEAN）",
  },
  {
    code: "RIASEC",
    label: {
      zh: "职业兴趣与环境探索", "zh-TW": "職涯興趣與環境探索",
      en: "Vocational interests and environments",
    },
    description: {
      zh: "基于霍兰德职业兴趣理论，描述现实型、研究型、艺术型、社会型、企业型与常规型六类兴趣。以六维兴趣分布与三字代码概括兴趣组合，为比较工作活动、专业学习与职业环境提供参考。", "zh-TW": "基於霍蘭德職涯興趣理論，描述現實型、研究型、藝術型、社會型、企業型與常規型六類興趣。以六維興趣分佈與三字母代碼概括興趣組合，為比較工作活動、專業學習與職涯環境提供參考。",
      en: "Based on Holland’s vocational interest theory, explore Realistic, Investigative, Artistic, Social, Enterprising and Conventional interests. Use the six-dimension profile and three-letter code to compare work activities, fields of study and occupational environments.",
    },
    purpose: { zh: "探索职业", "zh-TW": "探索職涯", en: "Career interests" },
    className: "riasec",
  },
  {
    code: "1—9",
    label: {
      zh: "动机取向与人际模式", "zh-TW": "動機取向與人際模式",
      en: "Motivational perspectives and interpersonal patterns",
    },
    description: {
      zh: "以九型人格的动机解释框架为基础，围绕核心关注、情境反应与人际互动组织自我描述。通过九型分布与候选类型解读，对照具体经历，探索反复出现的行为及其可能的动机。", "zh-TW": "以九型人格的動機解釋框架為基礎，圍繞核心關注、情境反應與人際互動組織自我描述。通過九型分佈與候選類型解讀，對照具體經歷，探索反覆出現的行為及其可能的動機。",
      en: "Use the Enneagram’s motivational framework to reflect on recurring concerns, situational responses and interpersonal patterns. Compare the nine-type distribution and candidate interpretations with concrete experiences to explore possible motives behind recurring behavior.",
    },
    purpose: { zh: "了解性格", "zh-TW": "了解性格", en: "Personality" },
    className: "enneagram",
    titleZh: "九型人格测试（Enneagram）",
  },
  {
    code: "IQ",
    label: {
      zh: "非言语图形与矩阵推理", "zh-TW": "非言語圖形與矩陣推理",
      en: "Nonverbal visual and matrix reasoning",
    },
    description: {
      zh: "采用30道原创图形与矩阵推理题，考察本题组中的视觉关系辨识、规则发现与推理表现。结果提供答对题数、正确率及题组表现，帮助回顾解题过程；当前不换算标准智商或人口百分位。", "zh-TW": "採用30道原創圖形與矩陣推理題，考察本題組中的視覺關係辨識、規則發現與推理表現。結果提供答對題數、正確率及題組表現，幫助回顧解題過程；目前不換算標準智商或人口百分位。",
      en: "Work through 30 original visual and matrix-reasoning items involving relationships and rules. Review correct-answer count, accuracy and item-group performance; the current exercise does not convert these results into standardized IQ scores or population percentiles.",
    },
    purpose: { zh: "练习推理", "zh-TW": "練習推理", en: "Reasoning practice" },
    className: "iq",
    titleZh: "IQ 智商测试",
  },
  {
    code: "EQ",
    label: {
      zh: "情绪与关系的四维自评", "zh-TW": "情緒與關係的四維自評",
      en: "Four-dimensional emotion and relationship self-report",
    },
    description: {
      zh: "采用60题自评，从自我觉察、情绪调节、共情理解与关系管理四个维度，描述个体对自身情绪和互动习惯的认识。结合具体事件与他人反馈阅读各维结果，为情绪反思和沟通实践提供线索。", "zh-TW": "採用60題自評，從自我覺察、情緒調節、同理理解與關係管理四個維度，描述個體對自身情緒和互動習慣的認識。結合具體事件與他人反饋閱讀各維結果，為情緒反思和溝通實踐提供線索。",
      en: "Use 60 self-report items to describe your perceptions of emotional awareness, regulation, empathy and relationship management. Read the four dimensions alongside real events and feedback to identify ideas for emotional reflection and communication practice.",
    },
    purpose: { zh: "理解情绪", "zh-TW": "理解情緒", en: "Emotions" },
    className: "eq",
    titleZh: "EQ 情商测试",
  },
];
function normalizeSearch(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\p{White_Space}\p{Punctuation}]/gu, "");
}

function coreIdentity(item: HubTestCardItem) {
  const raw = `${item.key} ${item.href} ${item.detailsHref}`;
  const index = raw.includes("mbti")
    ? 0
    : raw.includes("big-five")
      ? 1
      : /holland|riasec/.test(raw)
        ? 2
        : raw.includes("enneagram")
          ? 3
          : raw.includes("iq-test")
            ? 4
            : 5;
  return CORE_IDENTITIES[index];
}

export function TestDirectory({
  items,
  categories,
  locale,
  coreTests = [],
  heroTitle,
}: {
  items: Item[];
  categories: Record<string, { en: string; zh: string; "zh-TW"?: string }>;
  locale: DisplayLocale;
  coreTests?: HubTestCardItem[];
  heroTitle?: string;
}) {
  const zh = locale === "zh";
  const taiwan = locale === "zh-TW";
  const Heading = heroTitle ? "h1" : "h2";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const deferred = useDeferredValue(normalizeSearch(query));
  const groups = Object.entries(categories).filter(([key]) =>
    items.some((item) => item.category === key),
  );
  const filteredCore = coreTests.filter(
    (item) =>
      (!category || category === "core") &&
      normalizeSearch(
        `${item.title} ${item.description} ${item.key} ${item.href} ${coreIdentity(item).purpose[locale]} ${coreIdentity(item).code} ${coreIdentity(item).label[locale]} ${coreIdentity(item).description[locale]}`,
      ).includes(deferred),
  );
  const filtered = items.filter(
    (item) =>
      (!category || item.category === category) &&
      normalizeSearch(
        `${item.title} ${item.description} ${item.slug} ${discoveryCardEditorial(item.slug)?.subtitle[taiwan ? "zh" : locale] ?? ""}`,
      ).includes(deferred),
  );
  const total = filtered.length + filteredCore.length;
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.matches("input,textarea,select") ||
            event.target.isContentEditable)
        )
      ) {
        event.preventDefault();
        search.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === search.current)
        setQuery("");
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  function selectCategory(value: string) {
    setCategory((current) => (current === value ? "" : value));
  }
  return (
    <section className="catalog-workspace" aria-labelledby="tests-hub-title">
      <div className="catalog-container">
        <header className="catalog-intro">
          <div className="catalog-title-row">
            <div>
              <Heading id="tests-hub-title">
                {heroTitle ??
                  (taiwan ? "找到適合你的測驗。" : zh ? "找到适合你的测试。" : "Find your next discovery.")}
              </Heading>
              <div className="catalog-free">
                {(taiwan ? ["免費作答", "完整解讀", "無需註冊"] : zh
                  ? ["免费作答", "完整解读", "无需注册"]
                  : ["Free to take", "Full interpretations", "No signup"]
                ).map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </header>
        <div className="catalog-category-bar">
          <nav aria-label={taiwan ? "娛樂測驗分類" : zh ? "娱乐测试分类" : "Fun quiz categories"}>
            {coreTests.length > 0 && (
              <button
                aria-pressed={category === "core"}
                onClick={() => selectCategory("core")}
              >
                <span>{taiwan ? "主要測評" : zh ? "主要测评" : "Core assessments"}</span>
                <small>{coreTests.length}</small>
              </button>
            )}
            {groups.map(([key, label]) => (
              <button
                key={key}
                aria-pressed={category === key}
                onClick={() => selectCategory(key)}
              >
                <span>{label[locale] ?? label.zh}</span>
                <small>
                  {items.filter((item) => item.category === key).length}
                </small>
              </button>
            ))}
          </nav>
          <label className="catalog-search">
            <Search size={21} aria-hidden="true" />
            <span className="sr-only">{taiwan ? "搜尋測驗" : zh ? "搜索测试" : "Search tests"}</span>
            <input
              ref={search}
              aria-label={taiwan ? "搜尋測驗" : zh ? "搜索测试" : "Search tests"}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value.trim()) setCategory("");
              }}
              placeholder={
                taiwan ? "搜尋 MBTI、職涯興趣、依戀、打字…" : zh
                  ? "搜索 MBTI、职业兴趣、依恋、打字…"
                  : "Search MBTI, careers, attachment, typing…"
              }
            />
            {query ? (
              <button
                aria-label={taiwan ? "清除搜尋" : zh ? "清空搜索" : "Clear search"}
                onClick={() => setQuery("")}
              >
                <X size={18} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </label>
        </div>
        <div className="catalog-layout">
          <div className="catalog-results">
            <p className="sr-only" role="status">
              {taiwan ? `找到 ${total} 項測驗` : zh ? `找到 ${total} 项测试` : `${total} matching tests`}
            </p>
            {filteredCore.length > 0 && (
              <section
                className="catalog-core"
                id="core-tests"
                aria-labelledby="catalog-core-title"
              >
                <header>
                  <div>
                    <h2 id="catalog-core-title">
                      {taiwan ? "國際經典測評，科學認識自己" : zh
                        ? "国际经典测评，科学认识自己"
                        : "Established frameworks. A clearer view of you."}
                    </h2>
                    <p>
                      {taiwan ? "全球廣泛應用的經典測評體系，全方位解讀性格特質、職涯興趣、思維方式與情緒模式。" : zh
                        ? "全球广泛应用的经典测评体系，全方位解读性格特质、职业兴趣、思维方式与情绪模式。"
                        : "Internationally used assessment frameworks for a multidimensional understanding of personality traits, career interests, thinking styles and emotional patterns."}
                    </p>
                  </div>
                </header>
                <div className="catalog-core-grid">
                  {filteredCore.map((item) => {
                    const identity = coreIdentity(item);
                    return (
                      <article
                        key={item.key}
                        className={`catalog-core-card catalog-core-${identity.className}`}
                      >
                        <div className="catalog-core-heading">
                          <h3>
                            {zh ? (identity.titleZh ?? item.title) : item.title}
                          </h3>
                          <span className="catalog-core-model">
                            {identity.label[locale]}
                          </span>
                        </div>
                        <AssessmentStructureArt
                          kind={identity.className}
                          locale={locale}
                        />
                        <p className="catalog-core-description">
                          {identity.description[locale]}
                        </p>
                        <div className="catalog-core-meta">
                          <span>
                            <ListChecks size={14} aria-hidden="true" />
                            {item.questionsLabel}
                          </span>
                          <span>
                            <Clock3 size={14} aria-hidden="true" />
                            {item.durationLabel}
                          </span>
                        </div>
                        <Link
                          className="catalog-core-start"
                          prefetch={false}
                          href={item.detailsHref ?? item.href}
                          hrefLang={taiwan ? "zh-CN" : undefined}
                          aria-label={
                            taiwan ? item.primaryLabel + "（簡體中文）" : zh ? item.primaryLabel : "Start the free test"
                          }
                        >
                          <span>{taiwan ? "開始測驗（簡體中文）" : zh ? "开始测试" : "Start test"}</span>
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <CmsMediaAuthorityShell
                          media={item.media ?? null}
                          locale={taiwan ? "zh" : locale}
                          surface="tests_hub_card"
                          visible={item.key === IQ_PUBLIC_SLUG}
                        />
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
            <section
              id="more-tests"
              className="catalog-more"
              hidden={category === "core" && filteredCore.length > 0}
              aria-labelledby="more-tests-title"
            >
              <header className="catalog-more-heading">
                <div>
                  <h2 id="more-tests-title">
                    {taiwan ? "多元主題測驗與自我探索" : zh
                      ? "多元主题测验与自我探索"
                      : "Themed tests and self-exploration"}
                  </h2>
                  <p>
                    {taiwan ? "覆蓋人格行為、日常偏好、人際關係與幻想故事，包含娛樂測驗、知識練習和實用工具。" : zh
                      ? "覆盖人格行为、日常偏好、人际关系与幻想故事，包含娱乐测试、知识练习和实用工具。"
                      : "Explore personality, everyday preferences, relationships and fictional worlds through fun quizzes, knowledge exercises and practical tools."}
                  </p>
                </div>
              </header>
              {total === 0 && (
                <div className="catalog-empty">
                  <Search size={26} aria-hidden="true" />
                  <h3>{taiwan ? "沒有找到匹配的測驗" : zh ? "没有找到匹配的测试" : "No matching tests"}</h3>
                  <p>
                    {taiwan ? "試試其他關鍵詞，或清除篩選條件。" : zh
                      ? "试试其他关键词，或清除筛选条件。"
                      : "Try another keyword, or clear your filters."}
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("");
                    }}
                  >
                    {taiwan ? "查看全部" : zh ? "查看全部" : "Show all"}
                  </button>
                </div>
              )}
              {groups.map(([key, label]) => {
                const entries = filtered.filter(
                  (item) => item.category === key,
                );
                return entries.length ? (
                  <section
                    key={key}
                    id={`fun-${key}`}
                    className="catalog-group"
                    aria-labelledby={`fun-heading-${key}`}
                  >
                    <div className="catalog-group-heading">
                      <h3 id={`fun-heading-${key}`}>{label[locale] ?? label.zh}</h3>
                      <span>{entries.length}</span>
                    </div>
                    <div className="catalog-item-grid">
                      {entries.map((item) => (
                        <article
                          key={item.slug}
                          className={`catalog-item catalog-item-${key}`}
                        >
                          <DirectoryCover slug={item.slug}>
                            <DiscoveryCardArt slug={item.slug} category={key} />
                          </DirectoryCover>
                          <div className="catalog-item-body">
                            <h4>
                              <a href={item.href} hrefLang={item.hrefLang}>{item.title}</a>
                            </h4>
                            <p>{item.description}</p>

                            <span className="catalog-item-meta">
                              {item.meta}
                            </span>
                            <a
                              className="catalog-item-start"
                              href={item.href}
                              hrefLang={item.hrefLang}
                              aria-label={`${taiwan ? (item.kind === "tool" ? "開啟工具" : "開始測驗") : zh ? (item.kind === "tool" ? "打开工具" : "开始测试") : item.kind === "tool" ? "Open tool" : "Start test"} · ${item.title}`}
                            >
                              <span>
                                {taiwan ? item.kind === "tool"
                                    ? "開啟工具"
                                    : "開始測驗" : zh
                                  ? item.kind === "tool"
                                    ? "打开工具"
                                    : "开始测试"
                                  : item.kind === "tool"
                                    ? "Open tool"
                                    : "Start test"}
                                {taiwan && item.hrefLang === "zh-CN" ? "（簡體中文）" : ""}
                              </span>
                              <ArrowRight size={16} aria-hidden="true" />
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null;
              })}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
