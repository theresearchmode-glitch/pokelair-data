# Model variants for the Team Score fix: each is fitted on the training events only, then the page's Team Score is
# checked on held-out events (experiments/ts-audit.mjs). Usage: powershell -File experiments/ts-sweep.ps1 "name|K,HALF,SKILL,SETS|EVID_K|EVID_KP" ...
$env:Path = "$env:USERPROFILE\tools\node-v22.23.4-win-x64;$env:Path"
Set-Location (Split-Path $PSScriptRoot)
$env:TRAIN_ONLY = "1"
foreach ($v in $args) {
  $p = $v.Split('|'); $env:FAST = $p[1]; $env:EVID_K = $p[2]; $env:EVID_KP = $p[3]
  $fitLine = node model.mjs 2>&1 | Select-String "train-only fit"
  Copy-Item out/model_train.json "out/model_train_$($p[0]).json" -Force
  $env:MODEL = "out/model_train_$($p[0]).json"
  node experiments/ts-audit.mjs "out/ts_audit_$($p[0]).json" | Out-Null
  $sum = node -e "const r=require('./out/ts_audit_$($p[0]).json').rep;const f=k=>{const o=r[k];return k+' win '+o.winners_median+' t8 '+o.top8_median+' rest '+o.rest_median+' AUC '+o.auc_top8_vs_rest_pooled+'/'+o.auc_top8_vs_rest_mean_per_event+' restAboveWinner '+o.share_of_rest_above_their_winner+' rest90+ '+o.rest_scoring_90plus};console.log(f('limitless')+' | '+f('official')+' | hand '+r.hand.map(h=>h.name.slice(0,12)+'='+h.score).join(' '))"
  "$($p[0]): $fitLine`n   $sum" | Tee-Object -FilePath out/ts_sweep.log -Append
}
