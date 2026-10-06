import type { CSSProperties } from 'react'

const palettes = {
  4: ['#FFFFFF', '#EAF0F6', '#496C8A', '#0D1B2A'],
  5: ['#FFFFFF', '#EAF0F6', '#C7D9E8', '#496C8A', '#0D1B2A'],
} as const

type Props = { steps: readonly (readonly [string, string, string])[] }

export default function ProcessSequence({ steps }: Props) {
  const palette = palettes[steps.length as keyof typeof palettes] ?? palettes[5]
  return (
    <ol className="process-sequence" style={{ '--process-columns': steps.length } as CSSProperties}>
      {steps.map(([number, title, body], index) => (
        <li key={number} className={`process-stage ${index >= steps.length - 2 ? 'process-stage-dark' : ''}`} style={{ backgroundColor: palette[index] }}>
          <span aria-hidden="true" className="process-number">{number}</span>
          <h3 style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
          {body && <p>{body}</p>}
        </li>
      ))}
    </ol>
  )
}
