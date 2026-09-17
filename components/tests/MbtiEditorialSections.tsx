import type { EditorialLink, LandingFaq, MbtiEditorial } from "@/lib/tests/mbtiLandingEditorial";
import styles from "./mbti-preview.module.css";

function LinkGroup({ label, links, locale }: { label: string; links?: EditorialLink[]; locale: "zh" | "en" }) {
  return links?.length ? <div className={styles.faqSources}>{label}{locale === "zh" ? "：" : ": "}{links.map((link, index) => <span key={link.href}>
    {index > 0 ? (locale === "zh" ? "；" : "; ") : ""}<a href={link.href}>{link.label}</a>
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

function EditorialItems({ content, items }: { content: MbtiEditorial; items: MbtiEditorial["items"] }) {
  return <div>{items.map((item) => <article id={item.id} key={item.id}>
    <h3>{item.title}</h3>
    <div>{item.body.split(/\n\s*\n/u).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    {item.id === "versions" && content.comparison ? <div id="version-comparison" className={styles.comparison}>
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

export function MbtiWhyChoose({ content, itemOrder = [], methodItemIds = [], locale = "en" }: {
  content: MbtiEditorial;
  itemOrder?: string[];
  methodItemIds?: string[];
  locale?: "zh" | "en";
}) {
  const orderedItems = orderItems(content, itemOrder);
  const methodIds = new Set(methodItemIds);
  const overviewItems = orderedItems.filter((item) => !methodIds.has(item.id));
  const methodItems = orderedItems.filter((item) => methodIds.has(item.id));

  return <section id="why-choose" className={styles.whyChoose} aria-labelledby="why-choose-title">
    <h2 id="why-choose-title">{content.title}</h2>
    <p className={styles.whyIntro}>{content.intro}</p>
    <EditorialItems content={content} items={overviewItems} />
    {methodItems.length > 0 ? <section id="method-and-evidence" className={styles.methodSection} aria-labelledby="method-and-evidence-title">
      <h2 id="method-and-evidence-title">{locale === "zh" ? "方法与证据" : "Methods and limits"}</h2>
      <EditorialItems content={content} items={methodItems} />
    </section> : null}
  </section>;
}

export function MbtiFaqAnswers({ items, locale }: { items: LandingFaq[]; locale: "zh" | "en" }) {
  return <>{items.map((item, index) => <article id={item.id} key={item.id ?? index} className={styles.faqItem}>
    <h3>{item.q}</h3>
    {item.a.split(/\n\s*\n/u).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    <LinkGroup locale={locale} label={locale === "zh" ? "参考资料" : "References"} links={item.references} />
    <LinkGroup locale={locale} label={locale === "zh" ? "产品说明／延伸阅读" : "Product information / further reading"} links={item.related_links} />
  </article>)}</>;
}
