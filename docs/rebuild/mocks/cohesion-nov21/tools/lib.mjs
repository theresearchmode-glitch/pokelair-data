// Shared helpers that write mock-up HTML using ONLY kit2.css parts. Pages pass real data copied from today's built page.
import fs from 'fs';
export const WT = 'C:/Users/simra/code/pl-cohesion', DIR = WT + '/docs/rebuild/mocks/cohesion-nov21';
const R = JSON.parse(fs.readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const BY = Object.fromEntries(R.map(x => [x.n, x]));
// classic type colours for card plates (the same set ratings2/track2/events2 use)
export const TC = { Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C', Grass: '#7AC74C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1', Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A', Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Dark: '#705746', Steel: '#B7B7CE', Fairy: '#D685AD' };
// darker type colours that carry white text (the site's --ty-* set, each 4.6:1+)
export const TD = { Dragon: '#5060E1', Ground: '#9A6230', Fighting: '#BE5718', Poison: '#8E3FC8', Dark: '#5A4A56', Steel: '#447C90', Fire: '#D2411E', Water: '#2774D4', Grass: '#28843C', Fairy: '#BF3CB7', Flying: '#3076C7', Ghost: '#6A4BB8', Psychic: '#D6316F', Ice: '#187E97', Rock: '#7D754B', Electric: '#946F00', Normal: '#737571', Bug: '#677C0F' };
export const mon = n => { const m = BY[n]; if (!m) throw new Error('no roster entry: ' + n); return m; };
export const art = n => `../../../../../app/src/v2/art/${mon(n).id}.webp`;
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// display name split: "Charizard-Mega-Y" -> form "Mega", name "Charizard Y"
export const disp = (n, shown) => { const s = shown || n; const m = s.match(/^Mega (.+)$/); if (m) return ['Mega', m[1]];
  const f = s.match(/^(.+) \((F|M)\)$/); if (f) return [f[2] === 'F' ? 'Female' : 'Male', f[1]]; return ['', s]; };
// the ONE roster card. o: {score, fact, sel, top1, num, tag:[cls,text], shown}
export const card = (n, o = {}) => { const [form, name] = disp(n, o.shown); const t = mon(n).t;
  return `<div class="rcw${o.sel ? ' sel' : ''}${o.top1 ? ' top1' : ''}">${o.score != null ? `<b class="sc u">${o.score}</b>` : ''}${o.num ? `<span class="num">${o.num}</span>` : ''}<div class=rc style="--c:${TC[t[0]]}"><img src="${art(n)}" alt=""><div class=nm><small>${form || '&nbsp;'}</small><b class=u>${esc(name)}</b>${o.fact ? `<i>${o.fact}</i>` : ''}</div></div>${o.tag ? `<span class="tag ${o.tag[0]} u">${o.tag[1]}</span>` : ''}</div>`; };
export const types = n => `<div class=types>${mon(n).t.map(t => `<span class=ty style="--c:${TD[t]}">${t}</span>`).join('')}</div>`;
export const w = (t, on) => `<span class="w${on ? ' on' : ''}"><span>${t}</span></span>`;
export const sentence = (html, hint) => `<div class="sentence u">${html}</div>${hint !== false ? `<p class=hint>${hint || 'Blue words are buttons. Tap one to change it.'}</p>` : ''}`;
export const step = (n, title, note, link, body) => `<section class=step><span class=n>${n}</span><div class=sec><h2 class=u>${title}</h2>${note ? `<span>${note}</span>` : ''}${link ? `<a href=#>${link}</a>` : ''}</div>${body}</section>`;
export const top = active => `<header class=top><img src=../logo.svg alt=NastyPlot><nav>${['Home', 'Build', 'My Team', 'Battle', 'Meta'].map(x => x === active ? `<b>${x}</b>` : `<span>${x}</span>`).join('')}</nav></header>`;
export const head = ({ kicker, h1, lead, status }) => `${status ? `<p class=status>${status}</p>` : ''}<div class=kicker>${kicker}</div><h1 class=u>${h1}</h1>${lead ? `<p class=lead>${lead}</p>` : ''}`;
export const links = arr => `<div class=links>${arr.map(x => x.startsWith('~') ? `<span>${x.slice(1)}</span>` : `<a href=#>${x}</a>`).join('')}</div>`;
export const moves = (list, tyOf) => `<div class=moves>${list.map(([m, ty, extra]) => `<span class=mv style="--c:${TD[ty]}"><span>${m}</span>${extra ? `<small>${extra}</small>` : ''}</span>`).join('')}</div>`;
export const page = (id, nav, body, extraCss = '') => { fs.mkdirSync(DIR + '/pages', { recursive: true });
  fs.writeFileSync(`${DIR}/pages/${id}.html`, `<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${id} · cohesion mock-up</title><link rel=stylesheet href=../kit2.css>${extraCss ? `<style>${extraCss}</style>` : ''}</head><body>\n${top(nav)}<main class=wrap>${body}</main></body></html>\n`); };
// pages live one folder deeper than ratings2.html, so the kit's font paths need one more ../ : pages link a tiny shim
export const byId = id => { const m = R.find(x => x.id === id); if (!m) throw new Error('no roster id ' + id); return m.n; };
export const btnw = (t, on) => `<a href=# class="btnw${on ? ' on' : ''}"><span>${t}</span></a>`;
export const img = (n, px) => `<img src="${art(n)}" alt=""${px ? ` style="width:${px}px;height:${px}px"` : ''}>`;
