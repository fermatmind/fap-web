import type { EditorialLink, LandingFaq, MbtiEditorial } from "@/lib/tests/mbtiLandingEditorial";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "./mbti-preview.module.css";

function LinkGroup({ label, links, locale }: { label: string; links?: EditorialLink[]; locale: DisplayLocale }) {
  return links?.length ? <div className={styles.faqSources}>{label}{locale !== "en" ? "：" : ": "}{links.map((link, index) => <span key={link.href}>
    {index > 0 ? (locale !== "en" ? "；" : "; ") : ""}<a href={link.href}>{link.label}</a>
  </span>)}</div> : null;
}

function orderItems(content: MbtiEditorial, itemOrder: string[]) {
  const rank = new Map(itemOrder.map((id, index) => [id, index]));

  return content.items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((left, right) => {
      const leftRank = rank.get(left.item.id);
      const rightRank = rank.get(right.item.id);
      if (leftRank === undefined && rightRank === undefined) return left.originalIndex - right.originalIndex;
      if (leftRank === undefined) return 1;
      if (rightRank === undefined) return -1;
      return leftRank - rightRank;
    })
    .map(({ item }) => item);
}

function EditorialItems({ content, items, richBody, locale, destination }: { content: MbtiEditorial; items: MbtiEditorial["items"]; richBody: boolean; locale: DisplayLocale; destination?: (href: string) => string }) {
  return <div>{items.map((item) => <article id={item.id} key={item.id}>
    <h3>{item.title}</h3>
    <div>{richBody ? renderSimpleMarkdown(item.body, { allowImages: false, scrollableTables: true, minimumHeadingLevel: 4, locale: locale === "zh-TW" ? "zh" : locale, linkDestination: destination }) : item.body.split(/\n\s*\n/u).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    {item.id === "versions" && content.comparison ? <div id="version-comparison" className={styles.comparison}>
      <p className="md:hidden">{locale === "zh-TW" ? "左右滑動表格，比較兩個版本。" : locale === "zh" ? "左右滑动表格，比较两个版本。" : "Scroll sideways to compare both versions."}</p>
      <div className={styles.tableScroll} role="region" aria-label={content.comparison.caption} tabIndex={0}>
        <table>
          <caption>{content.comparison.caption}</caption>
          <thead><tr>{content.comparison.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
          <tbody>{content.comparison.rows.map(([label, short, full]) => <tr key={label}><th scope="row">{label}</th><td>{short}</td><td>{full}</td></tr>)}</tbody>
        </table>
      </div>
      <p>{content.comparison.note}</p>
    </div> : null}
    {item.link && !item.link.href.endsWith("#use-in-life") ? <a href={item.link.href}>{item.link.label}<span aria-hidden> →</span></a> : null}
  </article>)}</div>;
}

export function MbtiWhyChoose({ content, itemOrder = [], methodItemIds = [], locale = "en", richBody = false, destination }: {
  content: MbtiEditorial;
  itemOrder?: string[];
  methodItemIds?: string[];
  locale?: DisplayLocale;
  richBody?: boolean;
  destination?: (href: string) => string;
}) {
  const orderedItems = orderItems(content, itemOrder);
  const methodIds = new Set(methodItemIds);
  const overviewItems = orderedItems.filter((item) => !methodIds.has(item.id));
  const methodItems = orderedItems.filter((item) => methodIds.has(item.id));

  return <section id="why-choose" className={styles.whyChoose} aria-labelledby="why-choose-title">
    <h2 id="why-choose-title">{content.title}</h2>
    <p className={styles.whyIntro}>{content.intro}</p>
    <EditorialItems content={content} items={overviewItems} richBody={richBody} locale={locale} destination={destination} />
    {methodItems.length > 0 ? <section id="method-and-evidence" className={styles.methodSection} aria-labelledby="method-and-evidence-title">
      <h2 id="method-and-evidence-title">{locale === "zh-TW" ? "方法與證據" : locale === "zh" ? "方法与证据" : "Methods and limits"}</h2>
      <EditorialItems content={content} items={methodItems} richBody={richBody} locale={locale} destination={destination} />
    </section> : null}
  </section>;
}

export function MbtiFaqAnswers({ items, locale, richBody = false, destination }: { items: LandingFaq[]; locale: DisplayLocale; richBody?: boolean; destination?: (href: string) => string }) {
  return <>{items.map((item, index) => <article id={item.id} key={item.id ?? index} className={styles.faqItem}>
    <h3>{item.q}</h3>
    {richBody ? renderSimpleMarkdown(item.a, { allowImages: false, scrollableTables: true, minimumHeadingLevel: 4, locale: locale === "zh-TW" ? "zh" : locale, linkDestination: destination }) : item.a.split(/\n\s*\n/u).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    <LinkGroup locale={locale} label={locale === "zh-TW" ? "參考資料" : locale === "zh" ? "参考资料" : "References"} links={item.references} />
    <LinkGroup locale={locale} label={locale === "zh-TW" ? "產品說明／延伸閱讀" : locale === "zh" ? "产品说明／延伸阅读" : "Product information / further reading"} links={item.related_links} />
  </article>)}</>;
}
