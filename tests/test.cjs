const assert=require('node:assert/strict'),B=require('../public/model.js');
assert.ok(Math.abs(B.e1(1)-.2193839343955203)<1e-10);
assert.ok(Math.abs(B.e1(2)-.04890051070806112)<1e-10);
const p={annual:22000,peak:10,supply:40,eff:.45,delta:3,peakHours:6,t0:9,gradient:25,rb:.1,radius:.075,minDepth:80,maxDepth:320,step:10,maxBores:4,spacing:8,limit:-3,years:25,price:2,discount:.03,escalation:0,perBore:10000,fixed:90000,pumpFraction:.015,profile:[17,14,12,8,5,2,2,2,4,8,11,15],layers:[{base:180,k:2.5,cv:2.4,cost:350},{base:500,k:1.5,cv:2.5,cost:450}]};
assert.equal(B.ground(p,180).k,2.5);assert.ok(Math.abs(B.ground(p,285).k-(180*2.5+105*1.5)/285)<1e-12);
const one=B.evaluate(p,1,180),two=B.evaluate(p,2,180),wide=B.evaluate({...p,spacing:20},2,180),demand=B.evaluate({...p,annual:26000,peak:12},1,180);
assert.ok(two.min>one.min);assert.ok(wide.min>two.min);assert.ok(demand.min<one.min);assert.ok(B.evaluate({...p,supply:55},1,180).cop<one.cop);
const r=B.optimize(p);assert.equal(r.length,100);assert.ok(r.every(x=>Number.isFinite(x.npv)&&Number.isFinite(x.min)));assert.ok(r.every((x,i)=>!i||x.npv>=r[i-1].npv));
assert.equal(one.annual.length,p.years);assert.equal(one.cold.length,p.years*12);assert.equal(one.hot.length,one.cold.length);assert.ok(one.annual.at(-1).electricity>one.annual[0].electricity);assert.ok(one.hot.every((v,i)=>Math.abs(v-one.cold[i]-p.delta)<1e-10));assert.throws(()=>B.optimize({...p,profile:[NaN,...p.profile.slice(1)]}));assert.throws(()=>B.optimize({...p,step:0}));
console.log('Numerical reference, layer averaging, interference, demand, COP and optimization checks passed.');

const P=require('../public/planning.js');const pc={...p,costs:P.defaults,comparisonDesigns:[{n:3,h:125}]};B.validate(pc);const priced=B.evaluate(pc,2,180);assert.ok(Math.abs(priced.npv-P.lifecycle(pc,priced,P.defaults).total)<1e-6);assert.throws(()=>B.validate({...pc,comparisonDesigns:[{n:2,h:550}]}));console.log('Optimizer and comparison NPV agree; custom depth coverage validated.');
