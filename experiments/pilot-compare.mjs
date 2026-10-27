import fs from 'node:fs'; import {pilotTest} from '../pilot.mjs';
const M = JSON.parse(fs.readFileSync('out/matches.json','utf8')), old = JSON.parse(fs.readFileSync('out/model.json','utf8')).pilot, nw = pilotTest(M);
const show = n => `${n}: old ${old[n] ? old[n].join('/') : '-'}  new ${nw[n] ? nw[n].join('/') : '-'}`;
for (const n of ['Annihilape','Garchomp-Mega','Snorlax','Basculegion-F','Raichu-Mega-X','Sneasler','Incineroar','Kingambit']) console.log(show(n));
console.log('old count', Object.keys(old).length, 'new count', Object.keys(nw).length);

