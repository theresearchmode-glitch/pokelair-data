# Switch day (runbook 3d, rehearsed Nov 19): writes the 4 publish lists R1..R4 and the 2 mixed-page id lists, and checks
# every step (entries <= 255, files <= 511, every picture the page asks for exists, final 359 files with 0 sp/).
# usage: python3 docs/rebuild/switch-plan.py OUT_DIR   (run from the repo root; art from app/src/v2/art, sprites from app/sp)
import os,sys,json
out=sys.argv[1]; os.makedirs(out,exist_ok=True)
art=sorted(f for f in os.listdir('app/src/v2/art') if f.endswith('.webp'))
SP=sorted(f[:-5] for f in os.listdir('app/sp') if f.endswith('.webp')); sps=set(SP)
assert len(art)==350 and len(SP)==345 and sps<={a[:-5] for a in art}, (len(art),len(SP))
old='archivo-italic-latin archivo-italic-latin-ext archivo-italic-vietnamese dela-gothic-one-latin instrument-sans-italic-latin instrument-sans-italic-latin-ext'.split()
keep='instrument-sans-latin-ext instrument-sans-latin unbounded-cyrillic-ext unbounded-cyrillic unbounded-latin-ext unbounded-latin unbounded-vietnamese'.split()
ids=lambda lst:[a[:-5] for a in lst if a[:-5] in sps]
files={'index.html'}|{'sp/%s.webp'%i for i in SP}|{'fonts/%s.woff2'%f for f in old+keep}
assert len(files)==359
steps=[('R1',None,{'v2art/'+a:a for a in art[:152]}),
 ('R2',ids(art[:255]),{**{'v2art/'+a:a for a in art[152:255]},**{'sp/%s.webp'%i:None for i in ids(art[:152])}}),
 ('R3',SP,{**{'v2art/'+a:a for a in art[255:]},**{'sp/%s.webp'%i:None for i in ids(art[152:255])}}),
 ('R4','NEW',{'v2.js':'v2.js',**{'sp/%s.webp'%i:None for i in ids(art[255:])},**{'fonts/%s.woff2'%f:None for f in old}})]
for name,H,ch in steps:
  for k,v in ch.items(): files.discard(k) if v is None else files.add(k)
  if H=='NEW': need={'v2art/'+a for a in art}|{'v2.js'}|{'fonts/%s.woff2'%f for f in keep}
  elif H is None: need={'sp/%s.webp'%i for i in SP}
  else: hs=set(H); need={('v2art/' if i in hs else 'sp/')+i+'.webp' for i in SP}
  miss=need-files
  assert len(ch)<=255 and len(files)<=511 and not miss, (name,len(ch),len(files),sorted(miss)[:5])
  json.dump(ch,open(os.path.join(out,name+'.json'),'w'),separators=(',',':'))
  if H not in (None,'NEW'): open(os.path.join(out,'ids_'+name+'.txt'),'w').write('\n'.join(H))
  print(name,'entries',len(ch),'files after',len(files),'missing',len(miss))
assert len(files)==359 and not any(f.startswith('sp/') for f in files)
print('final 359 files, 0 sp/. Page per step: R1 old page as is; R2/R3 switch-mixed-page.py OLD ids_R2/ids_R3; R4 app/dist/v2.html.')
print('Publish v2art with root app/src/v2/art (keys v2art/x.webp -> x.webp); v2.js from app/dist. On live: omit capabilities and contract.')
