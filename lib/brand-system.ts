export const SC_BRAND = {
  name: 'SC-Analytics',
  tagline: 'Comprender antes de construir.',
  website: 'sc-analytics.io',
  colors: {
    navy: '#071522',
    navyPanel: '#0B1D2D',
    navyPanelAlt: '#102638',
    navySoft: '#173249',
    line: '#28465E',
    textOnDark: '#F4F6F8',
    mutedOnDark: '#9FB0BE',
    accentBlue: '#82B7E8',
    paper: '#F8FAFC',
    ink: '#0F172A',
    slate: '#475569',
    lineLight: '#CBD5E1',
    indigo: '#4F46E5',
    white: '#FFFFFF',
  },
  fonts: {
    body: 'Inter, Arial, Helvetica, sans-serif',
    display: 'Playfair Display, Georgia, serif',
  },
  logos: {
    horizontal: '/brand/logo-horizontal-transparent.png',
    horizontalSolid: '/brand/logo-horizontal.png',
    white: '/brand/logo-white.png',
    monogram: '/brand/Monograma-transparent.png',
    monogramSolid: '/brand/Monograma-simple.png',
    circular: '/brand/logo-circular.png',
  },
  spacing: {
    safe: 72,
    compactSafe: 48,
  },
} as const

export const VISUAL_FORMATS = {
  linkedin_square: {
    key: 'linkedin_square',
    label: 'LinkedIn · Square',
    width: 1200,
    height: 1200,
    family: 'linkedin',
    note: 'Default LinkedIn visual. Balanced on desktop and mobile.',
  },
  linkedin_portrait: {
    key: 'linkedin_portrait',
    label: 'LinkedIn · Portrait',
    width: 1080,
    height: 1350,
    family: 'linkedin',
    note: 'More feed real estate. Best for visual-first posts.',
  },
  linkedin_landscape: {
    key: 'linkedin_landscape',
    label: 'LinkedIn · Landscape',
    width: 1200,
    height: 627,
    family: 'linkedin',
    note: 'Useful for link-like or editorial compositions.',
  },
  article_hero: {
    key: 'article_hero',
    label: 'Website · Article hero',
    width: 1600,
    height: 900,
    family: 'website',
    note: 'Primary visual shown at the top of a generated article.',
  },
  article_inline: {
    key: 'article_inline',
    label: 'Website · Inline visual',
    width: 1400,
    height: 900,
    family: 'website',
    note: 'Explanatory diagrams and supporting visuals inside articles.',
  },
  open_graph: {
    key: 'open_graph',
    label: 'Website · Open Graph',
    width: 1200,
    height: 630,
    family: 'website',
    note: 'Preview image when a page is shared externally.',
  },
  presentation: {
    key: 'presentation',
    label: 'Presentation · 16:9',
    width: 1920,
    height: 1080,
    family: 'presentation',
    note: 'Reusable slide-ready composition.',
  },
  story: {
    key: 'story',
    label: 'Vertical · 9:16',
    width: 1080,
    height: 1920,
    family: 'vertical',
    note: 'Future vertical/social use.',
  },
} as const

export type VisualFormatKey = keyof typeof VISUAL_FORMATS
export type VisualFormat = (typeof VISUAL_FORMATS)[VisualFormatKey]

export const PUBLICATION_MODES = {
  text_only: {
    label: 'Text only',
    description: 'LinkedIn uses the written post and ignores the attached visual.',
  },
  text_with_visual: {
    label: 'Text + visual',
    description: 'Full written post plus the selected image.',
  },
  visual_first: {
    label: 'Visual first',
    description: 'The visual carries most of the message; LinkedIn commentary is shortened.',
  },
  image_only: {
    label: 'Image-led',
    description: 'The image carries the message. LinkedIn requires commentary in its Posts API, so the publisher sends only a minimal SC-Analytics caption.',
  },
} as const

export type PublicationMode = keyof typeof PUBLICATION_MODES
