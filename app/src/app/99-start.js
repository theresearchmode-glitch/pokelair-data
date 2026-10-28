// ---------- start ----------
// Test hook: the test runner sets window.__PL_TEST before load to reach internals.
if(window.__PL_TEST)window.__PL={byName,rating,members,damage,likelySpeed,sideDefaults,mvByName,koText,winVsField,teamScore,normSlots,proChecks,render,planMatchup,oppMember,META,getS:()=>S,parseReplay:typeof parseReplay==='function'?parseReplay:null,exportPaste,parsePaste,THR,prepOf,tsOf,itemProblems,assignItems,gamePlan,planFixes:typeof planFixes==='function'?planFixes:null,gauntletPrep,itemClause,resolveItems,trPlan,deadItems,teamCode:typeof teamCode==='function'?teamCode:null,decodeTeam:typeof decodeTeam==='function'?decodeTeam:null,turnOneField:typeof turnOneField==='function'?turnOneField:null,canonItem:typeof canonItem==='function'?canonItem:null};
// Retired option (Oct 27): the Meta map is hidden; the tier board is the default.
ui.lmode='board';try{LS.set('cc2.lmode','board')}catch(e){}
// any edit to the open team keeps it open; Save changes updates it
try{document.querySelectorAll('.phonefold').forEach(d=>{d.open=!PHONE()})}catch(e){}
// Refresh starts your scheduled data job, which only works when the page is open in Claude: hide it everywhere else
try{if(!(window.claude&&window.claude.use))document.querySelectorAll('.refreshbtn').forEach(b=>b.hidden=true)}catch(e){}
render();setView(view,false);
try{if(typeof checkSharedLink==='function')checkSharedLink()}catch(e){}
})();
