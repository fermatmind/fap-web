const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PATH = /^\/(en|zh)\/career\/jobs\/([a-z0-9-]+)$/;

/** Validate the manifest identity independently of the derived sitemap entries. */
export function parseCareerCurrentInventory(payload) {
  const identity = payload?.career_current_identity;
  if (payload?.ok !== true || payload.source !== 'backend_sitemap_generator'
    || !Array.isArray(payload.items) || payload.count !== payload.items.length
    || !identity || !/^[a-f0-9]{64}$/.test(identity.manifest_sha256 ?? '')
    || identity.storage_count !== 1046 || identity.file_count !== 2092
    || !Array.isArray(identity.slugs) || identity.slugs.length !== identity.storage_count
    || !identity.slugs.every(slug => typeof slug === 'string' && SLUG.test(slug))
    || !identity.aliases || typeof identity.aliases !== 'object' || Array.isArray(identity.aliases)) {
    throw new Error('CAREER_CURRENT_INVENTORY_INVALID');
  }
  const slugs = new Set(identity.slugs);
  if (slugs.size !== identity.storage_count) throw new Error('CAREER_CURRENT_INVENTORY_DUPLICATE');
  for (const [alias, target] of Object.entries(identity.aliases)) {
    if (!SLUG.test(alias) || slugs.has(alias) || !slugs.has(target) || Object.hasOwn(identity.aliases, target)) {
      throw new Error('CAREER_CURRENT_ALIAS_INVALID');
    }
  }
  const canonicalPaths = new Set([...slugs]
    .flatMap(slug => ['en', 'zh'].map(locale => `/${locale}/career/jobs/${slug}`)));
  const actual = [];
  for (const item of payload.items) {
    const url = new URL(item.loc);
    if (!PATH.test(url.pathname)) continue;
    if (url.protocol !== 'https:' || !['fermatmind.com', 'www.fermatmind.com'].includes(url.hostname)
      || url.search || url.hash || url.username || url.password) throw new Error('CAREER_CURRENT_URL_INVALID');
    actual.push(url.pathname);
  }
  if (actual.length === 0 || new Set(actual).size !== actual.length
    || actual.some(path => !canonicalPaths.has(path))) throw new Error('CAREER_CURRENT_SITEMAP_MISMATCH');
  return { manifestSha256: identity.manifest_sha256, paths: actual.sort() };
}

/** Wait only for an explicitly degraded source; never accept it as authority. */
export async function readCareerCurrentInventoryForDeployment({
  fetchImpl = globalThis.fetch,
  wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  now = Date.now,
} = {}) {
  const deadline = now() + 90_000;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error('CAREER_CURRENT_INVENTORY_FALLBACK_EXHAUSTED');
    const response = await fetchImpl('https://api.fermatmind.com/api/v0.5/seo/sitemap-source', {
      signal: AbortSignal.timeout(Math.min(60_000, remaining)),
    });
    if (!response.ok) throw new Error('CAREER_CURRENT_INVENTORY_UNAVAILABLE');
    const payload = await response.json();
    if (payload?.ok !== true || payload.source !== 'backend_sitemap_generator_fallback') {
      return parseCareerCurrentInventory(payload);
    }
    if (attempt === 5 || now() + 15_000 >= deadline) {
      throw new Error('CAREER_CURRENT_INVENTORY_FALLBACK_EXHAUSTED');
    }
    await wait(15_000);
  }
}

export function hasExactCareerPaths(actual, expected) {
  const unique = new Set(actual);
  return expected.length > 0 && unique.size === actual.length && unique.size === expected.length
    && new Set(expected).size === expected.length && expected.every(item => unique.has(item));
}
