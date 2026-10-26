/* MIT. One-at-a-time sensitivity; the thermal solver remains the source of depth-dependent performance. */
(function(root){
const Planning=root.Planning||(typeof require!=='undefined'?require('./planning.js'):null);
function percentages(range=30){if(![20,30,50].includes(Number(range)))throw Error('Choose a sensitivity range of 20, 30 or 50 percent.');return [-1,-2/3,-1/3,0,1/3,2/3,1].map(x=>Number((x*range).toFixed(6)));}
function depthPlan(p,design,changes){return changes.map(change=>{const h=Math.round(design.h*(1+change/100)*10)/10,coverage=p.layers.at(-1).base;return {change,h,n:design.n,status:h<30||h>600?'depth-limit':h>coverage?'geology-limit':'pending'};});}
function economics(p,r,costs,discounted=true){const gas=Planning.lifecycle(p,null,costs,true,discounted),hp=Planning.lifecycle(p,r,costs,false,discounted);return {saving:gas.total-hp.total,payback:r.feasible?Planning.sustainedPayback(hp,gas):null};}
function classify(row,hydraulic=null){if(!row?.feasible)return 'infeasible';if(!hydraulic||hydraulic.ok||hydraulic.status==='unverified')return 'ok';return ['pressure-limit','outside-curve','source-temperature-limit'].includes(hydraulic.status)?hydraulic.status:'pump-error';}
function series(p,r,costs,changes,depthRows=[],discounted=true){return ['gas','electricity','depth'].map(kind=>({kind,points:changes.map(change=>{let q={...p},c={...costs},design=r,actual,status='ok';if(kind==='gas'){actual=costs.gasPrice*(1+change/100);c.gasPrice=actual;}else if(kind==='electricity'){actual=p.price*(1+change/100);q.price=actual;}else {const d=depthRows.find(x=>x.change===change);actual=d?.h??Math.round(r.h*(1+change/100)*10)/10;status=d?.status||'pending';design=d?.row;}
const pumpStatus=kind==='depth'?depthRows.find(x=>x.change===change)?.pumpStatus:null;if(!design||!['ok','pending'].includes(status))return {kind,change,actual,status,pumpStatus,payback:null,saving:null,min:design?.min??null};
if(!design.feasible)return {kind,change,actual,status:'infeasible',pumpStatus,payback:null,saving:null,min:design.min};
return {kind,change,actual,status:'ok',pumpStatus,...economics(q,design,c,discounted),min:design.min};})}));}
function gasCurve(p,r,costs,prices,kwhM3,discounted=true){
if(!Number.isFinite(kwhM3)||kwhM3<=0)throw Error('Enter a positive gas conversion.');
if(!Array.isArray(prices)||prices.some(v=>!Number.isFinite(v)||v<0||v/kwhM3>10))throw Error('Enter valid nonnegative gas prices.');
return prices.map(price=>({price,status:r.feasible?'ok':'infeasible',...(r.feasible?economics(p,r,{...costs,gasPrice:price/kwhM3},discounted):{payback:null,saving:null})}));
}
root.SensitivityModel={percentages,depthPlan,economics,classify,series,gasCurve};if(typeof module!=='undefined')module.exports=root.SensitivityModel;
})(typeof window!=='undefined'?window:globalThis);
