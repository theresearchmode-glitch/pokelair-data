// Every behaviour test ID is unique inside its group (code review C-M1, Nov 16: --only=X-08 ran two different tests).
// The same ID in two groups is allowed (each group follows its own inventory); run.mjs --only takes group:ID for one of them.
//   node app/test/test-ids.mjs   (no browser)
const H = await import('./behaviour/harness.mjs');
for (const g of ['A-team', 'B-build', 'C-battle', 'D-meta-shell', 'Z-smoke']) await import(`./behaviour/${g}.mjs`);
const seen = new Map(), dup = [];
for (const T of H.tests()) { const k = T.group + ':' + T.id; if (seen.has(k)) dup.push(k); seen.set(k, 1); }
console.log(`test-ids: ${seen.size} tests, ${dup.length ? 'duplicates inside a group: ' + dup.join(', ') : 'every ID unique inside its group'}`);
process.exit(dup.length ? 1 : 0);
