// The scene with the new art (art4) plus the polished controls and plates (mock-up only).
export { scene, CSS } from './art4.mjs';
const IC = { '': '<circle cx="12" cy="12" r="7"/><path d="M7 17L17 7"/>',
  sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  rain: '<path d="M7 14.5a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 18 8a3.3 3.3 0 0 1-.6 6.5Z" fill="currentColor" stroke="none"/><path d="M8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3"/>',
  sand: '<path d="M3 8.5h11a2.5 2.5 0 1 0-2.5-2.5M3 12.5h15a2.5 2.5 0 1 1-2.5 2.5M3 16.5h8"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
  grassy: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" fill="currentColor" stroke="none"/>',
  electric: '<path d="M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6Z" fill="currentColor" stroke="none"/>',
  psychic: '<path d="M12 12.2a1.2 1.2 0 1 1 1.6-1.2 2.8 2.8 0 1 1-3.6 3.2 4.6 4.6 0 1 1 6.8-5.4 6.6 6.6 0 1 1-10.4 2"/>',
  misty: '<path d="M12 3.5c3.2 4 5.5 7 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.8 2.3-5.8 5.5-9.8Z" fill="currentColor" stroke="none"/>' };
const TC = { '': '#FFFFFF', sun: '#FFB23F', rain: '#7FB4FF', sand: '#E2B66E', snow: '#BFE6FF', grassy: '#5FD068', electric: '#FFD21F', psychic: '#FF5FBF', misty: '#FFA9DA' };
export const JS = `(() => { const IC = ${JSON.stringify(IC)}, TC = ${JSON.stringify(TC)};
  document.querySelectorAll('.arn-pills button').forEach(b => { const k = b.dataset.dcw ?? b.dataset.dcterr ?? ''; const d = b.querySelector('.dot'); if (d) d.remove();
    if (!b.querySelector('.mk-ic')) b.insertAdjacentHTML('afterbegin', '<svg class="mk-ic" viewBox="0 0 24 24" aria-hidden="true" style="color:' + TC[k] + '">' + IC[k] + '</svg>'); b.style.setProperty('--k', TC[k]); });
  const hp = document.querySelector('.arn-dp .arn-hpb');
  if (hp && !document.querySelector('.mk-hprow')) { const row = document.createElement('span'); row.className = 'mk-hprow'; hp.before(row); row.innerHTML = '<span class="mk-hpl">HP</span>'; row.append(hp);
    const keep = parseFloat(hp.querySelector('.l').style.width) || 0, r = hp.querySelector('.r'), roll = r ? parseFloat(r.style.width) || 0 : 0, mid = keep + roll / 2;
    hp.classList.add(mid > 50 ? 'mk-g' : mid > 20 ? 'mk-y' : 'mk-r'); hp.insertAdjacentHTML('beforeend', '<i class="mk-lost" style="left:' + (keep + roll) + '%"></i>'); }
  const t = document.querySelector('.arn-hpt'); if (t && !t.querySelector('b')) t.innerHTML = t.textContent.replace(/^(\\S+%)/, '<b>$1</b>');
  const v = document.querySelector('.arn-verdict .l1'); if (v && !v.querySelector('.mk-mv')) v.innerHTML = v.innerHTML.replace(/^([^<]+?) takes/, '<span class="mk-mv">$1</span> takes');
  const tg = document.querySelector('.arn-tag small'); if (tg) tg.classList.add('mk-mv');
  if (!document.querySelector('.mk-shade')) document.querySelector('.arn-bg').insertAdjacentHTML('beforeend', '<i class="mk-shade"></i>'); })()`;
export const CSS2 = `
/* rows: icon over word on phones, beside it from tablets up; the chosen option a white slanted plate with its colour along the foot */
.arn-scene .arn-pills{background:rgba(12,11,18,.74);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);padding:4px}
.arn-scene .arn-pills button{flex-direction:column;gap:2px;font:700 12px/1.1 var(--b);color:#fff;min-height:48px}
.arn-scene .arn-pills .mk-ic{flex:none;width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 1px 1px rgba(0,0,0,.45))}
.arn-scene .arn-pills button[aria-pressed="true"]{color:#17161A}
.arn-scene .arn-pills button[aria-pressed="true"]::before{background:linear-gradient(180deg,#FFFFFF 0,#FFFFFF calc(100% - 4px),var(--k) calc(100% - 4px))}
.arn-scene .arn-pills button[aria-pressed="true"] .mk-ic{filter:none}
.arn-scene .arn-pills button[aria-pressed="true"][data-dcw=""] .mk-ic,.arn-scene .arn-pills button[aria-pressed="true"][data-dcterr=""] .mk-ic{color:#17161A!important}
.arn-scene .arn-pills button[aria-pressed="true"][data-dcterr="electric"] .mk-ic,.arn-scene .arn-pills button[aria-pressed="true"][data-dcw="snow"] .mk-ic,.arn-scene .arn-pills button[aria-pressed="true"][data-dcterr="misty"] .mk-ic{filter:drop-shadow(0 0 1px #17161A) drop-shadow(0 0 0 #17161A)}
/* plates: one slanted shape; the defender's pink edge, the attacker's blue */
.arn-scene .arn-plate{border-radius:0;background:linear-gradient(180deg,rgba(30,28,42,.95),rgba(14,13,22,.95));box-shadow:inset 0 1px 0 rgba(255,255,255,.14);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);padding:8px 22px 9px 15px}
.arn-scene .arn-plate::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--e)}
.arn-scene .arn-dp{--e:#E8364F}.arn-scene .arn-ap{--e:#3FA9F5}
.arn-scene .arn-plate b.u{font-size:17px}.arn-scene .arn-plate .mg{color:#7CC8FF;font-size:12px}.arn-scene .arn-plate .arw{background:#7CC8FF}
/* the HP bar: HP tag, a thick slanted track with quarter ticks, coloured by what is left; the roll striped, the damage a dark red ghost */
.arn-scene .mk-hprow{display:flex;align-items:center;gap:6px;margin:7px 0 5px}
.arn-scene .mk-hpl{flex:none;padding:1px 7px 1px 6px;background:#FFC531;color:#17161A;font:900 10px/1.3 var(--u);font-style:italic;clip-path:polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)}
.arn-scene .arn-dp .arn-hpb{flex:1;height:12px;margin:0;border-radius:0;background:#0A0910;clip-path:polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)}
.arn-scene .arn-hpb .l{background:linear-gradient(180deg,var(--h1) 0 42%,var(--h2) 42%)}
.arn-scene .arn-hpb.mk-g{--h1:#7DF2AE;--h2:#22C064;--hs:#22C064}.arn-scene .arn-hpb.mk-y{--h1:#FFE27A;--h2:#F2B518;--hs:#F2B518}.arn-scene .arn-hpb.mk-r{--h1:#FF9A9A;--h2:#E8364F;--hs:#E8364F}
.arn-scene .arn-hpb .r{background:repeating-linear-gradient(135deg,var(--hs) 0 3px,#5A1729 3px 6px)}
.arn-scene .arn-hpb .mk-lost{position:absolute;top:0;bottom:0;right:0;background:linear-gradient(180deg,#6E1C31,#4A1020)}
.arn-scene .arn-hpb::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent calc(25% - 1px),rgba(10,9,16,.75) calc(25% - 1px) calc(25% + 1px),transparent calc(25% + 1px) calc(50% - 1px),rgba(10,9,16,.75) calc(50% - 1px) calc(50% + 1px),transparent calc(50% + 1px) calc(75% - 1px),rgba(10,9,16,.75) calc(75% - 1px) calc(75% + 1px),transparent calc(75% + 1px))}
.arn-scene .arn-hpt{font:600 12px/1.2 var(--b);color:#C9C5D0}.arn-scene .arn-hpt b{font:900 14px/1 var(--u);font-style:italic;color:#fff;margin-right:3px}
/* the verdict: the move as a chip in its type's colour */
.arn-scene .arn-verdict{padding:7px 26px 8px 14px;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%)}
.arn-scene .arn-verdict .l1{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12.5px}
.arn-scene .mk-mv{display:inline-block;padding:1px 9px;background:#D2411E;color:#fff;font:700 12px/1.5 var(--b);font-style:normal;clip-path:polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)}
.arn-scene .arn-verdict .l2{font-size:17px;margin-top:3px}
.arn-scene .arn-tag small.mk-mv{justify-self:start;font-size:14px;padding:2px 12px;color:#fff;margin-bottom:6px}
.arn-scene .arn-tag{clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%);padding:12px 32px 14px 26px;box-shadow:none}
/* swap: a slanted white key */
.arn-scene .arn-swap{border-radius:0;width:54px;height:48px;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);box-shadow:none}
/* pads: a contact shadow under the feet */
.arn-scene .arn-spr::before{border-width:2.5px;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,.6),rgba(0,0,0,.3) 55%,rgba(40,36,60,.6) 75%)}
/* calm bands behind the two rows */
.arn-bg .mk-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.3) 0,rgba(0,0,0,0) 96px),linear-gradient(0deg,rgba(0,0,0,.45) 0,rgba(0,0,0,0) 160px)}
@media (min-width:700px){.arn-scene .arn-pills button{flex-direction:row;gap:7px;font-size:14px}.arn-scene .arn-plate b.u{font-size:22px}.arn-scene .arn-dp .arn-hpb{height:14px}
 .arn-scene .arn-hpt b{font-size:17px}.arn-scene .arn-hpt{font-size:14px}.arn-scene .mk-hpl{font-size:12px}.arn-scene .arn-verdict .l2{font-size:26px}.arn-scene .arn-plate{padding:10px 26px 11px 17px}}
`;
export const CSS3 = `.arn-scene .arn-hpt{white-space:nowrap}.arn-scene .arn-hpt b{display:inline;font-size:14px}
@media (min-width:700px){.arn-scene .arn-hpt b{font-size:17px}}
@media (min-width:1024px){.arn-scene .arn-verdict .l1{display:none}.arn-scene .arn-verdict.notag .l1{display:flex}}`;
export const CSS4 = `.arn-scene .arn-verdict{padding-top:5px;padding-bottom:6px}.arn-scene .arn-verdict .mk-mv{line-height:1.3;font-size:11.5px}.arn-scene .arn-verdict .l1{font-size:12px;line-height:1.3}
.arn-scene .arn-verdict .l2{margin-top:1px;line-height:1.08}
@media (max-width:379.98px){.arn-scene .arn-hpt{white-space:normal}.arn-scene .arn-hpt b{white-space:nowrap}.arn-scene .arn-verdict .l2{font-size:15px}.arn-scene .arn-plate{padding-right:18px}}
@media (min-width:700px){.arn-scene .arn-verdict{padding-top:8px;padding-bottom:9px}.arn-scene .arn-verdict .mk-mv{font-size:13px}.arn-scene .arn-verdict .l1{font-size:14px}.arn-scene .arn-verdict .l2{margin-top:3px}}`;
export const CSS5 = `@media (max-width:379.98px){.arn-scene{grid-template-rows:64px auto minmax(0,1fr) auto minmax(64px,auto) 64px}.arn-scene .arn-verdict{margin-block:4px}}`;
export const CSS6 = `/* Sim: colours must mean something. HP bar = today's meaning: green left, pink damage, stripes the roll; the HP tag neutral */
.arn-scene .mk-hpl{background:#FFFFFF;color:#17161A}
.arn-scene .arn-hpb.mk-g,.arn-scene .arn-hpb.mk-y,.arn-scene .arn-hpb.mk-r{--h1:#7DF2AE;--h2:#22C064;--hs:#22C064}
.arn-scene .arn-hpb .r{background:repeating-linear-gradient(135deg,#22C064 0 3px,#E8364F 3px 6px)}
.arn-scene .arn-hpb .mk-lost{background:linear-gradient(180deg,#FF5C74 0 42%,#E8364F 42%)}`;
