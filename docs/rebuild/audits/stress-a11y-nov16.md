# Stress test, keyboard + screen reader (helper, Nov 16 ~2:25 AM; look-only). Status per item.
No blockers: keyboard journeys (edit a set, search, filter Meta, pick four and log) all finish with keys only.
SERIOUS
1. Battle Win/Loss: focus fell to <body> after the redraw. FIXED (focus goes to "All Your Games ›"; LOG tests 7/7).
2. Home "Import a Team ›" then Escape: focus fell to <body>. FIXED in two places: a heading opener gets a temporary tabindex; and V2.redraw
   restores focus when the merge strips a temporary tabindex (that was the real cause: My Team redrew ~330 ms later). Full test run pending.
3. "?" tips unreachable by keyboard / screen reader. FIXED (focus into the tip; Tab continues after the '?'; Shift+Tab / Escape back to it).
MINOR (open)
4. Headings skip h1 -> h3 (My Team tiles; Practice pairs). 5. Same-name buttons without context (Winning Teams: Load Team / Copy / Set as
Opponent / Compare x3; Pokémon page "Show ›" x4). 6. Forced colours (Windows high contrast): no rules; filled buttons lose edges, selected
states vanish, watermark letters turn solid. 7. Meta filters don't announce the new count. 8. Header search re-announces the whole list each
keystroke. 9. 200% zoom: Meta chip row cut with no sign it scrolls.
PASSED: lang, one h1 and one main per route, no unnamed controls, decorative images, skip link, visible focus everywhere, modal sheets trap
and return focus (20+ sheets), reduced motion honoured.
