(function () {
  var P = window.PROJECTS || []
  var grid = document.getElementById('grid')
  var q = document.getElementById('q')
  var count = document.getElementById('count')
  var kind = ''
  var LATEST = window.PROJECTS_LATEST || ''
  var isRecent = function (p) { return !!LATEST && p.lastDate === LATEST }
  var md = function (d) { return d ? d.slice(5).replace('-', '.') : '' }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag)
    for (var k in attrs || {}) {
      if (k === 'text') n.textContent = attrs[k]
      else n.setAttribute(k, attrs[k])
    }
    ;(kids || []).forEach(function (c) { if (c) n.appendChild(c) })
    return n
  }

  function stageLabel(p) {
    var s = p.stage || ''
    if (/2차|보완|반영/.test(s)) return '1단계 완료 · 보완 반영'
    if (/1단계 개발 완료/.test(s)) return '1단계 완료'
    return s || '기획서 등록'
  }

  function card(p) {
    var isWeb = p.kind === '웹 도구'
    var actions = el('div', { class: 'actions' }, [
      isWeb
        ? el('a', { class: 'btn primary', href: p.toolUrl, target: '_blank', rel: 'noopener', text: '도구 바로 쓰기' })
        : el('a', { class: 'btn primary', href: p.repoUrl + '#실행-방법', target: '_blank', rel: 'noopener', text: '실행 방법 보기' }),
      el('a', { class: 'btn', href: p.planUrl, target: '_blank', rel: 'noopener', text: '기획서' }),
      el('a', { class: 'btn', href: p.planDocx, text: 'Word' }),
      el('a', { class: 'btn', href: p.repoUrl, target: '_blank', rel: 'noopener', text: '리포지토리' }),
    ].concat((p.extras || []).map(function (x) {
      return el('a', { class: 'btn' + (x.tool ? ' sub' : ''), href: x.url, target: '_blank', rel: 'noopener', text: x.label })
    })))
    var metaKids = [el('span', { text: stageLabel(p) })]
    if (p.planVersion) metaKids.push(el('span', { text: '기획서 ' + p.planVersion }))
    if (p.hasDb) metaKids.push(el('span', { text: 'DB 스크립트 포함' }))
    return el('li', { class: 'card', id: p.repo }, [
      el('div', { class: 'card-top' }, [
        el('span', { class: 'no', text: p.no }),
        el('span', { class: 'who', text: p.name }),
        el('span', { class: 'badge ' + (isWeb ? 'web' : 'py'), text: p.kind }),
        isRecent(p) ? el('span', { class: 'badge new', text: md(LATEST) + ' 반영' }) : null,
      ]),
      el('h3', { text: p.title }),
      el('p', { class: 'desc', text: p.oneLine }),
      isRecent(p) && p.planNote ? el('p', { class: 'recent' }, [el('strong', { text: '최근 반영 ' }), document.createTextNode(p.planNote)]) : null,
      el('div', { class: 'meta' }, metaKids),
      actions,
    ])
  }

  function render() {
    var term = (q.value || '').trim().toLowerCase()
    var list = P.filter(function (p) {
      if (kind === 'recent') { if (!isRecent(p)) return false }
      else if (kind && p.kind !== kind) return false
      if (!term) return true
      return (p.no + ' ' + p.name + ' ' + p.title + ' ' + p.oneLine).toLowerCase().indexOf(term) >= 0
    })
    grid.textContent = ''
    list.forEach(function (p) { grid.appendChild(card(p)) })
    count.textContent = list.length === P.length ? '전체 ' + P.length + '개 과제' : P.length + '개 중 ' + list.length + '개'
    if (!list.length) grid.appendChild(el('li', { class: 'empty', text: '조건에 맞는 과제가 없습니다.' }))
  }

  var web = P.filter(function (p) { return p.kind === '웹 도구' }).length
  var stats = document.getElementById('stats')
  ;[['수강생 과제', P.length + '개'], ['바로 쓰는 웹 도구', web + '개'], ['폐쇄망 로컬 도구', P.length - web + '개'], [md(LATEST) + ' 반영', P.filter(isRecent).length + '개'], ['갱신', window.PROJECTS_UPDATED || '']].forEach(function (s) {
    stats.appendChild(el('div', {}, [el('dt', { text: s[0] }), el('dd', { text: s[1] })]))
  })

  var rc = document.querySelector('.chip[data-kind="recent"]')
  if (rc) { if (LATEST) rc.textContent = md(LATEST) + ' 반영'; else rc.hidden = true }

  q.addEventListener('input', render)
  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (b) {
    b.addEventListener('click', function () {
      kind = b.getAttribute('data-kind')
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (x) { x.classList.toggle('is-on', x === b) })
      render()
    })
  })

  var f = document.getElementById('footer')
  var y = new Date().getFullYear()
  ;['© ' + y + ' 드림아이티비즈(DreamIT Biz). All rights reserved.', 'Designed & Developed by Aebon, Ph.D', '| aebon@dreamitbiz.com', '· 카카오톡ID : aebon'].forEach(function (t) {
    f.appendChild(el('span', { text: t }))
  })

  render()
})()
