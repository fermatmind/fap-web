import { createHash } from 'node:crypto';
import { convertText } from './convert-zh-tw.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
export const CONTENT_PAGE_CONVERTER = 'opencc-js@1.4.2:cn:twp:content-page-v3';
export const TRADITIONAL_MARKDOWN_CONVERTER = 'opencc-js@1.4.2:cn:twp:reader-markdown-v1';
const glossary = 'fermatmind-tw-content-page-2';
// Preserve domestic-storage and account-closure meaning; generic Taiwan word
// conversion otherwise joins 内存 across words or turns 注销 into sign-out.
const readerPhrases = [
  ['境内存储', '境內儲存'],
  ['注销账号', '註銷帳號'],
  ['账号注销', '帳號註銷'],
];
const convertReaderText = source => convertText(source, readerPhrases);
const textFields = ['title', 'kicker', 'summary', 'seo_title', 'meta_description', 'seo_description'];

function tableStructure(source) {
  const groups = [];
  let rows = [];
  for (const line of [...source.split('\n'), '']) {
    if (/^\s*\|/.test(line)) {
      if (!/\|\s*$/.test(line) || /\\\|/.test(line)) throw new Error('CONTENT_PAGE_MARKDOWN_TABLE_UNSUPPORTED');
      rows.push(line.trim().slice(1, -1).split('|').map(cell => cell.trim()));
    } else if (rows.length) {
      const width = rows[0].length;
      if (width < 2 || rows.length < 2 || rows.some(row => row.length !== width)
        || !rows[1].every(cell => /^:?-{3,}:?$/.test(cell))) throw new Error('CONTENT_PAGE_MARKDOWN_TABLE_UNSUPPORTED');
      groups.push(rows.map((row, index) => index === 1 ? row : row.map(() => 'text')));
      rows = [];
    }
  }
  return groups;
}

/** Explicit reader-field conversion only. Tables require an opting-in consumer. */
export function convertTraditionalMarkdown(source, { allowTables = false, allowLinkSpacing = false } = {}) {
  if (typeof source !== 'string' || typeof allowTables !== 'boolean' || typeof allowLinkSpacing !== 'boolean') throw new Error('CONTENT_PAGE_MARKDOWN_FORMAT_UNSUPPORTED');
  // Support only reviewed inline links. Destinations never enter OpenCC.
  const links = [];
  const masked = source.replace(/\[([^\[\]\n]+)\]\(([ \t]*)([^()\s]+)([ \t]*)\)/g, (match, label, leading, href, trailing) => {
    if ((!allowLinkSpacing && (leading || trailing)) || !/^(?:\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href) || /[<>`\\\u0000-\u001f\u007f]/.test(href)) {
      throw new Error('CONTENT_PAGE_MARKDOWN_FORMAT_UNSUPPORTED');
    }
    links.push({ label, href, leading, trailing });
    return `\uE010${String.fromCharCode(0xE100 + links.length - 1)}\uE011`;
  });
  if (/[<>`\[\]]|!\uE010|^\s*~{3,}/m.test(masked) || (!allowTables && /^\s*\|/m.test(masked)) || links.some(link => /[<>`]/.test(link.label))) {
    throw new Error('CONTENT_PAGE_MARKDOWN_FORMAT_UNSUPPORTED');
  }
  const structure = value => value.split('\n').map(line => line.match(/^(\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+)?)/)?.[0]);
  const target = convertReaderText(masked).replace(/\uE010([\uE100-\uF8FF])\uE011/g, (_, key) => {
    const link = links[key.charCodeAt(0) - 0xE100];
    return `[${convertReaderText(link.label)}](${link.leading}${link.href}${link.trailing})`;
  });
  if (JSON.stringify(structure(source)) !== JSON.stringify(structure(target))) throw new Error('CONTENT_PAGE_MARKDOWN_STRUCTURE_CHANGED');
  if (allowTables && JSON.stringify(tableStructure(source)) !== JSON.stringify(tableStructure(target))) throw new Error('CONTENT_PAGE_MARKDOWN_STRUCTURE_CHANGED');
  return target;
}

/** Public source projection in, unpublished candidate out. No CMS/network writes. */
export function buildContentPageTraditional(source, previous = {}) {
  if (source?.locale !== 'zh-CN' || source.status !== 'published' || source.is_public !== true ||
      typeof source.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.slug) ||
      typeof source.content_md !== 'string' || !source.content_md.trim() ||
      (source.content_html != null && source.content_html !== '') ||
      !Array.isArray(source.headings) || !source.headings.every(item => typeof item === 'string') ||
      !Array.isArray(source.faq_items)) throw new Error('CONTENT_PAGE_SOURCE_INVALID');
  const sourceHash = sha(JSON.stringify(source));
  const units = {};
  function unit(context, text, format = 'text') {
    if (text == null) return text;
    if (typeof text !== 'string') throw new Error(`CONTENT_PAGE_TEXT_INVALID:${context}`);
    const sourceHash = sha(JSON.stringify(['zh-TW', source.slug, context, text, CONTENT_PAGE_CONVERTER, glossary]));
    const prior = previous.units?.[context];
    const generated = format === 'markdown' ? convertTraditionalMarkdown(text) : convertReaderText(text);
    // Validate the current format even for reused units. Manual corrections
    // belong to the reviewed native package, not an unvalidated cache entry.
    const translated = prior?.sourceHash === sourceHash && prior.text === generated ? prior.text : generated;
    units[context] = { sourceHash, text: translated };
    return translated;
  }
  const candidate = structuredClone(source);
  for (const field of textFields) {
    if (Object.hasOwn(source, field)) candidate[field] = unit(field, source[field]);
  }
  candidate.content_md = unit('content_md', source.content_md, 'markdown');
  candidate.headings = source.headings.map((text, index) => unit(`headings/${index}`, text));
  candidate.faq_items = source.faq_items.map((item, index) => {
    if (!item || typeof item.question !== 'string' || typeof item.answer !== 'string' ||
        Object.keys(item).some(key => !['question', 'answer'].includes(key))) throw new Error('CONTENT_PAGE_FAQ_INVALID');
    return { question: unit(`faq_items/${index}/question`, item.question), answer: unit(`faq_items/${index}/answer`, item.answer) };
  });
  // Source projection publication flags/IDs are reference data only. A candidate
  // cannot authorize its own publication or carry the source's approval dates.
  return { targetLocale: 'zh-TW', converter: CONTENT_PAGE_CONVERTER, glossary,
    sourceProjectionHash: sourceHash, sourceSlug: source.slug,
    state: 'unpublished_candidate_requires_native_source_revision_binding',
    fields: Object.fromEntries([...textFields, 'content_md', 'headings', 'faq_items'].filter(key => Object.hasOwn(candidate, key)).map(key => [key, candidate[key]])),
    units };
}
