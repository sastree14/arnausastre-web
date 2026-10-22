from datetime import date, timedelta
import unittest

from growth.src.seo_keyword_expansion import (
    CURATED_HYPOTHESES, propose_variant_research,
)


class KeywordExpansionTests(unittest.TestCase):
    def setUp(self):
        self.pages = [
            {"slug": slug, "status": "published"}
            for slug in {
                "consultoria-datos", "consultoria-dades",
                "automatizacion-ia-empresas", "prediccion-demanda",
                "optimizacion-inventario", "ai-automation",
                "demand-forecasting", "business-intelligence",
            }
        ]
        self.targets = [
            {"keyword": "consultoría de datos", "status": "active"},
            {"keyword": "predicción de demanda", "status": "active"},
        ]
        self.day = date(2026, 10, 22)

    def test_only_existing_published_relevant_service_paths(self):
        proposals = propose_variant_research(self.targets, self.pages, today=self.day, limit=20)
        self.assertGreater(len(proposals), 0)
        published = {"/services/" + x["slug"] for x in self.pages}
        for proposal in proposals:
            self.assertIn(proposal["target_path"], published)
            self.assertTrue(proposal["recommendation_id"].startswith("seo_variant_"))
            self.assertFalse(proposal["payload"]["publishable"])
            self.assertTrue(proposal["payload"]["review_required"])
            self.assertIsNone(proposal["payload"]["evidence"]["verified_market_search_volume"])
            self.assertIsNone(proposal["payload"]["evidence"]["observed_gsc_impressions"])
            self.assertFalse(proposal["payload"]["evidence"]["trend_verified"])
            self.assertFalse(proposal["payload"]["research"]["new_landing_authorized"])

    def test_weekly_deterministic_rotation_and_language_coverage(self):
        pages=[{"slug":slug,"status":"published"} for _,slug,_,_,_ in CURATED_HYPOTHESES]
        all_variants = propose_variant_research([],pages,today=self.day,limit=100)
        self.assertGreaterEqual(len(all_variants),25)
        self.assertTrue({"es","en","ca"}.issubset({
            p["payload"]["evidence"]["language"] for p in all_variants
        }))
        first = propose_variant_research([],pages,today=self.day,limit=2)
        again = propose_variant_research([],pages,today=self.day,limit=2)
        week_later = propose_variant_research([],pages,today=self.day + timedelta(days=7),limit=2)
        self.assertEqual(first,again)
        self.assertNotEqual(
            [x["recommendation_id"] for x in first],
            [x["recommendation_id"] for x in week_later],
        )

    def test_never_suggests_already_tracked_or_unpublished(self):
        pages=[{"slug":"consultoria-datos","status":"draft"}]
        self.assertEqual(propose_variant_research([],pages,today=self.day),[])
        pages=[{"slug":"consultoria-datos","status":"published"}]
        tracked=[{"keyword":"consultoría de datos para pymes","status":"active"}]
        all_proposals=propose_variant_research(tracked,pages,today=self.day,limit=100)
        self.assertNotIn("consultoría de datos para pymes",[
            x["payload"]["evidence"]["query"] for x in all_proposals
        ])
        self.assertEqual(len({
            p["payload"]["evidence"]["query"].casefold() for p in all_proposals
        }),len(all_proposals))

    def test_no_live_google_market_or_competitor_api_used(self):
        # Even if there are no GSC results, the candidates remain hypotheses.
        proposal=propose_variant_research([],self.pages,today=self.day,limit=1)[0]
        evidence=proposal["payload"]["evidence"]
        self.assertEqual(evidence["source"],"curated_editorial_hypothesis")
        self.assertFalse(evidence["commercial_intent_verified"])


if __name__=="__main__":
    unittest.main()
