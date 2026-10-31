// Events played under extra rules (themed or restricted cups) aren't standard Reg M-C: their teams would skew usage, win rates
// and the team model (sweep, Oct 31: Spooky Cup had Incineroar at 0%, Monotype events are 72–100% single-type teams).
// Every pipeline step skips them by name. The raw files stay in data/ so nothing is lost if a name is matched by mistake.
export const OFF_FORMAT = /off[ -]?meta|spooky|mono ?type|small pok[eé]mon|ultra beast|draft/i;
export const offFormat = name => OFF_FORMAT.test(String(name || ''));
