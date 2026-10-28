import {fetchFOHM,profileForGroup} from './fohm.mjs';
import {fetchPuma} from './puma.mjs';

const COUNTRIES={
 NL:{name:'Netherlands',centre:[52.0907,5.1214],zoom:8,source:'REGIS II',crs:'EPSG:28992'},
 DK:{name:'Denmark',centre:[56.1,10.1],zoom:7,source:'GEUS FOHM',crs:'EPSG:25832'},
 EE:{name:'Estonia',centre:[58.65,25.5],zoom:7,source:'PUMA/MOSYS',crs:'EPSG:25884'}
};

const definitions={
 'EPSG:25832':'+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs',
 'EPSG:25884':'+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
};

export function countryConfig(code){const config=COUNTRIES[code];if(!config)throw Error('Choose a supported country.');return config;}

export function projectedPoint(code,lat,lon,project=globalThis.proj4){
 const config=countryConfig(code);if(!Number.isFinite(lat)||!Number.isFinite(lon))throw Error('Enter valid latitude and longitude.');
 if(code==='NL')return {x:lon,y:lat,crs:'EPSG:4326'};
 if(typeof project!=='function')throw Error('Coordinate conversion is unavailable. Reload the page and try again.');
 const [x,y]=project('EPSG:4326',definitions[config.crs],[lon,lat]);return {x,y,crs:config.crs};
}

export function presetFor(source,lithology){
 if(lithology==='sand'||lithology==='aquifer')return 'sand';
 if(lithology==='clay')return 'clay';
 if(source==='DK'&&lithology==='carbonate')return 'chalk';
 return 'unknown';
}

export function depthLayers(profile,maxDepth){
 const valid=profile.layers.filter(layer=>Number.isFinite(layer.top)&&Number.isFinite(layer.bottom)&&layer.top>layer.bottom).sort((a,b)=>b.top-a.top);
 if(!valid.length)throw Error('The selected model contains no usable geological intervals.');
 const surface=Math.max(...valid.map(layer=>layer.top)),limit=Math.max(1,Number(maxDepth)||0),layers=[];
 let cursor=0;
 for(const item of valid){
  const top=Math.max(0,surface-item.top),base=Math.min(limit,surface-item.bottom);if(base<=cursor+.01)continue;
  if(top>cursor+.01)layers.push({code:'MODEL GAP',top:cursor,base:Math.min(top,limit),preset:'unknown',source:profile.country,sourceLithology:'gap',description:'No interval was supplied by the selected regional model.'});
  if(base>cursor+.01)layers.push({code:item.code,top:Math.max(cursor,top),base,preset:presetFor(profile.country,item.lithology),source:profile.country,sourceLithology:item.lithology,description:item.rock||item.name||item.modelGroup||'',modelGroup:item.modelGroup||profile.modelGroup||null});
  cursor=Math.max(cursor,base);if(cursor>=limit-.01)break;
 }
 if(cursor<limit-.01)layers.push({code:'BELOW MODEL',top:cursor,base:limit,preset:'unknown',source:profile.country,sourceLithology:'unresolved',description:'The requested design depth extends below the regional model profile.'});
 return {...profile,surfaceElevation:surface,maxDepth:limit,layers};
}

export async function fetchProfile(code,lat,lon,maxDepth,options={}){
 const point=projectedPoint(code,lat,lon);
 const profile=code==='DK'?await fetchFOHM(point.x,point.y,options):code==='EE'?await fetchPuma(point.x,point.y):null;
 if(!profile)throw Error('This source is handled by the REGIS API.');
 return depthLayers(profile,maxDepth);
}

export function selectDanishGroup(bundle,name,maxDepth){return depthLayers(profileForGroup(bundle,name),maxDepth);}

export async function searchAddress(code,query){
 const q=String(query||'').trim();if(q.length<2)throw Error('Enter at least two characters.');
 if(code==='DK'){
  const list=await fetch(`https://adressevaelger.dk/husnumre/soeg?${new URLSearchParams({tekst:q,token:'adressevaelger123',maksimum:'6'})}`).then(checkJSON);
  if(list.status!=='ok')throw Error(list.beskrivelse||'Danish address search failed.');
  const rows=Array.isArray(list)?list:list.fund||list.resultater||list.husnumre||[];
  return rows.map(row=>({id:row.id||row.id_lokalid||row.husnummer?.id_lokalid,label:row.titel||row.tekst||row.adressebetegnelse||row.adgangsadressebetegnelse||row.label,refine:row.type&&row.type!=='husnummer'})).filter(row=>row.id&&row.label);
 }
 if(code==='EE'){
  const rows=await fetch(`https://nominatim.openstreetmap.org/search?${new URLSearchParams({q,format:'jsonv2',countrycodes:'ee',limit:'6'})}`).then(checkJSON);
  return rows.map(row=>({label:row.display_name,lat:Number(row.lat),lon:Number(row.lon)}));
 }
 throw Error('This address source is handled by PDOK.');
}

export async function resolveDanishAddress(id){
 const body=await fetch(`https://adressevaelger.dk/husnumre/${encodeURIComponent(id)}?token=adressevaelger123`).then(checkJSON);
 if(body.status!=='ok')throw Error(body.beskrivelse||'Danish address lookup failed.');
 const house=body.husnummer||body.adresse?.husnummer||body.resultat||body,geometry=house.adgangspunkt?.geometri||house.geometri;let coords=geometry?.coordinates||Object.values(house.adgangspunkt?.koordinater||{});
 if(!Array.isArray(coords)||!coords.every(Number.isFinite)||!String(geometry?.crs?.properties?.name||'').includes('25832'))throw Error('The Danish address service did not return EPSG:25832 coordinates.');
 if(typeof globalThis.proj4!=='function')throw Error('Coordinate conversion is unavailable.');
 const [lon,lat]=globalThis.proj4(definitions['EPSG:25832'],'EPSG:4326',coords);return {lat,lon,label:house.adgangsadressebetegnelse||house.adressebetegnelse||id};
}

async function checkJSON(response){if(!response.ok)throw Error(`Address service returned ${response.status}.`);return response.json();}
