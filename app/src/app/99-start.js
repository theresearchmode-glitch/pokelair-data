// ---------- start ----------
// Test hook: the test runner sets window.__PL_TEST before load to reach internals.
if(window.__PL_TEST)window.__PL={byName,rating,members,damage,likelySpeed,sideDefaults,mvByName,koText,winVsField,planMatchup,oppMember,META,getS:()=>S,parseReplay:typeof parseReplay==='function'?parseReplay:null,exportPaste,parsePaste,teamCode:typeof teamCode==='function'?teamCode:null,decodeTeam:typeof decodeTeam==='function'?decodeTeam:null};
// Retired options (Oct 27): Fun mode and the Meta map are hidden; the tier board and meta picks are the defaults.
S.fun=false;ui.lmode='board';try{LS.set('cc2.lmode','board')}catch(e){}
// any edit to the open team keeps it open; Save changes updates it
try{document.querySelectorAll('.phonefold').forEach(d=>{d.open=!PHONE()})}catch(e){}
render();setView(view,false);
try{if(typeof checkSharedLink==='function')checkSharedLink()}catch(e){}
})();
