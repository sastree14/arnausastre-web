from datetime import date
import unittest

from growth.src.seo_commercial_readiness import commercial_readiness
from growth.src.seo_intelligence import analyze


class CommercialSeoReadinessTests(unittest.TestCase):
    def setUp(self):
        self.page = {
            "slug": "prediccion-demanda", "status": "published",
            "title": "Predicción de demanda orientada a decisiones empresariales",
            "h1": "Predicción de demanda para planificar inventario",
            "intro": "Las previsiones sirven para conectar señales reales de demanda con decisiones de compras, stock, operaciones y servicio. " * 2,
            "sections": [{"heading": "Aplicación"}, {"heading": "Proceso"}],
            "cta_title": "Hablemos de tu proceso de planificación",
            "cta_body": "Reserva una reunión de diagnóstico para revisar objetivos, restricciones y datos disponibles.",
            "internal_links": [
                {"href": "/projects/ecommerce-demand-forecasting", "label": "Caso"},
                {"href": "https://external.example/projects/phony", "label": "No es un caso nuestro"},
                {"href": "/projects/ecommerce-demand-forecasting", "label": "Duplicado"},
            ],
        }
        self.targets = [{"keyword_id": "t1", "target_path": "/services/prediccion-demanda",
                         "keyword": "predicción de demanda", "status": "active", "priority": 10}]
        self.today = date(2026, 10, 22)

    def test_ready_onsite_does_not_equal_ranked_or_indexed_or_clients(self):
        result = commercial_readiness(self.page, self.targets, today=self.today)
        self.assertEqual(result["onsite_readiness_checks_passed"], 6)
        self.assertEqual(result["status"], "analysis_only")
        self.assertFalse(result["publishable"])
        self.assertEqual(result["google_indexation_observed"], "unverified")
        self.assertIsNone(result["verified_market_search_volume"])
        self.assertIsNone(result["verified_serp_rankings"])
        self.assertIsNone(result["verified_external_referring_domains"])
        self.assertIsNone(result["verified_new_customers_from_seo"])
        self.assertEqual(result["linked_existing_case_paths"],
                         ["/projects/ecommerce-demand-forecasting"])
        self.assertIn("sending_outreach", result["approval_required_for"])

    def test_content_gaps_are_review_tasks_not_auto_edits(self):
        bare = dict(self.page, intro="", sections=[], cta_title="", cta_body="", internal_links=[])
        result = commercial_readiness(bare, self.targets, today=self.today)
        self.assertLess(result["onsite_readiness_checks_passed"], 6)
        self.assertEqual(result["tasks"][0]["kind"], "onsite_quality")
        self.assertEqual(result["tasks"][0]["status"], "needs_editorial_review")
        self.assertFalse(result["publishable"])

    def test_fresh_google_pass_only_confirms_inspection_verdict(self):
        targets = [dict(self.targets[0], metrics={
            "google_index_inspection": {"verdict": "PASS", "checked_at": "2026-10-21"}
        })]
        result = commercial_readiness(self.page, targets, today=self.today,
                                      observed_service_impressions=32,
                                      observed_service_clicks=0,
                                      observed_service_position=12.0)
        self.assertEqual(result["google_indexation_observed"], "reported_indexed")
        self.assertIn("snippet", [item["kind"] for item in result["tasks"]])
        self.assertIn("serp_competition", [item["kind"] for item in result["tasks"]])
        self.assertIn("earned_authority", [item["kind"] for item in result["tasks"]])
        self.assertIn("commercial_attribution", [item["kind"] for item in result["tasks"]])
        self.assertIsNone(result["verified_serp_rankings"])

    def test_engine_persists_readiness_in_review_only_proposal(self):
        p = dict(self.page, published_at="2026-08-01T00:00:00Z")
        report = analyze([], self.targets, [p], today=self.today)
        row = report["recommendations"][0]
        self.assertFalse(row["payload"]["publishable"])
        self.assertIn("commercial_plan", row["payload"])
        self.assertFalse(row["payload"]["commercial_plan"]["publishable"])
        self.assertEqual(row["payload"]["commercial_plan"]["onsite_readiness_checks_passed"], 6)

if __name__ == "__main__":
    unittest.main()
