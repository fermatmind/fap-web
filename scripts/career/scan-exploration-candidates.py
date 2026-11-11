#!/usr/bin/env python3
"""Read-only Career exploration audit. Supply an O*NET 31.0 Career Interest Types CSV."""
import argparse
import collections
import concurrent.futures
import csv
import gzip
import hashlib
import json
import math
from pathlib import Path
import re
import threading
import time
import urllib.error
import urllib.request

LETTERS = 'RIASEC'
TOPICS = tuple(LETTERS) + ('ARI', 'AC', 'RC', 'RCI', 'SI', 'RIC', 'IRC', 'ECS', 'CE')
MBTI_TYPES = 'INTJ INTP ENTJ ENTP INFJ INFP ENFJ ENFP ISTJ ISFJ ESTJ ESFJ ISTP ISFP ESTP ESFP'.split()
API = 'https://api.fermatmind.com/api/v0.5/career'
ONET_CODE = re.compile(r'^\d{2}-\d{4}\.\d{2}$')
SOC_CODE = re.compile(r'^\d{2}-\d{4}$')
ONET_PROFILE = re.compile(r'^https://(?:www\.)?onetonline\.org/link/(?:summary|details|custom)/(\d{2}-\d{4}\.\d{2})(?:[/?#]|$)')
READY = 'eligible'
ONET_31_SHA256 = '19f452d51b81a4d59389b500f85baf252563858f596124fe446dd436a9f41206'


def read_json(path):
    return json.loads(path.read_text())


def package(manifest_path):
    manifest = read_json(manifest_path)
    by_slug = collections.defaultdict(dict)
    for entry in manifest['files']:
        slug, locale = entry['canonical_slug'], entry['locale']
        if locale not in ('en', 'zh-CN'):
            continue
        if (not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug)
                or entry['path'] != f'careers/{slug}/{locale}.json' or locale in by_slug[slug]):
            raise ValueError(f'invalid or duplicate manifest entry: {slug}/{locale}')
        by_slug[slug][locale] = entry
    if len(by_slug) != 1046 or any(set(entries) != {'en', 'zh-CN'} for entries in by_slug.values()):
        raise ValueError('expected all 1,046 Career identities with both locales')
    return manifest, dict(sorted(by_slug.items()))


def interest_table(path):
    vectors, codes = collections.defaultdict(dict), collections.defaultdict(dict)
    with path.open(newline='', encoding='utf-8-sig') as file:
        for row in csv.DictReader(file):
            code = row['O*NET-SOC Code']
            element = row['Element ID']
            scale = row['Scale ID']
            if not ONET_CODE.fullmatch(code) or not element.startswith('1.B.1.') or len(element) != 7:
                raise ValueError(f'unexpected O*NET row: {code}/{element}')
            index = ord(element[-1]) - ord('a')
            if scale == 'OI' and 0 <= index < 6:
                value = float(row['Data Value'])
                if not 1 <= value <= 7 or index in vectors[code]:
                    raise ValueError(f'invalid or duplicate interest dimension: {code}/{element}')
                vectors[code][index] = value
            elif scale == 'IH' and 6 <= index <= 8:
                value = float(row['Data Value'])
                if not value.is_integer() or not 0 <= value <= 6 or index in codes[code]:
                    raise ValueError(f'invalid or duplicate interest high point: {code}/{element}')
                codes[code][index] = LETTERS[int(value) - 1] if value else ''
            else:
                raise ValueError(f'unexpected O*NET scale: {code}/{element}/{scale}')
    return {
        code: (tuple(vector[i] for i in range(6)), ''.join(codes[code][i] for i in range(6, 9)))
        for code, vector in vectors.items() if len(vector) == 6 and len(codes[code]) == 3
    }


def body_evidence(content):
    items = [item for block in content.get('blocks', []) if block.get('availability') == 'available'
             for item in block['items'] if item.get('availability') == 'available']
    task_items = [item for item in items if item['copy_key'] == 'career.item.responsibilities-block']
    refs = {ref for item in task_items for ref in item.get('source_refs', [])}
    codes = set()
    for item in items:
        if item['type'] != 'sources':
            continue
        for source in item['data']['entries']:
            match = ONET_PROFILE.match(source.get('url') or '')
            if match and source['id'] in refs:
                codes.add(match[1])
    return {
        'body_codes': sorted(codes),
        'has_tasks': any(item['data'].get('entries') for item in task_items),
    }


def fetch_snapshot(slugs, path):
    lock = threading.Lock()
    next_start = 0.0

    def get_json(url):
        nonlocal next_start
        with lock:
            now = time.monotonic()
            delay = max(0.0, next_start - now)
            next_start = now + delay + 0.25
        time.sleep(delay)
        request = urllib.request.Request(url, headers={
            'Accept': 'application/json', 'Accept-Encoding': 'gzip',
            'User-Agent': 'FermatMind-Career-Exploration-Audit/1.0',
        })
        with urllib.request.urlopen(request, timeout=18) as response:
            if response.headers.get('Content-Encoding') == 'gzip':
                with gzip.GzipFile(fileobj=response) as body:
                    return json.load(body)
            return json.load(response)

    def get(slug):
        url = f'{API}/jobs/{slug}?locale=en&projection_contract=career.detail.page.v1'
        for attempt in range(2):
            try:
                bundle = get_json(url)
                page = bundle['career_page']
                if (bundle.get('bundle_kind') != 'career_job_detail'
                        or bundle.get('bundle_version') != 'career.detail.page.v1'
                        or bundle['identity']['canonical_slug'] != slug
                        or bundle['seo_contract']['canonical_path'] != f'/en/career/jobs/{slug}'
                        or page['subject']['canonical_slug'] != slug
                        or page['locale'] != 'en'
                        or bundle['seo_contract']['metadata_fingerprint'] != page['source_content_sha256']):
                    return slug, {'status': 'invalid_authority'}
                return slug, {
                    'status': 'read', 'body_sha256': page['source_content_sha256'],
                    'crosswalks': [[row['source_system'], row['source_code'], row['mapping_type']]
                                   for row in bundle.get('ontology', {}).get('crosswalks', [])],
                    **body_evidence(page['content']),
                }
            except urllib.error.HTTPError as error:
                if error.code == 404 or (error.code < 500 and error.code != 429):
                    return slug, {'status': f'http_{error.code}'}
            except (OSError, TimeoutError):
                pass
            except (KeyError, TypeError, ValueError):
                return slug, {'status': 'invalid_authority'}
            if attempt == 0:
                time.sleep(2)
        return slug, {'status': 'unavailable'}

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows = dict(pool.map(get, slugs))
        mbti = {}
        for subject in MBTI_TYPES:
            for locale in ('en', 'zh-CN'):
                try:
                    payload = get_json(f'{API}/recommendations/mbti/{subject.lower()}?locale={locale}')
                    mbti[f'{subject}/{locale}'] = [row['canonical_slug'] for row in payload['matched_jobs']]
                except (OSError, ValueError, KeyError, TypeError):
                    mbti[f'{subject}/{locale}'] = None
    snapshot = {'career': rows, 'mbti': mbti}
    path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    return snapshot


def classify(row, entries, scope, interests, manifest_dir):
    if row['status'] != 'read':
        return row['status'], None
    if row['body_sha256'] != entries['en']['source_content_sha256']:
        return 'production_manifest_mismatch', None
    if scope is not None:
        return 'combined_or_scoped_identity', None
    onet = [entry for entry in row['crosswalks'] if entry[0] == 'onet_soc_2019']
    soc = [entry[1] for entry in row['crosswalks'] if entry[0] == 'us_soc' and entry[2] == 'direct_match']
    if not onet:
        return 'no_onet_mapping', None
    if len(onet) != 1 or not ONET_CODE.fullmatch(onet[0][1]):
        return 'mapping_conflict', None
    code = onet[0][1]
    if soc and any(not SOC_CODE.fullmatch(value) or code[:7] != value for value in soc):
        return 'mapping_conflict', code
    if row['body_codes'] and row['body_codes'] != [code]:
        return 'mapping_conflict', code
    if onet[0][2] != 'direct_match':
        return 'unconfirmed_mapping', code
    if code not in interests:
        return 'no_complete_onet_vector', code
    if not row['has_tasks'] or row['body_codes'] != [code]:
        return 'insufficient_task_evidence', code
    zh = entries['zh-CN']
    zh_bytes = (manifest_dir / zh['path']).read_bytes()
    if hashlib.sha256(zh_bytes).hexdigest() != zh['sha256']:
        return 'manifest_file_mismatch', code
    evidence = body_evidence(json.loads(zh_bytes))
    if evidence['body_codes'] and evidence['body_codes'] != [code]:
        return 'mapping_conflict', code
    if not evidence['has_tasks'] or evidence['body_codes'] != [code]:
        return 'insufficient_task_evidence', code
    return READY, code


def similarity(topic, vector):
    # Fixed exploration priorities for sorting within an interest topic, not a person score.
    weights = tuple(3 - topic.index(letter) if letter in topic else 0 for letter in LETTERS)
    return round(sum(weight * (value - 1) for weight, value in zip(weights, vector))
                 / (math.hypot(*weights) * math.hypot(*(value - 1 for value in vector))), 6)


def audit(manifest, entries, interests, snapshot, manifest_dir):
    if set(snapshot['career']) != set(entries):
        raise ValueError('snapshot identities differ from the current Career manifest')
    jobs = {}
    for slug, locales in entries.items():
        reason, code = classify(snapshot['career'][slug], locales, manifest['identity_scopes'].get(slug),
                                interests, manifest_dir)
        jobs[slug] = {'status': reason, 'onet_code': code}
        if code in interests:
            jobs[slug]['interest_code'] = interests[code][1]
    eligible = {slug: row for slug, row in jobs.items() if row['status'] == READY}
    topics = {}
    for topic in TOPICS:
        exact, related = [], []
        for slug, row in eligible.items():
            vector, code = interests[row['onet_code']]
            primary_match = code.startswith(topic) if len(topic) == 1 else code == topic
            if primary_match:
                exact.append(slug)
            elif set(topic) <= set(code):
                related.append(slug)
        def sort_key(slug):
            return -similarity(topic, interests[eligible[slug]['onet_code']][0]), slug
        topics[topic] = {'exact': sorted(exact, key=sort_key), 'related': sorted(related, key=sort_key)}
    by_topic_set = collections.Counter(
        tuple(sorted(result['exact'])) for result in topics.values() if result['exact']
    )
    for result in topics.values():
        signature = tuple(sorted(result['exact']))
        reason = 'missing_exact_evidence' if not signature else (
            'duplicate_occupation_set' if by_topic_set[signature] > 1 else None
        )
        result.update(status='hold' if reason else READY, reasons=[reason] if reason else [])
    by_signature = collections.defaultdict(set)
    for key, slugs in snapshot['mbti'].items():
        if slugs:
            by_signature[tuple(sorted(set(slugs)))].add(key.split('/')[0])
    mbti = {}
    for subject in MBTI_TYPES:
        en = snapshot['mbti'].get(f'{subject}/en')
        zh = snapshot['mbti'].get(f'{subject}/zh-CN')
        reasons = ['no_validated_type_to_interest_model']
        if not en or not zh:
            reasons.append('missing_candidates')
        elif set(en) != set(zh):
            reasons.append('locale_mismatch')
        if en and len(by_signature[tuple(sorted(set(en)))]) > 1:
            reasons.append('duplicate_occupation_set')
        mbti[subject] = {'status': 'hold', 'reasons': reasons}
    return {
        'manifest_sha256': manifest['aggregate_sha256'],
        'occupations': len(jobs),
        'status_counts': dict(collections.Counter(row['status'] for row in jobs.values())),
        'official_complete_vectors': len(interests),
        'mbti_distinct_candidate_sets': len(by_signature),
        'mbti': mbti, 'interest_topics': topics, 'careers': jobs,
    }


def interest_release(report, entries, manifest_dir):
    """Project the validated data into the bilingual public interest reader."""
    topics = {
        code.lower(): {group: result[group] for group in ('exact', 'related')}
        for code, result in report['interest_topics'].items() if result['status'] == READY
    }
    published_slugs = {slug for topic in topics.values() for group in topic.values() for slug in group}
    careers = {}
    for slug in sorted(published_slugs):
        candidate = report['careers'][slug]
        if candidate['status'] != READY:
            raise ValueError(f'ineligible release candidate: {slug}')
        copy = {}
        for key, locale in (('en', 'en'), ('zh', 'zh-CN')):
            entry = entries[slug][locale]
            data = (manifest_dir / entry['path']).read_bytes()
            if hashlib.sha256(data).hexdigest() != entry['sha256']:
                raise ValueError(f'manifest file mismatch: {slug}/{locale}')
            subject = json.loads(data)['subject']
            if (subject['canonical_slug'] != slug or not subject['name'].strip()
                    or not subject['summary'].strip()):
                raise ValueError(f'incomplete public summary: {slug}/{locale}')
            copy[key] = {field: subject[field] for field in ('name', 'summary')}
        careers[slug] = {
            'onet': candidate['onet_code'], 'interest': candidate['interest_code'], 'copy': copy,
        }
    return {'sourceManifestSha256': report['manifest_sha256'], 'careers': careers, 'topics': topics}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--onet', type=Path, required=True)
    parser.add_argument('--snapshot', type=Path, required=True, help='existing snapshot or new destination with --fetch')
    parser.add_argument('--fetch', action='store_true', help='read public production once, then save reduced evidence for offline re-runs')
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--interest-release', type=Path, help='export the eligible bilingual interest reader data')
    args = parser.parse_args()
    manifest, entries = package(args.manifest)
    onet_digest = hashlib.sha256(args.onet.read_bytes()).hexdigest()
    if onet_digest != ONET_31_SHA256:
        parser.error('expected the original O*NET 31.0 Career Interest Types CSV')
    interests = interest_table(args.onet)
    if args.fetch and args.snapshot.exists():
        parser.error('--fetch requires a new snapshot path')
    snapshot = fetch_snapshot(entries, args.snapshot) if args.fetch else read_json(args.snapshot)
    report = audit(manifest, entries, interests, snapshot, args.manifest.parent)
    report['onet_csv_sha256'] = onet_digest
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    if args.interest_release:
        release = interest_release(report, entries, args.manifest.parent)
        args.interest_release.write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({
        'occupations': report['occupations'], 'status_counts': report['status_counts'],
        'mbti_distinct_candidate_sets': report['mbti_distinct_candidate_sets'],
        'mbti_eligible_types': 0, 'holland_topics': {
            topic: {**{key: len(result[key]) for key in ('exact', 'related')}, 'status': result['status']}
            for topic, result in report['interest_topics'].items()
        },
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
