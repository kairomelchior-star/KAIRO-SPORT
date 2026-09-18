const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav');toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));document.getElementById('year').textContent=new Date().getFullYear();function subscribe(e){e.preventDefault();const email=e.target.querySelector('input').value;alert('Merci ! '+email+' est bien inscrit à Kairo Sport.');e.target.reset()}
async function loadAutomaticNews(){
  const grid=document.getElementById('auto-news-grid');
  const status=document.getElementById('auto-news-status');
  if(!grid) return;
  try{
    const response=await fetch('data/news.json?v='+Date.now(),{cache:'no-store'});
    if(!response.ok) throw new Error('news.json indisponible');
    const data=await response.json();
    const items=Array.isArray(data.items)?data.items:[];
    if(!items.length){
      grid.innerHTML='<p class="auto-news-loading">Les prochaines actualités apparaîtront automatiquement ici.</p>';
      return;
    }
    grid.innerHTML=items.slice(0,6).map(item=>{
      const date=item.published?new Date(item.published):null;
      const dateText=date&&!Number.isNaN(date.getTime())?date.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Date non précisée';
      const safeTitle=(item.title||'Actualité football').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const safeDesc=(item.description||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const safeSource=(item.source||'Source').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return '<article class="auto-news-card"><div><span class="tag">ACTU</span><h3>'+safeTitle+'</h3><p>'+safeDesc+'</p><small>'+safeSource+' · '+dateText+'</small></div><a href="'+item.link+'" target="_blank" rel="noopener noreferrer">Lire la source →</a></article>';
    }).join('');
    if(data.updated_at){
      const updated=new Date(data.updated_at);
      status.textContent='Actualisé le '+updated.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    }
  }catch(error){
    grid.innerHTML='<p class="auto-news-loading">La mise à jour automatique est momentanément indisponible.</p>';
    status.textContent='En attente de mise à jour';
    console.error(error);
  }
}
loadAutomaticNews();
