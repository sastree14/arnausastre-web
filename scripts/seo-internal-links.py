#!/usr/bin/env python3
"""Read-only audit of internal links on every indexed SC-Analytics page.

Standard library only. No API keys, external link fetching, or paid services.
Outputs JSON. Exit status 1 if reachable pages have broken internal links.
Run: python3 scripts/seo-internal-links.py
"""
import concurrent.futures
import html.parser
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict

ORIGIN = os.environ.get("SEO_AUDIT_BASE_URL", "https://www.sc-analytics.io").rstrip("/")
MAX_WORKERS = 5
USER_AGENT = "SC-Analytics-Link-Audit/1.0"
EXCLUDED_PREFIXES = ("/api/", "/_next/", "/growth-admin/")

class LinkParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "a":
            href = dict(attrs).get("href")
            if href:
                self.hrefs.append(href)

def fetch(url):
    last_error = None
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=25) as resp:
                body = resp.read(1200000).decode("utf-8", "replace")
                return {"status": resp.status, "body": body, "effective": resp.geturl()}
        except urllib.error.HTTPError as exc:
            return {"status": exc.code, "body": "", "effective": url}
        except Exception as exc:
            last_error = str(exc)
    return {"status": None, "body": "", "effective": url, "error": last_error}

def normalize_url(href):
    url = urllib.parse.urljoin(ORIGIN + "/", href)
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != "https" or parts.netloc != urllib.parse.urlsplit(ORIGIN).netloc:
        return None
    if parts.path.startswith(EXCLUDED_PREFIXES):
        return None
    # Query-string variants of a page are intentionally consolidated through
    # canonicals; this test verifies that their underlying page exists.
    return ORIGIN + (parts.path.rstrip("/") or "/")

def scan_page(url):
    result = fetch(url)
    if result["status"] != 200:
        return url, result["status"], []
    parser = LinkParser()
    parser.feed(result["body"])
    return url, result["status"], list(set(filter(None, (normalize_url(href) for href in parser.hrefs))))

def main():
    xml = fetch(ORIGIN + "/sitemap.xml")
    if xml["status"] != 200:
        raise RuntimeError("Sitemap unreachable: " + str(xml["status"]))
    root = ET.fromstring(xml["body"])
    pages = [el.text for el in root.iter() if el.tag.endswith("loc") and el.text]

    sources = defaultdict(list)
    page_errors = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        for page, status, links in pool.map(scan_page, pages):
            if status != 200:
                page_errors.append({"url": page, "status": status})
            for link in links:
                sources[link].append(page)

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        checked = list(zip(sources, pool.map(fetch, sources)))

    broken = [
        {"url": url, "status": result["status"], "linked_from": source[:5], "source_count": len(source)}
        for (url, result), source in ((pair, sources[pair[0]]) for pair in checked)
        if result["status"] != 200
    ]
    output = {
        "origin": ORIGIN,
        "sitemap_pages": len(pages),
        "unique_internal_destinations": len(sources),
        "pages_failed": page_errors,
        "broken_count": len(broken),
        "broken": broken,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if broken or page_errors:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
