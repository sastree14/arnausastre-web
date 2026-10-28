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

    def test_recent_service_already_indexed_does_not_wait_for_crawl(self):
        targets = [dict(x, metrics={"google_index_inspection": {
            "verdict": "PASS",
            "coverageState": "Enviada e indexada",
            "checked_at": "2026-10-22T08:02:00Z",
            "googleCanonical": "https://www.sc-analytics.io/services/consultoria-datos",
        }}) if x["keyword_id"] == "kw3" else x for x in self.targets]
        report = analyze([], targets, self.pages, today=date(2026, 10, 22),
                         sitemap_service_paths={"/services/consultoria-datos", "/services/prediccion-demanda"})
        indexed = next(x for x in report["recommendations"]
                       if x["target_path"] == "/services/consultoria-datos")
        self.assertEqual(indexed["payload"]["evidence"]["google_indexation"],
                         "reported_indexed")
        self.assertNotEqual(indexed["payload"]["action"], "wait_for_crawl")
        self.assertEqual(indexed["payload"]["action"], "validate_keyword_demand")

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


    def test_stale_search_console_does_not_trigger_copy_rewrite(self):
        rows = [{"metric_date":"2026-08-20", "query":"predicción de demanda",
                 "page":"https://www.sc-analytics.io/services/prediccion-demanda",
                 "impressions":100, "clicks":0, "position":11}]
        report=analyze(rows,self.targets,self.pages,today=date(2026,10,22))
        row=next(x for x in report["recommendations"]
                 if x["target_path"]=="/services/prediccion-demanda")
        self.assertEqual(row["payload"]["action"],"refresh_search_console")
        self.assertTrue(row["payload"]["evidence"]["search_console_data_stale"])
        self.assertFalse(row["payload"]["publishable"])

    def test_google_canonical_conflict_outranks_snippet_work(self):
        targets=[dict(x,metrics={"google_index_inspection":{
            "verdict":"PASS","checked_at":"2026-10-21",
            "googleCanonical":"https://other.example/services/prediccion-demanda",
        }}) if x["keyword_id"]=="kw1" else x for x in self.targets]
        report=analyze([],targets,self.pages,today=date(2026,10,22))
        row=next(x for x in report["recommendations"]
                 if x["target_path"]=="/services/prediccion-demanda")
        self.assertEqual(row["payload"]["action"],"review_google_canonical")
        self.assertTrue(row["payload"]["evidence"]["google_canonical_conflict"])
        self.assertIn("canonical",row["payload"]["workplan"]["fields_to_review"])

    def test_offsite_business_query_cannot_be_discovered_as_our_demand(self):
        rows=[{"metric_date":"2026-10-18","query":"predicción de demanda",
               "page":"https://other.example/prediccion-demanda",
               "impressions":500, "clicks":5, "position":1}]
        report=analyze(rows,self.targets,self.pages,today=date(2026,10,22))
        self.assertEqual(report["unmapped_keyword_opportunities"],[])
        self.assertEqual(report["unmapped_gsc_rows"],0)

    def test_inconclusive_google_inspection_not_presented_as_indexed_or_failed(self):
        targets = [dict(x, metrics={"google_index_inspection": {
            "verdict": "NEUTRAL", "coverageState": "Google no reconoce esta URL",
            "checked_at": "2026-10-23",
        }}) if x["keyword_id"] == "kw1" else x for x in self.targets]
        report = analyze([], targets, self.pages, today=date(2026, 10, 23))
        proposal = next(x for x in report["recommendations"]
                        if x["target_path"] == "/services/prediccion-demanda")
        self.assertEqual(proposal["payload"]["action"], "review_inconclusive_inspection")
        self.assertEqual(proposal["payload"]["evidence"]["google_indexation"], "inconclusive")
        self.assertFalse(proposal["payload"]["publishable"])



if __name__=="__main__":
    unittest.main()
