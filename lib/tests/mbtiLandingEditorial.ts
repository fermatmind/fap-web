/** Optional CMS editorial fields. Missing content is never replaced with local copy. */
export type EditorialLink = { label: string; href: string };
export type LandingFaq = { q: string; a: string; id?: string; references?: EditorialLink[]; related_links?: EditorialLink[] };
export type MbtiEditorial = {
  title: string;
  intro: string;
  items: { id: string; title: string; body: string; link?: EditorialLink }[];
  comparison?: { caption: string; columns: string[]; rows: string[][]; note: string };
};
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const externalHosts = new Set(["www.themyersbriggs.com", "www.myersbriggs.org", "pubmed.ncbi.nlm.nih.gov", "www.nimh.nih.gov"]);
function parseLink(value: unknown): EditorialLink | undefined {
  const node = record(value);
  const label = text(node.label);
  const href = text(node.href);
  if (!label || !href || /[\\\s\u0000-\u001f]/u.test(href)) return undefined;
  if (/^#[a-z][a-z0-9-]*$/u.test(href) || /^\/(?:zh|en)(?:\/|$)/u.test(href)) return { label, href };
  try {
    const url = new URL(href);
    if (url.protocol === "https:" && externalHosts.has(url.hostname) && !url.username && !url.password && !url.port) return { label, href };
  } catch { /* Invalid editorial links are not rendered. */ }
  return undefined;
}
const links = (value: unknown) => Array.isArray(value) ? value.map(parseLink).filter((link): link is EditorialLink => Boolean(link)) : [];
export function parseLandingFaq(value: unknown): LandingFaq[] {
  if (!Array.isArray(value)) return [];
  const usedIds = new Set<string>();
  return value.flatMap((item) => {
    const node = record(item);
    const q = text(node.q ?? node.question);
    const a = text(node.a ?? node.answer);
    if (!q || !a) return [];
    const candidate = text(node.id);
    const id = /^faq-[a-z0-9-]+$/u.test(candidate) && !usedIds.has(candidate) ? candidate : undefined;
    if (id) usedIds.add(id);
    return [{ q, a, ...(id ? { id } : {}), references: links(node.references), related_links: links(node.related_links) }];
  });
}
export function parseMbtiEditorial(value: unknown): MbtiEditorial | null {
  const content = record(value);
  const why = record(content.why_choose);
  const title = text(why.title);
  const intro = text(why.intro);
  const items = Array.isArray(why.items) ? why.items.flatMap((value) => {
    const item = record(value);
    const id = text(item.id), title = text(item.title), body = text(item.body);
    return id && title && body ? [{ id, title, body, link: parseLink(item.link) }] : [];
  }) : [];
  if (!title || !intro || !items.length) return null;
  const raw = record(content.version_comparison);
  const columns = Array.isArray(raw.columns) ? raw.columns.map(text) : [];
  const rows = Array.isArray(raw.rows) ? raw.rows.filter(Array.isArray).map((row) => row.map(text)) : [];
  const comparison = text(raw.caption) && columns.length === 3 && columns.every(Boolean) && rows.length && rows.every((row) => row.length === 3 && row.every(Boolean))
    ? { caption: text(raw.caption), columns, rows, note: text(raw.note) } : undefined;
  return { title, intro, items, comparison };
}
