# News: "The Champions Dispatch" (#news; Sim, Nov 18). Brief from the other chat, word for word below; our rules win
(docs/rebuild/stampede/RULES-FOR-BUILDERS.md). Shared parts of the prompt (content sources, new wording, open points) are in
docs/rebuild/postroom/BRIEF.md.

## Building contract (main thread)
- Page: app/src/v2/pages/dispatch.js (V2.pages.news), CSS app/src/v2/css/sd-dispatch.css, classes .dp-*.
- News comes from V2.postNow().news (POST in app/src/data/post.js): headline, date, type, source link. No article text.
  Every headline is a link to the source (opens in a new tab, rel="noopener").
- Ratings (The Standings), the latest winning six (Latest Result) and upcoming events (Fixtures; Next event box) come from the
  site's data (lairRows / RS, homeChamp(), META.calendar or the Events page's upcoming list: reuse what events.js uses).
  Counts must agree with the rest of the site (the mock-up's "All 30 Events" vs Home's 113: use the same count and word as the
  Events page; say which in the report).
- The clip-out coupon reuses the Post Room's code piece (V2.prCode or similar) and its Copy Code.
- Build the front page as a piece (V2.dpFront(news, {compact})) so the Home post band can show the small version.
- The monthly series row: the rounds and their gifts come from POST (cited) only; "No gift listed" when POST has none.
- Classified ads link to the tools (Battle, Build, My Team, Damage Calc). Their words are new (Sim hasn't signed them off).

---

PAGE 2: NEWS, "THE CHAMPIONS DISPATCH"

The idea: the news page is the front page of a newspaper. One sheet of cream paper on the page, with a faint centre fold, printed in ink with spot colour only: the logo's blue and red, and colour in the Pokémon pictures.

Masthead
- A thin top line: edition number on the left, "Every Pokémon Champions story in one paper" in the centre, "Free · Unofficial" on the right.
- The name very large: "The Champions" in ink, "Dispatch" in blue.
- Under it, three things in a row: a red-outlined box on the left ("In the post": how many gifts are waiting and when one ends), the date and a count of this year's stories in the centre, and a blue-outlined box on the right ("Next event": name, dates, days to go).

Lead story (left two thirds)
- Small blue line with type and date, then a very large headline, a one-line summary, and a red "Ended" rubber stamp at the top right when the event is over.
- Below it, "The series so far, and the gift each round gave out": one column per month with that round's gift Pokémon in a small halftone picture frame and its name, "No gift listed" where there was none, and the current month tinted blue.

Interviews (right third)
- A column with a heading over a blue rule. Each interview has its date, full headline and a "Read the Interview" link, separated by thin rules.

Second row
- Two announcements side by side, each with type and date, headline and a "Read the Story" link; one has a small picture and caption.
- A clip-out coupon on the right: dashed red border with a scissors mark, pale yellow fill, "Clip and claim · Mystery Gift", the live gift's name, its code on a black bar with a Copy Code button, the days left and a link to all Mystery Gifts.

"The Back Page"
- A black bar with a red edge, "The Back Page" on the left and "From around NastyPlot" on the right. Three columns under it:
- Latest Result: the newest event's name, date and player count, and the winner's six in small picture frames with names.
- The Standings: the top five ratings as a ranked table with the ratings in blue, and a link to all ratings.
- Fixtures: the next events, with the day as a large red number, the name, dates, place and days to go, and a link to all events.

Classifieds
- A row of four small boxed ads with a sideways "Classifieds" label. Each is a playful one-liner that links to a tool: Wanted (Battle), For Hire (Build), Lost (My Team), Notice (Damage Calc).

Below the paper
- "Earlier Editions" with the number of older stories on the left, and a small note on the right: "News list checked Nov 17. Each headline opens the full story at its source."

Phone: the same paper in one column, in this order: masthead, the two boxes, lead story with the series row, interviews, announcements, coupon, back page, classifieds.

Dark mode ("Lamplight"): the page goes dark and the paper stays a warm cream, as if lit by a lamp from above, with a soft glow at the top and a deep shadow underneath. Ink stays dark on the paper. The paper never turns black.
