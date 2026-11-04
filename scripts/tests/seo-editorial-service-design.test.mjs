import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL('../../'+path,import.meta.url),'utf8')

test('service category has a two-column hero with What it involves on the right',()=>{
  const hub=source('components/ServiceHubPage.tsx')
  const header=hub.slice(hub.indexOf('<main '),hub.indexOf('</section>'))
  assert.match(header,/lg:grid-cols-2/)
  assert.match(header,/\{t\.overviewLabel\}/)
  assert.match(header,/\{t\.overview\}/)
  assert.match(header,/\{hub\.titles\[lang\]\}/)
  assert.equal((hub.match(/\{t\.overviewLabel\}/g)||[]).length,1)
})

test('specialist grids have no empty tinted outer cells and center incomplete rows',()=>{
  const css=source('app/public-polish.css')
  const grid=css.slice(css.indexOf('/* The specialist directory'))
  assert.match(grid,/justify-content:\s*center/)
  assert.match(grid,/background:\s*transparent/)
  assert.match(grid,/gap:\s*16px/)
  assert.match(grid,/data-count="4"/)
  assert.doesNotMatch(grid,/background:\s*#CBD5E1/)
})

test('specialist page rows use two columns, alternating backgrounds and three clear next steps',()=>{
  const page=source('app/services/[slug]/page.tsx')
  assert.match(page,/md:grid-cols-\[minmax\(0,0\.39fr\)_minmax\(0,0\.61fr\)\]/)
  assert.match(page,/index%2===0\?'bg-white':'bg-\[#EAF0F6\]'/)
  assert.match(page,/actionCards\.map/)
  assert.match(page,/md:grid-cols-3/)
  assert.match(page,/href:caseLink\?\.href \|\| '\/projects'/)
  assert.match(page,/const contactHref=/)
  assert.match(page,/otherLinks\.map/)
})

test('Services promotes general categories rather than individual techniques',()=>{
  const page=source('app/services/page.tsx')
  assert.match(page,/Turn data patterns into useful predictions and decisions/)
  assert.match(page,/Transformamos patrones de datos en predicciones útiles/)
  assert.doesNotMatch(page,/Predictive maintenance and anomaly detection/)
})
