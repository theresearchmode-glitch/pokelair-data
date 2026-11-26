# Switch helper (S1 rehearsal, Nov 19): make the OLD live page load sprites from v2art/ for the ids listed, sp/ for the rest,
# so sp/ files can be removed step by step with no broken picture (removals count toward the 255-per-publish limit).
# usage: python3 switch-mixed-page.py OLD.html IDS_FILE OUT.html [--title "Scratch title"]
# The script goes right after the skeleton's first <body> (never before the doctype: quirks mode).
# OLD.html = the live page as read with Artifact read. IDS_FILE = one sprite id per line (ids whose v2art/<id>.webp is already published).
import sys,json
src=open(sys.argv[1],encoding='utf-8').read()
ids=[l.strip() for l in open(sys.argv[2]) if l.strip()]
reps=[('`sp/${id}.webp`','`${__vp(id)}`'),('"sp/"+id+".webp"','__vp(id)'),('href="sp/${id}.webp"','href="${__vp(id)}"')]
n=0
for a,b in reps:
    n+=src.count(a); src=src.replace(a,b)
assert n==8,'expected 8 sprite paths in the old page, found %d'%n
head=('<title>%s</title>\n'%sys.argv[5]) if len(sys.argv)>5 and sys.argv[4]=='--title' else ''
head+='<script>window.__V2S=new Set(%s);window.__vp=function(id){return(window.__V2S.has(String(id))?"v2art/":"sp/")+id+".webp"}</script>\n'%json.dumps(ids)
i=src.find('<body>')
assert src.startswith('<!doctype html>') and i>0,'old page must start with the publish skeleton (doctype ... <body>)'
if head.startswith('<title>'):
    src=src.replace('<title>NastyPlot</title>','',1)
src=src[:i+6]+head+src[i+6:]
open(sys.argv[3],'w',encoding='utf-8').write(src)
print('replaced',n,'sprite paths; ids on v2art:',len(ids))
