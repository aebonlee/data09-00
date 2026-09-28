// 옆 폴더의 data09-NN 리포를 읽어 data/projects.js 를 만든다.
// 과제가 늘면 이 스크립트만 다시 돌리면 된다:  node scripts/build-data.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const dirs = readdirSync(ROOT).filter((d) => /^data09-(\d\d)$/.test(d) && d !== 'data09-00').sort()

const cell = (md, key) => {
  const m = md.match(new RegExp(`^\\|\\s*${key}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, 'm'))
  return m ? m[1].trim() : ''
}
const stripUrl = (s) => s.replace(/\s*—\s*https?:\/\/\S+/g, '').replace(/https?:\/\/\S+/g, '').trim()

const projects = dirs.map((repo) => {
  const dir = join(ROOT, repo)
  const readme = readFileSync(join(dir, 'README.md'), 'utf8')
  const lines = readme.split('\n')
  const h1 = (lines.find((l) => l.startsWith('# ')) || '').replace(/^#\s*/, '')
  const title = h1.includes('·') ? h1.split('·').slice(1).join('·').trim() : h1
  const oneLine = (lines.slice(1).find((l) => l.trim() && !l.startsWith('|') && !l.startsWith('#')) || '').trim()
  const plan = existsSync(join(dir, 'docs/01_프로젝트_기획서.md')) ? readFileSync(join(dir, 'docs/01_프로젝트_기획서.md'), 'utf8') : ''
  const ver = (plan.match(/문서 상태\s*\|\s*[^|]*?(v\d+\.\d+)/) || [])[1] || ''
  const web = existsSync(join(dir, 'index.html'))
  const hasDb = existsSync(join(dir, 'supabase/schema.sql'))
  const stage = stripUrl(cell(readme, '진행 단계'))
  return {
    no: repo.slice(-2),
    repo,
    name: cell(readme, '제출자'),
    title,
    oneLine,
    kind: web ? '웹 도구' : '로컬 Python 도구',
    stage,
    planVersion: ver,
    hasDb,
    toolUrl: web ? `https://aebonlee.github.io/${repo}/` : '',
    repoUrl: `https://github.com/aebonlee/${repo}`,
    planUrl: `https://github.com/aebonlee/${repo}/blob/main/docs/01_%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_%EA%B8%B0%ED%9A%8D%EC%84%9C.md`,
    planDocx: `https://github.com/aebonlee/${repo}/raw/main/docs/01_%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_%EA%B8%B0%ED%9A%8D%EC%84%9C.docx`,
  }
})

for (const p of projects) for (const k of ['name', 'title', 'oneLine']) if (!p[k]) throw new Error(`${p.repo}: ${k} 비어 있음`)
const out = `// 자동 생성 — 손으로 고치지 말 것. node scripts/build-data.mjs\nwindow.PROJECTS = ${JSON.stringify(projects, null, 2)};\nwindow.PROJECTS_UPDATED = ${JSON.stringify(new Date().toISOString().slice(0, 10))};\n`
writeFileSync(join(HERE, '..', 'data', 'projects.js'), out)
console.log(`과제 ${projects.length}개 → data/projects.js`)
