from __future__ import annotations
from datetime import date
import unittest

from growth.src.seo_intelligence import analyze, classify_query


class SeoIntelligenceTests(unittest.TestCase):
    def setUp(self):
        self.targets = [
            dict(keyword_id="kw1", keyword="predicción de demanda", target_path="/services/prediccion-demanda", priority=10, status="active"),
            dict(keyword_id="kw2", keyword="forecasting de ventas", target_path="/services/prediccion-demanda", priority=9, status="active"),
            dict(keyword_id="kw3", keyword="consultoría de datos", target_path="/services/consultoria-datos", priority=9, status="active"),
        ]
        self.pages = [
            dict(slug="prediccion-demanda", status="published", published_at="2026-09-01T00:00:00Z"),
            dict(slug="consultoria-datos", status="published", published_at="2026-10-21T09:00:00Z"),
        ]

    def test_brand_and_ambiguous_queries_are_not_nonbrand(self):
        for query in ["SC-Analytics", "sc analytics", "SC-analytix", "Arnau Sastre"]:
            self.assertEqual(classify_query(query), "branded", query)
        for query in ["sc data", "erp sc", "sc insights"]:
            self.assertEqual(classify_query(query), "ambiguous", query)
        self.assertEqual(classify_query("predicción de demanda"), "nonbrand")

    def test_never_invents_volumes_and_does_not_claim_google_indexed(self):
        rows = [
            {"metric_date": "2026-10-18", "query": "predicción de demanda",
             "page": "https://www.sc-analytics.io/services/prediccion-demanda",
             "impressions": 40, "clicks": 0, "position": 14},
            {"metric_date": "2026-10-18", "query": "sc analytics",
             "page": "https://www.sc-analytics.io/services/prediccion-demanda",
             "impressions": 1000, "clicks": 100, "position": 1},
        ]
        result = analyze(rows, self.targets, self.pages, today=date(2026, 10, 22),
                         sitemap_service_paths={"/services/prediccion-demanda", "/services/consultoria-datos"})
        self.assertEqual(len(result["recommendations"]), 2)
        rec = next(r for r in result["recommendations"]
                   if r["target_path"] == "/services/prediccion-demanda")
        self.assertEqual(rec["payload"]["action"], "review_title_snippet")
        self.assertEqual(rec["payload"]["evidence"]["nonbrand_impressions_28d"], 40)
        self.assertEqual(rec["payload"]["evidence"]["nonbrand_clicks_28d"], 0)
        self.assertEqual(rec["payload"]["evidence"]["google_indexation"], "not_verified")
        self.assertFalse(rec["payload"]["publishable"])
        self.assertEqual(rec["payload"]["evidence"]["weighted_position"], 14)

    def test_new_services_not_immediately_labeled_failure(self):
        result = analyze([], self.targets, self.pages, today=date(2026, 10, 22),
                         sitemap_service_paths={"/services/consultoria-datos","/services/prediccion-demanda"})
        recent = next(r for r in result["recommendations"]
                      if r["target_path"] == "/services/consultoria-datos")
        self.assertEqual(recent["payload"]["action"], "wait_for_crawl")

    def test_sitemap_error_is_more_important_than_keyword_content(self):
        result = analyze([], self.targets, self.pages, today=date(2026, 10, 22),
                         sitemap_service_paths={"/services/consultoria-datos"})
        missing = next(r for r in result["recommendations"]
                       if r["target_path"] == "/services/prediccion-demanda")
        self.assertEqual(missing["payload"]["action"], "technical_sitemap_fix")

    def test_repeated_analyses_have_stable_recommendation_ids(self):
        x = analyze([], self.targets, self.pages, today=date(2026, 10, 22))
        y = analyze([], self.targets, self.pages, today=date(2026, 10, 22))
        self.assertEqual(
            [r["recommendation_id"] for r in x["recommendations"]],
            [r["recommendation_id"] for r in y["recommendations"]],
        )

    def test_unrelated_or_external_pages_do_not_generate_wrong_new_landing(self):
        rows=[{"metric_date":"2026-10-18","query":"cheap recipes","page":"https://other.example/cheap-recipes",
               "impressions":1000,"clicks":10,"position":1}]
        result=analyze(rows,self.targets,self.pages,today=date(2026,10,22))
        self.assertTrue(all(r["payload"]["evidence"]["nonbrand_impressions_28d"]==0
                            for r in result["recommendations"]))


if __name__=="__main__":
    unittest.main()
