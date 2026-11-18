// Mystery Gifts and Champions News (Sim, Nov 18: The Post Room, The Champions Dispatch, and Home's post band). Hand-kept for now:
// a gift's code goes in only with its source link (an official channel, or two reputable outlets); news is headline, date, type
// and a link to the full story at its source (official news feed). Times are UTC; pages show the viewer's local day.
// Filled by the post-data helper (docs/rebuild/postroom/BRIEF.md); not live until Sim approves the source.
// How it was gathered, sources and their terms, what is unverified: docs/rebuild/research/post-data-nov18.md.
// Checked by experiments/post-data-test.mjs (every gift has a source, every code 1 official or 2+ outlet sources, dates parse,
// start before end, every news link https).
//
// SHAPE
// checked  ISO time (UTC) the list was last checked against its sources.
// gifts[]  one entry per gift (a Pokémon, or one kind of item). V2.postNow() puts it at the counter from `start` until `end`,
//          then on the stamp sheet. A gift whose `end` we cannot place is NOT here (see held[]): with no end it would stay live.
//   id       stable id, 'g-...'.
//   kind     'pokemon' | 'item'.
//   name     the contents as players call it ('Training Ticket', 'Gallade').
//   mon      Pokémon gifts: the name as in the site's data (lairRows / sets: 'Indeedee-F', 'Raichu-Alola', 'Sirfetch’d').
//   item     item gifts: which line drawing to use: 'Quick Coupon' | 'Training Ticket' | 'Teammate Ticket' | 'VP' | 'Clothing'
//            | 'Trainer Icon'.
//   amount   how many (1 for a Pokémon).
//   extras   other things that came in the same parcel, as the source lists them ('Quick Coupon ×100'). Optional.
//   how      how it was given. Only Mystery Gifts are kept (Sim, Nov 18: "the gift page shouldn't have pokemon and stuff from
//            battle pass. just mystery gifts"; she chose these two kinds):
//            'Event Gift'        claimed from the in-game mailbox during a campaign, no code.
//            'Serial Code'       a code (or password) shared with everyone, typed in Mystery Gift.
//            Not kept (removed Nov 18; V2.postNow() also keeps any of them off every page): Battle Pass Pokémon, Competition
//            Prizes (online competitions; their Pokémon stay in series[].mon for the Dispatch's series row), Livestream Rewards
//            (personal stream codes), Early Download bonuses.
//   start, end  UTC ISO times. Exact unless named in `approx`.
//   approx   which of 'start' / 'end' are not exact times from the source; `note` says what they are (usually: the source gives
//            the day only, so the start is 00:00 UTC and the end 23:59:59 UTC of that day, or the start is the day of the first
//            report). Optional.
//   code     only when it appears on an official channel, or on 2+ reputable independent outlets, each URL in `src` (the 2-outlet
//            rule and the outlets that count: docs/legal-sources.md, "Codes: the 2-outlet rule"; Analytics Insight never counts).
//   nature, ability, moves   only when a source in `src` prints them. Optional.
//   src      [urls]: the official news page first, then outlets.
//   note     plain words: conditions, conflicts between sources, what is not verified.
// series[] the monthly series rounds (Monthly Challenge Series), oldest first, for the Dispatch's series row.
//   id ('mcs-2026-05'), month ('2026-05'), name (as published), entry (entry period start), start and end (event period, UTC),
//   reg (Regulation Set), battle ('Single' | 'Double'), mon (the Pokémon each finisher got: the round's participation prize, as
//   the round's official page in src lists it; null = "No gift listed"), src. These prizes are not Mystery Gifts, so they are
//   not in gifts[] (Sim, Nov 18); the Dispatch's series row reads mon.
// news[]   the official in-game news feed, newest first as published. Headline, date and type only: no article text, no images
//          (no licence found for either).
//   id ('n' + the feed's id), date (UTC ISO: when the official news item went up), type (the feed's category word, except
//   'Online Competition' -> 'Tournament' and 'News' -> 'Announcement'; others: Maintenance, Battle Pass, Ranked Battles,
//   Regulations, Roster, Campaign, Championships, Update, Issue), kind (the feed's category number), title (as published; only
//   HTML tags and invisible zero-width spaces removed), url (the full story at its source), updated (UTC ISO, only when the
//   item was re-published more than a day later).
//   Interviews: none. The official feed has no interviews; the mock-up's came from fan sites (see the research note).
// held[]   found but not placed (pages ignore it): name, reason, src.
var POST = {checked: '2026-11-18T02:21:50Z',
  gifts: [
    // ---- live on Nov 18 (UTC) ----
    {id: 'g-laic-training-tickets', kind: 'item', item: 'Training Ticket', name: 'Training Ticket', amount: 2, how: 'Serial Code',
      start: '2026-11-11T00:00:00Z', end: '2026-11-22T23:59:00Z', approx: ['start', 'end'], code: 'LA1CTRA1N1NG27',
      src: ['https://nintendoeverything.com/?p=929482', 'https://www.nintendolife.com/guides/pokemon-champions-mystery-gift-codes-list',
        'https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/',
        'https://www.analyticsinsight.net/news/pokémon-champions-free-code-offers-players-two-training-tickets'],
      note: 'Not on an official channel we could find; code printed by Nintendo Everything (Nov 11) and Nintendo Life (Nov 12). ' +
        'Start: day of the first report (Nov 11); Nintendo Everything\'s list says Nov 1, so the real start is unsure. End: both say ' +
        'Nov 22 (day only); Analytics Insight says 11:59 pm UTC.'},
    {id: 'g-coupons-10m1ntrnr', kind: 'item', item: 'Quick Coupon', name: 'Quick Coupons', amount: 100, how: 'Serial Code',
      start: '2026-09-09T00:00:00Z', end: '2026-12-31T23:59:59Z', approx: ['start', 'end'], code: '10M1NTRNR',
      src: ['https://www.levelup.com/noticias/pokemon-champions-tiene-regalos-misteriosos-y-aun-estas-a-tiempo-de-canjearlos/',
        'https://criticalhits.com.br/games/pokemon-champions-recebe-codigo-com-100-quick-coupons-gratis/',
        'https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/'],
      note: 'Not on an official channel we could find; code printed by LevelUp, Critical Hits and Nintendo Everything. Start: Critical ' +
        'Hits says Sep 9, LevelUp and Nintendo Everything Sep 10 (earliest used). End: Dec 31 (day only, no time given). Which partner ' +
        'gave it out is not confirmed by these sources.'},
    {id: 'g-vivillon-icon', kind: 'item', item: 'Trainer Icon', name: 'Vivillon Trainer Icon', amount: 1, how: 'Event Gift',
      start: '2026-10-29T06:00:00Z', end: '2027-01-31T14:59:59Z', extras: ['Training Ticket ×6', '666 VP'],
      src: ['https://champions-news.pokemon-home.com/en/page/850.html'],
      note: 'Vivillon Visitor Campaign. Only for players who bring a Vivillon befriended in Pokémon Legends: Z-A over through Pokémon HOME.'},
    // ---- past ----
    {id: 'g-worlds-outfit', kind: 'item', item: 'Clothing', name: '2026 Worlds Outfit Set (red cap and shirt)', amount: 1, how: 'Serial Code',
      start: '2026-08-28T00:00:00Z', end: '2026-09-03T23:59:00Z', approx: ['start'],
      src: ['https://www.levelup.com/en/news/pokemon-world-championships-2026-here-are-all-the-freebies-you-can-get-by-watching-the-event/',
        'https://insider-gaming.com/2026-pokemon-world-championships-twitch-drops/'],
      note: 'Password shown on the Worlds stream. Code not verified (not printed by 2 reputable outlets we read). Start: first day of the ' +
        'stream (day only). End: LevelUp (Sep 3, 4:59 PM PDT); Insider Gaming gives none and a French fan site says Oct 3, so unsure.'},
    {id: 'g-mobile-raichu', kind: 'pokemon', mon: 'Raichu', name: 'Raichu', amount: 1, how: 'Event Gift',
      start: '2026-06-17T02:00:00Z', end: '2026-09-02T01:59:59Z', extras: ['Raichunite X', 'Raichunite Y'],
      src: ['https://champions-news.pokemon-home.com/en/page/773.html'],
      note: 'Campaign for the mobile version\'s release; claimed from the in-game mailbox.'},
    // ---- past: serial codes reported by outlets (no official page found) ----
    {id: 'g-coupons-hajimari', kind: 'item', item: 'Quick Coupon', name: 'Quick Coupons', amount: 100, how: 'Serial Code',
      start: '2026-06-17T00:00:00Z', end: '2026-08-31T23:59:59Z', approx: ['start', 'end'],
      src: ['https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/'],
      note: 'Code not verified (one outlet only). Dates: Nintendo Everything\'s list (days only).'},
    {id: 'g-naic-coupons', kind: 'item', item: 'Quick Coupon', name: 'Quick Coupons', amount: 22, how: 'Serial Code',
      start: '2026-06-14T00:00:00Z', end: '2026-06-14T23:59:59Z', approx: ['start', 'end'], code: 'NA1CCHAMP',
      src: ['https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/',
        'https://www.nintendolife.com/guides/pokemon-champions-mystery-gift-codes-list'],
      note: 'Code printed by Nintendo Everything and Nintendo Life (which calls them "Quick Tokens"). One day, Jun 14 (day only).'},
    {id: 'g-charizard', kind: 'pokemon', mon: 'Charizard', name: 'Charizard', amount: 1, how: 'Serial Code',
      start: '2026-06-06T00:00:00Z', end: '2026-06-14T23:59:59Z', approx: ['start', 'end'], code: 'L12ARD0NPJCS26',
      ability: 'Blaze', moves: ['Flare Blitz', 'Dragon Claw', 'Thunder Punch', 'Dragon Dance'],
      src: ['https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/',
        'https://www.vice.com/en/article/pokemon-champions-limited-time-pokemon-code-details/',
        'https://www.nintendolife.com/guides/pokemon-champions-mystery-gift-codes-list'],
      note: 'Title "Charizard the Festive". Code printed by Nintendo Everything, Vice and Nintendo Life. End Jun 14 per Nintendo Everything ' +
        'and Vice (days only); Nintendo Life says Jul 14 (outvoted). Ability and moves: Vice only.'},
    {id: 'g-gyarados', kind: 'pokemon', mon: 'Gyarados', name: 'Gyarados', amount: 1, how: 'Serial Code',
      start: '2026-05-24T00:00:00Z', end: '2026-05-31T23:59:59Z', approx: ['start', 'end'], code: 'DRAG0NDANCEPTC26',
      ability: 'Intimidate', moves: ['Waterfall', 'Earthquake', 'Ice Fang', 'Dragon Dance'],
      src: ['https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/',
        'https://www.nintendolife.com/news/2026/05/new-limited-time-pokemon-champions-distribution-now-available',
        'https://www.nintendolife.com/guides/pokemon-champions-mystery-gift-codes-list'],
      note: 'Title "Gyarados the Festive"; shown at the Pokémon Trainers Cup (South Korea). Code printed by Nintendo Everything and Nintendo ' +
        'Life. May 24 to May 31 (days only). Ability and moves: Nintendo Life.'},
    {id: 'g-machamp', kind: 'pokemon', mon: 'Machamp', name: 'Machamp', amount: 1, how: 'Serial Code',
      start: '2026-04-08T00:00:00Z', end: '2026-08-31T23:59:59Z', approx: ['start', 'end'], code: 'CHAMP10N',
      ability: 'No Guard', moves: ['Dynamic Punch', 'Stone Edge', 'Ice Punch', 'Bullet Punch'],
      src: ['https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/',
        'https://www.nintendolife.com/news/2026/04/psa-pokemon-champions-first-mystery-gift-distribution-now-live',
        'https://www.nintendolife.com/guides/pokemon-champions-mystery-gift-codes-list'],
      note: 'The first Mystery Gift. Code printed by Nintendo Everything and Nintendo Life. Apr 8 (Nintendo Everything) to Aug 31 (both; ' +
        'days only). Ability and moves: Nintendo Life.'}
  ],
  series: [
    {id: 'mcs-2026-05', month: '2026-05', name: 'The Monthly Challenge Series May 2026', entry: '2026-05-22T02:00:00Z',
      start: '2026-05-29T02:00:00Z', end: '2026-06-01T01:59:59Z', reg: 'M-A', battle: 'Single', mon: 'Gallade',
      src: 'https://champions-news.pokemon-home.com/en/page/762.html'},
    {id: 'mcs-2026-06', month: '2026-06', name: 'The Monthly Challenge Series June 2026', entry: '2026-06-19T02:00:00Z',
      start: '2026-06-26T02:00:00Z', end: '2026-06-29T01:59:59Z', reg: 'M-B', battle: 'Single', mon: 'Tyranitar',
      src: 'https://champions-news.pokemon-home.com/en/page/780.html'},
    {id: 'mcs-2026-07', month: '2026-07', name: 'The Monthly Challenge Series July 2026', entry: '2026-07-17T02:00:00Z',
      start: '2026-07-24T02:00:00Z', end: '2026-07-27T01:59:59Z', reg: 'M-B', battle: 'Single', mon: 'Mawile',
      src: 'https://champions-news.pokemon-home.com/en/page/797.html'},
    {id: 'mcs-2026-08', month: '2026-08', name: 'The Monthly Challenge Series August 2026', entry: '2026-08-14T02:00:00Z',
      start: '2026-08-21T02:00:00Z', end: '2026-08-24T01:59:59Z', reg: 'M-B', battle: 'Single', mon: 'Raichu-Alola',
      src: 'https://champions-news.pokemon-home.com/en/page/805.html'},
    {id: 'mcs-2026-09', month: '2026-09', name: 'The Monthly Challenge Series September 2026', entry: '2026-09-11T02:00:00Z',
      start: '2026-09-18T02:00:00Z', end: '2026-09-21T01:59:59Z', reg: 'M-C', battle: 'Single', mon: 'Indeedee-F',
      src: 'https://champions-news.pokemon-home.com/en/page/824.html'},
    {id: 'mcs-2026-10', month: '2026-10', name: 'The Monthly Challenge Series October 2026', entry: '2026-10-16T02:00:00Z',
      start: '2026-10-23T02:00:00Z', end: '2026-10-26T01:59:59Z', reg: 'M-C', battle: 'Single', mon: 'Sirfetch’d',
      src: 'https://champions-news.pokemon-home.com/en/page/847.html'},
    {id: 'mcs-2026-11', month: '2026-11', name: 'The Monthly Challenge Series November 2026', entry: '2026-11-13T02:00:00Z',
      start: '2026-11-20T02:00:00Z', end: '2026-11-23T01:59:59Z', reg: 'M-C', battle: 'Single', mon: 'Pawmot',
      src: 'https://champions-news.pokemon-home.com/en/page/869.html'}
  ],
  held: [
    {name: '5,000 VP (code W0R1DCHAMP10NS26)', reason: 'Code printed by Nintendo Everything and LevelUp (start Aug 21), but both give no end ' +
      'date while other guides say Aug 31; with no end it would show as live forever, so it waits for a confirmed end.',
      src: ['https://nintendoeverything.com/pokemon-champions-mystery-gift-codes-list/',
        'https://www.levelup.com/noticias/pokemon-champions-tiene-regalos-misteriosos-y-aun-estas-a-tiempo-de-canjearlos/']},
    {name: '500 VP (NAIC shared code)', reason: 'One outlet only (Insider Gaming: ends Jun 14, 23:59 UTC); not on Nintendo Everything\'s or ' +
      'Nintendo Life\'s lists.', src: ['https://insider-gaming.com/new-pokemon-champions-free-vp-mystery-gift-released/']},
    {name: '50 Quick Coupons (Worlds co-streamer reward)', reason: 'One outlet only (LevelUp), no dates.',
      src: ['https://www.levelup.com/en/news/pokemon-world-championships-2026-here-are-all-the-freebies-you-can-get-by-watching-the-event/']}
  ],
  news: [
    {id: 'n877', date: '2026-11-18T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Wednesday, December 2, 2026 Battle Balance Adjustments', url: 'https://champions-news.pokemon-home.com/en/page/877.html'},
    {id: 'n869', date: '2026-11-04T04:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series November 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/869.html'},
    {id: 'n868', date: '2026-11-04T04:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-8 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/868.html'},
    {id: 'n867', date: '2026-11-04T04:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-8 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/867.html'},
    {id: 'n866', date: '2026-11-04T04:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/866.html'},
    {id: 'n865', date: '2026-11-02T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/865.html'},
    {id: 'n852', date: '2026-10-29T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Mega Evolution Battle Competition Is On!', url: 'https://champions-news.pokemon-home.com/en/page/852.html'},
    {id: 'n850', date: '2026-10-29T06:00:00Z', type: 'Campaign', kind: 6, title: 'Obtain a Vivillon Trainer Icon in the Vivillon Visitor Campaign!', url: 'https://champions-news.pokemon-home.com/en/page/850.html'},
    {id: 'n848', date: '2026-10-07T06:00:00Z', type: 'Tournament', kind: 13, title: 'Take On the 2027 Global Challenge II!', url: 'https://champions-news.pokemon-home.com/en/page/848.html'},
    {id: 'n847', date: '2026-10-07T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series October 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/847.html'},
    {id: 'n846', date: '2026-10-07T06:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-7 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/846.html'},
    {id: 'n845', date: '2026-10-07T06:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-7 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/845.html'},
    {id: 'n844', date: '2026-10-07T06:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/844.html'},
    {id: 'n843', date: '2026-10-05T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/843.html'},
    {id: 'n834', date: '2026-09-18T02:00:00Z', type: 'Roster', kind: 15, title: 'The 2027 Global Challenge I & II Special Roster', url: 'https://champions-news.pokemon-home.com/en/page/834.html'},
    {id: 'n857', date: '2026-09-16T07:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/857.html'},
    {id: 'n856', date: '2026-09-16T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/856.html'},
    {id: 'n855', date: '2026-09-11T07:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/855.html', updated: '2026-09-23T20:45:15Z'},
    {id: 'n854', date: '2026-09-11T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/854.html'},
    {id: 'n835', date: '2026-09-09T06:00:00Z', type: 'Announcement', kind: 7, title: 'Our Response to Unauthorized Downloads of Pokémon Champions', url: 'https://champions-news.pokemon-home.com/en/page/835.html'},
    {id: 'n825', date: '2026-09-09T06:00:00Z', type: 'Tournament', kind: 13, title: 'Take On the 2027 Global Challenge I!', url: 'https://champions-news.pokemon-home.com/en/page/825.html'},
    {id: 'n824', date: '2026-09-09T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series September 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/824.html'},
    {id: 'n823', date: '2026-09-09T06:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-6 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/823.html'},
    {id: 'n822', date: '2026-09-09T06:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-6 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/822.html'},
    {id: 'n821', date: '2026-09-09T06:00:00Z', type: 'Roster', kind: 15, title: 'Regular Roster M-C', url: 'https://champions-news.pokemon-home.com/en/page/821.html'},
    {id: 'n820', date: '2026-09-09T06:00:00Z', type: 'Announcement', kind: 7, title: 'Age Divisions for Official Competitions in the 2027 Season', url: 'https://champions-news.pokemon-home.com/en/page/820.html'},
    {id: 'n817', date: '2026-09-09T06:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/817.html', updated: '2026-09-10T21:25:15Z'},
    {id: 'n818', date: '2026-09-07T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/818.html'},
    {id: 'n816', date: '2026-08-30T22:00:00Z', type: 'Regulations', kind: 12, title: 'Regulation Set M-C (Updated on September 9)', url: 'https://champions-news.pokemon-home.com/en/page/816.html', updated: '2026-09-09T06:10:15Z'},
    {id: 'n830', date: '2026-08-28T16:00:00Z', type: 'Championships', kind: 14, title: 'Get a Special Worlds Incineroar!', url: 'https://champions-news.pokemon-home.com/en/page/830.html'},
    {id: 'n813', date: '2026-08-24T02:00:00Z', type: 'Roster', kind: 15, title: 'The 2026 Worlds Commemorative Roster', url: 'https://champions-news.pokemon-home.com/en/page/813.html'},
    {id: 'n812', date: '2026-08-05T06:00:00Z', type: 'Announcement', kind: 7, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/812.html'},
    {id: 'n805', date: '2026-08-05T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series August 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/805.html'},
    {id: 'n804', date: '2026-08-05T06:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-5 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/804.html'},
    {id: 'n803', date: '2026-08-05T06:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-5 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/803.html'},
    {id: 'n802', date: '2026-08-03T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/802.html'},
    {id: 'n811', date: '2026-07-16T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/811.html'},
    {id: 'n801', date: '2026-07-08T06:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/801.html'},
    {id: 'n797', date: '2026-07-08T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series July 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/797.html'},
    {id: 'n796', date: '2026-07-08T06:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-4 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/796.html'},
    {id: 'n795', date: '2026-07-08T06:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-4 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/795.html'},
    {id: 'n798', date: '2026-07-06T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/798.html'},
    {id: 'n783', date: '2026-06-17T06:00:00Z', type: 'Announcement', kind: 7, title: 'Membership Perk: Additional Battle Songs (Updated on September 9)', url: 'https://champions-news.pokemon-home.com/en/page/783.html', updated: '2026-09-09T06:10:15Z'},
    {id: 'n780', date: '2026-06-17T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series June 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/780.html', updated: '2026-06-19T04:40:15Z'},
    {id: 'n779', date: '2026-06-17T06:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-3 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/779.html'},
    {id: 'n778', date: '2026-06-17T06:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-3 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/778.html'},
    {id: 'n777', date: '2026-06-17T06:00:00Z', type: 'Roster', kind: 15, title: 'Regular Roster M-B (Updated on August 5)', url: 'https://champions-news.pokemon-home.com/en/page/777.html', updated: '2026-08-05T06:10:15Z'},
    {id: 'n776', date: '2026-06-17T06:00:00Z', type: 'Regulations', kind: 12, title: 'Regulation Set M-B (Updated on August 5)', url: 'https://champions-news.pokemon-home.com/en/page/776.html', updated: '2026-08-05T06:05:15Z'},
    {id: 'n775', date: '2026-06-17T06:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Completion Notice', url: 'https://champions-news.pokemon-home.com/en/page/775.html'},
    {id: 'n774', date: '2026-06-15T02:00:00Z', type: 'Maintenance', kind: 3, title: 'Maintenance Notice', url: 'https://champions-news.pokemon-home.com/en/page/774.html'},
    {id: 'n770', date: '2026-06-12T14:00:00Z', type: 'Announcement', kind: 7, title: 'Get a Special NAIC Blastoise!', url: 'https://champions-news.pokemon-home.com/en/page/770.html'},
    {id: 'n773', date: '2026-06-03T13:00:00Z', type: 'Campaign', kind: 6, title: 'Mega Evolve Raichu in a Campaign Celebrating the Release of the Mobile Version of the Game!', url: 'https://champions-news.pokemon-home.com/en/page/773.html'},
    {id: 'n762', date: '2026-05-13T06:00:00Z', type: 'Tournament', kind: 13, title: 'The Monthly Challenge Series May 2026 Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/762.html', updated: '2026-05-22T07:25:15Z'},
    {id: 'n761', date: '2026-05-13T06:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-2 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/761.html'},
    {id: 'n760', date: '2026-05-13T06:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-2 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/760.html'},
    {id: 'n759', date: '2026-04-24T02:00:00Z', type: 'Roster', kind: 15, title: '2026 Global Challenge Special Roster', url: 'https://champions-news.pokemon-home.com/en/page/759.html'},
    {id: 'n764', date: '2026-04-23T06:00:00Z', type: 'Update', kind: 4, title: 'Pokémon Champions Ver. 1.0.3 Update Notice', url: 'https://champions-news.pokemon-home.com/en/page/764.html', updated: '2026-05-04T18:45:15Z'},
    {id: 'n758', date: '2026-04-09T06:00:00Z', type: 'Issue', kind: 18, title: 'Regarding Current Issues', url: 'https://champions-news.pokemon-home.com/en/page/758.html', updated: '2026-04-23T06:10:15Z'},
    {id: 'n753', date: '2026-04-08T02:00:00Z', type: 'Battle Pass', kind: 16, title: 'Season M-1 Battle Passes', url: 'https://champions-news.pokemon-home.com/en/page/753.html'},
    {id: 'n752', date: '2026-04-08T02:00:00Z', type: 'Tournament', kind: 13, title: 'The Warm-Up Challenge Is Coming!', url: 'https://champions-news.pokemon-home.com/en/page/752.html'},
    {id: 'n751', date: '2026-04-08T02:00:00Z', type: 'Regulations', kind: 12, title: 'Regulation Set M-A', url: 'https://champions-news.pokemon-home.com/en/page/751.html'},
    {id: 'n750', date: '2026-04-08T02:00:00Z', type: 'Roster', kind: 15, title: 'Regular Roster M-A', url: 'https://champions-news.pokemon-home.com/en/page/750.html'},
    {id: 'n746', date: '2026-04-08T02:00:00Z', type: 'Ranked Battles', kind: 11, title: 'Ranked Battles Season M-1 Underway!', url: 'https://champions-news.pokemon-home.com/en/page/746.html'},
    {id: 'n743', date: '2026-03-06T05:00:00Z', type: 'Tournament', kind: 13, title: 'Take On the 2026 Global Challenge I Online Competition!', url: 'https://champions-news.pokemon-home.com/en/page/743.html', updated: '2026-04-07T02:05:15Z'},
    {id: 'n741', date: '2026-03-06T05:00:00Z', type: 'Announcement', kind: 7, title: 'Age Divisions for 2026 Official Competitions (Updated on September 9)', url: 'https://champions-news.pokemon-home.com/en/page/741.html', updated: '2026-09-09T06:15:15Z'},
    {id: 'n718', date: '2026-02-27T14:30:00Z', type: 'Campaign', kind: 6, title: 'Receive Dragonite and 100 Quick Coupons as an early-download bonus!', url: 'https://champions-news.pokemon-home.com/en/page/718.html', updated: '2026-04-07T02:05:15Z'},
    {id: 'n716', date: '2026-02-27T14:30:00Z', type: 'Announcement', kind: 7, title: 'Use Pokémon You’ve Befriended in Pokémon Legends: Z-A in Pokémon Champions', url: 'https://champions-news.pokemon-home.com/en/page/716.html', updated: '2026-03-19T17:30:05Z'}
  ]
};
