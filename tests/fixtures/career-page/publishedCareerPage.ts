import { readFileSync } from 'node:fs';
import { Agent, get } from 'node:https';
import { createGunzip } from 'node:zlib';

const publishedPageAgent = new Agent({ keepAlive: true, maxSockets: 4 });
const TIMEOUT = 'CAREER_CONTRACT_API_TIMEOUT';

function readPublishedBundle(url: URL): Promise<{ career_page?: unknown }> {
  return new Promise((resolve, reject) => {
    const request = get(url, {
      agent: publishedPageAgent,
      headers: { 'Accept-Encoding': 'gzip' },
    }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`CAREER_CONTRACT_API_${response.statusCode}`));
        return;
      }
      const stream = response.headers['content-encoding'] === 'gzip'
        ? response.pipe(createGunzip())
        : response;
      let body = '';
      stream.setEncoding('utf8');
      stream.on('data', chunk => { body += chunk; });
      stream.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
      response.on('error', reject);
      if (stream !== response) stream.on('error', reject);
    });
    request.setTimeout(20_000, () => request.destroy(new Error(TIMEOUT)));
    request.on('error', reject);
  });
}

/** Contract input is published API output or a temporary backend projection. */
export async function publishedCareerPage(locale: 'zh' | 'zh-TW' | 'en', slug = 'accountants-and-auditors') {
  if (slug === 'accountants-and-auditors' && locale === 'zh' && process.env.CAREER_TEST_PAGE_FILE) return JSON.parse(readFileSync(process.env.CAREER_TEST_PAGE_FILE, 'utf8'));
  if (process.env.CAREER_PAGE_CORPUS) {
    const pages = readFileSync(process.env.CAREER_PAGE_CORPUS, 'utf8').trim().split('\n').map(line => JSON.parse(line));
    const page = pages.find(value => value.subject?.canonical_slug === slug && value.locale === (locale === 'zh' ? 'zh-CN' : locale));
    if (!page) throw new Error(`CAREER_CORPUS_PAGE_MISSING:${locale}:${slug}`);
    return page;
  }
  const url = new URL(`/api/v0.5/career/jobs/${slug}`, process.env.NEXT_PUBLIC_API_URL || 'https://api.fermatmind.com');
  url.searchParams.set('locale', locale === 'zh' ? 'zh-CN' : locale);
  url.searchParams.set('projection_contract', 'career.detail.page.v1');
  const bundle = await readPublishedBundle(url).catch((error: unknown) => {
    if (!(error instanceof Error) || error.message !== TIMEOUT) throw error;
    return readPublishedBundle(url);
  });
  if (!bundle.career_page) throw new Error('CAREER_CONTRACT_PAGE_MISSING');
  return bundle.career_page;
}
