import glob, os, shutil, html
SRC='/home/user/pokelair-data/docs/rebuild/pics/nov19/'; OUT='/tmp/claude-0/-home-user-pokelair-data/204a9d61-5900-570f-b954-256bbb6b60d7/scratchpad/mq/'
Q=[
 ('Q14','Battle: "Favoured" while turn one looks risky','review #9','Q14-battle-favoured',[('A','One plain line under the verdict, only when turn one has a risk: what Favoured is based on, and that your opening has a risk.',True),('B','A short "Risky start" tag under Favoured.',False),('C','No change.',False)],'Says what the verdict is based on without hiding it.'),
 ('Q13','Usage: which source it opens on','review #14','Q13-usage-source',[('A','Open on Online tournaments (updates daily). Ranked ladder stays one tap away and says "Last updated Nov 17 · updates paused".',True),('B','Keep opening on Ranked ladder, add the paused label.',False),('C','No change.',False)],'The first thing people see should be current.'),
 ('Q20','Matchups cards: real-games verdict vs "Calc disagrees"','review #8','Q20-matchups-calc-note',[('A','One verdict per card plus one short grey line ("Calc: beats it"); every card the same height.',True),('B','Verdict only on the cards; one sentence under the grid lists the calc differences.',False),('C','No change.',False)],'One clear verdict per card, the extra fact kept where it belongs.'),
 ('Q22','KO Board: the 30 Pokémon have no names','review #3','Q22-ko-board',[('A','Name and damage on hover or keyboard focus on desktop; a short name under each tile on phones.',True),('B','Short names under every tile at every size.',False),('C','No change.',False)],'Keeps the board clean where hover exists, readable where it does not.'),
 ('Q19','Home headline contrast','review #10','Q19-hero-contrast',[('A','Same colours; a band-blue glow calms the crowd right behind the words (3.17:1, meets the 3:1 rule for big text).',True),('B','Glow plus a paler line 2 (3.79:1).',False),('C','Line 2 white (4.73:1); loses the two tones.',False),('D','No change.',False)],'Fixes the crowd showing through while keeping your two-tone headline.'),
 ('Q17','"Mega" on My Team cards (phones)','review #11','Q17-mega-label',[('A','"Mega" on the same dark slanted plate as the score.',True),('B','No change.',False)],'Readable on any art, matches the score plate.'),
 ('Q18','Log a Game: Win looks already picked','review #7','Q18-log-a-game',[('A','Two equal buttons: "Log a Win" / "Log a Loss".',True),('B','No change.',False)],'Equal weight, and the words say what the tap does.'),
 ('Q21','Meta on phones: search and filters','review #12 + #19','Q21-meta-phone',[('A','Search and filters above the featured #1 on phones; filters wrap into even rows.',True),('B','No change (search at 842px, filters scroll sideways).',False)],'The tools people came for are on the first screen.'),
 ('Q25','Team Preview Practice on phones','review #13','Q25-practice-phone',[('A','Your six as the same 3 x 2 cards as theirs (356px instead of 649px).',True),('B','No change.',False)],'Both sixes nearly fit one phone screen.'),
 ('Q16','Edit Set: the Close X on phones','review #21','Q16-editset-close',[('A','A solid strip at the top holds the X; content scrolls under it.',True),('B','No change (the X sits on a dropdown corner).',False)],'Nothing collides while you scroll.'),
 ('Q26','"Restore Last Team" after Clear Team','review #2','Q26-restore-last-team',[('A','A "Restore Last Team" button on the empty My Team, naming the team, until you add a Pokémon.',True),('B','No change.',False)],'A way back after the 10 s Undo is gone.'),
 ('Q15','Pokémon count wording','review #18','Q15-pokemon-count',[('A','"#1 of 322 with tournament results".',True),('B','Adds "(322 of 345 rated have them)".',False),('C','No change.',False)],'Says why it is 322, not 345, and stays short.'),
 ('Q23','Home copy','review #17','Q23-home-copy',[('A','Keep the playful headlines, add one plain line under the unclear ones.',True),('B','Plain headlines instead.',False),('C','No change.',False)],'Clear about what each part does, your voice kept.'),
 ('Q24','Odd addresses and #owner','review #20','Q24-',[('A','A not-found page in the "No Pokémon here." style; visitors to #owner get it too.',True),('B','Home with a message strip / #owner unchanged.',False),('C','No change.',False)],'A wrong link says so and offers one way out.'),
]
cards=[]
for qid,title,rev,pref,opts,why in Q:
  files=sorted(glob.glob(SRC+pref+'*.png'))
  imgs=[]
  for f in files:
    b=os.path.basename(f); shutil.copy(f, OUT+'pics/'+b); imgs.append(b)
  # recommended first
  imgs.sort(key=lambda b: (0 if 'RECOMMENDED' in b else 1, b))
  ol=''.join(f'<li class="{"rec" if r else ""}"><b>{k}</b>{" <span class=\"tag\">Recommended</span>" if r else ""}<span>{html.escape(t)}</span></li>' for k,t,r in opts)
  im=''.join(f'<figure><img src="pics/{b}" alt="{html.escape(b[:-4])}" loading="lazy"></figure>' for b in imgs)
  cards.append(f'<section class="q" id="{qid.lower()}"><p class="eb">{qid} · {html.escape(rev)}</p><h2>{html.escape(title)}</h2><ol class="opts">{ol}</ol><p class="why"><b>Why A:</b> {html.escape(why)}</p><div class="shots">{im}</div><p class="ans">Your answer: reply in the chat with <b>{qid}</b> and a letter.</p></section>')
# before/after review 1
ba=''
for b in ['review1-battle-turn-one-BEFORE.png','review1-battle-turn-one-AFTER.png']:
  shutil.copy(SRC+b, OUT+'pics/'+b); ba+=f'<figure><img src="pics/{b}" alt="{b[:-4]}" loading="lazy"></figure>'
toc=''.join(f'<a href="#{q[0].lower()}">{q[0]}</a>' for q in Q)
page=open(OUT+'tpl.html').read().replace('%%TOC%%',toc).replace('%%CARDS%%',''.join(cards)).replace('%%BA%%',ba)
open(OUT+'index.html','w').write(page); print(len(Q),'questions', len(os.listdir(OUT+'pics')),'pictures')
