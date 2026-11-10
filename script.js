const PHONE='2348070685083', FEE=3000, FREE=50000; // WhatsApp number (country code, no +); delivery ₦3,000, free over ₦50,000
const BEST=12; // how many best sellers to show first (keep it even so the grid fills evenly)

/* s = units sold (placeholder numbers: replace with your real sales) */
const RAW=[
 {n:'Red Rose Bouquet',w:'Rose',c:'Romantic',p:25000,s:1840,m:'Love & passion',v:'7 days',f:'Sweet, classic',b:'Anniversaries',o:'Anniversary,Wedding,Birthday'},
 {n:'Blush Peony Bouquet',w:'Peony',c:'Romantic',p:32000,s:1320,m:'Romance & prosperity',v:'5–7 days',f:'Light, rosy',b:'Weddings',o:'Wedding,Anniversary'},
 {n:'Ranunculus Bouquet',w:'Ranunculus asiaticus',c:'Romantic',p:27000,s:590,m:'Charm & radiance',v:'6–8 days',f:'Faint',b:'Date nights',o:'Anniversary,Birthday'},
 {n:'Pink Carnations',w:'Dianthus caryophyllus',c:'Romantic',p:15000,s:870,m:'Admiration',v:'14 days',f:'Spicy-sweet',b:'Thank-yous',o:'Birthday,Graduation'},
 {n:'Sunshine Sunflowers',w:'Sunflower',c:'Cheerful',p:18000,s:1210,m:'Joy & loyalty',v:'7–10 days',f:'Mild, nutty',b:'Birthdays',o:'Birthday,Graduation'},
 {n:'Tulip Garden Mix',w:'Tulip',c:'Cheerful',p:22000,s:980,m:'Perfect love',v:'5–7 days',f:'Barely there',b:'Spring gifts',o:'Birthday,Anniversary'},
 {n:'Gerbera Daisies',w:'Gerbera',c:'Cheerful',p:16000,s:760,m:'Cheer & innocence',v:'7–10 days',f:'None',b:'Get well soon',o:'Birthday,Graduation'},
 {n:'Dahlia Burst',w:'Dahlia',c:'Cheerful',p:26000,s:560,m:'Dignity & commitment',v:'5–7 days',f:'None',b:'Statement gifts',o:'Anniversary,Birthday'},
 {n:'Chrysanthemum Mix',w:'Chrysanthemum',c:'Cheerful',p:17000,s:520,m:'Joy & long life',v:'14+ days',f:'Fresh, herbal',b:'Birthdays',o:'Sympathy,Birthday'},
 {n:'Golden Marigolds',w:'Tagetes',c:'Cheerful',p:10000,s:410,m:'Warmth & celebration',v:'7–10 days',f:'Earthy',b:'Festivals',o:'Birthday'},
 {n:'Oriental Lilies',w:'Lilium',c:'Elegant',p:28000,s:940,m:'Purity & renewal',v:'10–14 days',f:'Rich, strong',b:'Sympathy & home',o:'Sympathy,Wedding'},
 {n:'Moth Orchid Pot',w:'Phalaenopsis',c:'Elegant',p:35000,s:640,m:'Luxury & beauty',v:'2–3 months',f:'Light',b:'Office & gifts',o:'Sympathy,Wedding,Graduation'},
 {n:'Hydrangea Cloud',w:'Hydrangea',c:'Elegant',p:30000,s:700,m:'Gratitude',v:'7 days',f:'None',b:"Mother's Day",o:'Wedding,Sympathy'},
 {n:'Lavender Bundle',w:'Lavandula',c:'Elegant',p:14000,s:600,m:'Calm & devotion',v:'Dries for months',f:'Calming',b:'Home & spa',o:'Sympathy,Anniversary'},
 {n:'Red Hibiscus Bloom',w:'Hibiscus',c:'Tropical',p:12000,s:350,m:'Delicate beauty',v:'2–3 days',f:'None',b:'Décor',o:'Birthday'},
 {n:'Jasmine Stems',w:'Jasminum',c:'Tropical',p:11000,s:430,m:'Grace & sensuality',v:'5 days',f:'Intense, heady',b:'Evenings & weddings',o:'Wedding,Anniversary'}
];
const P=RAW.map((r,i)=>({...r,id:'p'+i,name:r.n,dn:r.w.replace(' caryophyllus','').replace(' asiaticus','')})).sort((a,b)=>b.s-a.s);
const ITEMS={}; P.forEach(p=>ITEMS[p.id]=p);
const TOP=new Set(P.slice(0,4).map(p=>p.id));

const $=s=>document.querySelector(s), naira=n=>'₦'+n.toLocaleString('en-NG');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=(n,c='')=>`<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const wa=t=>`https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`;
const even=a=>a.length>1&&a.length%2?a.slice(0,-1):a; // always an even number so rows fill equally

/* photos + descriptions from the Wikipedia API (no key needed) */
const W={}, IMG={};
const wiki=t=>W[t]||(W[t]=fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(t))
  .then(r=>r.ok?r.json():Promise.reject()).then(d=>({img:d.thumbnail&&d.thumbnail.source,txt:d.extract||''})).catch(()=>({img:'',txt:''})));
function show(el,u,key){ if(key)IMG[key]=u; el.style.setProperty('--p',`url("${u}")`); el.classList.add('ld'); }
function paint(el){
  if(el.dataset.src){ const u=el.dataset.src, im=new Image(); im.onload=()=>show(el,u); im.src=u; return; }
  const t=el.dataset.w; wiki(t).then(d=>{
    if(!d.img) return;
    const big=d.img.replace(/\/\d+px-/,'/500px-'), im=new Image();
    im.onload=()=>show(el,big,t); im.onerror=()=>show(el,d.img,t); im.src=big;
  });
}
const paintAll=r=>(r||document).querySelectorAll('.ph[data-w]:not(.x),.ph[data-src]:not(.x)').forEach(e=>{e.classList.add('x');paint(e)});
const short=s=>{s=(s||'').replace(/\s*\([^)]*\)/g,'');return s.length>120?s.slice(0,117).replace(/\s\S*$/,'')+'…':s};

/* shop */
const cats=['Romantic','Cheerful','Elegant','Tropical'], chips=$('#chips'), grid=$('#grid'), stt=$('#stt');
let searchSeq=0;
function cardHTML(it,badge){
  ITEMS[it.id]=it;
  const photo=it.thumb?`<div class="ph" data-src="${esc(it.thumb)}"></div>`:`<div class="ph" data-w="${esc(it.w)}"></div>`;
  const text=it.desc?`<p class="wt">${esc(short(it.desc))}</p>`:`<p class="wt" data-t="${esc(it.w)}"></p>`;
  const list=it.m?`<li><b>Means</b>${esc(it.m)}</li><li><b>Vase life</b>${esc(it.v)}</li><li><b>Scent</b>${esc(it.f)}</li><li><b>Best for</b>${esc(it.b)}</li>`
    :'<li><b>Type</b>Fresh-cut flower</li><li><b>Made</b>Hand-tied to order</li><li><b>Delivery</b>Same day, Lagos</li>';
  return `<article class="card" data-id="${esc(it.id)}">
   <div class="pw">${badge?`<span class="bs">${ic('star','f')} Best seller</span>`:''}${photo}<button class="ib" aria-label="Details">i</button>
    <div class="dt"><h4>${esc(it.dn||it.name)}</h4>${text}<ul>${list}</ul></div></div>
   <div class="bd"><small>${esc(it.c)}</small><h3>${esc(it.name)}</h3>${it.s?`<span class="sd">${it.s.toLocaleString('en-NG')} sold</span>`:''}
    <div class="row"><span class="pr">${naira(it.p)}</span><button class="buy">Order</button></div></div>
  </article>`;
}
function fill(items,msg,badges){
  grid.innerHTML=items.length?items.map(it=>cardHTML(it,badges&&TOP.has(it.id))).join(''):'<p class="empty">Nothing here yet.</p>';
  stt.textContent=msg; paintAll(grid);
  grid.querySelectorAll('.wt[data-t]').forEach(e=>wiki(e.dataset.t).then(d=>e.textContent=short(d.txt)));
}
function go(f){
  const occ=f.startsWith('o:')?f.slice(2):'', q=f.startsWith('s:')?f.slice(2):'';
  const base=[['best','Best Sellers'],['All','All Flowers'],...cats.map(c=>[c,c])];
  chips.innerHTML=((occ||q)?`<button class="chip on" data-c="best">${esc(occ?occ+' flowers':'“'+q+'”')} ${ic('x')}</button>`:'')
    +base.map(([k,l])=>`<button class="chip${k===f?' on':''}" data-c="${k}">${l}</button>`).join('');
  if(f==='best') fill(P.slice(0,BEST),`Our ${BEST} best sellers, loved most by customers`,true);
  else if(f==='All') fill(P,`All ${P.length} flowers, most popular first`,true);
  else if(occ){ const a=even(P.filter(p=>p.o.split(',').includes(occ))); fill(a,`${a.length} flowers for ${occ.toLowerCase()}, most popular first`,false); }
  else { const a=even(P.filter(p=>p.c===f)); fill(a,`${a.length} ${f.toLowerCase()} flowers, most popular first`,false); }
}
async function search(q){
  q=q.trim(); if(!q){go('best');return}
  const my=++searchSeq;
  chips.innerHTML=`<button class="chip on" data-c="best">“${esc(q)}” ${ic('x')}</button>`;
  stt.textContent=`Searching the world's flowers for “${q}”…`;
  grid.innerHTML='<article class="card"><div class="pw ph"></div></article>'.repeat(4);
  try{
    const u='https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=0&gsrlimit=20&gsrsearch='+encodeURIComponent(q+' flower')
      +'&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=500&exintro=1&explaintext=1&exsentences=2&exlimit=20';
    const d=await (await fetch(u)).json(); if(my!==searchSeq) return;
    const pages=Object.values((d.query&&d.query.pages)||{}).sort((a,b)=>a.index-b.index).filter(p=>p.thumbnail&&!/^(List|Index|Outline)\b/i.test(p.title));
    const items=even(pages.slice(0,BEST)).map(p=>({id:'s'+p.pageid,name:p.title,w:p.title,c:'Search result',p:9000+(p.pageid%12)*1500,s:0,thumb:p.thumbnail.source,desc:p.extract||''}));
    if(!items.length){ grid.innerHTML='<p class="empty">No flowers found. Try “orchid”, “lotus”, “protea” or “jasmine”.</p>'; stt.textContent=`No results for “${q}”`; return }
    fill(items,`${items.length} flower${items.length>1?'s':''} found for “${q}”`,false);
  }catch(e){ stt.textContent='Search is unavailable right now. Check your connection and try again.'; grid.innerHTML='' }
}
chips.onclick=e=>{const b=e.target.closest('.chip');if(b){$('#sq').value='';go(b.dataset.c)}};
$('#sf').onsubmit=e=>{e.preventDefault();search($('#sq').value)};
$('#sq').oninput=e=>{if(!e.target.value.trim())go('best')};
grid.onclick=e=>{
  const card=e.target.closest('.card'); if(!card||!card.dataset.id) return;
  if(e.target.closest('.buy')){add(ITEMS[card.dataset.id]);openCart();return}
  card.classList.toggle('open'); // tap on phones
};

/* cart (saved in the browser) */
let cart=[]; try{cart=(JSON.parse(localStorage.getItem('bp_cart2'))||[]).filter(c=>c&&c.id&&c.name)}catch(e){}
const save=()=>{try{localStorage.setItem('bp_cart2',JSON.stringify(cart))}catch(e){}};
const sub=()=>cart.reduce((s,c)=>s+c.q*c.p,0), fee=()=>cart.length&&sub()<FREE?FEE:0;
function add(it){
  const f=cart.find(c=>c.id===it.id);
  f?f.q++:cart.push({id:it.id,name:it.name,p:it.p,w:it.w||'',img:it.thumb||IMG[it.w]||'',q:1});
  save();draw();const b=$('#cb');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');toast(`Added ${it.name} to your cart`);
}
function draw(){
  const n=cart.reduce((s,c)=>s+c.q,0); $('#cn').textContent=n; $('#cn').hidden=!n;
  const db=$('#db'), df=$('#df');
  if(!cart.length){db.innerHTML='<div class="em"><b>'+ic('flower')+'</b><p>Your cart is empty.<br>Add some flowers to get started.</p><button class="btn" data-x>Browse flowers</button></div>';df.hidden=true;return}
  df.hidden=false;
  db.innerHTML=cart.map((c,k)=>{const u=c.img||IMG[c.w];return `<div class="it" data-k="${k}">
   <div class="ph x ${u?'ld':''}" style="${u?`--p:url('${esc(u)}')`:''}"></div>
   <div><strong>${esc(c.name)}</strong><small>${naira(c.p)} each</small><br><span class="q"><button data-a="-">−</button><b>${c.q}</b><button data-a="+">+</button></span></div>
   <div class="ln">${naira(c.p*c.q)}<button data-a="x">Remove</button></div></div>`}).join('');
  $('#s1').textContent=naira(sub()); $('#s2').textContent=fee()?naira(fee()):'Free'; $('#s3').textContent=naira(sub()+fee());
}
const openCart=()=>{$('#dr').classList.add('on');$('#ov').classList.add('on');document.body.style.overflow='hidden'};
const closeCart=()=>{$('#dr').classList.remove('on');$('#ov').classList.remove('on');document.body.style.overflow=''};
$('#db').onclick=e=>{
  if(e.target.closest('[data-x]')){closeCart();location.hash='#shop';return}
  const a=e.target.dataset.a,row=e.target.closest('.it'); if(!a||!row) return;
  const c=cart[+row.dataset.k]; if(a==='+')c.q++; if(a==='-')c.q--; if(a==='x'||c.q<=0)cart.splice(+row.dataset.k,1);
  save();draw();
};
$('#cb').onclick=openCart; $('#dx').onclick=closeCart; $('#ov').onclick=closeCart;
document.onkeydown=e=>{if(e.key==='Escape')closeCart()};
$('#cl').onclick=()=>{cart=[];save();draw()};
$('#pv').onclick=()=>{
  if(!cart.length) return;
  const ad=$('#ad').value.trim(); if(!ad){toast('Please add your delivery address');$('#ad').focus();return}
  const lines=cart.map(c=>`${c.q} × ${c.name} — ${naira(c.p*c.q)}`).join('\n'), nm=$('#nm').value.trim(), nt=$('#nt').value.trim();
  const msg=`Hello Bloom & Petal! I'd like to order:\n\n${lines}\n\nSubtotal: ${naira(sub())}\nDelivery: ${fee()?naira(fee()):'Free'}\nTotal: ${naira(sub()+fee())}\n\n`+(nm?`Name: ${nm}\n`:'')+`Delivery address: ${ad}`+(nt?`\nNote: ${nt}`:'');
  window.open(wa(msg),'_blank','noopener');
};
let tt; function toast(m){const t=$('#ts');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2200)}

/* page bits */
$('#custom').href=wa("Hello Bloom & Petal! I'd like a custom arrangement.");
const nav=$('#nav'); $('#bg').onclick=()=>nav.classList.toggle('on'); nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('on'));
const pe=$('#petals'); ['#f4a9bd','#e98ba5','#fbd3dc','#c2456b','#f6c1a9'].forEach(col=>{for(let j=0;j<4;j++){const e=document.createElement('span');e.className='pt';
 e.innerHTML=`<svg viewBox="0 0 24 24"><path d="M12 1c5 4 7 9 0 22C5 10 7 5 12 1z" fill="${col}"/></svg>`;
 e.style.cssText=`left:${Math.random()*100}%;width:${14+Math.random()*14}px;height:${14+Math.random()*14}px;--dx:${(Math.random()-.5)*160}px;animation-duration:${9+Math.random()*9}s;animation-delay:${-Math.random()*14}s`;pe.appendChild(e)}});
document.querySelectorAll('.stars').forEach(s=>s.innerHTML=ic('star').repeat(5));
document.querySelectorAll('.oc').forEach(a=>a.onclick=()=>{$('#sq').value='';go('o:'+a.dataset.o)});
document.querySelectorAll('[data-plan]').forEach(a=>{a.href=wa("Hello Bloom & Petal! I'd like to subscribe to the "+a.dataset.plan+" plan.");a.target='_blank';a.rel='noopener'});
go('best'); paintAll(); draw();