// ---------- Evidence lines ----------
// (The Oct 23 outside tier-list snapshot that used to live here, EXT_TIERS, was never scored and was removed on Oct 31.)
// One line of real evidence for a Pokémon, for cards and rankings.
function evidenceLine(p) { const r = rating(p);
  if (r.src) { const t = r.src.tour, o = r.src.official, bits = [];
    // this source's win rates average well above 50%, so show its average next to the number
    if (t) bits.push(`${pctFmt(t[0])} of tournament teams, ${pctFmt(t[1])} of ${t[2].toLocaleString()} games won${r.wrMean != null && isFinite(r.wrMean) ? ` (average Pokémon here: ${Math.round(r.wrMean)}%)` : ''}`);
    if (o && o[2] >= 50) bits.push(`official events: ${pctFmt(o[1])} of ${o[2].toLocaleString()} matches won`);
    if (bits.length) return bits.join(' · '); }
  if (r.usage != null) return `On ${pctFmt(r.usage)} of tournament teams${r.matches ? `, ${pctFmt(r.wr)} of ${r.matches.toLocaleString()} games won` : ''}`;
  return 'No tournament or ladder data yet'; }

