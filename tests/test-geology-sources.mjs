import assert from 'node:assert/strict';
import test from 'node:test';
import {countryConfig,depthLayers,presetFor,projectedPoint,resolveDanishAddress,searchAddress} from '../public/geology-sources.mjs';
import {fetchFOHM} from '../public/fohm.mjs';

test('the three supported geology countries stay distinct',()=>{
 assert.equal(countryConfig('NL').source,'REGIS II');
 assert.equal(countryConfig('DK').crs,'EPSG:25832');
 assert.equal(countryConfig('EE').crs,'EPSG:25884');
 assert.throws(()=>countryConfig('XX'));
});

test('projection retains longitude/latitude order',()=>{
 const calls=[];
 const point=projectedPoint('DK',56.1,10.1,(from,to,coordinates)=>{calls.push({from,to,coordinates});return [600000,6218000];});
 assert.deepEqual(calls[0].coordinates,[10.1,56.1]);
 assert.deepEqual(point,{x:600000,y:6218000,crs:'EPSG:25832'});
});

test('regional profiles become continuous depth layers without fabricating gaps',()=>{
 const profile={country:'DK',modelGroup:'FOHM',layers:[
  {code:'Sand',top:12,bottom:-8,lithology:'sand'},
  {code:'Clay',top:-12,bottom:-30,lithology:'clay'}
 ]};
 const converted=depthLayers(profile,50);
 assert.equal(converted.surfaceElevation,12);
 assert.deepEqual(converted.layers.map(layer=>[layer.code,layer.top,layer.base,layer.preset]),[
  ['Sand',0,20,'sand'],['MODEL GAP',20,24,'unknown'],['Clay',24,42,'clay'],['BELOW MODEL',42,50,'unknown']
 ]);
});

test('only defensible broad thermal analogues are selected automatically',()=>{
 assert.equal(presetFor('DK','carbonate'),'chalk');
 assert.equal(presetFor('EE','carbonate'),'unknown');
 assert.equal(presetFor('EE','mixed'),'unknown');
 assert.equal(presetFor('EE','aquifer'),'sand');
});

test('Danish address responses retain refine results and require the declared CRS',async()=>{
 const priorFetch=globalThis.fetch,priorProj4=globalThis.proj4;
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>String(url).includes('/soeg?')?{status:'ok',fund:[{id:'street',titel:'Main street',type:'vej'},{id:'house',titel:'Main street 1',type:'husnummer'}]}:{status:'ok',husnummer:{id_lokalid:'house',adgangsadressebetegnelse:'Main street 1',adgangspunkt:{geometri:{crs:{properties:{name:'EPSG:25832'}},coordinates:[600000,6218000]}}}}});
  globalThis.proj4=(from,to,point)=>{assert.match(from,/utm/);assert.equal(to,'EPSG:4326');assert.deepEqual(point,[600000,6218000]);return [10.1,56.1];};
  const hits=await searchAddress('DK','Main');assert.equal(hits[0].refine,true);assert.equal(hits[1].refine,false);
  assert.deepEqual(await resolveDanishAddress('house'),{lat:56.1,lon:10.1,label:'Main street 1'});
 }finally{globalThis.fetch=priorFetch;globalThis.proj4=priorProj4;}
});

test('FOHM retries a transient timeout but not a valid empty response',async()=>{
 let calls=0,retries=0;
 const row={modelnavn:'Sjælland (DK-model)',name:'ks1',layernumber:1,data:[[0,2,-10]]};
 const profile=await fetchFOHM(726133,6179366,{cache:false,timeouts:[10,10],retryDelayMs:0,onRetry:()=>retries++,fetchImpl:async()=>{if(++calls===1){const error=Error('signal timed out');error.name='TimeoutError';throw error;}return {ok:true,json:async()=>[row]};}});
 assert.equal(profile.layers.length,1);assert.equal(calls,2);assert.equal(retries,1);
 calls=0;await assert.rejects(fetchFOHM(726133,6179366,{cache:false,timeouts:[10,10],retryDelayMs:0,fetchImpl:async()=>{calls++;return {ok:true,json:async()=>[]};}}),/No model intervals/);assert.equal(calls,1);
});
