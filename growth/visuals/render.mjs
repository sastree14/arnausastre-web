import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderVisual } from './templates.mjs'

const [specPath, outputPath] = process.argv.slice(2)
if (!specPath || !outputPath) {
  console.error('Usage: node growth/visuals/render.mjs <spec.json> <output.svg>')
  process.exit(2)
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
const repoRoot = process.cwd()
const logoPath = path.join(repoRoot, 'public', 'brand', 'logo-white.png')
let logoDataUri = null
if (fs.existsSync(logoPath)) {
  const encoded = fs.readFileSync(logoPath).toString('base64')
  logoDataUri = `data:image/png;base64,${encoded}`
}

const markup = renderToStaticMarkup(renderVisual(spec, logoDataUri))
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`, 'utf8')
console.log(outputPath)
