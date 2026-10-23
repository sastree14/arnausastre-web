from datetime import date
from unittest.mock import patch
import unittest

from growth.src.seo_intelligence import run_organic_engine
from growth.src import storage, seo_competitor_research


class FakeStore:
    def __init__(self):
        self.saved = {}
    def list(self, table):
        assert table == "seo_recommendations"
        return list(self.saved.values())
    def upsert(self, table, item, key):
        assert table == "seo_recommendations" and key == "recommendation_id"
        self.saved[item[key]] = dict(item)
        return item


class WeeklySeoPublicationSafetyTests(unittest.TestCase):
    def test_weekly_run_stages_keyword_research_but_never_publishes_page(self):
        data = {
            "search_console_daily": [{
                "metric_date": "2026-10-18", "query": "agentes de IA para empresas",
                "page": "https://www.sc-analytics.io/knowledge/agent-guide",
                "impressions": 12, "clicks": 0, "position": 30
            }],
            "seo_keyword_targets": [{
                "keyword_id": "kw", "keyword": "automatización IA empresas",
                "target_path": "/services/automatizacion-ia-empresas",
                "priority": 10, "status": "active",
            }],
            "seo_pages": [{
                "slug": "automatizacion-ia-empresas",
                "status": "published", "published_at": "2026-10-01T09:00:00Z",
            }],
            "competitor_events": [],
        }
        store=FakeStore()

        def read(table,**kwargs):
            return data[table]

        class SiteResponse:
            content = b"<urlset><url><loc>https://www.sc-analytics.io/services/automatizacion-ia-empresas</loc></url></urlset>"
            def raise_for_status(self):
                pass

        with patch("growth.src.seo_intelligence._api_rows",side_effect=read), \
            patch("requests.get",return_value=SiteResponse()), \
            patch("growth.src.seo_competitor_research.research_competitor_pages",return_value=[]), \
            patch("growth.src.storage.get_store",return_value=store):
            result=run_organic_engine(write=True,max_write=12,date_today=date(2026,10,22))
            self.assertEqual(len(result["keyword_recommendations"]),1)
            self.assertEqual(len(result["written"]),4)
            self.assertTrue(any(x.startswith("seo_query_") for x in result["written"]))
            self.assertEqual(len(result["variant_recommendations"]),2)
            self.assertTrue(any(x.startswith("seo_variant_") for x in result["written"]))
            self.assertEqual(len(store.saved),4)
            for item in store.saved.values():
                self.assertEqual(item["status"],"proposed")
                self.assertFalse(item["payload"]["publishable"])
                self.assertTrue(item["payload"]["review_required"])
                self.assertNotIn("synthetic_search_volume",item["payload"])
            # Re-running does not generate duplicate persistent entries.
            second=run_organic_engine(write=True,max_write=12,date_today=date(2026,10,22))
            self.assertEqual(len(store.saved),4)
            self.assertEqual(len(second["written"]),4)

    def test_rejected_opportunity_is_not_reactivated_by_scheduled_jobs(self):
        store=FakeStore()
        store.saved["seo_query_abc"]={"recommendation_id":"seo_query_abc","status":"rejected"}
        self.assertEqual(store.saved["seo_query_abc"]["status"],"rejected")
    def test_stage_is_persisted_as_nonpublishing_evidence(self):
        from growth.src.seo_growth_strategy import FOCUS_PATHS
        self.assertTrue(FOCUS_PATHS)
        self.assertEqual(
            set(row["payload"]["growth_strategy"]["stage"]
                for row in self._sample_proposed_rows()),
            {"focused_foundation"},
        )

    @staticmethod
    def _sample_proposed_rows():
        from growth.src.seo_growth_strategy import assess_growth_stage, prioritize_growth_review
        rows = [{
            "target_path": "/services/prediccion-demanda", "priority": 10,
            "payload": {"action": "wait_for_crawl", "publishable": False,
                        "evidence": {"nonbrand_impressions_28d": 0}}
        }]
        return prioritize_growth_review(
            rows, assess_growth_stage(rows, imported_date=None, today=date(2026, 10, 23))
        )



if __name__=="__main__":
    unittest.main()
