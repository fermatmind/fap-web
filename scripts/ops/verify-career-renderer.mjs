import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function completeStream(html) {
  const root = {tag: 'root', children: []};
  const stack = [root], ids = new Map(), commands = [];
  const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const append = node => {node.parent = stack.at(-1); node.parent.children.push(node);};
  for (const match of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->|<\/?[a-z][^>]*>|[^<]+|</gi)) {
    const token = match[0];
    if (/^<script\b/i.test(token)) {
      for (const [,kind,first,second] of token.matchAll(/\$(RS|RC)\("([BSP]:[a-z0-9]+)","([BSP]:[a-z0-9]+)"\)/g)) commands.push([kind,first,second]);
      continue;
    }
    if (token.startsWith('<!--')) {append({tag: 'comment', text: token.slice(4,-3), children: []}); continue;}
    if (/^<\//.test(token)) {
      const tag = token.match(/^<\/([a-z0-9]+)/i)[1].toLowerCase();
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index > 0) stack.splice(index);
      continue;
    }
    if (/^<[a-z]/i.test(token)) {
      const tag = token.match(/^<([a-z0-9]+)/i)[1].toLowerCase();
      const id = token.match(/\bid="([^"]+)"/i)?.[1];
      const node = {tag, token, hidden: /\shidden(?:\s|=|>)/i.test(token), children: []};
      append(node); if (id) ids.set(id,node);
      if (!voids.has(tag)) stack.push(node);
    } else append({tag: 'text', text: token, children: []});
  }
  const detach = node => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node),1);
    node.parent = null;
  };
  for (const [kind,first,second] of commands) {
    const source = ids.get(kind === 'RS' ? first : second), target = ids.get(kind === 'RS' ? second : first);
    if (!source) throw new Error('stream source');
    detach(source);
    if (!target?.parent) {if (kind === 'RC') continue; throw new Error('stream target');}
    const parent = target.parent, start = parent.children.indexOf(target);
    let end = start + 1;
    if (kind === 'RC') {
      let depth = 0; end = start;
      while (end < parent.children.length) {
        const node = parent.children[end];
        if (node.tag === 'comment') {
          if (['/$','/&'].includes(node.text)) {if (depth === 0) break; depth--;}
          else if (['$','$?','$~','$!','&'].includes(node.text)) depth++;
        }
        end++;
      }
      if (end === parent.children.length) throw new Error('stream boundary');
    }
    const moved = source.children; source.children = [];
    parent.children.splice(start,end-start,...moved);
    for (const node of moved) node.parent = parent;
  }
  const render = node => {
    if (node.hidden || node.tag === 'style') return '';
    if (node.tag === 'text') return node.text;
    if (node.tag === 'comment') return `<!--${node.text}-->`;
    const content = node.children.map(render).join('');
    return node.tag === 'root' ? content : node.token + content + (voids.has(node.tag) ? '' : `</${node.tag}>`);
  };
  return render(root);
}

let category = 'environment';
try {
  process.env.NEXT_PUBLIC_SITE_URL = process.argv[5];
  const { getSiteUrlOrThrow, isConfiguredStagingSiteUrl } = await import(pathToFileURL(process.argv[7]).href);
  category = 'api_contract';
  const html = readFileSync(process.argv[2], 'utf8');
  const response = JSON.parse(readFileSync(process.argv[3], 'utf8'));
  const page = response.career_page;
  if (response.bundle_version !== 'career.detail.page.v1' || response.locale_policy?.requested_locale !== 'zh-CN' ||
      response.identity?.canonical_slug !== 'accountants-and-auditors' || page?.locale !== 'zh-CN' ||
      page.display?.contract_version !== 'career.detail.display.v1' || page.hero?.ai?.availability !== 'available' ||
      page.hero?.badges?.length !== 3) throw new Error('API contract');
  // Exclude React transport scripts so cached props cannot masquerade as rendered content.
  category = 'stream';
  const rendered = completeStream(html);
  category = 'seo_authority';
  const seo = response.seo_contract;
  const canonical = '/zh/career/jobs/accountants-and-auditors';
  if (page.content?.locale !== page.locale || page.content?.subject?.canonical_slug !== response.identity.canonical_slug ||
      page.subject?.canonical_slug !== response.identity.canonical_slug ||
      !/^[a-f0-9]{64}$/.test(page.source_content_sha256 ?? '') ||
      page.content?.source_content_sha256 !== page.source_content_sha256 ||
      seo?.metadata_fingerprint !== page.source_content_sha256 || seo.canonical_path !== canonical ||
      seo.canonical_target !== canonical || typeof seo.index_eligible !== 'boolean') throw new Error('SEO authority');
  const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(match => [match[1].toLowerCase(), match[2] ?? match[3]]));
  category = 'robots';
  const policies = [...rendered.matchAll(/<meta\b[^>]*>/gi)].map(match => attrs(match[0]))
    .filter(meta => ['robots', 'googlebot'].includes((meta.name ?? '').toLowerCase())).map(meta => meta.content ?? '');
  const headers = readFileSync(process.argv[4], 'utf8');
  const headerPolicies = [...headers.matchAll(/^x-robots-tag:\s*(.*)$/gim)].map(match => match[1]);
  const restricted = value => /(?:^|[\s,:])(?:noindex|none)(?:$|[\s,])/i.test(value);
  const nofollow = value => /(?:^|[\s,:])(?:nofollow|none)(?:$|[\s,])/i.test(value);
  const indexable = seo.index_eligible && ['index', 'indexable', 'indexed'].includes(seo.index_state) &&
    seo.robots_policy === 'index,follow' && page.content.content_state === 'enhanced' && page.content.blocks.length > 0 &&
    seo.reason_codes?.includes('runtime_publish_projection') && seo.reason_codes?.some(reason =>
      ['release_gate_pass', 'validated_display_asset_backed_release', 'runtime_published_navigation_shell'].includes(reason));
  if (!policies.length) throw new Error('robots missing');
  const staging = isConfiguredStagingSiteUrl();
  if (staging) {
    if (process.argv[6] === 'public' && !headerPolicies.some(restricted)) throw new Error('staging noindex missing');
  } else if (indexable) {
    if ([...policies, ...headerPolicies].some(value => restricted(value) || nofollow(value))) throw new Error('index suppressed');
    if (!policies.some(value => /(?:^|[\s,])index(?:$|[\s,])/i.test(value))) throw new Error('index missing');
  } else if (!policies.every(restricted)) throw new Error('noindex authority overridden');
  category = 'canonical';
  const canonicals = [...rendered.matchAll(/<link\b[^>]*>/gi)].map(match => attrs(match[0]))
    .filter(link => link.rel === 'canonical').map(link => link.href);
  if (canonicals.length !== 1 || canonicals[0] !== `${getSiteUrlOrThrow()}${canonical}`) throw new Error('canonical');

  category = 'renderer';
  if (!rendered.includes('data-career-production-template="career-production-v1"')) throw new Error('original template');
  for (const marker of ['career-production-ai-gauge', 'career-production-hero-badges', 'career-dossier-toc', 'career-display-faq']) {
    if (!rendered.includes(`data-testid="${marker}"`)) throw new Error('original renderer');
  }
  category = 'visible_content';
  const decode = value => value.replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[name]);
  const normalize = value => decode(value).replace(/\s+/g, '');
  const visible = normalize(rendered.replace(/<[^>]*>/g, ''));
  const components = page.display.components;
  const expected = [page.subject.name, page.hero.ai.fact?.display_value, ...page.hero.badges,
    ...page.hero.metrics.map(metric => metric.fact?.display_value), components.hero.quick_answer,
    components.definition_block, components.faq_block.items[0]?.question];
  for (const value of expected) {
    if (typeof value !== 'string' || !value.trim() || !visible.includes(normalize(value))) throw new Error('visible content');
  }
} catch {
  console.error(`career smoke failed: category=${category}`);
  process.exitCode = 1;
}
