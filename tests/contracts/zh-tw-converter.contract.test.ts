import { test } from 'vitest';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { build, collect, convertText, sources } = createRequire(import.meta.url)('../../scripts/i18n/convert-zh-tw.mjs');

test('Taiwan conversion preserves protected tokens and semantic boundaries', () => {
  assert.equal(convertText('软件、硬盘、内存、鼠标、打印、视频'), '軟體、硬碟、記憶體、滑鼠、列印、影片');
  assert.equal(convertText('兴趣不等于能力，可能喜欢但不代表不能合作。'), '興趣不等於能力，可能喜歡但不代表不能合作。');
  const text = '第18题 3/12 {{name}} ${score} %s `id=简体` https://example.com/简体?q=18';
  assert.equal(convertText(text), '第18題 3/12 {{name}} ${score} %s `id=简体` https://example.com/简体?q=18');
});
test('only bilingual reader fields are extracted; IDs, business configuration and URLs stay intact', () => {
  assert.deepEqual(collect({ id: '简体ID', slug: 'chiikawa', score: 18, url: '/zh/path', source: { hash: 'abc' }, label: { zh: '请选择', en: 'Choose' } }), { '/label': '请选择' });
  assert.deepEqual(sources, ['lib/questionnaires/data/chiikawa.json', 'lib/questionnaires/result-content/chiikawa.json', 'lib/i18n/zh-TW/ui.source.json']);
});
test('incremental reuse binds target, field context, source text and converter/glossary version', () => {
  const first = build().artifact;
  const second = build(first).artifact;
  assert.deepEqual(second, first);
  const key = Object.keys(first.units)[0];
  assert.equal(second.units[key], first.units[key]);
  const stale = structuredClone(first);
  stale.units[key].sourceHash = 'stale';
  stale.units[key].text = 'wrong';
  assert.deepEqual(build(stale).artifact, first);
});
