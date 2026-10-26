const assert=require('node:assert/strict'),S=require('../public/scenario-model.js'),B=require('../public/model.js'),P=require('../public/planning.js');
const p={annual:22000,peak:10,supply:55,eff:.45,delta:3,peakHours:6,t0:9,gradient:25,rb:.1,radius:.075,minDepth:180,maxDepth:200,step:20,maxBores:2,spacing:8,limit:-3,years:25,price:.35,discount:.03,escalation:0,perBore:1340,fixed:12000,pumpFraction:.015,profile:[17,14,12,8,5,2,2,2,4,8,11,15],layers:[{base:180,k:2.24,cv:2.73,cost:47},{base:500,k:1.15,cv:3.19,cost:60}],costs:P.defaults,exchangerType:'single-u',pipeDesign:{flow:.25,rho:1000}};
const a={name:'Radiators',reduceHeat:false,reduction:20,changeSupply:true,supply:45,peakMode:'keep',peakReduction:20,peak:8,flowMode:'keep',flow:.5,extraCapex:2000},c={...S.defaults(),enabled:true,alternatives:[a]};
const before=JSON.stringify(p),radiators=S.apply(p,a);assert.equal(radiators.annual,p.annual);assert.equal(radiators.peak,p.peak);assert.equal(radiators.supply,45);assert.equal(radiators.fixed,p.fixed+2000);assert.deepEqual(radiators.profile,p.profile);assert.equal(JSON.stringify(p),before);
const insulation=S.apply(p,{...a,reduceHeat:true,changeSupply:false});assert.equal(insulation.annual,17600);assert.equal(insulation.peak,10);assert.equal(insulation.supply,55);assert.ok(Math.abs(insulation.profile.reduce((s,x)=>s+x,0)-p.profile.reduce((s,x)=>s+x,0)*.8)<1e-10);
assert.equal(S.apply(p,{...a,peakMode:'percent',peakReduction:20}).peak,8);assert.equal(S.apply(p,{...a,peakMode:'value',peak:7}).peak,7);
assert.deepEqual(S.flows(p,'optimize',{min:.2,max:.5,step:.1}),[.2,.3,.4,.5]);
const pump={mode:'curve',curve:[{flow:1,pressure:100},{flow:3,pressure:60}]};assert.equal(S.available(pump,2),80);assert.equal(S.available(pump,.9),null);assert.equal(S.available(pump,3.1),null);
const row={n:2,pipe:{massFlowPerBorehole:.25,pressureKPa:83}};assert.equal(S.hydraulics(p,row,{mode:'pressure',maxKPa:80}).ok,false);assert.equal(S.hydraulics(p,row,{mode:'provisional'}).status,'unverified');assert.equal(S.hydraulics(p,row,pump).totalFlow,1.8);assert.equal(S.hydraulics(p,row,pump).ok,true);assert.equal(S.hydraulics(p,{n:1,pipe:null},pump).ok,false);
assert.throws(()=>S.validate({...c,alternatives:[{...a,peakMode:'magic'}]}));assert.throws(()=>S.validate({...c,pump:{mode:'curve',curve:[{flow:2,pressure:50},{flow:1,pressure:60}]}}));
(async()=>{
 // A deterministic solver exposes whether the optimizer respects pressure and thermal constraints.
 const evaluate=async(q,n,h,kind)=>{const flow=q.pipeDesign.flow,capex=n*h*40+q.fixed;return {n,h,L:n*h,feasible:h>=180,min:-2,exchangerType:kind,capex,npv:capex+(flow-.4)**2*10000,pipe:{massFlowPerBorehole:flow,pressureKPa:flow*200}};};
 const cfg={...c,baselineFlow:'optimize',flow:{min:.2,max:.5,step:.1},pump:{mode:'pressure',maxKPa:65}};
 const result=await S.run(p,cfg,evaluate);assert.equal(result.results[0].best.pipe.massFlowPerBorehole,.3,'Reject cheaper flow above available pump pressure');assert.equal(result.results[0].p.pipeDesign.flow,.3);assert.equal(result.results[0].best.n,1);assert.equal(result.results[0].best.h,180);assert.equal(result.results[0].pumpRejected,8);assert.equal(result.results[1].p.supply,45);assert.equal(result.results[1].p.annual,p.annual);
 const fixed=await S.run(p,{...cfg,mode:'fixed',fixed:{n:2,h:200,kind:'single-u'}},evaluate);assert(fixed.results.every(x=>x.best.n===2&&x.best.h===200));
 const blocked=await S.run(p,{...cfg,pump:{mode:'pressure',maxKPa:1}},evaluate);assert.equal(blocked.results[0].best,null);
 const thermal=await S.run(p,c,async(...args)=>({...await evaluate(...args),feasible:false}));assert.equal(thermal.results[0].best,null);assert.equal(thermal.results[0].thermalRejected,4);
 // Real heat balance: lower supply at fixed heat demand extracts more heat from the ground.
 const one=B.evaluate(p,2,200),low=B.evaluate({...p,supply:45},2,200);assert(low.annual[0].groundExtraction>one.annual[0].groundExtraction);assert(low.electricity<one.electricity);
 assert.equal(JSON.stringify(p),before);assert.deepEqual(S.validate(JSON.parse(JSON.stringify(c))),c);
 console.log('Scenario inheritance, explicit peak changes, energy balance, pressure/curve limits, fixed layouts and constrained flow selection passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
