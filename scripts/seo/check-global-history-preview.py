"""Validate locally served World Edition HTML, sitemap membership and inbound links."""
import argparse
import json
import re
import unicodedata
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import urlopen

SITE = 'https://fermatmind.com'
LOCALES = {'zh': 'zh-CN', 'zh-TW': 'zh-TW', 'en': 'en'}
TYPES = [f'{a}{b}{c}{d}' for a in 'ei' for b in 'ns' for c in 'ft' for d in 'jp']
ENTRY = '/tests/explore/global-history-quiz'
AXES = ['Pace', 'Collaboration', 'Inquiry', 'Scope', 'Change', 'Influence']
PROFILE_MODULES = ['hero', 'core-facts', 'decision-evidence', 'cox-1926', 'behavior-coding',
                   'alternative-readings', 'faq', 'related-figures', 'references', 'audit-log']


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.main_landmarks = 0
        self.public_copy_conflicts = []
        self.has_public_result = False
        self.alternates = {}
        self.links = set()
        self.images = {}
        self.robots = ''
        self.person = None
        self.structured = None
        self.script_id = None
        self.atlas_rows = set()
        self.type_figures = ''
        self.profile_modules = []
        self.profile_tables = []
        self.axis_rows = []
        self.linked_axes = []
        self.active_axis = None
        self.active_table = None
        self.table_rows = {}
        self.row = None
        self.cell = None
        self.evidence_ids = set()
        self.references = []
        self.citation_titles = {"references": [], "alternative-readings": []}
        self.citation_section = None
        self.citation_link = None
        self.inside_references = False
        self.reference_copy = []
        self.inside_synthesis = False
        self.inside_flagship_copy = False
        self.flagship_copy = []
        self.standard_paragraphs = []
        self.standard_paragraph = None
        self.inside_cox = False
        self.cox_copy = []
        self.inside_portrait_credit = False
        self.portrait_credit = []
        self.synthesis_copy = []
        self.evidence_by_axis = {}
        self.inside_faq = False
        self.faq_questions = 0
        self.inside_footer = False
        self.footer_text = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == 'p' and 'data-history-synthesis' in props:
            self.inside_synthesis = True
        if tag == 'p' and 'data-standard-narrative' in props:
            self.standard_paragraph = []
        if tag == 'p' and 'data-flagship-narrative' in props:
            self.inside_flagship_copy = True
        if tag == 'section' and props.get('id') == 'cox-1926':
            self.inside_cox = True
        if tag == 'a' and 'data-history-portrait-credit' in props:
            self.inside_portrait_credit = True
        if tag == 'main':
            self.main_landmarks += 1
        if props.get('data-history-state') == 'public':
            self.has_public_result = True
        if props.get('data-history-state') == 'matched' or props.get('id') == 'history-why':
            self.public_copy_conflicts.append(tag)
        if tag == 'link':
            rel = props.get('rel')
            if rel in ('canonical', 'alternate'):
                self.alternates[props.get('hreflang', 'canonical')] = props.get('href')
        if tag == 'a':
            self.links.add(props.get('href'))
            if self.inside_references and (props.get('href') or '').startswith('https://'):
                self.references.append(props['href'])
            if self.citation_section and (props.get('href') or '').startswith('https://'):
                self.citation_link = (props['href'], [])
        if tag == 'img':
            self.images[props.get('src')] = props.get('alt')
        if tag == 'meta' and props.get('name') == 'robots':
            self.robots = props.get('content', '')
        if tag == 'tr' and 'data-history-atlas-figure' in props:
            self.atlas_rows.add(props['data-history-atlas-figure'])
        if tag == 'section' and 'data-history-type-figures' in props:
            self.type_figures = props['data-history-type-figures']
        if tag == 'section' and props.get('id') in PROFILE_MODULES:
            self.profile_modules.append(props['id'])
            self.inside_references = props['id'] == 'references'
            if props['id'] in self.citation_titles:
                self.citation_section = props['id']
        if tag == 'table' and (name := props.get('aria-labelledby')) in ('core-facts-heading', 'cox-reference-heading', 'behavior-coding-heading'):
            self.profile_tables.append(name)
            self.active_table = name
            self.table_rows[name] = []
        if tag == 'tr' and self.active_table:
            self.row = []
            self.active_axis = props.get('data-history-axis')
            if self.active_axis:
                self.axis_rows.append(self.active_axis)
        if tag in ('td', 'th') and self.row is not None:
            self.cell = []
        if tag == 'a' and self.active_axis and re.fullmatch(r'#e[1-3]', props.get('href') or ''):
            self.evidence_by_axis.setdefault(self.active_axis, []).append(props['href'])
            if props['href'] == '#e1':
                self.linked_axes.append(self.active_axis)
        if tag == 'article' and re.fullmatch(r'e[1-9][0-9]*', props.get('id', '')):
            self.evidence_ids.add(props['id'])
        if tag == 'section' and props.get('id') == 'faq':
            self.inside_faq = True
        if tag == 'dt' and self.inside_faq:
            self.faq_questions += 1
        if tag == 'footer' and props.get('data-site-footer') == 'true':
            self.inside_footer = True
        if tag == 'script':
            self.script_id = props.get('id', '')

    def handle_endtag(self, tag):
        if tag == 'p':
            if self.standard_paragraph is not None:
                self.standard_paragraphs.append(''.join(self.standard_paragraph))
                self.standard_paragraph = None
            self.inside_synthesis = False
            self.inside_flagship_copy = False
        if tag == 'a':
            self.inside_portrait_credit = False
            if self.citation_link:
                href, parts = self.citation_link
                self.citation_titles[self.citation_section].append((href, ''.join(parts).strip()))
                self.citation_link = None
        if tag in ('th', 'td') and self.cell is not None:
            self.row.append(''.join(self.cell).strip())
            self.cell = None
        if tag == 'tr' and self.row is not None:
            self.table_rows[self.active_table].append(self.row)
            self.row = None
            self.active_axis = None
        if tag == 'table':
            self.active_table = None
        if tag == 'section':
            self.inside_references = False
            self.citation_section = None
            self.inside_faq = False
            self.inside_cox = False
        if tag == 'footer':
            self.inside_footer = False
        if tag == 'script':
            self.script_id = None

    def handle_data(self, data):
        if self.standard_paragraph is not None:
            self.standard_paragraph.append(data)
        if self.citation_link:
            self.citation_link[1].append(data)
        if self.inside_flagship_copy:
            self.flagship_copy.append(data)
        if self.inside_portrait_credit:
            self.portrait_credit.append(data)
        if self.inside_cox and self.script_id is None:
            self.cox_copy.append(data)
        if self.inside_synthesis:
            self.synthesis_copy.append(data)
        if self.inside_references:
            self.reference_copy.append(data)
        if self.script_id is None and self.cell is not None:
            self.cell.append(data)
        if self.script_id is None and re.search(r'你和他是同一型|你的隐藏超能力|你的隱藏超能力|Your hidden superpower|^再[测測]一次$|^Play again$', data):
            self.public_copy_conflicts.append(data)
        if self.inside_footer:
            self.footer_text.append(data)
        if self.script_id == 'world-edition-profile':
            self.person = json.loads(data)
        if self.script_id == 'history-atlas-data':
            self.structured = json.loads(data)


def get(origin, path):
    with urlopen(origin + path, timeout=45) as response:
        if response.status != 200:
            raise ValueError(f'HTTP {response.status}')
        return response.read().decode(), response.headers.get('X-Robots-Tag', '')


def main():
    cli = argparse.ArgumentParser()
    cli.add_argument('origin', help='Local Next server with NEXT_PUBLIC_SITE_URL=https://fermatmind.com')
    cli.add_argument('--schedule', type=Path, help='Use an evidence-backed schedule and retain wave assignment')
    cli.add_argument('--editorial-queue', type=Path, help='Assert three questions on source-checked profile pages')
    cli.add_argument('--max-portraits', type=int, help='Optional portrait subset for development checks')
    cli.add_argument('--output', type=Path)
    cli.add_argument('--standard-coverage', type=Path, help='Validate Tier 2 pages against the current diagnostic report')
    args = cli.parse_args()
    origin = args.origin.rstrip('/')
    if urlsplit(origin).hostname not in ('127.0.0.1', 'localhost', '::1'):
        cli.error('Preview checks require a loopback URL')
    root = Path(__file__).resolve().parents[2]
    source = root / 'lib/entertainment/global-history'
    roster = json.loads((source / 'people.json').read_text())
    by_slug = {row['id']: row for row in roster}
    estimates = {row['person_id']: row for row in json.loads((source / 'cox-estimates.json').read_text())['entries'].values()}
    axis_map = json.loads((source / 'decision-evidence-axes.json').read_text())
    flagships = json.loads((source / 'flagship-profiles-content.json').read_text())
    standards = json.loads((source / 'standard-profiles-content.json').read_text())
    standard_records = {row['slug']: row for row in json.loads(args.standard_coverage.read_text())['records']} if args.standard_coverage else {}
    if args.standard_coverage and set(standards) != {slug for slug, row in standard_records.items() if row['upgraded'] and row['passed']}:
        cli.error('Tier 2 coverage report is stale or contains failed upgrades')
    ordered = (json.loads(args.schedule.read_text())['people'] if args.schedule
        else [{'slug': row['id'], 'wave': None} for row in roster])
    reviewed = {row['slug']: row['verifiedDecisionLocator']['url']
                for row in map(json.loads, args.editorial_queue.read_text().splitlines())
                if row['status'] == 'source-checked'} if args.editorial_queue else {}
    tasks = [(locale, kind, slug, None) for locale in LOCALES
             for kind, slug in [('entry', ''), ('atlas', 'personality-atlas'), ('atlas', 'cox-1926')]]
    tasks += [(locale, 'portrait', row['slug'], row['wave']) for row in ordered[:args.max_portraits] for locale in LOCALES]
    tasks += [(locale, 'mbti', type_code, None) for locale in LOCALES for type_code in TYPES]
    tasks += [('en', 'iq', '', None)]
    tasks += [(locale, 'take', '', None) for locale in LOCALES]

    def check(task):
        locale, kind, slug, wave = task
        suffix = {'entry': ENTRY, 'atlas': ENTRY + '/' + slug, 'portrait': ENTRY + '/results/' + slug,
                  'mbti': '/personality/' + slug, 'iq': '/tests/iq-test-intelligence-quotient-assessment', 'take': ENTRY + '/take'}[kind]
        path = '/' + locale + suffix
        try:
            html, robots_header = get(origin, path)
            page = Document()
            page.feed(html)
            if kind in ('entry', 'portrait', 'atlas', 'take'):
                assert page.main_landmarks == 1, f'main landmarks: {page.main_landmarks}'
            if kind == 'take':
                return {'path':path, 'kind':kind, 'wave':wave, 'status':'pass'}
            assert re.search(r'©\s*\d{4}\s*FermatMind\b', ''.join(page.footer_text)), 'footer brand'
            if kind in ('entry', 'portrait', 'atlas'):
                assert page.alternates.get('canonical') == SITE + path, 'canonical'
                assert all(page.alternates.get(lang) == SITE + '/' + code + suffix for code, lang in LOCALES.items()), 'hreflang'
                assert 'noindex' not in (page.robots + robots_header), 'robots'
            if kind == 'atlas':
                expected = set(by_slug) if slug == 'personality-atlas' else set(estimates)
                assert page.atlas_rows == expected, f'atlas rows: {len(page.atlas_rows)}/{len(expected)}'
                types = {node['@type'] for node in page.structured['@graph']}
                assert types == ({'ItemList', 'Dataset'} if slug == 'cox-1926' else {'ItemList'}), 'atlas schema'
            if kind == 'portrait':
                assert page.has_public_result and not page.public_copy_conflicts, 'public result state'
                image = f'/images/global-history/{slug}.jpg'
                assert page.person['@type'] == 'Person' and f"https://www.wikidata.org/wiki/{by_slug[slug]['qid']}" in page.person['sameAs'], 'Wikidata'
                assert page.person['image'] == SITE + image and page.images.get(image), 'portrait image or alt'
                assert re.search(r'\b[EI][NS][FT][JP]\b', page.images[image]) and 'FermatMind' in page.images[image], 'semantic portrait alt'
                assert '/' + locale + ENTRY in page.links, 'entry backlink'
                assert any(re.fullmatch(r'/' + locale + r'/personality/[ei][ns][ft][jp]', link or '') for link in page.links), 'MBTI backlink'
                assert any(link and link.startswith('/' + locale + ENTRY + '/results/') and link != path for link in page.links), 'related portrait link'
                assert page.profile_modules == PROFILE_MODULES, 'profile module sequence'
                table_order = ['core-facts-heading', 'behavior-coding-heading']
                if slug in estimates:
                    table_order.insert(1, 'cox-reference-heading')
                assert page.profile_tables == table_order, 'profile tables'
                assert page.axis_rows == AXES, 'behavior axis rows'
                flagship = flagships.get(slug)
                first_axes = flagship['episodes'][0]['axes'] if flagship else axis_map[slug]
                assert 'e1' in page.evidence_ids and page.linked_axes == [axis for axis in AXES if axis in first_axes], 'incorrect linked evidence'
                if flagship:
                    assert page.evidence_ids == {f'e{index + 1}' for index in range(len(flagship['episodes']))}, 'flagship evidence count'
                    assert page.faq_questions == 4, 'flagship FAQ count'
                    expected_map = {axis: [f'#e{index + 1}' for index, episode in enumerate(flagship['episodes'])
                                           if axis in episode['axes']] for axis in AXES}
                    assert page.evidence_by_axis == {axis: refs for axis, refs in expected_map.items() if refs}, 'flagship evidence links'
                    synthesis = ''.join(page.synthesis_copy)
                    expected_numbers = set(range(1, 1 + len(flagship['episodes'])))
                    assert {int(n) for n in re.findall(r'\[E([1-3])\]', synthesis)} == expected_numbers, 'flagship synthesis evidence numbers'
                    axis_labels = dict(zip(AXES, [row[0] for row in page.table_rows['behavior-coding-heading'][1:]], strict=True))
                    assert all(axis_labels[axis] in synthesis for axis, refs in expected_map.items() if refs), 'flagship synthesis dimensions'
                    if slug == 'isaac-newton':
                        assert 'This episode is most relevant' not in synthesis, 'obsolete Newton synthesis'
                    if slug == 'li-bai':
                        assert not any('treccani.it' in link for link in page.references), 'unused Li Bai supplementary reference'
                        assert not re.match(r'^(?:亚洲|亞洲|Asia)\s*·', page.table_rows['core-facts-heading'][4][1]), 'redundant Li Bai geography'
                    assert all(page.references.count(item['source']['url']) == 1 for item in flagship['evidence']), 'flagship citations in references'
                    assert page.references.count(flagship['alternative']['url']) == 1, 'flagship alternative citation in references'
                    expected_alternative = (flagship['alternative']['url'], flagship['alternative']['title'][locale])
                    assert expected_alternative in page.citation_titles['alternative-readings'], 'M6 localized title'
                    assert expected_alternative in page.citation_titles['references'], 'M9 localized alternative title'
                    for entries in page.citation_titles.values():
                        for _, title in entries:
                            has_han = any('CJK UNIFIED IDEOGRAPH' in unicodedata.name(char, '') for char in title)
                            assert title and has_han == (locale != 'en'), f'citation title language: {title}'
                    if locale == 'en':
                        assert not any('CJK UNIFIED IDEOGRAPH' in unicodedata.name(char, '')
                                       for char in ''.join(page.reference_copy)), 'English M9 contains Han characters'
                    assert not re.search(r'Supplementary reference|补充参考资料|補充參考資料',
                                         ' '.join(page.reference_copy), re.I), 'flagship placeholder reference'
                    assert 'data-history-flagship="true"' in html, 'flagship narrative marker'
                    if locale == 'zh-TW':
                        assert page.flagship_copy and not re.search(r'[“”‘’]', ''.join(page.flagship_copy)), 'flagship Traditional Chinese quotation marks'
                standard = standards.get(slug)
                if standard:
                    assert page.standard_paragraphs == standard['narrative'][locale].split('\n\n'), 'missing or altered Tier 2 narrative'
                    assert page.faq_questions == 3 and page.evidence_ids == {'e1'}, 'Tier 2 decision and FAQ counts'
                    assert not page.citation_titles['alternative-readings'], 'unverified Tier 2 alternative'
                    assert not re.search(r'Supplementary reference|补充参考资料|補充參考資料',
                                         ' '.join(page.reference_copy), re.I), 'Tier 2 placeholder reference'
                    for _, title in page.citation_titles['references']:
                        has_han = any('CJK UNIFIED IDEOGRAPH' in unicodedata.name(char, '') for char in title)
                        assert title and has_han == (locale != 'en'), f'Tier 2 citation title language: {title}'
                    if slug in standard_records:
                        assert page.references.count(standard_records[slug]['source']) == 1, 'missing Tier 2 decision reference'
                if (record := standard_records.get(slug)) and record['cox'] in ('in-window-not-listed', 'outside-birth-window'):
                    outside_window = record['cox'] == 'outside-birth-window'
                    expected = {'zh': '范围之外', 'zh-TW': '範圍以外', 'en': 'outside the study’s'} if outside_window else {
                        'zh': '范围内', 'zh-TW': '範圍內', 'en': 'within 1450–1850'
                    }
                    assert expected[locale] in ''.join(page.cox_copy), f"Tier 2 Cox distinction: {record['cox']}"
                if slug == 'charles-dickens':
                    license_labels = {'zh': '公有领域', 'zh-TW': '公有領域', 'en': 'Public domain'}
                    assert ''.join(page.portrait_credit).endswith(license_labels[locale]), 'localized public domain portrait credit'
                if slug == 'william-shakespeare':
                    listed = ''.join(page.cox_copy)
                    evidence_limit = {'zh': '早年资料不足', 'zh-TW': '早年資料不足', 'en': 'insufficient evidence about his early years'}
                    assert evidence_limit[locale] in listed and '12A' in listed, 'Cox listed without an estimate'
                    assert 'cox-reference-heading' not in page.profile_tables, 'unexpected Shakespeare Cox estimate table'
                if slug in {'kartini', 'ahmad-baba-al-timbukti', 'aristotle', 'xu-xiake'}:
                    omitted = ''.join(page.cox_copy)
                    if slug in {'kartini', 'aristotle'}:
                        expected = {'zh': '范围之外', 'zh-TW': '範圍以外', 'en': 'outside the study’s'}
                    else:
                        expected = {'zh': '范围内', 'zh-TW': '範圍內', 'en': 'within 1450–1850'}
                    assert expected[locale] in omitted, 'Cox birth window coverage explanation'
                behavior = page.table_rows['behavior-coding-heading'][1:]
                assert [row[2] for row in behavior] == [f'{score} / 6' for score in by_slug[slug]['vector']], 'behavior values'
                if slug in estimates:
                    row = estimates[slug]
                    cox_data = page.table_rows['cox-reference-heading'][1:]
                    expected_cells = [
                        [f"{row['table']} · {row['sheet_row']}"], [f"{row['group']} · {row['rank']}"],
                        [str(row['ai']), str(row['aii'])], [f"±{row['ai_pe']}", f"±{row['aii_pe']}"],
                        [str(row['ai_grade']), str(row['aii_grade'])],
                        [f"{row['ai_reliability']:.2f}", f"{row['aii_reliability']:.2f}"],
                        [str(row['childhood_corrected']), str(row['youth_corrected'])],
                    ]
                    assert [cells[1:] for cells in cox_data[:-1]] == expected_cells and len(cox_data[-1]) == 2, 'Cox values or method limits'
                assert '#references' in page.links, 'missing citation jump'
                assert 2 <= page.faq_questions <= 4, 'FAQ count'
                if slug in reviewed:
                    assert page.faq_questions == (4 if 'e2' in page.evidence_ids else 3), 'reviewed profile FAQ count'
                    assert reviewed[slug] in page.links, 'decision citation link'
                assert '/' + locale + ENTRY + '/personality-atlas' in page.links and '/' + locale + ENTRY + '/cox-1926' in page.links, 'atlas backlinks'
            if kind == 'mbti':
                assert page.type_figures == slug.upper(), 'history figure section'
                assert '/' + locale + ENTRY + f'/personality-atlas?type={slug.upper()}#atlas-rows' in page.links, 'filtered atlas link'
            if kind == 'iq':
                assert '/en' + ENTRY + '/cox-1926' in page.links, 'Cox archive link'
            return {'path':path, 'kind':kind, 'wave':wave, 'status':'pass'}
        except Exception as exc:
            return {'path':path, 'kind':kind, 'wave':wave, 'status':'fail', 'reason':str(exc)}

    with ThreadPoolExecutor(6) as pool:
        results = list(pool.map(check, tasks))
    sitemap_status = {}
    try:
        sitemap, _ = get(origin, '/sitemap.xml')
        contained = {url for url in re.findall(r'<loc>([^<]+)</loc>', sitemap) if ENTRY in url}
        suffixes = ['', '/personality-atlas', '/cox-1926', *('/results/' + slug for slug in by_slug)]
        expected = {f'{SITE}/{locale}{ENTRY}{suffix}' for locale in LOCALES for suffix in suffixes}
        sitemap_status = {'count': len(contained), 'expected': len(expected), 'pass': contained == expected,
                          'missing': sorted(expected - contained), 'unexpected': sorted(contained - expected)}
    except HTTPError as exc:
        sitemap_status = {'pass': False, 'status': exc.code}
    report = {'routes':results, 'sitemap':sitemap_status}
    if args.output:
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(Counter((r['kind'], r['status']) for r in results), 'sitemap', sitemap_status)
    for row in [r for r in results if r['status'] == 'fail'][:20]:
        print(row)
    return int(any(r['status'] == 'fail' for r in results) or not sitemap_status['pass'])


if __name__ == '__main__':
    raise SystemExit(main())
