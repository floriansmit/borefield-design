const assert=require('node:assert/strict'),P=require('./public/planning.js'),B=require('./public/model.js');
const s={method:'area',fuelUnit:'kWh',area:100,loss:60,hdd:2500,indoor:20,outdoor:-10,occupants:0,litres:45,hot:45,cold:10,fuel:10000,kwhM3:10,eta:.9,other:0,dhwPeak:0};
const e=P.estimate(s);assert.equal(e.heatLoss,200);assert.equal(e.space,12000);assert.equal(e.annual,12000);assert.equal(e.peak,6);assert.ok(Math.abs(e.profile.reduce((a,b)=>a+b,0)-e.annual)<1e-8);
const g=P.estimate({...s,method:'fuel',fuel:1000,fuelUnit:'m3'});assert.equal(g.annual,9000);assert.equal(g.heatLoss,150);assert.equal(g.peak,4.5);assert.throws(()=>P.estimate({...s,hdd:0}));
const p={years:3,annual:10000,price:.2,discount:0,escalation:0},r={capex:10000,annual:[{electricity:2500},{electricity:2500},{electricity:2500}]},c={...P.defaults,hpMaintenance:100,hpLife:2,hpReplacement:1000,gasCapex:2000,gasPrice:.1,gasEfficiency:1,gasStanding:0,gasMaintenance:0,gasLife:2,gasReplacement:500};
const hp=P.lifecycle(p,r,c),gas=P.lifecycle(p,null,c,true);assert.equal(hp.total,12800);assert.equal(gas.total,5500);assert.equal(hp.history[2].replacement,1000);assert.equal(hp.history[3].replacement,0);assert.equal(P.sustainedPayback(hp,gas),null);assert.equal(P.sustainedPayback(gas,hp),0);
assert.ok(P.lifecycle({...p,discount:.1},r,c).total<hp.total);
console.log('Household heat balance, gas conversion, peak load, lifecycle costs, replacement timing and payback tests passed.');
