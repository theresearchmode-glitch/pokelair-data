#!/usr/bin/env python3
"""Apply one Kip (Gemini) answer mechanically, without reading it (Nov 24, the bottleneck fix).
Usage: python3 docs/rebuild/kip-apply.py <answer.txt> <base-commit> <branch alt/gemini-...> [--push]
Takes from the answer: every unified diff (--- a/x / +++ b/x hunks, inside or outside code fences) and every full new file written as
'----- BEGIN <path> -----' ... '----- END <path> -----'. Cleans the two known copy problems first (the Google-search prefix, HTML
escapes inside code). Makes <branch> from <base>, writes new files, `git apply --3way` the diffs one file at a time, commits, and
prints one line per file: applied / new / FAILED (why). Never touches main or claude/design6."""
import re, subprocess, sys, html, os, pathlib
ans, base, br = sys.argv[1], sys.argv[2], sys.argv[3]; push = '--push' in sys.argv
assert br.startswith('alt/gemini-'), 'branch must be alt/gemini-*'
t = open(ans, encoding='utf8').read().replace('https://www.google.com/search?q=', '')
def git(*a, check=True): return subprocess.run(['git', *a], capture_output=True, text=True, check=check)
git('fetch', '-q', 'origin', base, check=False); git('checkout', '-q', '-f', '-B', br, base)
out = []
for m in re.finditer(r'^-{3,} BEGIN (\S+) -{3,}\n(.*?)\n-{3,} END \1 -{3,}', t, re.S | re.M):
    p, body = m.group(1), html.unescape(m.group(2)) if '&lt;' in m.group(2) else m.group(2)
    pathlib.Path(p).parent.mkdir(parents=True, exist_ok=True); open(p, 'w', encoding='utf8').write(body + '\n'); git('add', p); out.append(f'new      {p}')
def fuzzy(f, p):
    """Fallback for hand-written diffs: each hunk's old lines (context + '-') must appear exactly once; replaced by context + '+'."""
    try: src = open(f, encoding='utf8').read()
    except Exception as e: return 'FAILED   ', f'  (cannot read: {e})'
    hunks = re.split(r'^@@[^\n]*@@[^\n]*\n', p, flags=re.M)[1:]
    if not hunks: return 'FAILED   ', '  (no hunks)'
    for n, h in enumerate(hunks, 1):
        old, new = [], []
        for l in h.rstrip('\n').split('\n'):
            if l.startswith('\\'): continue
            c, body = (l[:1], l[1:]) if l[:1] in ' +-' else (' ', l)
            if c in ' -': old.append(body)
            if c in ' +': new.append(body)
        o, w = '\n'.join(old), '\n'.join(new)
        k = src.count(o)
        if k != 1:
            o2 = '\n'.join(x.rstrip() for x in old); src2 = '\n'.join(x.rstrip() for x in src.split('\n'))
            if src2.count(o2) == 1: src, o = src2, o2
            else: return 'FAILED   ', f'  (hunk {n}: old text found {k} times)'
        src = src.replace(o, w, 1)
    open(f, 'w', encoding='utf8').write(src); return 'matched  ', '  (hand-written diff: every hunk matched exactly once)'
# real git diffs (diff --git ... , incl. new files from /dev/null): applied as written, one file at a time
for blk in re.findall(r'^diff --git a/(\S+) b/\S+\n(.*?)(?=^diff --git |^```|^-{5,} ?(?:END|BEGIN)|\Z)', t, re.S | re.M):
    f, body = blk; pf = f'/tmp/kip-{os.getpid()}-g.patch'; open(pf, 'w', encoding='utf8').write(f'diff --git a/{f} b/{f}\n' + body.rstrip('\n') + '\n')
    r = git('apply', '--3way', '--recount', '--whitespace=nowarn', pf, check=False)
    out.append(('applied  ' if r.returncode == 0 else 'FAILED   ') + f + ('' if r.returncode == 0 else '  (' + r.stderr.strip().split('\n')[-1][:140] + ')'))
    if r.returncode == 0: git('add', f)
t = re.sub(r'^diff --git .*?(?=^diff --git |^```|^-{5,} ?(?:END|BEGIN)|\Z)', '', t, flags=re.S | re.M)
lines = t.split('\n'); i = 0; patches = {}
while i < len(lines):
    if lines[i].startswith('--- a/') and i + 1 < len(lines) and lines[i + 1].startswith('+++ b/'):
        f = lines[i + 1][6:].strip(); j = i + 2; buf = [lines[i], lines[i + 1]]
        while j < len(lines) and (lines[j][:1] in ' +-\\' or lines[j].startswith('@@') or lines[j] == '') and not (lines[j].startswith('--- a/') and j + 1 < len(lines) and lines[j + 1].startswith('+++ b/')) and not lines[j].startswith('```'):
            buf.append(lines[j]); j += 1
        while buf and buf[-1] == '': buf.pop()
        patches.setdefault(f, []).append('\n'.join(html.unescape(x) if '&lt;' in x or '&gt;' in x else x for x in buf) + '\n'); i = j
    else: i += 1
for f, ps in patches.items():
    for k, p in enumerate(ps):
        pf = f'/tmp/kip-{os.getpid()}-{k}.patch'; open(pf, 'w', encoding='utf8').write(p)
        r = git('apply', '--3way', '--recount', '--whitespace=nowarn', pf, check=False)
        how, why = ('applied  ', '') if r.returncode == 0 else fuzzy(f, p)
        out.append(how + f + why)
        if how.strip() in ('applied', 'matched'): git('add', f)
print('\n'.join(out) or 'nothing found in the answer')
if git('diff', '--cached', '--quiet', check=False).returncode:
    git('commit', '-q', '-m', f'Kip: {os.path.basename(ans)} applied mechanically on {base[:8]} (kip-apply.py)')
    print('commit', git('rev-parse', '--short', 'HEAD').stdout.strip())
    if push: r = git('push', '-q', 'origin', f'HEAD:refs/heads/{br}', check=False); print('pushed' if r.returncode == 0 else 'PUSH FAILED ' + r.stderr[-200:])
