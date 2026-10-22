"""Low-volume, robots-aware competitor page structure audit (no SERP scraping).

Collects only page metadata and structural signals. Never copies competitor
copy or pretends website order corresponds to Google's ranking.
"""
from __future__ import annotations

from html.parser import HTMLParser
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
from datetime import datetime, timezone
import requests

USER_AGENT = "SCAnalytics-ResearchBot/1.0 (+https://www.sc-analytics.io/contact)"
SOURCES = (
    ("MERIDIAN Data & IA", "https://meridiandata.es/"),
    ("Aureliox", "https://www.aureliox.digital/"),
    ("Todoesdata", "https://todoesdata.com/"),
    ("MB Soluciones", "https://mbsoluciones.es/business-intelligence-pymes"),
    ("ConsultorIA Forecasting", "https://www.consultoriaconia.com/servicios/analisis-predictivo"),
    ("Technova Partners IA", "https://technovapartners.com/es/services/data-ai/consultoria-ia"),
)
ALLOW_HOSTS = frozenset(urlparse(url).hostname for _, url in SOURCES)


class PageStructure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.h1 = ""
        self._capture = ""
        self.faq_headings = 0
        self.links_to_cases = 0
        self.section_headings = 0

    def handle_starttag(self, tag: str, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name", "").lower() == "description":
            self.description = (attrs.get("content") or "")[:150]
        if tag in ("title", "h1"):
            self._capture = tag
        if tag in ("h2", "h3"):
            self.section_headings += 1
        if tag == "a":
            href = str(attrs.get("href") or "").lower()
            if any(term in href for term in ("/case", "/proyectos", "/casos", "/projects", "/portfolio")):
                self.links_to_cases += 1

    def handle_endtag(self, tag: str):
        if tag == self._capture:
            self._capture = ""

    def handle_data(self, data: str):
        if self._capture == "title":
            self.title += data[:160]
        elif self._capture == "h1":
            self.h1 += data[:160]


def research_competitor_pages(
    sources: tuple[tuple[str, str], ...] = SOURCES,
    requester=requests.get,
    robot_factory=RobotFileParser,
) -> list[dict]:
    output = []
    now = datetime.now(timezone.utc).isoformat()
    for name, url in sources[:6]:
        host = urlparse(url).hostname
        if host not in ALLOW_HOSTS or not url.startswith("https://"):
            output.append({"name": name, "url": url, "status": "not_allowlisted"})
            continue
        robots_url = "https://" + host + "/robots.txt"
        robots = robot_factory()
        robots.set_url(robots_url)
        try:
            robots.read()
            # RobotFileParser.read() may treat HTTP errors as permissive.
            # Avoid crawling if robots retrieval isn't known to be successful.
            robot_response = requester(robots_url, headers={"User-Agent": USER_AGENT}, timeout=9)
            if robot_response.status_code != 200 or not robots.can_fetch(USER_AGENT, url):
                output.append({"name": name, "url": url, "status": "robots_blocked_or_unavailable"})
                continue
            response = requester(url, headers={"User-Agent": USER_AGENT}, timeout=12, allow_redirects=False)
            if response.status_code != 200 or len(response.content) > 900_000:
                output.append({"name": name, "url": url, "status": "unavailable"})
                continue
            # Several Spanish sites serve UTF-8 without a charset header.
            # requests.text can decode those as ISO-8859-1 and corrupt h1s.
            try:
                html = response.content.decode("utf-8")
            except UnicodeDecodeError:
                html = response.text
            structure = PageStructure()
            structure.feed(html)
            output.append({
                "name": name, "url": url, "status": "observed",
                "observed_at": now,
                "title": structure.title.strip()[:150],
                "h1": structure.h1.strip()[:150],
                "description_length": len(structure.description),
                "section_headings": structure.section_headings,
                "links_to_cases": structure.links_to_cases,
                "has_structured_data": 'application/ld+json' in html,
                "is_serp_ranking": False,
            })
        except (requests.RequestException, OSError, ValueError):
            output.append({"name": name, "url": url, "status": "unavailable"})
    return output
