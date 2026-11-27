# HH independent LCP check, time: 7:36 PM (7:36:22)  date: Thu Nov 26, 2026

Script: experiments/hh-lcp-measure.cjs (on branch t3). Phone = 390x844, 4x CPU, 150 ms RTT, 1.6 Mbit/s; fast = 1440x900, no throttling. Median of 3, cold cache. Built with public-site.mjs on origin/main's out/ (e7e2ad16).

```
d6	mobile	/	LCP 14606	FCP 9521	CLS 0.0000
d6	mobile	/pokemon	LCP 1426	FCP 1426	CLS 0.0000
d6	mobile	/pokemon/garchomp	LCP 15308	FCP 9755	CLS 0.0007
d6	mobile	/team	LCP 15141	FCP 9474	CLS 0.0000
d6	mobile	/meta	LCP 15060	FCP 9524	CLS 0.0193
d6	fast	/	LCP 392	FCP 59	CLS 0.0000
d6	fast	/pokemon	LCP 159	FCP 159	CLS 0.0000
d6	fast	/pokemon/garchomp	LCP 410	FCP 69	CLS 0.0000
d6	fast	/team	LCP 588	FCP 95	CLS 0.0000
d6	fast	/meta	LCP 410	FCP 68	CLS 0.0000
k64c	mobile	/	LCP 1768	FCP 1711	CLS 0.1157
k64c	mobile	/pokemon	LCP 689	FCP 689	CLS 0.0162
k64c	mobile	/pokemon/garchomp	LCP 2153	FCP 2006	CLS 0.0075
k64c	mobile	/team	LCP 1963	FCP 1872	CLS 0.1199
k64c	mobile	/meta	LCP 1918	FCP 1873	CLS 0.0395
k64c	fast	/	LCP 115	FCP 115	CLS 0.0000
k64c	fast	/pokemon	LCP 171	FCP 171	CLS 0.0000
k64c	fast	/pokemon/garchomp	LCP 98	FCP 98	CLS 0.0000
k64c	fast	/team	LCP 135	FCP 135	CLS 0.0000
k64c	fast	/meta	LCP 87	FCP 87	CLS 0.0159
```

## Claude build Home, slow phone, why 26 s (time: 7:53 PM (7:53:58)  date: Thu Nov 26, 2026)

```
load event 26548 ms
LCP candidates: [{"t":5589,"el":"IMG.","url":"ttp%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22-68.57","size":896},{"t":26268,"el":"H1.u sdh-h","url":"","size":74426}]
total KB 4815 requests 58
biggest: v2.js?v=add6709e7771 3729KB | index.html 980KB | instrument-sans-latin.woff2 56KB | unbounded-latin.woff2 50KB 
```
My test server sends files uncompressed. Whether the Claude artifact host compresses v2.js is NOT checked, so 26 s is the worst case.
