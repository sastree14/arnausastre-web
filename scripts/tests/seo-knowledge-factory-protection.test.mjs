import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const workflow=readFileSync(new URL('../../.github/workflows/knowledge-factory.yml',import.meta.url),'utf8')

test('Knowledge Factory publishes generated content through a pull request',()=>{
  assert.match(workflow,/pull-requests: write/)
  assert.match(workflow,/gh pr create --base main --head/)
  assert.match(workflow,/git push origin "HEAD:refs\/heads\/\$branch"/)
  assert.doesNotMatch(workflow,/git push origin "HEAD:\$GITHUB_REF_NAME"/)
  assert.doesNotMatch(workflow,/git push origin main/)
})
