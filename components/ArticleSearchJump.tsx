'use client'

import { useEffect } from 'react'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
}

/**
 * Follow a contextual result from /knowledge to its actual paragraph.
 * This does not alter the article's text/React nodes or change normal links.
 */
export default function ArticleSearchJump({ language, articleId }: { language: string; articleId: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const needle = normalize((params.get('find') || '').trim().slice(0, 100))
    const context = normalize((params.get('context') || '').trim().slice(0, 100))
    if (!needle) return

    const root = document.querySelector<HTMLElement>('[data-knowledge-article-body]')
    if (!root) return

    const blocks = Array.from(root.querySelectorAll<HTMLElement>('p, li, td, th'))
    const target = (context ? blocks.find((block) => normalize(block.textContent || '').includes(context)) : null)
      || blocks.find((block) => normalize(block.textContent || '').includes(needle))

    if (!target) return

    const details = target.closest('details')
    if (details && !details.open) details.open = true

    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
    let textNode: Node | null = walker.nextNode()
    let match: Range | null = null

    while (textNode) {
      const value = textNode.textContent || ''
      const position = normalize(value).indexOf(needle)
      if (position !== -1) {
        const range = document.createRange()
        range.setStart(textNode, position)
        range.setEnd(textNode, Math.min(value.length, position + needle.length))
        match = range
        break
      }
      textNode = walker.nextNode()
    }

    target.classList.add('knowledge-search-target')

    // The CSS Highlight API emphasizes the exact word without changing the DOM.
    const highlights = (CSS as unknown as {
      highlights?: { set: (key: string, value: unknown) => void; delete: (key: string) => void }
    }).highlights
    const HighlightClass = (window as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight
    if (match && highlights && HighlightClass) {
      highlights.set('knowledge-search-word', new HighlightClass(match))
    }

    const frame = window.requestAnimationFrame(() => {
      const rect = match ? match.getBoundingClientRect() : target.getBoundingClientRect()
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - 145), behavior: 'instant' })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      target.classList.remove('knowledge-search-target')
      highlights?.delete('knowledge-search-word')
    }
  }, [language, articleId])

  return null
}
