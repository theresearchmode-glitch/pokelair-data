# Rebuild Checklist: how to keep it current (TOP PRIORITY, RULES.md 00d)

Page: https://claude.ai/artifact/E99Mux9sZxxBuvFXEsKW1V (source: the page's own file in the session that made it; the page's
structure is in its HTML, every tick lives in its shared database). Update it with the ArtifactData tool, in the same message as the work.

## Collections
- `steps`: one document per page and step, id `<page>__<step>`, fields `{s, by, t, note}`.
  - `s`: `done` | `part` | `unsure` | `block` | `""` (not started). `by`: `Claude` or `Sim`. `t`: time in ms (`date +%s%3N`).
  - `note`: plain words. For `part` say what is left; for `unsure` say why; for `block` say what blocks it.
- `items`: open items, ids `i01`, `i02`, ... fields `{title, note, s, order, t}`; `s` as above (`""` = open).

## Steps (the six columns)
`mock` Mock-up approved · `built` Built (ALL of today's features for the page found) · `tests` Behaviour tests green ·
`checks` Heights, polish, both engines · `preview` On the Preview · `ok` Sim's OK (only Sim ticks this one).

## Page ids
My Team: `team` `sheet` `saved` `compare` `box` `info` `sugs` `teamempty` · `home` `build` ·
Battle: `battle` `practice` `gauntlet` `speed` `calc` `types` ·
Meta: `ratings` `usage` `sets` `top` `events` `arch` `weekly` `track` ·
Rest: `method` `about` `legal` `feedback` `states` · Switch: `inv` `ci` `sizes` `use` `go` · Clean-up: `old` `docs`.
(New pages: add them to PHASES in the page's HTML and republish, then tick.)

## Example (one call, several writes; existing documents need `if_version` from a read)
ArtifactData batch, url = the page, writes = [
  {op: "update", collection: "steps", doc_id: "battle__preview", if_version: <v>, data: {s: "done", by: "Claude", t: <ms>}},
  {op: "set", collection: "items", doc_id: "i10", data: {title: "...", note: "...", s: "", order: 10, t: <ms>}}]
