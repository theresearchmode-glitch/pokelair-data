# Limitless data on a public site: what their pages say (time: 12:23 PM (12:23:40)  date: Fri Nov 27, 2026)
Read with a web scrape (Firecrawl, direct quotes), not legal advice.

- docs.limitlesstcg.com/developer.html: "you do NOT need an API key to access the API. Rate limits apply ... If you need a higher
  usage limit ... you can apply for an API key. However, these are not meant for private use, and are only given out to
  public-facing projects that have a legitimate use-case."
  Plain meaning: the API is open without a key; keys are for public-facing projects, so public projects using the data are expected.
- play.limitlesstcg.com/tos: the quoted clauses cover content users post (players grant Limitless a licence; players keep their
  rights) and an IP-infringement policy. In what was quoted, nothing forbids a third party showing results drawn from the API.
  NOT checked: the full ToS word for word (the scrape returned the matching clauses only).
- Ignore limitlesstcg.co.uk: a different business (a card shop).

Recommendation (HH): before announcing (about Dec 18), apply for an API key as a public-facing project. It is their stated route
for public projects, and it raises our rate limit. Keep the source credit ("Online tournaments, via Limitless") on every page
that shows it, and keep player names out (already done: IDs only, no-names check daily).

## Draft API key application (for Sim to send; HH drafted Fri Nov 27)
Project: NastyPlot (nastyplot.org), a free team builder and Strength Score for Pokémon Champions VGC doubles.
What we use: public tournament placings and team sheets from the Limitless API, read by one scheduled job once a day (every 4 hours for about two weeks after a new regulation starts; checked: .github/workflows/update.yml crons), plus one daily Reg M-D watcher
(not by visitors' browsers); results are cached and shown as usage stats, sets and real winning teams, credited "Online
tournaments, via Limitless" with a link.
Players: we show no player names (IDs only), because many of our users are kids.
Why a key: a public-facing project with a steady, small request rate; we'd like the higher limit so a busy day never misses events.
Contact: hello@nastyplot.org (forwarded; set up before sending).
