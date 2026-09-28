// OG 이미지 재생성: 임시 폴더에 npm i sharp 후  node scripts/generate-og-image.mjs <과제수> og-image.png  (sharp 는 리포 의존성에 넣지 않는다)
import sharp from 'sharp'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#1f3a5f"/>
<rect x="60" y="60" width="1080" height="510" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
<text x="110" y="170" font-family="Apple SD Gothic Neo" font-size="30" fill="#c9d8ea">NIPA 2026 산업전문인력 AI역량강화 · 건설기계</text>
<text x="110" y="270" font-family="Apple SD Gothic Neo" font-weight="700" font-size="64" fill="#ffffff">현장 데이터 수집·디지털화</text>
<text x="110" y="350" font-family="Apple SD Gothic Neo" font-weight="700" font-size="64" fill="#ffffff">전문가과정 1차수</text>
<text x="110" y="440" font-family="Apple SD Gothic Neo" font-size="36" fill="#e8f0fa">수강생 프로젝트 ${process.argv[2]}개 · 기획서와 바로 쓰는 도구</text>
<text x="110" y="520" font-family="Apple SD Gothic Neo" font-size="26" fill="#9fb6d1">aebonlee.github.io/data09-00</text>
</svg>`
await sharp(Buffer.from(svg)).resize(1200, 630).png().toFile(process.argv[3])
console.log('ok')
