// Player IDs (Sim, Nov 10: no real player names stored anywhere; each player gets a generated ID number).
// A name is turned into "P" + 10 digits with a keyed hash (HMAC-SHA256). The key lives only in GitHub's locked settings
// (repository secret NP_PID_KEY), so:
//   - the same player gets the same number every day (teams still match across events and with their sets);
//   - no list of names is ever saved;
//   - without the key, nobody can turn a number back into a name, or turn a public name into our number.
// Names exist only in memory while a download is read; every file we save holds the number instead.
// With no key, pid() throws: the daily job then stops before writing, so a missing key can never store a real name.
import crypto from 'crypto';

const KEY = process.env.NP_PID_KEY || '';
export const hasKey = () => KEY.length >= 16;
export const isPid = s => /^P\d{10}$/.test(String(s));
const mac = s => { if (!hasKey()) throw new Error('NP_PID_KEY is missing (GitHub repository secret): refusing to store a player name');
  const h = crypto.createHmac('sha256', KEY).update(s).digest(); return 'P' + String(h.readBigUInt64BE(0) % 10000000000n).padStart(10, '0'); };

// a Limitless account (the account id, not the display name; same rule the win model used: lower case)
export function pid(raw) { const s = String(raw ?? '').trim(); if (!s) return ''; if (isPid(s)) return s; return mac('l:' + s.toLowerCase()); }

// official events (Victory Road, Liquipedia): full names, written differently between sites, so besides the ID we keep
// keyed versions of the name's parts, enough to tell "Ana Lima Silva" = "Silva Ana Lima" without storing either.
export const nkey = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const toks = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
export function opid(raw) { const s = String(raw ?? '').trim(); if (!s) return ''; if (isPid(s)) return s; return mac('o:' + nkey(s)); }
// [the whole name's key, then one key per word in order]
export function okeys(raw) { if (Array.isArray(raw)) return raw; const s = String(raw ?? '').trim(); if (!s) return []; if (isPid(s)) return [s]; return [opid(s), ...toks(s).map(t => mac('w:' + t))]; }
// The same person written two ways, scored on keys (0 = not the same): 4 same text, 3 same words in another order,
// 2 one unbroken part of the longer name, 1 the shorter name's words in order inside the longer one with the same first word
// (Victory Road prints first name + one surname). Used only next to another key (same placement, or best of a list).
export function keyScore(a, b) { const KA = okeys(a), KB = okeys(b); if (!KA.length || !KB.length) return 0; if (KA[0] === KB[0]) return 4;
  const A = KA.slice(1), B = KB.slice(1); if (!A.length || !B.length) return 0;
  if (A.length === B.length && A.slice().sort().join() === B.slice().sort().join()) return 3;
  const [s, l] = A.length <= B.length ? [A, B] : [B, A]; if (s.length < 2) return 0;
  for (let i = 0; i + s.length <= l.length; i++) if (s.every((x, j) => l[i + j] === x)) return 2;
  if (s[0] !== l[0]) return 0; let j = 0; for (const x of l) if (x === s[j]) j++; return j === s.length ? 1 : 0; }
