import React from 'react'
import { BRAND } from './brand.mjs'

const h = React.createElement

function lines(text, max = 26, maxLines = 4) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  const out = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > max && line) {
      out.push(line)
      line = word
      if (out.length >= maxLines - 1) break
    } else line = next
  }
  if (line && out.length < maxLines) out.push(line)
  return out
}

function TextBlock({ text, x, y, fontSize, maxChars, maxLines = 4, fill = BRAND.text, weight = 600, lineHeight = 1.15 }) {
  const wrapped = lines(text, maxChars, maxLines)
  return h('text', { x, y, fill, fontFamily: BRAND.font, fontSize, fontWeight: weight },
    wrapped.map((line, i) => h('tspan', { key: `${line}-${i}`, x, dy: i === 0 ? 0 : Math.round(fontSize * lineHeight) }, line)))
}

function Frame({ children, eyebrow = 'SC-ANALYTICS', logoDataUri }) {
  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: BRAND.width, height: BRAND.height,
    viewBox: `0 0 ${BRAND.width} ${BRAND.height}`,
  },
  h('defs', null,
    h('linearGradient', { id: 'bg', x1: '0', y1: '0', x2: '1', y2: '1' },
      h('stop', { offset: '0%', stopColor: BRAND.background }),
      h('stop', { offset: '100%', stopColor: '#0A2031' }))),
  h('rect', { width: 1200, height: 1200, fill: 'url(#bg)' }),
  h('path', { d: 'M80 160 H1120 M80 1015 H1120', stroke: BRAND.line, strokeWidth: 2 }),
  h('circle', { cx: 1070, cy: 102, r: 44, fill: BRAND.soft, opacity: 0.55 }),
  h('circle', { cx: 1110, cy: 142, r: 18, fill: BRAND.accent, opacity: 0.18 }),
  logoDataUri
    ? h('image', { href: logoDataUri, x: 80, y: 72, width: 250, height: 72, preserveAspectRatio: 'xMinYMid meet' })
    : h('text', { x: 80, y: 112, fill: BRAND.muted, fontFamily: BRAND.font, fontSize: 30, letterSpacing: 5 }, eyebrow),
  h('text', { x: 80, y: 1085, fill: BRAND.muted, fontFamily: BRAND.font, fontSize: 23 }, BRAND.footer),
  children)
}

function Insight({ spec, logoDataUri }) {
  return h(Frame, { logoDataUri, eyebrow: spec.eyebrow },
    h(TextBlock, { text: spec.headline, x: 80, y: 350, fontSize: 78, maxChars: 23, maxLines: 4, weight: 650 }),
    spec.subheadline && h(TextBlock, { text: spec.subheadline, x: 84, y: 740, fontSize: 34, maxChars: 51, maxLines: 3, fill: BRAND.muted, weight: 400 }),
    h('rect', { x: 82, y: 900, width: 180, height: 6, rx: 3, fill: BRAND.accent }))
}

function MetricCase({ spec, logoDataUri }) {
  const metrics = (spec.metrics || []).slice(0, 3)
  return h(Frame, { logoDataUri, eyebrow: spec.eyebrow },
    h(TextBlock, { text: spec.headline, x: 80, y: 280, fontSize: 58, maxChars: 30, maxLines: 2 }),
    metrics.map((m, i) => {
      const y = 465 + i * 170
      return h('g', { key: `${m.label}-${i}` },
        h('rect', { x: 80, y: y - 70, width: 1040, height: 132, rx: 24, fill: i === 0 ? BRAND.panelAlt : BRAND.panel, stroke: BRAND.line, strokeWidth: 1.5 }),
        h('text', { x: 120, y: y + 8, fill: BRAND.text, fontFamily: BRAND.font, fontSize: 58, fontWeight: 700 }, String(m.value || '')),
        h(TextBlock, { text: m.label, x: 430, y: y - 5, fontSize: 28, maxChars: 39, maxLines: 2, fill: BRAND.muted, weight: 450 }))
    }),
    h('text', { x: 80, y: 990, fill: BRAND.muted, fontFamily: BRAND.font, fontSize: 20 }, spec.note || 'Resultados anonimizados de un caso publicado.'))
}

function ProcessFlow({ spec, logoDataUri }) {
  const steps = (spec.steps || []).slice(0, 5)
  return h(Frame, { logoDataUri, eyebrow: spec.eyebrow },
    h(TextBlock, { text: spec.headline, x: 80, y: 270, fontSize: 54, maxChars: 31, maxLines: 2 }),
    steps.map((step, i) => {
      const y = 410 + i * 120
      return h('g', { key: `${step}-${i}` },
        h('rect', { x: 130, y: y - 48, width: 940, height: 88, rx: 20, fill: i === steps.length - 1 ? BRAND.panelAlt : BRAND.panel, stroke: i === steps.length - 1 ? BRAND.accent : BRAND.line, strokeWidth: 2 }),
        h('circle', { cx: 180, cy: y - 4, r: 19, fill: i === steps.length - 1 ? BRAND.accent : BRAND.soft }),
        h('text', { x: 180, y: y + 4, fill: i === steps.length - 1 ? BRAND.background : BRAND.muted, textAnchor: 'middle', fontFamily: BRAND.font, fontSize: 18, fontWeight: 700 }, String(i + 1)),
        h('text', { x: 225, y: y + 6, fill: BRAND.text, fontFamily: BRAND.font, fontSize: 30, fontWeight: i === steps.length - 1 ? 650 : 500 }, String(step).slice(0, 62)),
        i < steps.length - 1 && h('path', { d: `M600 ${y + 40} V${y + 72}`, stroke: BRAND.line, strokeWidth: 3 }))
    }))
}

function Comparison({ spec, logoDataUri }) {
  const left = spec.left || { label: 'COMMON QUESTION', text: spec.subheadline || '' }
  const right = spec.right || { label: 'BETTER QUESTION', text: spec.headline || '' }
  const card = (x, label, text, accent) => h('g', null,
    h('rect', { x, y: 365, width: 475, height: 485, rx: 30, fill: BRAND.panel, stroke: accent ? BRAND.accent : BRAND.line, strokeWidth: 2 }),
    h('text', { x: x + 42, y: 430, fill: accent ? BRAND.accent : BRAND.muted, fontFamily: BRAND.font, fontSize: 20, letterSpacing: 2.5 }, label),
    h(TextBlock, { text, x: x + 42, y: 540, fontSize: 42, maxChars: 18, maxLines: 5, weight: 600 }))
  return h(Frame, { logoDataUri, eyebrow: spec.eyebrow },
    h(TextBlock, { text: spec.title || 'A better business question', x: 80, y: 265, fontSize: 54, maxChars: 33, maxLines: 2 }),
    card(80, left.label || 'COMMON QUESTION', left.text || '', false),
    card(645, right.label || 'BETTER QUESTION', right.text || '', true))
}

export function renderVisual(spec, logoDataUri) {
  const template = String(spec.template || 'insight')
  if (template === 'metric_case') return h(MetricCase, { spec, logoDataUri })
  if (template === 'process_flow') return h(ProcessFlow, { spec, logoDataUri })
  if (template === 'comparison') return h(Comparison, { spec, logoDataUri })
  return h(Insight, { spec, logoDataUri })
}
