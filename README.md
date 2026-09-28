# data09-00 · 현장 데이터 수집·디지털화 전문가과정 1차수 — 수강생 프로젝트 모음

**https://aebonlee.github.io/data09-00/**

수강생이 자기 직무의 현안을 직접 기획하고, 그 기획서를 바탕으로 만든 현장 업무 도구를 한 페이지에서 소개합니다.
과제마다 **도구 바로 쓰기 · 기획서(Markdown·Word) · 리포지토리** 링크가 있습니다.

## 목록 갱신

목록은 손으로 적지 않고 옆 폴더의 `data09-NN` 리포(README·기획서)에서 만듭니다. 과제가 늘거나 단계가 바뀌면:

```sh
node scripts/build-data.mjs   # data/projects.js 재생성
```

과제 수가 바뀌면 OG 이미지도 다시 만듭니다(임시 폴더에 `npm i sharp` 후 `node scripts/generate-og-image.mjs <과제수> og-image.png`).

## 구성

- `index.html` · `css/style.css` · `js/app.js` — 정적 페이지(빌드 없음)
- `data/projects.js` — 자동 생성 목록(손으로 고치지 말 것)
- `scripts/build-data.mjs` — 목록 생성기
