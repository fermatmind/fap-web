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
    if (!slugs.has(alias) || !slugs.has(target) || alias === target || Object.hasOwn(identity.aliases, target)) {
      throw new Error('CAREER_CURRENT_ALIAS_INVALID');
    }
  }
  const paths = [...slugs].filter(slug => !Object.hasOwn(identity.aliases, slug))
    .flatMap(slug => ['en', 'zh'].map(locale => `/${locale}/career/jobs/${slug}`)).sort();
  const actual = [];
  for (const item of payload.items) {
    const url = new URL(item.loc);
    if (!PATH.test(url.pathname)) continue;
    if (url.protocol !== 'https:' || !['fermatmind.com', 'www.fermatmind.com'].includes(url.hostname)
      || url.search || url.hash || url.username || url.password) throw new Error('CAREER_CURRENT_URL_INVALID');
    actual.push(url.pathname);
  }
  if (!hasExactCareerPaths(actual, paths)) throw new Error('CAREER_CURRENT_SITEMAP_MISMATCH');
  return { manifestSha256: identity.manifest_sha256, paths };
}

export function hasExactCareerPaths(actual, expected) {
  const unique = new Set(actual);
  return expected.length > 0 && unique.size === actual.length && unique.size === expected.length
    && new Set(expected).size === expected.length && expected.every(item => unique.has(item));
}
