import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCareerCurrentInventory } from '../../scripts/ops/career-current-inventory.mjs';

function fixture(aliasCount) {
  const slugs = Array.from({ length: 1046 }, (_, i) => `role-${i}`);
  const aliases = Object.fromEntries(Array.from({ length: aliasCount }, (_, i) => [`role-${1045 - i}`, `role-${i}`]));
  const paths = slugs.filter(slug => !Object.hasOwn(aliases, slug)).flatMap(slug => ['en', 'zh'].map(locale => `/${locale}/career/jobs/${slug}`));
  return {
    ok: true, source: 'backend_sitemap_generator', count: paths.length,
    items: paths.map(path => ({ loc: `https://fermatmind.com${path}` })),
    career_current_identity: { manifest_sha256: 'a'.repeat(64), storage_count: 1046, file_count: 2092, slugs, aliases },
  };
}
for (const aliases of [0, 2, 3]) {
  test(`retains 1046/2092 storage while validating ${aliases} aliases against the exact canonical set`, () => {
    const result = parseCareerCurrentInventory(fixture(aliases));
    assert.equal(result.paths.length, (1046 - aliases) * 2);
  });
}
test('rejects missing, duplicate, substituted and stale alias URLs even at the same count', () => {
  for (const mutate of [
    p => { p.items[0] = p.items[1]; },
    p => { p.items[0].loc = 'https://fermatmind.com/en/career/jobs/role-1045'; },
    p => { p.items[0].loc = 'https://fermatmind.com/en/career/jobs/not-in-manifest'; },
    p => { p.items.pop(); p.count--; },
    p => { p.source = 'backend_sitemap_generator_fallback'; },
    p => { delete p.career_current_identity; },
    p => { p.career_current_identity.aliases['role-1045'] = 'role-1044'; },
    p => { p.career_current_identity.aliases['role-1045'] = 'missing'; },
  ]) {
    const payload = fixture(3); mutate(payload);
    assert.throws(() => parseCareerCurrentInventory(payload), /CAREER_CURRENT_/);
  }
});
