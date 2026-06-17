"""Deterministic, programmatic SVG header image for an article.

No image-generation API is used — this is plain geometric composition (lines +
nodes) seeded from sha256(slug), so the same slug always produces the exact
same SVG (reproducible and diffable in git).
"""

from __future__ import annotations

import hashlib
import random
from pathlib import Path

WIDTH = 1200
HEIGHT = 800
LEFT_RESERVED_RATIO = 0.42  # kept empty so the real HTML title can sit on top of it

BACKGROUND = "#0D1B2A"
LINE_COLOR = "#496C8A"
ACCENT_COLOR = "#F5F7FA"

PADDING = 48
MIN_NODES = 16
MAX_NODES = 24
ACCENT_RATIO = 0.22
EDGE_DISTANCE_THRESHOLD = 260


def _seed_from_slug(slug: str) -> int:
    digest = hashlib.sha256(slug.encode("utf-8")).hexdigest()
    return int(digest[:16], 16)


def _generate_nodes(rng: random.Random, zone_x_min: float, zone_x_max: float) -> list[tuple[float, float]]:
    count = rng.randint(MIN_NODES, MAX_NODES)
    nodes = []
    for _ in range(count):
        x = rng.uniform(zone_x_min, zone_x_max - PADDING)
        y = rng.uniform(PADDING, HEIGHT - PADDING)
        nodes.append((x, y))
    return nodes


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def _generate_edges(nodes: list[tuple[float, float]]) -> list[tuple[int, int]]:
    edges = []
    # chain: guarantees a connected, line-like backbone across the zone
    for i in range(len(nodes) - 1):
        edges.append((i, i + 1))
    # a few extra short edges between nearby nodes, for the "network" texture
    for i, node_a in enumerate(nodes):
        for j, node_b in enumerate(nodes):
            if j <= i:
                continue
            if _distance(node_a, node_b) <= EDGE_DISTANCE_THRESHOLD and (i, j) not in edges:
                edges.append((i, j))
    return edges


def generate_svg_markup(slug: str) -> str:
    seed = _seed_from_slug(slug)
    rng = random.Random(seed)

    zone_x_min = WIDTH * LEFT_RESERVED_RATIO
    nodes = _generate_nodes(rng, zone_x_min, WIDTH)
    edges = _generate_edges(nodes)
    accent_count = max(1, round(len(nodes) * ACCENT_RATIO))
    accent_indices = set(rng.sample(range(len(nodes)), accent_count))

    lines_markup = "\n".join(
        f'    <line x1="{nodes[a][0]:.1f}" y1="{nodes[a][1]:.1f}" '
        f'x2="{nodes[b][0]:.1f}" y2="{nodes[b][1]:.1f}" '
        f'stroke="{LINE_COLOR}" stroke-width="1" stroke-opacity="0.55" />'
        for a, b in edges
    )

    circles_markup = "\n".join(
        f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="{4 if i in accent_indices else 2.2}" '
        f'fill="{ACCENT_COLOR if i in accent_indices else LINE_COLOR}" '
        f'fill-opacity="{1.0 if i in accent_indices else 0.85}" />'
        for i, (x, y) in enumerate(nodes)
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}">
  <rect x="0" y="0" width="{WIDTH}" height="{HEIGHT}" fill="{BACKGROUND}" />
  <g>
{lines_markup}
{circles_markup}
  </g>
</svg>
"""


def write_header_svg(slug: str, public_dir: Path) -> Path:
    output_dir = public_dir / "insights"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{slug}.svg"
    output_path.write_text(generate_svg_markup(slug), encoding="utf-8", newline="\n")
    return output_path
