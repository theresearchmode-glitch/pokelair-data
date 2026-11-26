(()=>{const D=document.getElementById('ra-t-D'),F=document.getElementById('ra-t-F'),C=document.getElementById('ra-t-C');if(!D||!F||!C)return;
 const n=[D,F].reduce((a,s)=>a+ +((s.querySelector('.gs-blk small')||{}).textContent||'0').replace(/\D/g,''),0);
 D.classList.add('gs-fold');F.classList.add('gs-fold');
 const b=document.createElement('button');b.type='button';b.className='tr-more gs-foldbtn';b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','ra-t-D ra-t-F');
 const set=o=>{b.setAttribute('aria-expanded',o);D.classList.toggle('on',o);F.classList.toggle('on',o);b.innerHTML=o?'<b class="u">Show Fewer</b><span>Fold the D and F tiers away</span>':`<b class="u">Show D and F tiers ›</b><span>${n} more Pokémon, rated under 60</span>`;};
 set(false);b.addEventListener('click',()=>set(b.getAttribute('aria-expanded')!=='true'));C.after(b);})();
