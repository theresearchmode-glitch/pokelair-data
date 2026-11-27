(()=>{const outs=document.querySelectorAll('.tm-mus .mu-out');if(outs.length<2)return;const fav=outs[1];fav.id='mu-out-fav';
 const n=fav.querySelectorAll('li').length;const lbl=(fav.querySelector('.tm-v')||{}).textContent||'Favoured';
 const b=document.createElement('button');b.type='button';b.className='np-link mu-more mu-favbtn';b.setAttribute('aria-controls','mu-out-fav');
 const set=o=>{b.setAttribute('aria-expanded',o);fav.classList.toggle('mu-fold',!o);b.textContent=o?'Show Fewer':`Show ${n} Favoured ›`;};
 set(false);b.addEventListener('click',()=>set(b.getAttribute('aria-expanded')!=='true'));fav.before(b);})();
