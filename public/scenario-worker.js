/* Reuse the exact production thermal/pipe solver and its cached Python kernels. */
importScripts('./calc-worker.js','./planning.js','./scenario-model.js');
self.onmessage=async({data})=>{try{const result=await ScenarioModel.run(data.p,data.config,evalCandidate,v=>postMessage({type:'progress',message:v.name+' · '+v.n+' × '+v.h+' m · '+v.flow+' kg/s · '+v.tested}));postMessage({type:'scenarios-result',...result});}catch(e){postMessage({type:'error',message:e.message||String(e)});}};
