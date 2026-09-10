from PIL import Image

from growth.src.brain import load_brain, validate_brain
from growth.src.visuals import render_branded_card, render_business_diagram


def test_brain_is_complete():
    files = validate_brain()
    assert "company/identity.md" in files
    assert "evidence/evidence_policy.md" in files
    assert "SC-Analytics" in load_brain(["company/identity.md"])


def test_branded_card_is_linkedin_ready_png(tmp_path, monkeypatch):
    import growth.src.visuals as visuals
    monkeypatch.setattr(visuals, "OUTPUT_DIR", tmp_path)
    path = render_branded_card("Forecasting is not the decision", "Different horizons support different actions", slug="test")
    assert path.suffix == ".png"
    with Image.open(path) as image:
        assert image.size == (1200, 1200)


def test_business_diagram_is_png(tmp_path, monkeypatch):
    import growth.src.visuals as visuals
    monkeypatch.setattr(visuals, "OUTPUT_DIR", tmp_path)
    path = render_business_diagram("From forecast to decision", ["Forecast", "Inventory policy", "Purchase decision"], slug="diagram")
    with Image.open(path) as image:
        assert image.size == (1200, 1200)
