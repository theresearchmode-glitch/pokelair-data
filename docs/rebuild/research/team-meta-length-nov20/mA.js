document.querySelectorAll('.gs-step').forEach(st=>{const blk=st.querySelector('.gs-blk'),wd=st.querySelector('.gs-wd');if(!blk||!wd)return;
 const d=wd.querySelector('span');const btn=wd.querySelector('button');const sm=blk.querySelector('small');const band=blk.querySelector(':scope>span:not(.vh)');
 const w=document.createElement('span');w.className='gs-bw';w.setAttribute('aria-hidden','true');blk.insertBefore(w,band);w.appendChild(band);
 if(d){d.classList.add('gs-bd');w.appendChild(d);} if(btn){btn.classList.add('gs-ball');blk.appendChild(btn);if(sm)sm.classList.add('gs-cnt-hide');}
 wd.remove();});
