#!/bin/bash
# Build the Preview into $S/pub/redesign (S = your scratch folder) and run the privacy check: no player name from out/teams.json may
# appear in the page files (only the word "Search" is a known false match). Usage: S=/your/scratch bash docs/rebuild/preview-kit/pubprep.sh
S="${S:?set S to a scratch folder}"; cd "$(dirname "$0")/../../.."
S=$S/pub PREVIEW=1 bash docs/rebuild/preview-kit/rebuild-preview.sh 2>&1 | tail -1; cp docs/rebuild/preview-kit/index.html $S/pub/redesign/
node -e "const fs=require('fs');const t=JSON.parse(fs.readFileSync('out/teams.json','utf8'));const arr=Array.isArray(t)?t:(t.teams||Object.values(t));const names=new Set(arr.map(x=>(x.player||'').trim()).filter(n=>n.length>2));const h=['foundation.html','preview.json','v2.js'].map(f=>{try{return fs.readFileSync('$S/pub/redesign/'+f,'utf8')}catch(e){return ''}}).join('\n');const hit=[...names].filter(n=>h.includes(n));console.log('privacy: player names',names.size,'found in page:',JSON.stringify(hit), hit.every(n=>n==='Search')?'OK':'PROBLEM')"
