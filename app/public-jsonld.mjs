// Google structured data (JSON-LD) for nastyplot.org public builds (ZERO visible words).
// Values come strictly from docs/rebuild/seo-titles-draft.md and the route list.
// Note: SearchAction is intentionally omitted because the public site has no /?q= search URL (search is an in-page modal).
export const SITE_ORIGIN = 'https://nastyplot.org';

export function websiteJsonLd(homeRow = null) {
  const desc = (homeRow && homeRow.desc) ||
    'Build a winning Pokémon Champions team: Strength Score, damage calc, speed tiers, usage stats and winning tournament teams, updated every day.';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NastyPlot',
    url: SITE_ORIGIN + '/',
    description: desc,
  };
}

export function pokemonBreadcrumbJsonLd(name, displayName = '') {
  const clean = String(name || '').trim();
  if (!clean) return null;
  const label = String(displayName || clean).trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'NastyPlot',
        item: SITE_ORIGIN + '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Ratings',
        item: SITE_ORIGIN + '/meta',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: label,
        item: SITE_ORIGIN + '/pokemon/' + encodeURIComponent(clean),
      },
    ],
  };
}

export function pokemonPageGraphJsonLd(name, displayName = '', homeRow = null) {
  const ws = websiteJsonLd(homeRow);
  const bc = pokemonBreadcrumbJsonLd(name, displayName);
  if (!bc) return ws;
  const {'@context': _, ...wsBody} = ws;
  const {'@context': __, ...bcBody} = bc;
  return {
    '@context': 'https://schema.org',
    '@graph': [wsBody, bcBody],
  };
}

export function jsonLdScriptTag(obj) {
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return `<script type="application/ld+json" id="np-jsonld">${json}</script>`;
}
