import type { EditorialLink, LandingFaq, MbtiEditorial } from "@/lib/tests/mbtiLandingEditorial";
import styles from "./mbti-preview.module.css";

function LinkGroup({ label, links }: { label: string; links?: EditorialLink[] }) {
  return links?.length ? <div className={styles.faqSources}>{label}：{links.map((link, index) => <span key={link.href}>
    {index > 0 ? "；" : ""}<a href={link.href}>{link.label}</a>
  </span>)}</div> : null;
}

export function MbtiWhyChoose({ content }: { content: MbtiEditorial }) {
  return <section id="why-choose" className={styles.whyChoose} aria-labelledby="why-choose-title">
    <h2 id="why-choose-title">{content.title}</h2>
    <p className={styles.whyIntro}>{content.intro}</p>
    <div>{content.items.map((item) => <article key={item.id}>
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
      {item.link ? <a href={item.link.href}>{item.link.label}<span aria-hidden> →</span></a> : null}
    </article>)}</div>
  </section>;
}

export function MbtiFaqAnswers({ items, locale }: { items: LandingFaq[]; locale: "zh" | "en" }) {
  return <>{items.map((item, index) => <article id={item.id} key={item.id ?? index} className={styles.faqItem}>
    <h3>{item.q}</h3>
    {item.a.split(/\n\s*\n/u).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    <LinkGroup label={locale === "zh" ? "参考资料" : "References"} links={item.references} />
    <LinkGroup label={locale === "zh" ? "产品说明／延伸阅读" : "Product information / further reading"} links={item.related_links} />
  </article>)}</>;
}
