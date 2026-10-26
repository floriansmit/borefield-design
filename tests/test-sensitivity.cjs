const assert=require('node:assert/strict'),B=require('../public/model.js'),P=require('../public/planning.js'),S=require('../public/sensitivity-model.js');
const p={annual:22000,peak:10,supply:40,eff:.45,delta:3,peakHours:6,t0:9,gradient:25,rb:.1,radius:.075,minDepth:80,maxDepth:320,step:10,maxBores:4,spacing:8,limit:-10,years:25,price:.35,discount:.03,escalation:0,perBore:1340,fixed:12000,pumpFraction:.015,profile:[17,14,12,8,5,2,2,2,4,8,11,15],layers:[{base:180,k:2.24,cv:2.73,cost:47},{base:400,k:1.15,cv:3.19,cost:60}]};
const r=B.evaluate(p,1,285),changes=S.percentages(30),depths=S.depthPlan(p,r,changes).map(d=>({...d,status:'ok',row:B.evaluate(p,d.n,d.h)})),all=S.series(p,r,P.defaults,changes,depths);
const zero=all.map(s=>s.points.find(x=>x.change===0));zero.forEach(v=>assert.equal(v.saving,zero[0].saving));assert.equal(all[0].points[0].saving<all[0].points.at(-1).saving,true);assert.equal(all[1].points[0].saving>all[1].points.at(-1).saving,true);
assert.notEqual(depths[0].row.cop,depths.at(-1).row.cop);assert.notEqual(depths[0].row.capex,depths.at(-1).row.capex);assert.notEqual(depths[0].row.min,depths.at(-1).row.min);
assert.equal(S.depthPlan(p,{n:1,h:400},[30])[0].status,'geology-limit');assert.equal(S.depthPlan(p,{n:1,h:30},[-30])[0].status,'depth-limit');
const impossible={...r,feasible:false};for(const series of S.series(p,impossible,P.defaults,changes,[]))if(series.kind!=='depth')for(const pt of series.points){assert.equal(pt.status,'infeasible');assert.equal(pt.payback,null);assert.equal(pt.saving,null);}
const expensive={...r,capex:1e9};assert.equal(S.economics(p,expensive,P.defaults).payback,null);const free={...r,capex:0,annual:r.annual.map(y=>({...y,electricity:0}))};assert.equal(S.economics(p,free,{...P.defaults,hpMaintenance:0,hpReplacement:0}).payback,0);
assert.equal(S.classify(r,null),'ok');assert.equal(S.classify(r,{ok:true,status:'unverified'}),'ok');assert.equal(S.classify(r,{ok:false,status:'pressure-limit'}),'pressure-limit');assert.equal(S.classify(r,{ok:false,status:'outside-curve'}),'outside-curve');assert.equal(S.classify(r,{ok:false,status:'source-temperature-limit'}),'source-temperature-limit');assert.equal(S.classify(impossible,{ok:true,status:'within-input-limit'}),'infeasible');
// Exact arithmetic check against an independent discounted cash-flow sum.
const q={...p,years:2,discount:.1},fake={feasible:true,capex:100,annual:[{electricity:100},{electricity:110}]},costs={...P.defaults,gasPrice:.2,gasCapex:0,gasStanding:0,gasMaintenance:0,hpMaintenance:0};
const expected=Array.from({length:2},(_,i)=>(q.annual/.9*.2-fake.annual[i].electricity*q.price)/(1.1**(i+1))).reduce((a,b)=>a+b,0)-100;assert.ok(Math.abs(S.economics(q,fake,costs).saving-expected)<1e-8);
console.log('Sensitivity price direction, depth thermal/economic recalculation, coverage, no-payback, infeasibility and independent cash-flow checks passed.');
// Absolute gas-price curve agrees with independently priced lifecycle cash flows.
const tariff=1.66,conversion=9.77,curve=S.gasCurve(p,r,P.defaults,[tariff,tariff*1.2],conversion,true);
for(const [i,point]of curve.entries()){
 const c={...P.defaults,gasPrice:tariff*(i?1.2:1)/conversion};
 const gas=P.lifecycle(p,null,c,true,true),hp=P.lifecycle(p,r,c,false,true);
 assert.equal(point.payback,P.sustainedPayback(hp,gas));assert.equal(point.saving,gas.total-hp.total);
}
assert.ok(curve[1].saving>curve[0].saving);
const differentGas=S.gasCurve(p,r,P.defaults,[tariff],11.2,true)[0];assert.ok(differentGas.saving<curve[0].saving);
assert.equal(S.gasCurve(p,expensive,P.defaults,[0],conversion)[0].payback,null);
assert.equal(S.gasCurve(p,impossible,P.defaults,[tariff],conversion)[0].status,'infeasible');
assert.equal(S.gasCurve(p,impossible,P.defaults,[tariff],conversion)[0].saving,null);
assert.throws(()=>S.gasCurve(p,r,P.defaults,[tariff],0));assert.throws(()=>S.gasCurve(p,r,P.defaults,[-1],conversion));
const undiscounted=S.gasCurve(p,r,P.defaults,[tariff],conversion,false)[0],uc={...P.defaults,gasPrice:tariff/conversion};
assert.equal(undiscounted.saving,P.lifecycle(p,null,uc,true,false).total-P.lifecycle(p,r,uc,false,false).total);
console.log('Absolute gas-price curve, calorific conversion, discounting, infeasibility and horizon limits passed.');
