import fs from "node:fs";
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCareerCurrentInventory } from '../../scripts/ops/career-current-inventory.mjs';

function fixture(aliasCount) {
  const slugs = Array.from({ length: 1046 }, (_, i) => `role-${i}`);
  const aliases = Object.fromEntries(Array.from({ length: aliasCount }, (_, i) => [`old-role-${i}`, `role-${i}`]));
  const paths = slugs.flatMap(slug => ['en', 'zh'].map(locale => `/${locale}/career/jobs/${slug}`));
  return {
    ok: true, source: 'backend_sitemap_generator', count: paths.length,
    items: paths.map(path => ({ loc: `https://fermatmind.com${path}` })),
    career_current_identity: { manifest_sha256: 'a'.repeat(64), storage_count: 1046, file_count: 2092, slugs, aliases },
  };
}
for (const aliases of [0, 2, 3]) {
  test(`retains 1046/2092 independent careers while validating ${aliases} historical URL aliases outside the fixed set`, () => {
    const result = parseCareerCurrentInventory(fixture(aliases));
    assert.equal(result.paths.length, 1046 * 2);
  });
}
test('the preschool identity migration retains both canonical URL pairs and rejects the old backend mapping', () => {
  const payload = fixture(0);
  const pair = ['preschool-teachers', 'preschool-teachers-except-special-education'];
  payload.career_current_identity.slugs.splice(0, 2, ...pair);
  payload.items = payload.items.map(item => ({loc: item.loc.replace(/\/role-([01])$/, (_, index) => `/${pair[Number(index)]}`)}));
  payload.career_current_identity.aliases = {'old-preschool-teacher-url': pair[0]};
  const inventory = parseCareerCurrentInventory(payload);
  assert.equal(inventory.paths.length, 2092);
  for (const slug of pair) {
    for (const locale of ['en', 'zh']) assert.ok(inventory.paths.includes(`/${locale}/career/jobs/${slug}`));
  }
  payload.career_current_identity.aliases = {[pair[0]]: pair[1]};
  assert.throws(() => parseCareerCurrentInventory(payload), /CAREER_CURRENT_ALIAS_INVALID/);
});
test('accepts the current published subset without inventing unpublished language pairs', () => {
  const payload = fixture(3);
  payload.items = payload.items.filter(item => item.loc.endsWith('/zh/career/jobs/role-0')
    || item.loc.endsWith('/zh/career/jobs/role-1')
    || item.loc.endsWith('/en/career/jobs/role-0'));
  payload.count = payload.items.length;
  assert.deepEqual(parseCareerCurrentInventory(payload).paths, [
    '/en/career/jobs/role-0', '/zh/career/jobs/role-0', '/zh/career/jobs/role-1',
  ]);
});
test('rejects duplicate, substituted and stale alias URLs even at the same count', () => {
  for (const mutate of [
    p => { p.items[0] = p.items[1]; },
    p => { p.items[0].loc = 'https://fermatmind.com/en/career/jobs/old-role-0'; },
    p => { p.items[0].loc = 'https://fermatmind.com/en/career/jobs/not-in-manifest'; },
    p => { p.items.push(p.items[0]); p.count++; },
    p => { p.items = p.items.filter(item => !item.loc.includes('/career/jobs/')); p.count = 0; },
    p => { p.source = 'backend_sitemap_generator_fallback'; },
    p => { delete p.career_current_identity; },
    p => { p.career_current_identity.aliases['role-1045'] = 'role-1044'; },
    p => { p.career_current_identity.aliases['old-role-0'] = 'missing'; },
    p => { p.career_current_identity.aliases['old-role-0'] = 'old-role-1'; },
  ]) {
    const payload = fixture(3); mutate(payload);
    assert.throws(() => parseCareerCurrentInventory(payload), /CAREER_CURRENT_/);
  }
});

 test('release receipt count uses the same validated inventory as the artifact verifier', () => {
  const source = fs.readFileSync(new URL('./deploy-web-release.sh', import.meta.url), 'utf8');
  assert.match(source, /parseCareerCurrentInventory\(await response.json\(\)\).paths.length/);
  assert.match(source, /\.counts.career == \$career_count/);
  assert.doesNotMatch(source, /\.counts.career == 2088/);
});
