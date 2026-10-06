import type { ReactNode } from 'react'

export function renderArticleInline(text: string): ReactNode[] {
  const tokens = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>]+|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer" className="break-words font-medium text-[#254A66] underline underline-offset-4">{link[1]}</a>
    if (/^https?:\/\//.test(token)) {
      const href = token.replace(/[.,;:!?]+$/, '')
      return <span key={index}><a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-[#254A66] underline underline-offset-4">{href}</a>{token.slice(href.length)}</span>
    }
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index} className="font-semibold text-slate-950">{token.slice(2, -2)}</strong>
    if (token.startsWith('*') && token.endsWith('*')) return <em key={index}>{token.slice(1, -1)}</em>
    return token
  })
}

export default function ArticleText({ text, className }: { text: string; className: string }) {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length > 1 && lines.every(line => line.trim().startsWith('|'))) {
    const rows = lines.map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()))
      .filter(row => !row.every(cell => /^:?-+:?$/.test(cell)))
    const [header, ...body] = rows
    return <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-[16px] leading-7"><thead className="bg-[#EAF0F6]"><tr>{header.map((cell, i) => <th key={i} scope="col" className="border border-slate-300 p-3 font-semibold">{renderArticleInline(cell)}</th>)}</tr></thead><tbody>{body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="border border-slate-300 p-3 align-top">{renderArticleInline(cell)}</td>)}</tr>)}</tbody></table></div>
  }
  if (lines.every(line => /^[-*]\s+/.test(line))) return <ul className={`${className} list-disc space-y-3 pl-6`}>{lines.map((line, i) => <li key={i}>{renderArticleInline(line.replace(/^[-*]\s+/, ''))}</li>)}</ul>
  if (lines.every(line => /^\d+\.\s+/.test(line))) return <ol className={`${className} list-decimal space-y-3 pl-6`}>{lines.map((line, i) => <li key={i}>{renderArticleInline(line.replace(/^\d+\.\s+/, ''))}</li>)}</ol>
  return <p className={className}>{renderArticleInline(text)}</p>
}
