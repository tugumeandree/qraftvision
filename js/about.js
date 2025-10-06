// Lightweight script to load sample data and provide basic interactions
document.addEventListener('DOMContentLoaded', async function(){
  const dataUrl = 'data/vision.json';
  let data;
  try{
    const res = await fetch(dataUrl);
    data = await res.json();
  }catch(e){console.error('Failed to load data',e);return}

  // Fill hero
  document.getElementById('slogan').textContent = data.visionBlock.slogan;
  document.getElementById('vision-statement').textContent = data.visionBlock.statement;
  document.getElementById('vision-sub').textContent = data.visionBlock.subheading;

  // Products
  const productsEl = document.getElementById('products-grid');
  data.products.forEach(p=>{
    const card = document.createElement('article');
    card.className='card product-card';
    card.innerHTML = `<h4>${p.name}</h4><p class="small">${p.description}</p><button class="btn" data-product="${p.id}">Explore</button>`;
    productsEl.appendChild(card);
  });

  // Goals
  const goalsEl = document.getElementById('goals-grid');
  data.goals.forEach(g=>{
    const card = document.createElement('section');
    card.className='card goal-card';
    card.setAttribute('tabindex','0');
    card.innerHTML = `<h3>${g.title}</h3><div class="small">Owner: ${g.owner} • Due: ${g.dueDate}</div>
      <div class="objective-list" aria-live="polite">${g.objectives.map(o=>`<div class="objective"><div><strong>${o.title}</strong><div class="small">${o.metric}: ${o.current}/${o.target} ${o.unit}</div></div><div><span class="donut" style="--p:${Math.min(100,Math.round((o.current/o.target)*100))}%"></span></div></div>`).join('')}</div>`;
    card.addEventListener('click',()=>card.classList.toggle('expanded'));
    card.addEventListener('keypress',(e)=>{if(e.key==='Enter'||e.key===' ')card.click()});
    goalsEl.appendChild(card);
  });

  // Milestones
  const timelineEl = document.getElementById('timeline');
  data.milestones.forEach(m=>{
    const item = document.createElement('div');
    item.className='timeline-item';
    item.innerHTML = `<div><time datetime="${m.date}">${m.date}</time></div><div><strong>${m.description}</strong><div class="small">Status: ${m.status} • Owner: ${m.owner}</div></div>`;
    timelineEl.appendChild(item);
  });

  // KPIs
  const kpisEl = document.getElementById('kpis');
  data.achievements.forEach(a=>{
    const card = document.createElement('div');
    card.className='kpi';
    card.innerHTML = `<div class="small">${a.title} (${a.year})</div><div style="font-size:1.6rem;font-weight:700">${a.value}</div><div class="small">${a.narrative}</div>`;
    kpisEl.appendChild(card);
  })

  // High contrast toggle
  document.getElementById('contrast-toggle').addEventListener('click',()=>{
    document.body.classList.toggle('high-contrast');
  });

  // Simple filter by product
  document.getElementById('product-filter').addEventListener('change',(e)=>{
    const val = e.target.value;
    document.querySelectorAll('.product-card').forEach(card=>{
      if(val==='all' || card.textContent.toLowerCase().includes(val)) card.style.display='block'; else card.style.display='none';
    })
  });
});
