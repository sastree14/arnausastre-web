const ARROWS = /[→←↑↓↔↕⇒⇐⇑⇓↗↘↙↖➜➝➡⬅➤➔]/g

export function sanitizePublicationText(value: string) {
  return String(value || '')
    .replace(ARROWS, ' ')
    .replace(/->|<-/g, ' - ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .trim()
}
