from datetime import date
import unittest

from growth.src.seo_intelligence import analyze
from growth.src.seo_review_briefs import (
    verified_index_state, keyword_discovery, review_brief,
)

class SeoReviewGuardTests(unittest.TestCase):
    def setUp(self):
        self.day=date(2026,10,22)
        self.pages=[
            {"slug":"prediccion-demanda","status":"published",
             "published_at":"2026-08-01T00:00:00Z",
             "title":"Predicción de demanda | SC-Analytics",
             "h1":"Predicción de demanda para empresas",
             "primary_keyword":"predicción de demanda",
             "internal_links":[{"href":"/projects/ecommerce-demand-forecasting","label":"Caso real"}]},
        ]
        self.targets=[{
            "keyword_id":"kw1","status":"active","target_path":"/services/prediccion-demanda",
            "keyword":"predicción de demanda","priority":10,"metrics":{},
        }]

    def test_unverified_is_not_indexed(self):
        status=verified_index_state(self.targets,self.day)
        self.assertEqual(status["status"],"unverified")
        self.assertIsNone(status["checked_at"])

    def test_only_recent_actual_google_inspection_can_guide_indexing_review(self):
        self.targets[0]["metrics"]={"google_index_inspection":{
            "verdict":"FAIL","coverageState":"Crawled - currently not indexed",
            "checked_at":"2026-10-21T09:00:00Z",
        }}
        status=verified_index_state(self.targets,self.day)
        self.assertEqual(status["status"],"reported_not_indexed")
        rec=analyze([],self.targets,self.pages,today=self.day)
        self.assertEqual(rec["recommendations"][0]["payload"]["action"],"review_google_indexing")
        self.assertFalse(rec["recommendations"][0]["payload"]["publishable"])
        self.assertEqual(rec["recommendations"][0]["payload"]["workplan"]["change_scope"],"technical_or_research_only")
        self.assertEqual(rec["recommendations"][0]["payload"]["evidence"]["google_indexation"],"reported_not_indexed")

    def test_stale_index_report_is_ignored(self):
        self.targets[0]["metrics"]={"google_index_inspection":{
            "verdict":"PASS","checked_at":"2026-08-01T12:00:00Z",
        }}
        self.assertEqual(verified_index_state(self.targets,self.day)["status"],"unverified")

    def test_google_home_impressions_are_never_ascribed_to_commercial_landing(self):
        observations=[{
            "metric_date":"2026-10-18","query":"predicción de demanda",
            "page":"https://www.sc-analytics.io/",
            "impressions":42,"clicks":1,"position":8,
        }]
        output=analyze(observations,self.targets,self.pages,today=self.day)
        r=output["recommendations"][0]["payload"]
        self.assertEqual(r["evidence"]["nonbrand_impressions_28d"],0)
        self.assertEqual(r["evidence"]["nonbrand_clicks_28d"],0)
        self.assertEqual(output["unmapped_gsc_rows"],1)
        self.assertEqual(output["unmapped_keyword_opportunities"][0]["query"],"predicción de demanda")
        self.assertFalse(output["unmapped_keyword_opportunities"][0]["new_page_authorized"])

    def test_true_service_impressions_unlock_metadata_review_but_do_not_publish(self):
        observations=[{
            "metric_date":"2026-10-18","query":"predicción de demanda",
            "page":"https://www.sc-analytics.io/services/prediccion-demanda",
            "impressions":34,"clicks":0,"position":13,
        }]
        output=analyze(observations,self.targets,self.pages,today=self.day)
        r=output["recommendations"][0]["payload"]
        self.assertEqual(r["action"],"review_title_snippet")
        self.assertEqual(r["workplan"]["change_scope"],"metadata_only")
        self.assertEqual(r["workplan"]["fields_to_review"],["title","meta_description"])
        self.assertFalse(r["workplan"]["publication_allowed"])
        self.assertIsNone(r["workplan"]["candidate_text"])

    def test_keyword_suggestions_are_observed_not_invented_volume(self):
        rows=[
            {"query":"sc analytics","impressions":300},
            {"query":"sc data","impressions":70},
            {"query":"agentes de IA para empresas","impressions":5,
             "page":"https://www.sc-analytics.io/knowledge/ai"},
            {"query":"como cocinar pasta","impressions":900},
            {"query":"agentes de IA para empresas","impressions":4,
             "page":"https://www.sc-analytics.io/"},
        ]
        items=keyword_discovery(rows)
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]["observed_impressions"],9)
        self.assertIsNone(items[0]["search_market_volume"])
        self.assertFalse(items[0]["commercial_intent_verified"])

    def test_review_brief_only_uses_real_portfolio_claims(self):
        b=review_brief("review_content_relevance",self.pages[0],
            {"status":"unverified"},[("predicción de demanda",5)])
        self.assertEqual(b["real_portfolio_links"],
            ["/projects/ecommerce-demand-forecasting"])
        self.assertIsNone(b["candidate_text"])
        self.assertFalse(b["publication_allowed"])

if __name__=="__main__":
    unittest.main()
