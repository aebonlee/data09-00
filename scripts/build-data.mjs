// 옆 폴더의 data09-NN 리포를 읽어 data/projects.js 를 만든다.
// 과제가 늘면 이 스크립트만 다시 돌리면 된다:  node scripts/build-data.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
// README 가 아직 없는 폴더(다른 작업이 만드는 중)는 건너뛴다
const dirs = readdirSync(ROOT).filter((d) => /^data09-(\d\d)$/.test(d) && d !== 'data09-00' && existsSync(join(ROOT, d, 'README.md'))).sort()
// 다른 리포로 합친 과제는 목록에서 뺀다 — README 에 「| 상태 | **통합됨 → data09-NN** … |」 가 있으면(합친 사실은 받는 쪽 README 진행 단계에 적는다)
const mergedInto = (d) => (readFileSync(join(ROOT, d, 'README.md'), 'utf8').match(/^\|\s*상태\s*\|\s*\**통합됨\s*→\s*(data09-\d\d)/m) || [])[1] || ''
const merged = dirs.filter(mergedInto)
for (const d of merged) { console.log(`${d} → ${mergedInto(d)} 에 통합됨 — 목록에서 뺌`); dirs.splice(dirs.indexOf(d), 1) }

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
  const stage = stripUrl(cell(readme, '진행 단계').replace(/<br\s*\/?>/gi, ' · ')).replace(/\s*·\s*$/, '')
  // 가장 최근 반영일 = 진행 단계에 적힌 날짜 중 가장 늦은 것
  const lastDate = (stage.match(/20\d\d-\d\d-\d\d/g) || []).sort().pop() || ''
  // 이번 판 기획서에 무엇을 반영했는지 = 「문서 상태」 칸의 — 뒤 설명
  const status = cell(plan, '문서 상태')
  const planNote = (status.split(' — ')[1] || '')
    .replace(/\s*\(v\d+\.\d+ = [^)]*\)\s*$/, '')
    .replace(/[.。]?\s*11장 참조\s*$/, '')
    .replace(/\s*\(11장\)|\(11장\)/g, '')
    .replace(/^수강생 제출 자료(?: 기반)? \+ /, '')
    .replace(/20\d\d-\d\d-\d\d\s*/g, '') // 날짜는 lastDate 로 따로 보여 준다
    .replace(/\(\s*/g, '(')
    .trim()
  // 사용자 도메인을 배당한 리포는 루트의 CNAME 파일(Pages 가 서빙하는 도메인)을 쓴다. 없으면 github.io 하위 경로
  const cname = existsSync(join(dir, 'CNAME')) ? readFileSync(join(dir, 'CNAME'), 'utf8').trim().split(/\s+/)[0] : ''
  const siteBase = cname ? `https://${cname}/` : `https://aebonlee.github.io/${repo}/`
  // 한 리포 안의 추가 과제(과제 B 등): 하위 도구 폴더·02 기획서가 있으면 링크를 단다
  const extras = []
  if (existsSync(join(dir, 'report/index.html'))) extras.push({ label: '과제 B 도구', url: `${siteBase}report/`, tool: true })
  const plan2 = readdirSync(join(dir, 'docs')).find((f) => /^02_.*기획서\.md$/.test(f))
  if (plan2) extras.push({ label: '과제 B 기획서', url: `https://github.com/aebonlee/${repo}/blob/main/docs/${encodeURIComponent(plan2)}` })
  return {
    no: repo.slice(-2),
    repo,
    name: cell(readme, '제출자'),
    title,
    oneLine,
    kind: web ? '웹 도구' : '로컬 Python 도구',
    stage,
    lastDate,
    planNote,
    extras,
    planVersion: ver,
    hasDb,
    toolUrl: web ? siteBase : '',
    repoUrl: `https://github.com/aebonlee/${repo}`,
    planUrl: `https://github.com/aebonlee/${repo}/blob/main/docs/01_%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_%EA%B8%B0%ED%9A%8D%EC%84%9C.md`,
    planDocx: `https://github.com/aebonlee/${repo}/raw/main/docs/01_%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_%EA%B8%B0%ED%9A%8D%EC%84%9C.docx`,
  }
})

for (const p of projects) for (const k of ['name', 'title', 'oneLine']) if (!p[k]) throw new Error(`${p.repo}: ${k} 비어 있음`)
const out = `// 자동 생성 — 손으로 고치지 말 것. node scripts/build-data.mjs\nwindow.PROJECTS = ${JSON.stringify(projects, null, 2)};\nwindow.PROJECTS_UPDATED = ${JSON.stringify(new Date().toISOString().slice(0, 10))};\nwindow.PROJECTS_LATEST = ${JSON.stringify(projects.map((p) => p.lastDate).sort().pop() || '')};\n`
writeFileSync(join(HERE, '..', 'data', 'projects.js'), out)
console.log(`과제 ${projects.length}개 → data/projects.js`)
