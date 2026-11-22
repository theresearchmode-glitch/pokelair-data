// How a player reaches Ratings from Home (one option; Home is Sim's call). MOCK-UP ONLY. A "Top 10 right now" strip right under the
// hero: the ten best by rating as small tappable chips (rank, sprite, name, rating), then "SEE ALL RATINGS ›" to #meta. Real data (lairRows).
(() => { const E = V2.esc, top = lairRows().slice(0, 10), hero = document.querySelector('#main section, #main > div > *');
const css = `<style>.hm-top{padding:28px max(24px,calc((100% - 1240px) / 2)) 32px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px 24px;background:var(--k-paper);border-bottom:1px solid var(--k-rule)}
.hm-top h2{margin:0;font-size:var(--t34);line-height:1.1;color:var(--k-ink)}.hm-top h2 em{font-style:inherit;color:var(--k-plot-text)}
.hm-top ol{grid-column:1/-1;grid-row:2;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px 16px}
.hm-top li button{display:grid;grid-template-columns:24px 40px minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;min-height:52px;padding:0;border:0;border-top:1px solid var(--k-rule);background:none;color:var(--k-ink);font:inherit;text-align:left;cursor:pointer}
.hm-top .np-mon{--iw:40px}.hm-top .r{font-size:var(--t20);text-align:right}.hm-top .n{font-size:var(--t15);font-weight:700;line-height:1.2}.hm-top .s{font-size:var(--t20);color:var(--k-plot-text)}
.hm-top .k-go{margin:0;font-size:var(--t17);padding:10px 16px}
@media (max-width:1099.98px){.hm-top{grid-template-columns:minmax(0,1fr)}.hm-top ol{grid-template-columns:repeat(2,minmax(0,1fr))}}</style>`;
const strip = `${css}<section class="hm-top" aria-label="The top 10 right now"><h2 class="u">The top 10 <em>right now.</em></h2><ol>${top.map((x, i) => { const k = lairRank(x.p); return `<li><button type="button" data-v2mon="${E(x.p.n)}"><b class="r u">${k ? k.rank : i + 1}</b>${V2.mon(x.p.n, {bare: true, iw: 40})}<span class="n">${E(x.p.d).replace(/ (\S)$/, "\u00a0$1")}</span><b class="s u">${RS(x.r.total)}</b></button></li>`; }).join('')}</ol>${V2.kGo('SEE ALL RATINGS ›', {href: '#meta'})}</section>`;
// under the hero band (the first full-width section of Home)
document.querySelector('#main .sd-hero').insertAdjacentHTML('afterend', strip); scrollTo(0, 0); })();
