// Type Chart mock-ups (Nov 14): real numbers from today's shared type logic (20-types-data.js: typeGroups, typeOffence, EFF).
// Shows Garchomp (a 4x weakness and an immunity) with the ability most players run, and your six for the quick buttons.
(() => { const ms = members(), pick = 'Garchomp', p = byName.get(pick), onTeam = ms.find(m => m.p.n === pick);
  const ab = onTeam ? onTeam.ability : (metaAbility(p) || bestAbility(p)), tg = typeGroups(p.t, ab);
  return {n: pick, p, ab, onTeam: !!onTeam, sel: p.t.slice(), groups: tg.groups, abNotes: tg.abNotes, off: typeOffence(p.t),
    team: ms.map(m => m.p.n), types: TYPES.slice(), eff: TYPES.map(a => TYPES.map(d => EFF[a][d]))}; })()
