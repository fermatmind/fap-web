import { readFileSync } from 'node:fs';
import { get } from 'node:https';

/** Contract input is published API output or a temporary backend projection. */
export async function publishedCareerPage(locale: 'zh' | 'en') {
  if (locale === 'zh' && process.env.CAREER_TEST_PAGE_FILE) return JSON.parse(readFileSync(process.env.CAREER_TEST_PAGE_FILE, 'utf8'));
  if (process.env.CAREER_PAGE_CORPUS) {
    const pages = readFileSync(process.env.CAREER_PAGE_CORPUS, 'utf8').trim().split('\n').map(line => JSON.parse(line));
    const page = pages.find(value => value.subject?.canonical_slug === 'accountants-and-auditors' && value.locale === (locale === 'zh' ? 'zh-CN' : 'en'));
    if (page) return page;
  }
  const url = new URL('/api/v0.5/career/jobs/accountants-and-auditors', process.env.NEXT_PUBLIC_API_URL || 'https://api.fermatmind.com');
  url.searchParams.set('locale', locale === 'zh' ? 'zh-CN' : 'en');
  url.searchParams.set('projection_contract', 'career.detail.page.v1');
  const bundle = await new Promise<{career_page?: unknown}>((resolve, reject) => {
    const request = get(url, response => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`CAREER_CONTRACT_API_${response.statusCode}`)); return; }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
      response.on('error', reject);
    });
    request.setTimeout(20000, () => request.destroy(new Error('CAREER_CONTRACT_API_TIMEOUT')));
    request.on('error', reject);
  });
  if (!bundle.career_page) throw new Error('CAREER_CONTRACT_PAGE_MISSING');
  return bundle.career_page;
}
