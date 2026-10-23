from datetime import date
import unittest

from growth.src.seo_growth_strategy import (
    FOCUS_PATHS, assess_growth_stage, pillar_for_path, prioritize_growth_review
)

DAY = date(2026, 10, 23)


def row(path, impressions, prev, clicks, indexed=True, action="review_search_intent"):
    return {
        "target_path": path, "priority": 9, "payload": {
            "action": action, "publishable": False,
            "evidence": {
                "nonbrand_impressions_28d": impressions,
                "nonbrand_impressions_previous_28d": prev,
                "nonbrand_clicks_28d": clicks,
                "weighted_position": 14,
                "google_indexation": "reported_indexed" if indexed else "not_verified",
            },
            "workplan": {"real_portfolio_links": ["/projects/example"]},
        },
    }


class SeoGrowthStrategyTests(unittest.TestCase):
    def setUp(self):
        self.a = row("/services/prediccion-demanda", 85, 20, 5)
        self.b = row("/services/logistics-optimization", 70, 15, 4)

    def test_starts_in_four_pillars_even_without_observations(self):
        self.assertEqual(len(FOCUS_PATHS), len(set(FOCUS_PATHS)))
        out = assess_growth_stage([], imported_date=None, today=DAY)
        self.assertEqual(out["stage"], "focused_foundation")
        self.assertFalse(out["expanded_keyword_research_enabled"])
        self.assertEqual(out["focus_clicks_28d"], 0)
        self.assertIn("demand_forecasting", out["focus_pillars"])

    def test_fresh_distinct_growth_and_real_indexing_enable_only_research(self):
        out = assess_growth_stage([self.a, self.b], imported_date="2026-10-20", today=DAY)
        self.assertTrue(out["expanded_keyword_research_enabled"])
        self.assertEqual(out["growing_pillars"], 2)
        self.assertEqual(out["indexed_pillars"], 2)
        self.assertEqual(out["stage"], "expansion_research")

    def test_stale_gsc_never_triggers_expansion(self):
        out = assess_growth_stage([self.a, self.b], imported_date="2026-09-10", today=DAY)
        self.assertFalse(out["expanded_keyword_research_enabled"])
        self.assertFalse(out["gsc_fresh"])

    def test_without_google_pass_in_two_pillars_stay_focused(self):
        b = row("/services/logistics-optimization", 70, 15, 4, indexed=False)
        out = assess_growth_stage([self.a, b], imported_date="2026-10-20", today=DAY)
        self.assertEqual(out["indexed_pillars"], 1)
        self.assertFalse(out["expanded_keyword_research_enabled"])

    def test_spike_only_in_one_pillar_does_not_expand(self):
        b = row("/services/demand-forecasting", 75, 10, 8)
        out = assess_growth_stage([self.a, b], imported_date="2026-10-20", today=DAY)
        self.assertEqual(out["growing_pillars"], 1)
        self.assertFalse(out["expanded_keyword_research_enabled"])

    def test_decline_not_misread_as_improvement(self):
        a = row("/services/prediccion-demanda", 85, 110, 5)
        b = row("/services/logistics-optimization", 70, 95, 4)
        out = assess_growth_stage([a, b], imported_date="2026-10-20", today=DAY)
        self.assertFalse(out["expanded_keyword_research_enabled"])

    def test_ambiguous_unattributed_data_cannot_enter_gate(self):
        outside = row("/projects/erp-operations-control", 10000, 0, 100, True)
        out = assess_growth_stage([self.a, outside], imported_date="2026-10-20", today=DAY)
        self.assertEqual(out["growing_pillars"], 1)
        self.assertFalse(out["expanded_keyword_research_enabled"])

    def test_technical_issues_first_and_scores_review_only(self):
        diagnostic = row("/services/business-intelligence", 0, 0, 0, action="technical_sitemap_fix")
        growth = assess_growth_stage([self.a, self.b, diagnostic],
                                    imported_date="2026-10-20", today=DAY)
        ranked = prioritize_growth_review([self.a, self.b, diagnostic], growth)
        self.assertEqual(ranked[0]["payload"]["action"], "technical_sitemap_fix")
        self.assertTrue(all(x["payload"]["growth_strategy"]["review_only"] for x in ranked))
        self.assertTrue(all(x["payload"]["publishable"] is False for x in ranked))
        self.assertEqual(pillar_for_path("/services/prediccion-demanda"), "demand_forecasting")


if __name__ == "__main__":
    unittest.main()
