"""Probe editorial source links for transport errors and HTML challenge pages."""
import argparse
import csv
import json
import re
import socket
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import BoundedSemaphore
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen


def audit(url, host_gate):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username:
        return '', 'replace-invalid-url', ''
    if re.search(r'(^|/)~[^/]+', parsed.path):
        return '', 'replace-transient-directory', ''
    if parsed.hostname.removeprefix('www.') == 'ctext.org':
        return '', 'replace-challenged-host', ''
    if parsed.hostname == 'old.maa.org':
        return '', 'replace-retired-host', ''
    with host_gate[parsed.hostname]:
        try:
            encoded = parsed._replace(
                path=quote(parsed.path, safe="/%:@!$&'()*+,;="),
                query=quote(parsed.query, safe="%:/?@!$&'()*+,;="),
                fragment='',
            ).geturl()
            request = Request(encoded, headers={'User-Agent': 'FermatMind editorial citation audit (https://fermatmind.com)'})
            with urlopen(request, timeout=9) as response:
                if response.headers.get_content_type() == 'text/html':
                    body = response.read(131072).decode('utf-8', 'ignore')
                    if (response.headers.get('cf-mitigated') == 'challenge' or
                        re.search(r'<title>\s*(?:just a moment|attention required|access denied|verify (?:you|that))|/cdn-cgi/challenge-platform|cf-turnstile(?:-response)?[\s\"<]|attention llms|id=["\']challenge-(?:form|running)', body, re.I)):
                        return response.status, 'browser-recheck-challenge', response.geturl()
                    if len(body.strip()) < 500:
                        return response.status, 'browser-recheck-short-body', response.geturl()
                return response.status, 'reachable', response.geturl()
        except HTTPError as error:
            status = error.code
            if status in (404, 410, 504, 521):
                return status, 'replace-dead-link', error.geturl()
            if status in (403, 429, 503):
                return status, 'browser-recheck-possible-throttle', error.geturl()
            return status, 'browser-recheck-http', error.geturl()
        except URLError as error:
            if isinstance(error.reason, socket.gaierror) and error.reason.errno == socket.EAI_NONAME:
                return '', 'replace-dns', ''
            return '', 'browser-recheck-network', ''
        except (TimeoutError, OSError):
            return '', 'browser-recheck-network', ''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('queue', type=Path, help='NDJSON with slug, wave and existingSource')
    parser.add_argument('output', type=Path)
    parser.add_argument('--decision-sources', action='store_true', help='Audit the reviewed decision citations')
    args = parser.parse_args()
    rows = [json.loads(line) for line in args.queue.read_text().splitlines()]
    if args.decision_sources:
        if any(not (row.get('verifiedDecisionLocator') or {}).get('url') for row in rows):
            parser.error('Every row must have a reviewed decision citation')
        for row in rows:
            row['source'] = row['verifiedDecisionLocator']['url']
    else:
        for row in rows:
            row['source'] = row['existingSource']
    urls = list(dict.fromkeys(row['source'] for row in rows))
    host_gate = defaultdict(lambda: BoundedSemaphore(2))
    with ThreadPoolExecutor(12) as pool:
        evidence = dict(zip(urls, pool.map(lambda url: audit(url, host_gate), urls)))
    with args.output.open('w', encoding='utf-8-sig', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['slug', 'wave', 'source', 'status', 'decision', 'resolvedUrl'])
        for row in rows:
            url = row['source']
            writer.writerow([row['slug'], row['wave'], url, *evidence[url]])
    for wave in sorted({row['wave'] for row in rows}):
        by_status = Counter(evidence[row['source']][1] for row in rows if row['wave'] == wave)
        print(f'Wave {wave}: {dict(by_status)}')


if __name__ == '__main__':
    main()
