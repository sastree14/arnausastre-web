from __future__ import annotations

import unittest
from growth.src.seo_competitor_research import PageStructure, research_competitor_pages


class FakeRobots:
    def set_url(self, url):
        self.url = url

    def read(self):
        pass

    def can_fetch(self, agent, url):
        return True


class FakeResponse:
    def __init__(self, status, text):
        self.status_code = status
        self.text = text
        self.content = text.encode()


def mock_request(url, **kwargs):
    if url.endswith("/robots.txt"):
        return FakeResponse(200, "User-agent: *\nAllow: /\n")
    return FakeResponse(200, '<html><head><title>Servicio profesional</title>'
                         '<meta name="description" content="Consultoría de datos para pymes">'
                         '</head><body><h1>Ayudamos a decidir con datos</h1>'
                         '<h2>Metodología</h2><a href="/casos/test">Caso real</a></body></html>')


class CompetitorResearchTests(unittest.TestCase):
    def test_structural_counts_and_source(self):
        result = research_competitor_pages(
            (("MERIDIAN", "https://meridiandata.es/"),),
            requester=mock_request,
            robot_factory=FakeRobots,
        )[0]
        self.assertEqual(result["status"], "observed")
        self.assertEqual(result["h1"], "Ayudamos a decidir con datos")
        self.assertEqual(result["links_to_cases"], 1)
        self.assertFalse(result["is_serp_ranking"])

    def test_unknown_hosts_are_never_requested(self):
        called = []
        def request(url, **kwargs):
            called.append(url)
            return FakeResponse(200, "")
        results = research_competitor_pages((("Private", "https://127.0.0.1/"),),
                                            requester=request,robot_factory=FakeRobots)
        self.assertEqual(results[0]["status"], "not_allowlisted")
        self.assertEqual(called, [])

    def test_robots_failure_causes_skip(self):
        def request(url, **kwargs):
            if url.endswith("robots.txt"):
                return FakeResponse(403, "Forbidden")
            raise AssertionError("Must not crawl a disallowed site")
        result = research_competitor_pages(
            (("MERIDIAN", "https://meridiandata.es/"),),
            requester=request,robot_factory=FakeRobots,
        )[0]
        self.assertEqual(result["status"], "robots_blocked_or_unavailable")


if __name__ == "__main__":
    unittest.main()
