import Link from "next/link";
import styles from "@/components/career/display/CareerContentV3Surface.module.css";
import {
  careerContentV3BlockCopy,
  careerContentV3CardCopy,
  careerContentV3ColumnCopy,
  careerContentV3ItemCopy,
  careerContentV3QuestionCopy,
  canRenderCareerContentV3Item,
  type CareerContentV3,
  type CareerContentV3Block,
  type CareerContentV3Item,
} from "@/lib/career/contentV3";

type Props = {
  content: CareerContentV3;
  ctaHref: string;
};

function itemLabel(index: number, locale: CareerContentV3["locale"]): string {
  return locale === "zh" ? `信息 ${index + 1}` : `Detail ${index + 1}`;
}

function Item({ item, content }: { item: CareerContentV3Item; content: CareerContentV3 }) {
  const locale = content.locale;
  if (item.type === "prose" || item.type === "notice") {
    return <div className={styles.prose}>{(item.data.paragraphs as string[]).map((paragraph, index) => <p key={`${item.id}-${index}`}>{paragraph}</p>)}</div>;
  }
  if (item.type === "list") {
    return <ul className={styles.list}>{(item.data.entries as string[]).map((entry, index) => <li key={`${item.id}-${index}`}>{entry}</li>)}</ul>;
  }
  if (item.type === "cards" || item.type === "timeline") {
    return <div className={styles.cards}>{(item.data.entries as Array<{ id: string; values: string[] }>).map((entry, entryIndex) => (
      <article className={styles.card} key={entry.id}><h4>{careerContentV3CardCopy(item.copyKey, entry.id, entryIndex, locale)}</h4>{entry.values.map((value, index) => <p key={`${entry.id}-${index}`}>{value}</p>)}</article>
    ))}</div>;
  }
  if (item.type === "faq") {
    return <div className={styles.faq}>{(item.data.entries as Array<{ id: string; question_key: string; answer: string }>).map((entry) => (
      <details key={entry.id}><summary>{careerContentV3QuestionCopy(entry.question_key, locale, content.subject.name)}</summary><p>{entry.answer}</p></details>
    ))}</div>;
  }
  if (item.type === "links") {
    return <div className={styles.links}>{(item.data.entries as Array<{ id: string; entity: string; url: string }>).map((entry) => (
      entry.url.startsWith("/") ? <Link key={entry.id} href={entry.url}>{entry.entity} <span aria-hidden="true">→</span></Link> :
        <a key={entry.id} href={entry.url} target={entry.url.startsWith("https://") ? "_blank" : undefined} rel={entry.url.startsWith("https://") ? "noreferrer" : undefined}>{entry.entity} <span aria-hidden="true">↗</span></a>
    ))}</div>;
  }
  if (item.type === "sources") {
    return <div className={styles.links}>{(item.data.entries as Array<{ id: string; name: string; url: string | null }>).map((entry) => (
      entry.url ? <a key={entry.id} href={entry.url} target="_blank" rel="noreferrer">{entry.name} <span aria-hidden="true">↗</span></a> : <span key={entry.id}>{entry.name}</span>
    ))}</div>;
  }
  if (item.type === "metrics") {
    return <div className={styles.cards}>{(item.data.entries as Array<{ key: string; value: string }>).map((entry, index) => (
      <article className={styles.card} key={`${entry.key}-${index}`}><p><strong>{itemLabel(index, locale)}</strong></p><p>{entry.value}</p></article>
    ))}</div>;
  }
  const columns = item.data.column_keys as string[];
  const rows = item.data.rows as string[][];
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr>{columns.map((column) => <th key={column} scope="col">{careerContentV3ColumnCopy(column, locale)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Placeholder({ locale }: { locale: CareerContentV3["locale"] }) {
  const copy = careerContentV3BlockCopy("career.block.unavailable", locale)!;
  return <section className={styles.placeholder} data-nosnippet="true" aria-live="polite"><h2>{copy.title}</h2><p>{locale === "zh" ? "该内容暂时无法安全显示，页面其余部分仍可使用。" : "This content cannot be displayed safely right now. The rest of the page remains available."}</p></section>;
}

function renderableBlock(block: CareerContentV3Block, content: CareerContentV3): boolean {
  const availableItems = block.items.filter((item) => item.availability === "available");
  return block.renderable && block.availability === "available" && availableItems.length > 0 &&
    availableItems.every((item) => canRenderCareerContentV3Item(item, content.locale, content.subject.name));
}

function ItemGroups({ block, content }: { block: CareerContentV3Block; content: CareerContentV3 }) {
  const groups: Array<{ copyKey: string; items: CareerContentV3Item[] }> = [];
  for (const item of block.items.filter((candidate) => candidate.availability === "available")) {
    const previous = groups.at(-1);
    if (previous?.copyKey === item.copyKey) previous.items.push(item);
    else groups.push({ copyKey: item.copyKey, items: [item] });
  }
  return <div className={styles.items}>{groups.map((group, index) => (
    <section className={styles.itemGroup} key={`${group.copyKey}-${index}`}>
      <h3>{careerContentV3ItemCopy(group.copyKey, content.locale)}</h3>
      <div className={styles.itemBodies}>{group.items.map((item) => <Item key={item.id} item={item} content={content} />)}</div>
    </section>
  ))}</div>;
}

export function CareerContentV3Surface({ content, ctaHref }: Props) {
  const successful = content.blocks.filter((block) => renderableBlock(block, content));
  const isZh = content.locale === "zh";
  return (
    <article className={styles.surface} data-testid="career-content-v3-surface" data-content-contract={content.contractVersion}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{isZh ? "费马职业档案" : "FermatMind career dossier"}</p>
        <h1>{content.subject.name}</h1>
        {content.subject.summary ? <p className={styles.lead}>{content.subject.summary}</p> : null}
        <Link className={styles.cta} href={ctaHref}>{isZh ? "开始职业兴趣测试" : "Start the career interest test"}</Link>
      </header>
      <div className={styles.layout}>
        {successful.length > 0 ? <nav className={styles.toc} aria-label={isZh ? "本页目录" : "On this page"} data-testid="career-content-v3-toc"><p className={styles.tocTitle}>{isZh ? "目录" : "Contents"}</p><ol>{successful.map((block) => <li key={block.id}><a href={`#career-content-${block.id}`}>{careerContentV3BlockCopy(block.copyKey, content.locale)?.title}</a></li>)}</ol></nav> : null}
        <div className={styles.blocks}>{content.blocks.map((block) => {
          if (!renderableBlock(block, content)) return <Placeholder key={block.id} locale={content.locale} />;
          const copy = careerContentV3BlockCopy(block.copyKey, content.locale)!;
          return <section className={styles.block} id={`career-content-${block.id}`} key={block.id} data-content-block-id={block.id}><header className={styles.blockHeader}><h2>{copy.title}</h2><span className={styles.state}>{block.contentState === "enhanced" ? (isZh ? "增强内容" : "Enhanced") : (isZh ? "基础内容" : "Core content")}</span></header><ItemGroups block={block} content={content} /></section>;
        })}</div>
      </div>
    </article>
  );
}
