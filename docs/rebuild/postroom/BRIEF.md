# Mystery Gifts: "The Post Room" (#gifts; Sim, Nov 18). Brief from the other chat, word for word below; our rules win
(docs/rebuild/stampede/RULES-FOR-BUILDERS.md)

## Building contract (main thread)
- Page: app/src/v2/pages/postroom.js (V2.pages.gifts), CSS app/src/v2/css/sd-postroom.css, classes .pr-*.
- Data: V2.postNow() in app/src/v2/pages/post-data.js reads POST from app/src/data/post.js (gifts with start/end in UTC, code,
  how given, contents, source links). Live vs past is decided by the clock. The days-left count uses the viewer's local day.
- Build the parcel, label and stamp as reusable pieces (V2.prParcel(gift, {compact}), V2.prLabel, V2.prStamp(gift)) so the
  Home post band (stampede-post.js) and the Dispatch coupon use the same pieces (one family).
- Sources and legality: docs/rebuild/research/mystery-gift-sources-nov18.md. op.gg and Serebii content may NOT be copied.
- Copy Code uses the site's shared copy with fallback (as Build's Copy for Showdown); the code is also selectable text.
- Item pictures: our own simple inline SVG line drawings (ticket, coupon with amount, shirt, VP coin); no new image files.
- A stamp for a Pokémon gift opens its nature and moves only if POST has them (from a cited source); otherwise it opens that
  Pokémon's page; say which in the report. Item stamps: not buttons.
- Empty state (no live gift): the counter shows an empty parcel shelf with one line ("Nothing at the counter right now.
  The next gift will wait here.") and the stamp sheet still shows. Sim decides final words.
- Menu placement: not decided (open point for Sim); reachable by #gifts and from Home's post band.

---

TWO NEW PAGES: MYSTERY GIFTS ("THE POST ROOM") AND NEWS ("THE CHAMPIONS DISPATCH")

Attached: two packages of mock-up pictures, four per page (desktop and phone, light and dark). They are flat pictures, not working pages. Please build both pages in the working copy to match them and show Sim a preview before anything goes live. The new Home page ("The Stampede") shows a small version of each at its foot, so the three should feel like one family.

PAGE 1: MYSTERY GIFTS, "THE POST ROOM"

The idea: every Mystery Gift in Pokémon Champions is a parcel. Live gifts wait at the counter with the code on the shipping label. Every past gift becomes a postage stamp, postmarked the day it ended.

Top of the page
- Breadcrumb "Home · Mystery Gifts".
- Headline on two lines: "Special delivery." in ink and "No postage due." in PLOT blue.
- One line under it: "Every Mystery Gift in Pokémon Champions, parcel by parcel. The code is on the label, and so is the last day to collect it."
- Beside the headline on desktop, under it on phone: a small blue "Live right now" plate and three big numbers with small labels: gifts to claim, days until one ends, gifts so far.

"Waiting at the Counter"
- One kraft-paper parcel per live gift, side by side on desktop, stacked on phone. Each has a strip of tape across the top and a white shipping label, tilted slightly.
- The label reads like a real one: "Mystery Gift" title over a thick rule; Contents (the gift's name, large); how it is given and when it was sent; Collect by (the last day); then the code in large letters with a Copy Code button, and a barcode along the bottom.
- In the code, digits are blue and letters are ink, so a 1 and an I or a 0 and an O can be told apart. A small key beside the section heading explains this: "Blue characters are numbers. The rest are letters."
- A rubber stamp sits across the top right corner of each parcel with the days left: red when it ends soon, blue when there is plenty of time.

"The Stamp Sheet"
- Heading with one line: "Every gift so far gets a stamp, postmarked the day it ended. Tap a Pokémon for the nature and moves it came with."
- Three filter tabs with counts: All, Pokémon, Items.
- A sheet of perforated stamps, six across on desktop and three across on phone, all the same size with even bottoms. Each stamp has a framed picture area with the month and year in its top corner, the gift's name under it, and how it was given in small coloured capitals.
- Pokémon and items are mixed. A Pokémon stamp shows its render. An item stamp shows a simple line drawing (ticket, coupon with the amount, shirt, VP coin with the amount).
- The stamp's colour says how it was given: pink for event gifts, blue for serial codes, gold for battle pass.
- A round grey postmark with wavy lines overlaps each stamp's top right corner: "Ended" and the date.
- Under the sheet: "Show All 41 Stamps", then a small note: "Gift list checked Nov 17. Dates are each campaign's listed dates; a gift can end earlier in your time zone."

Dark mode ("Dim Paper"): the page goes dark, but paper stays paper. Labels and stamps become a dimmed cream, the parcels a deeper brown, and the stamp pictures slightly muted. Stamps do not turn black.

(Page 2, The Champions Dispatch, is in docs/rebuild/dispatch/BRIEF.md.)

WHERE THE CONTENT COMES FROM
- Ratings, the latest winning six, and upcoming events come from the site's own data and should update with it.
- Gifts and news in the pictures were copied by hand from another site on Nov 17. The codes are unchecked. Both pages need their own permitted source before they ship; until then they cannot go live.
- Each news headline opens the full story at its original source. NastyPlot shows headlines, dates and types only, not the articles.

WORDING THAT IS NEW
Sim has seen these in the pictures but has not signed off the words: the headline "Special delivery. No postage due.", "Waiting at the Counter", "The Stamp Sheet", the newspaper's name and top line, "The series so far, and the gift each round gave out", "Clip and claim", "The Back Page", and the four classified ads.

OPEN POINTS FOR SIM
- Where both pages live in the menu.
- The item pictures on the stamps are stand-in line drawings.
- On the parcel label, the middle column's heading is the way the gift is given ("Serial code") with the sent date under it, which may read oddly; a "Sent" heading may be clearer.
- The Fixtures link says "All 30 Events" while Home says 113 events. Please check which count belongs there.
- What a parcel area shows when no gift is live, and whether tapping an item stamp does anything.
- Whether the stamp sheet's Pokémon stamps open the nature and moves, as the line under the heading promises.
- The mock-ups keep the site's existing header and footer unchanged.
