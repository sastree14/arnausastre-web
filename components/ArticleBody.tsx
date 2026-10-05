'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
export function normalizeArticleMarkdown(body:string){return body.replace(/^\*\*([^*\n]+)\*\*\s*$/gm,'## $1')}
export default function ArticleBody({body}:{body:string}){return <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeArticleMarkdown(body)}</ReactMarkdown></div>}
