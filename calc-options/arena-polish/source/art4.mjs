// Mock-up art for the Damage Calc scene (look only). scene(weather, terrain) returns a replacement for .arn-bg:
// a sky picture anchored to the horizon from above and a ground picture anchored to it from below, so the horizon never moves at any size.
// Everything is drawn from a seeded random generator, so each picture is the same every time.
const R = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const f = n => Math.round(n * 10) / 10;
const SKY = {
  clear: { g: ['#1C66C9', '#4E9FE9', '#CDE6FA'], far: '#8DB8DE', near: '#6A9CCB', stand: '#3D5574', fog: '#DCEBF8', tint: 'rgba(170,210,255,.0)' },
  sun: { g: ['#C9471A', '#F08528', '#FFDDA0'], far: '#EDA066', near: '#D9793E', stand: '#6A3420', fog: '#FFD69C', tint: 'rgba(255,170,80,.16)' },
  rain: { g: ['#0F1522', '#263046', '#66748D'], far: '#46526A', near: '#323C52', stand: '#1C2232', fog: '#6F7E97', tint: 'rgba(20,30,50,.22)' },
  sand: { g: ['#7E4F22', '#BD8440', '#E9C88A'], far: '#D7A866', near: '#BF8C48', stand: '#5E4026', fog: '#E6C48A', tint: 'rgba(220,170,100,.22)' },
  snow: { g: ['#6585AA', '#A3BAD3', '#E6EEF7'], far: '#D3DFEC', near: '#A9BCD2', stand: '#4E6079', fog: '#EAF1F8', tint: 'rgba(235,242,250,.0)' }};
const GR = {
  none: ['#625C78', '#3A3550', '#1E1A2B'], grassy: ['#5DAE52', '#2E7A34', '#16451D'], electric: ['#2E2A58', '#17143A', '#090820'],
  psychic: ['#B2479C', '#6D1F6A', '#2E0B33'], misty: ['#F6D6EA', '#C99BC8', '#7D5A8E'] };
// the ground's perspective: world X across (-1..1 is the near edge), z depth (0 = the bottom edge of the picture)
const P = (X, z) => [800 + X * 900 / (1 + z), 500 / (1 + z)];
const poly = pts => 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
const ring = (X0, z0, r, n = 64) => 'M' + Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, p = P(X0 + Math.cos(a) * r, z0 + Math.sin(a) * r); return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z';
const line = (a, b) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
const COURT = { x: .98, z0: .03, z1: 2.7, zc: 1.05, cr: .3 };
const courtLines = () => { const { x, z0, z1, zc, cr } = COURT;
  return [poly([P(-x, z0), P(x, z0), P(x, z1), P(-x, z1)]), line(P(-x, zc), P(x, zc)), ring(0, zc, cr), ring(0, zc, .04, 20)].join(' '); };
// a cumulus: lit top, shaded belly, flat base
const cloud = (rnd, x, y, s, top, belly, op = 1) => { const n = 6 + Math.floor(rnd() * 3); let c = '';
  for (let i = 0; i < n; i++) { const t = i / (n - 1), cx = x + (t - .5) * s * 2.2, r = s * (.42 + Math.sin(t * Math.PI) * .5) * (.8 + rnd() * .35); c += `<circle cx="${f(cx)}" cy="${f(y - r * .35)}" r="${f(r)}"/>`; }
  return `<g opacity="${op}"><clipPath id="cc${f(x)}${f(y)}"><rect x="${f(x - s * 3)}" y="${f(y - s * 3)}" width="${f(s * 6)}" height="${f(s * 3 + s * .18)}"/></clipPath>
   <g clip-path="url(#cc${f(x)}${f(y)})"><g fill="${belly}">${c}</g><g fill="${top}" transform="translate(${f(-s * .08)} ${f(-s * .16)})">${c}</g></g></g>`; };
const streaks = (rnd, n, y0, y1, len, w, op, col, ang = .22) => { let d = ''; for (let i = 0; i < n; i++) { const x = rnd() * 1800 - 100, y = y0 + rnd() * (y1 - y0), l = len * (.6 + rnd() * .8); d += `M${f(x)} ${f(y)}l${f(-l * ang)} ${f(l)}`; }
  return `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" fill="none"/>`; };
const flakes = (rnd, n, y0, y1, r0, r1, op, filt = '') => { let c = ''; for (let i = 0; i < n; i++) c += `<circle cx="${f(rnd() * 1600)}" cy="${f(y0 + rnd() * (y1 - y0))}" r="${f(r0 + rnd() * (r1 - r0))}"/>`;
  return `<g fill="#fff" opacity="${op}"${filt}>${c}</g>`; };
const star = (x, y, s) => `M${f(x)} ${f(y - s)}Q${f(x + s * .12)} ${f(y - s * .12)} ${f(x + s)} ${f(y)}Q${f(x + s * .12)} ${f(y + s * .12)} ${f(x)} ${f(y + s)}Q${f(x - s * .12)} ${f(y + s * .12)} ${f(x - s)} ${f(y)}Q${f(x - s * .12)} ${f(y - s * .12)} ${f(x)} ${f(y - s)}Z`;
const defs = p => `<defs><filter id="${p}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter><filter id="${p}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
 <filter id="${p}b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter><filter id="${p}b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
 <filter id="${p}b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs>`;

function sky(w, t) { const S = SKY[w], rnd = R(11), q = 'sk'; let o = defs(q);
  o += `<linearGradient id="skg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.g[0]}"/><stop offset=".55" stop-color="${S.g[1]}"/><stop offset="1" stop-color="${S.g[2]}"/></linearGradient><rect width="1600" height="600" fill="url(#skg)"/>`;
  // the light source
  if (w === 'sun') { o += `<circle cx="820" cy="500" r="420" fill="#FFE2A0" opacity=".45" filter="url(#skb40)"/>`;
    let rays = ''; for (let i = 0; i < 14; i++) { const a = -Math.PI + i / 13 * Math.PI, a2 = a + .07 + rnd() * .05; rays += `M820 500L${f(820 + Math.cos(a) * 1500)} ${f(500 + Math.sin(a) * 1500)}L${f(820 + Math.cos(a2) * 1500)} ${f(500 + Math.sin(a2) * 1500)}Z`; }
    o += `<path d="${rays}" fill="#FFF4D2" opacity=".16" filter="url(#skb8)"/><circle cx="820" cy="500" r="150" fill="#FFF1C4" opacity=".7" filter="url(#skb20)"/><circle cx="820" cy="500" r="78" fill="#FFFBEA"/>`;
    for (const [t, r, c, op] of [[.32, 22, '#FFF6D8', .4], [.48, 48, '#FFB36B', .22], [.62, 14, '#FFFFFF', .45], [.8, 70, '#FF9F5A', .14]]) o += `<circle cx="${f(820 + 560 * t)}" cy="${f(500 - 380 * t)}" r="${r}" fill="${c}" opacity="${op}"/>`; }
  if (w === 'clear') o += `<circle cx="1180" cy="120" r="160" fill="#FFFFFF" opacity=".35" filter="url(#skb40)"/><circle cx="1180" cy="120" r="34" fill="#FFFDF2"/>`;
  if (w === 'sand') o += `<circle cx="1020" cy="230" r="120" fill="#FFE9BC" opacity=".5" filter="url(#skb40)"/><circle cx="1020" cy="230" r="48" fill="#FFF0CF" opacity=".75"/>`;
  // clouds
  if (w === 'clear') { o += '<g filter="url(#skb1)">'; for (const [x, y, s] of [[500, 330, 58], [1240, 380, 66], [880, 430, 36], [330, 440, 30]]) o += cloud(rnd, x, y, s, '#FFFFFF', '#C3D7EC', .95); o += '</g>'; }
  if (w === 'sun') for (const [x, y, s] of [[1220, 190, 50], [380, 130, 32]]) o += cloud(rnd, x, y, s, '#FFD9A8', '#E99260', .7);
  if (w === 'rain') { for (let i = 0; i < 16; i++) o += cloud(rnd, rnd() * 1700 - 50, 120 + rnd() * 170, 70 + rnd() * 60, '#56627A', '#1C2333', .9);
    for (let i = 0; i < 12; i++) o += cloud(rnd, rnd() * 1700 - 50, 20 + rnd() * 120, 90 + rnd() * 70, '#3E4961', '#141A27', 1); }
  if (w === 'snow') { o += `<g filter="url(#skb20)" opacity=".75">`; for (let i = 0; i < 14; i++) o += `<ellipse cx="${f(rnd() * 1600)}" cy="${f(60 + rnd() * 260)}" rx="${f(160 + rnd() * 200)}" ry="${f(40 + rnd() * 50)}" fill="${rnd() < .5 ? '#F4F8FC' : '#B9CADD'}"/>`; o += `</g>`; }
  // distant land
  if (w === 'snow') { let m = 'M-50 600'; for (let x = -50; x <= 1650; x += 130 + rnd() * 90) m += `L${f(x)} ${f(380 + rnd() * 120)}`; o += `<path d="${m}L1650 600Z" fill="${S.far}"/>`;
    let caps = ''; m.slice(1).split('L').slice(1).forEach(pt => { const [x, y] = pt.split(' ').map(Number); if (y < 450) caps += `M${f(x - 46)} ${f(y + 34)}L${f(x)} ${f(y)}L${f(x + 46)} ${f(y + 34)}L${f(x + 18)} ${f(y + 26)}L${f(x)} ${f(y + 40)}L${f(x - 20)} ${f(y + 28)}Z`; }); o += `<path d="${caps}" fill="#FFFFFF" opacity=".9"/>`; }
  else if (w === 'sand') { o += `<path d="M-50 600V470C200 420 380 410 600 452C820 494 1000 420 1240 430C1420 438 1520 470 1650 460V600Z" fill="${S.far}"/><path d="M-50 600V520C260 486 500 500 760 532C1000 560 1260 496 1650 520V600Z" fill="${S.near}"/>`; }
  else { o += `<path d="M-50 600V430C150 396 320 380 520 420C700 456 880 392 1100 400C1300 408 1460 440 1650 420V600Z" fill="${S.far}" opacity=".85"/><path d="M-50 600V500C240 470 460 480 700 512C940 544 1180 470 1650 490V600Z" fill="${S.near}"/>`; }
  // the stadium on the horizon: stands, a rim of lights, two floodlight towers
  const lit = w === 'rain' || w === 'snow' || w === 'sand';
  o += `<path d="M-50 600V540C300 516 560 508 800 508C1040 508 1300 516 1650 540V600Z" fill="${S.stand}"/><path d="M-50 566C300 546 560 540 800 540C1040 540 1300 546 1650 566M-50 586C300 570 560 566 800 566C1040 566 1300 570 1650 586" stroke="#fff" stroke-opacity=".08" stroke-width="2" fill="none"/>`;
  let dots = ''; for (let x = -40; x < 1650; x += 26) { const y = 540 - 32 * Math.cos((x - 800) / 1700 * Math.PI) + 0; dots += `<circle cx="${x}" cy="${f(y + 2)}" r="2.2"/>`; } o += `<g fill="${lit ? '#FFF3C8' : '#FFFFFF'}" opacity="${lit ? .85 : .35}">${dots}</g>`;
  for (const x of [430, 1170]) { o += `<path d="M${x - 3} 600V300h6V600Z" fill="${S.stand}"/><rect x="${x - 34}" y="272" width="68" height="30" rx="4" fill="${S.stand}"/>`;
    o += `<g fill="${lit ? '#FFF6D6' : '#FFFFFF'}" opacity="${lit ? 1 : .45}">${[0, 1, 2, 3].map(i => `<rect x="${x - 29 + i * 15}" y="277" width="11" height="8" rx="2"/><rect x="${x - 29 + i * 15}" y="289" width="11" height="8" rx="2"/>`).join('')}</g>`;
    if (lit) o += `<ellipse cx="${x}" cy="287" rx="90" ry="44" fill="#FFF3C8" opacity=".35" filter="url(#skb20)"/><path d="M${x - 30} 300L${x - 230} 600H${x + 230}L${x + 30} 300Z" fill="#FFF3D0" opacity=".07"/>`; }
  // weather in the air
  if (w === 'sun') o += `<rect y="500" width="1600" height="100" fill="#FFE9B8" opacity=".35" filter="url(#skb8)"/>`;
  if (w === 'rain') o += `<rect y="430" width="1600" height="170" fill="${S.fog}" opacity=".35" filter="url(#skb20)"/>` + `<g filter="url(#skb1)">${streaks(rnd, 260, -60, 600, 50, 1.4, .3, '#C9D8F2')}</g>` + streaks(rnd, 120, -60, 600, 80, 2, .38, '#DCE6F8') + `<g filter="url(#skb1)">${streaks(rnd, 26, -60, 600, 160, 3.2, .45, '#EAF1FF')}</g>`;
  if (w === 'snow') o += `<rect y="440" width="1600" height="160" fill="#F2F6FB" opacity=".5" filter="url(#skb20)"/>` + flakes(rnd, 220, 0, 600, 1, 2, .7) + flakes(rnd, 70, 0, 600, 2.6, 3.8, .9) + flakes(rnd, 16, 0, 600, 7, 10, .85, ' filter="url(#skb3)"');
  if (w === 'sand') { let bands = ''; for (let i = 0; i < 9; i++) { const y = 60 + rnd() * 500; bands += `<path d="M-100 ${f(y)}C300 ${f(y - 60 - rnd() * 60)} 800 ${f(y + 50)} 1700 ${f(y - 40 - rnd() * 80)}" stroke="#FBE3B4" stroke-width="${f(22 + rnd() * 40)}" fill="none" opacity="${f(.12 + rnd() * .14)}"/>`; }
    o += `<g filter="url(#skb20)">${bands}</g><rect y="380" width="1600" height="220" fill="${S.fog}" opacity=".45" filter="url(#skb20)"/>`;
    let gr = ''; for (let i = 0; i < 420; i++) { const x = rnd() * 1600, y = rnd() * 600, l = 3 + rnd() * 9; gr += `M${f(x)} ${f(y)}l${f(l)} ${f(l * .16)}`; } o += `<path d="${gr}" stroke="#FFF1D4" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`; }
  const AU = { grassy: '#7BE06A', electric: '#FFD21F', psychic: '#FF6FD0', misty: '#FFC8EC' }[t];
  if (AU) o += `<linearGradient id="aug" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${AU}" stop-opacity="0"/><stop offset="1" stop-color="${AU}" stop-opacity="${t === 'misty' ? .75 : .6}"/></linearGradient><rect y="330" width="1600" height="270" fill="url(#aug)" style="mix-blend-mode:${t === 'misty' ? 'screen' : 'screen'}"/>`;
  return `<svg class="mk-sky" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${o}</svg>`; }

function ground(w, t) { const S = SKY[w], G = GR[t], rnd = R(29), q = 'gr'; let o = defs(q);
  o += `<linearGradient id="grg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G[0]}"/><stop offset=".4" stop-color="${G[1]}"/><stop offset="1" stop-color="${G[2]}"/></linearGradient><rect width="1600" height="500" fill="url(#grg)"/>`;
  const zs = []; for (let z = 0; z < 40; z = z * 1.0 + .32) zs.push(z);
  if (t === 'none') { o += `<path d="${poly([P(-COURT.x, COURT.z0), P(COURT.x, COURT.z0), P(COURT.x, COURT.z1), P(-COURT.x, COURT.z1)])}" fill="#FFFFFF" opacity=".05"/>`;
    o += `<path d="${courtLines()}" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="7" fill="none" stroke-linejoin="round"/>`; }
  if (t === 'grassy') { let st = ''; for (let i = 0; i < zs.length - 1; i += 2) st += poly([P(-4, zs[i]), P(4, zs[i]), P(4, zs[i + 1]), P(-4, zs[i + 1])]);
    o += `<path d="${st}" fill="#FFFFFF" opacity=".07"/><path d="${courtLines()}" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="7" fill="none"/>`;
    let tuft = ''; const greens = ['#8FD66E', '#6DBE55', '#4E9F43', '#A9E37F'];
    for (let i = 0; i < 170; i++) { const y = 40 + Math.pow(rnd(), .6) * 470, x = rnd() * 1600; if (Math.abs(x - 800) < 330 * y / 500 && y > 120 && rnd() < .8) continue; const s = 6 + y / 500 * 34;
      let d = ''; for (let k = 0; k < 5; k++) { const bx = x + (k - 2) * s * .22, tip = bx + (k - 2) * s * .18 + (rnd() - .5) * s * .3; d += `M${f(bx - s * .07)} ${f(y)}Q${f(bx)} ${f(y - s * .6)} ${f(tip)} ${f(y - s * (.8 + rnd() * .5))}Q${f(bx + s * .05)} ${f(y - s * .5)} ${f(bx + s * .07)} ${f(y)}Z`; }
      tuft += `<path d="${d}" fill="${greens[i % 4]}"/>`; }
    o += tuft; let fl = ''; for (let i = 0; i < 26; i++) { const y = 80 + rnd() * 420, x = rnd() * 1600, r = 1.5 + y / 500 * 4; fl += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${rnd() < .5 ? '#FFFFFF' : '#FFE36B'}"/>`; } o += fl;
    let mo = ''; for (let i = 0; i < 40; i++) mo += `<circle cx="${f(rnd() * 1600)}" cy="${f(rnd() * 480)}" r="${f(2 + rnd() * 4)}"/>`; o += `<g fill="#D9FFB0" opacity=".55" filter="url(#grb3)">${mo}</g>`; }
  if (t === 'electric') { let gl = ''; for (let X = -3; X <= 3.01; X += .25) gl += line(P(X, 0), P(X, 60)); for (const z of zs) gl += line(P(-6, z), P(6, z));
    o += `<path d="${gl}" stroke="#FFE14D" stroke-width="3" opacity=".5" fill="none"/>`;
    o += `<rect width="1600" height="140" fill="#FFE14D" opacity=".35" filter="url(#grb20)"/><g fill="#FFD21F" opacity=".42" filter="url(#grb40)"><ellipse cx="800" cy="250" rx="420" ry="90"/><ellipse cx="360" cy="430" rx="300" ry="80"/><ellipse cx="1260" cy="400" rx="300" ry="80"/></g>`;
    o += `<path d="${courtLines()}" stroke="#FFD21F" stroke-width="26" opacity=".95" fill="none" filter="url(#grb8)"/><path d="${courtLines()}" stroke="#FFF7B8" stroke-width="7" fill="none"/>`;
    let bolt = ''; for (let i = 0; i < 14; i++) { let X = (rnd() - .5) * 3, z = .2 + rnd() * 3, d = 'M' + P(X, z).map(f).join(' '); for (let k = 0; k < 7; k++) { X += (rnd() - .5) * .22; z += .08 + rnd() * .12; d += 'L' + P(X, z).map(f).join(' '); } bolt += d; }
    o += `<path d="${bolt}" stroke="#FFD21F" stroke-width="18" opacity=".9" fill="none" stroke-linejoin="round" filter="url(#grb3)"/><path d="${bolt}" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    let sp = ''; for (let i = 0; i < 46; i++) sp += `<circle cx="${f(rnd() * 1600)}" cy="${f(rnd() * 490)}" r="${f(1.5 + rnd() * 3)}"/>`; o += `<g fill="#FFF6A8">${sp}</g>`; }
  if (t === 'psychic') { o += `<ellipse cx="800" cy="${f(P(0, COURT.zc)[1])}" rx="520" ry="150" fill="#FF7AD6" opacity=".35" filter="url(#grb40)"/>`;
    let rings = ''; [.18, .36, .58, .84, 1.14, 1.5, 1.95, 2.5].forEach((r, i) => { rings += `<path d="${ring(0, COURT.zc, r, 96)}" stroke-width="${i % 2 ? 3.5 : 7}"/>`; });
    o += `<g stroke="#FF7FDA" fill="none" opacity=".85" stroke-width="18" filter="url(#grb8)">${rings}</g><g stroke="#FFE2F7" fill="none" opacity=".95">${rings}</g>`;
    let mo = ''; for (let i = 0; i < 34; i++) { const x = rnd() * 1600, y = rnd() * 480, s = 3 + y / 500 * 12; mo += `<path d="M${f(x)} ${f(y - s)}L${f(x + s * .6)} ${f(y)}L${f(x)} ${f(y + s)}L${f(x - s * .6)} ${f(y)}Z" fill="${rnd() < .5 ? '#FFC6EF' : '#C9A2FF'}" opacity="${f(.5 + rnd() * .4)}"/>`; } o += mo; }
  if (t === 'misty') { o += `<path d="${courtLines()}" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="7" fill="none"/>`;
    let fog = ''; for (let i = 0; i < 16; i++) { const y = 20 + rnd() * 480, s = .5 + y / 500; fog += `<ellipse cx="${f(rnd() * 1700 - 50)}" cy="${f(y)}" rx="${f(220 * s + rnd() * 160)}" ry="${f(34 * s + rnd() * 24)}" fill="${rnd() < .6 ? '#FFFFFF' : '#FFD8F0'}" opacity="${f(.35 + rnd() * .3)}"/>`; }
    o += `<g filter="url(#grb20)">${fog}</g>`; let sp = ''; for (let i = 0; i < 34; i++) { const y = rnd() * 480; sp += `<path d="${star(rnd() * 1600, y, 3 + y / 500 * 10)}" fill="${rnd() < .6 ? '#FFFFFF' : '#FFC4E8'}"/>`; } o += `<g opacity=".9">${sp}</g>`; }
  // the weather on the ground
  if (w === 'sun') o += `<ellipse cx="820" cy="30" rx="760" ry="160" fill="#FFD27A" opacity=".3" filter="url(#grb40)"/><rect width="1600" height="500" fill="${S.tint}"/>`;
  if (w === 'rain') { o += `<rect width="1600" height="500" fill="#0A0F1C" opacity=".14"/>`;
    o += `<g filter="url(#grb20)" opacity=".4">${[430, 1170, 300, 760, 1320].map((x, i) => `<rect x="${x - 26}" y="0" width="52" height="${i < 2 ? 380 : 220}" fill="${i < 2 ? '#FFF2C8' : '#9FB2D4'}"/>`).join('')}</g>`;
    let pd = ''; for (let i = 0; i < 12; i++) { const y = 60 + rnd() * 430, s = y / 500; pd += `<ellipse cx="${f(rnd() * 1600)}" cy="${f(y)}" rx="${f(40 + 140 * s * (.6 + rnd()))}" ry="${f(6 + 24 * s * (.6 + rnd() * .6))}"/>`; }
    o += `<g fill="#8FA3C4" opacity=".22">${pd}</g>`; let rp = ''; for (let i = 0; i < 40; i++) { const y = 30 + rnd() * 470, s = y / 500, x = rnd() * 1600; rp += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + 30 * s)}" ry="${f(2 + 7 * s)}"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(16 + 60 * s)}" ry="${f(4 + 14 * s)}" opacity=".5"/>`; }
    o += `<g fill="none" stroke="#DCE7FA" stroke-width="1.5" opacity=".45">${rp}</g>` + streaks(rnd, 90, -40, 500, 70, 1.6, .3, '#D4E0F5') + `<g filter="url(#grb1)">${streaks(rnd, 20, -40, 500, 150, 3, .4, '#EAF1FF')}</g>`; }
  if (w === 'snow') { o += `<linearGradient id="sng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset="1" stop-color="#E8F0F8" stop-opacity=".35"/></linearGradient><rect width="1600" height="500" fill="url(#sng)"/>`;
    o += `<path d="M-50 500V470C80 430 180 452 300 440C420 428 470 470 560 500ZM1100 500C1180 456 1260 430 1380 444C1480 456 1560 420 1650 436V500Z" fill="#F7FAFD"/><path d="M-50 500V486C120 462 260 476 420 500ZM1240 500C1340 470 1500 462 1650 470V500Z" fill="#C9D7E6" opacity=".7"/>`;
    o += flakes(rnd, 80, 0, 500, 1.5, 3, .85) + flakes(rnd, 12, 0, 500, 7, 11, .85, ' filter="url(#grb3)"'); let sp = ''; for (let i = 0; i < 26; i++) sp += `<path d="${star(rnd() * 1600, 40 + rnd() * 460, 3 + rnd() * 4)}"/>`; o += `<g fill="#FFFFFF" opacity=".8">${sp}</g>`; }
  if (w === 'sand') { o += `<rect width="1600" height="500" fill="#D9AE6A" opacity=".34"/>`; let rip = ''; for (let i = 0; i < 34; i++) { const y = 20 + Math.pow(rnd(), .8) * 470, s = y / 500, x = rnd() * 1500 - 100, l = 120 + 420 * s; rip += `M${f(x)} ${f(y)}c${f(l * .25)} ${f(-8 * s - 2)} ${f(l * .5)} ${f(8 * s + 2)} ${f(l)} 0`; }
    o += `<path d="${rip}" stroke="#F7DCA6" stroke-width="2.5" fill="none" opacity=".6"/><path d="M-50 500V450C140 420 260 446 380 500ZM1180 500C1300 440 1460 426 1650 444V500Z" fill="#E2BC7C"/>`;
    o += `<rect width="1600" height="150" fill="${S.fog}" opacity=".5" filter="url(#grb20)"/>`; let gr = ''; for (let i = 0; i < 220; i++) { const x = rnd() * 1600, y = rnd() * 500, l = 4 + rnd() * 12; gr += `M${f(x)} ${f(y)}l${f(l)} ${f(l * .12)}`; } o += `<path d="${gr}" stroke="#FFF1D4" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>`; }
  const tx = { none: .5, grassy: .45, electric: .25, psychic: .25, misty: .2 }[t] + (w === 'sand' ? .2 : 0);
  o += `<filter id="grn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${t === 'grassy' ? '.9 .12' : '.7 .5'}" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1.1"/></filter><rect width="1600" height="500" filter="url(#grn)" opacity="${tx * .35}" style="mix-blend-mode:overlay"/>`;
  // the horizon: haze where the ground meets the sky
  o += `<linearGradient id="hzg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.fog}" stop-opacity="${w === 'clear' ? .45 : .6}"/><stop offset="1" stop-color="${S.fog}" stop-opacity="0"/></linearGradient><rect width="1600" height="95" fill="url(#hzg)"/>`;
  o += `<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient><rect width="1600" height="500" fill="url(#vg)"/>`;
  return `<svg class="mk-gr" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${o}</svg>`; }

export const scene = (w, t) => `<div class="arn-bg mk" aria-hidden="true"><div class="mk-s">${sky(w, t)}</div><div class="mk-g">${ground(w, t)}</div></div>`;
export const CSS = `.arn-bg.mk .mk-s{position:absolute;left:0;right:0;top:0;height:var(--arn-hz)}.arn-bg.mk .mk-g{position:absolute;left:0;right:0;bottom:0;top:var(--arn-hz)}
.arn-bg.mk svg{position:absolute;inset:0;width:100%;height:100%;display:block}.arn-scene .arn-fx{display:none}`;
