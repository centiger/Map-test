let places=[], maps=[], links=[], linkByPlace=new Map(), mapById=new Map();
const $=s=>document.querySelector(s);
const norm=s=>(s||'').toString().toLowerCase().replace(/\s+/g,'').replace(/[()·ㆍ.,-]/g,'');
function gradeBadge(g){return `<span class="badge ${g?'':'null'}">${g||'등급미정'}</span>`}
function mapUrl(m){return m?.preferred_url||m?.primary_url||m?.map_url||m?.url||''}
function altUrl(m){return m?.alternate_url||''}
function placeName(p){return p.canonical_name||p.official_name||p.name||''}
function getLinks(p){return linkByPlace.get(p.id)||[]}
function openUrl(url){ if(url) window.open(url,'_blank','noopener'); }
async function init(){
 const [p,m,l]=await Promise.all([
  fetch('data/places-master.json').then(r=>r.json()),
  fetch('data/map-master.json').then(r=>r.json()),
  fetch('data/place-map-links-master.json').then(r=>r.json())
 ]);
 places=Array.isArray(p)?p:p.places; maps=m.maps||m; links=l.links||l;
 maps.forEach(x=>mapById.set(x.map_id,x));
 links.forEach(x=>{ if(!linkByPlace.has(x.place_id)) linkByPlace.set(x.place_id,[]); linkByPlace.get(x.place_id).push(x); });
 $('#placeCount').textContent=places.length; $('#linkCount').textContent=links.length; $('#mapCount').textContent=maps.length;
 renderChips(); renderHome(); buildMapList();
 $('#searchBtn').onclick=()=>search($('#q').value); $('#q').addEventListener('input',e=>search(e.target.value));
 $('#homeBtn').onclick=()=>{setActive('homeBtn');$('#q').value='';renderHome()};
 $('#allBtn').onclick=()=>{setActive('allBtn');renderList(places,'전체 지명')};
 $('#mapsBtn').onclick=()=>mapDialog.showModal();
 if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function setActive(id){document.querySelectorAll('.footer-nav button').forEach(b=>b.classList.remove('active')); $('#'+id).classList.add('active')}
function renderChips(){ const samples=['예루살렘','하란','갈릴리 바다','요단 강','시내산','고린도','에베소','미스바']; $('#chips').innerHTML=samples.map(s=>`<button class="chip" onclick="q.value='${s}';search('${s}')">${s}</button>`).join('');}
function score(p,q){const n=norm(q); if(!n) return 0; let pool=[placeName(p),p.card_title,p.card_subtitle,p.summary,p.place_meaning,...(p.aliases||[]),...(p.search_keywords||[]),...(p.bmpi_map_labels||[])].filter(Boolean).map(norm); let sc=0; for(const x of pool){ if(x===n) sc=Math.max(sc,100); else if(x.startsWith(n)) sc=Math.max(sc,80); else if(x.includes(n)) sc=Math.max(sc,55); } return sc + Math.min((p.bmpi_map_count||0)*2,20);}
function search(q){setActive('homeBtn'); if(!q.trim()){renderHome();return} const arr=places.map(p=>[score(p,q),p]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).map(x=>x[1]); renderList(arr,`검색 결과: ${q} (${arr.length})`)}
function renderHome(){ const priority=['예루살렘','갈릴리 바다','요단 강','베들레헴','하란','다메섹','고린도','에베소']; const arr=priority.map(n=>places.find(p=>placeName(p)===n || (p.aliases||[]).includes(n))).filter(Boolean); renderList(arr,'대표 지명');}
function renderList(arr,title){$('#resultTitle').textContent=title; if(!arr.length){$('#results').innerHTML='<div class="empty">검색 결과가 없습니다.<br>철자를 줄여서 다시 검색해 보세요.</div>';return} $('#results').innerHTML=arr.slice(0,120).map(renderCard).join('');}
function renderCard(p){const ls=getLinks(p); const first=ls[0]; const m=first?mapById.get(first.map_id):null; return `<div class="card"><div class="row"><div><div class="name">${placeName(p)}</div><div class="meta">${p.id||''} · 지도 ${ls.length||p.bmpi_map_count||0}개 · ${(p.category||p.feature_type||'place')}</div></div>${gradeBadge(p.grade)}</div>${p.card_subtitle?`<div class="summary">${p.card_subtitle}</div>`:''}<div class="actions">${m?`<button class="btn primary" onclick="openUrl('${mapUrl(m)}')">지도보기</button>`:''}${m&&altUrl(m)?`<button class="btn alt" onclick="openUrl('${altUrl(m)}')">고해상도</button>`:''}<button class="btn" onclick="toggleMaps('${p.id}')">연결지도 ${ls.length}</button></div><div class="maps" id="maps-${p.id}" style="display:none">${ls.map(x=>renderMapItem(x)).join('')||'<div class="meta">연결 지도 없음</div>'}</div></div>`}
function renderMapItem(x){const m=mapById.get(x.map_id)||{}; const u=mapUrl(m)||x.map_url; return `<div class="mapitem"><div><div class="map-title">${x.map_id} · ${x.map_title||m.title||''}</div><div class="map-label">표기: ${(x.map_labels||[]).join(', ')}</div></div><div class="actions"><button class="btn primary" onclick="openUrl('${u}')">기본</button>${altUrl(m)?`<button class="btn alt" onclick="openUrl('${altUrl(m)}')">고해상도</button>`:''}</div></div>`}
function toggleMaps(id){const el=$('#maps-'+id); el.style.display=el.style.display==='none'?'block':'none'}
function buildMapList(){ $('#mapList').innerHTML=maps.map(m=>`<div class="mapitem"><div><div class="map-title">${m.map_id} · ${m.title}</div><div class="map-label">${m.url_policy||''}</div></div><div class="actions"><button class="btn primary" onclick="openUrl('${mapUrl(m)}')">기본</button>${altUrl(m)?`<button class="btn alt" onclick="openUrl('${altUrl(m)}')">고해상도</button>`:''}</div></div>`).join('')}
init();
