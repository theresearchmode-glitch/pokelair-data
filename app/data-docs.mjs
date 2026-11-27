// The "meta/perf" document the page reads, built one way everywhere (code review C-I2, Nov 17): the daily data job stores all of
// out/perf.json there (ratings-snapshot.mjs), so the build's Preview data, the behaviour tests, the live-site suite and the word
// check all pass the same shape. Before, the tests passed only {adj, updated}, so every rating fell back to the built-in Nov 1 path.
export const perfDoc = (L, perf) => L && L.adj ? Object.assign({adj: L.adj}, perf || {}, {updated: String(L.updated || '').slice(0, 10)}) : null;
