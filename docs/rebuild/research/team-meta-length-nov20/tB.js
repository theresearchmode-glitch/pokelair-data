(()=>{if(innerWidth>=700)return;const nav=document.querySelector('.tm-jump'),work=document.querySelector('.tm-work');if(!nav||!work)return;
 V2.jumpSync=()=>{};
 const as=[...nav.querySelectorAll('[data-tmjump]')];work.classList.add('tm-tabbed');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Team sections');
 const show=k=>{as.forEach(a=>{const on=a.dataset.tmjump===k;a.setAttribute('aria-selected',on);a.tabIndex=on?0:-1;a.removeAttribute('aria-current');
   const s=document.getElementById(a.dataset.tmjump);if(s){s.setAttribute('role','tabpanel');s.setAttribute('aria-labelledby',a.id);s.classList.toggle('tm-off',!on);}});};
 as.forEach((a,i)=>{a.id='tmtab-'+a.dataset.tmjump;a.setAttribute('role','tab');a.setAttribute('aria-controls',a.dataset.tmjump);
  a.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show(a.dataset.tmjump);if(nav.getBoundingClientRect().top<=parseFloat(getComputedStyle(nav).top)+1)nav.scrollIntoView({block:'start'});},true);
  a.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;const n=as[(i+d+as.length)%as.length];n.focus();n.click();});});
 // a count on the Suggestions tab, so a team with things to change still sees there is something there
 const sg=document.getElementById('tm-sg');const nfix=sg?sg.querySelectorAll('.tm-sug>li').length:0;const t=as.find(a=>a.dataset.tmjump==='tm-sg');if(t&&nfix)t.insertAdjacentHTML('beforeend',`<span class="tm-tcnt"> ${nfix}</span>`);
 show(as[0].dataset.tmjump);})();
