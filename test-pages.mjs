import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/build-pages.mjs']);
const html=await readFile('_site/index.html','utf8');assert(!/(?:href|src)="\/(?!\/)/.test(html),'HTML assets must work at a repository subpath');
for(const m of html.matchAll(/(?:href|src)="\.\/([^"?#]+)/g))await access('_site/'+m[1]);
const app=await readFile('_site/app.js','utf8'),worker=await readFile('_site/calc-worker.js','utf8');assert(app.includes("new URL('./calc-worker.js',document.baseURI)"));assert(app.includes("import('./browser-api.mjs')"));assert(worker.includes("new URL('.',self.location.href)"));assert(!worker.includes("fetch('/kernel.py')"));assert(!worker.includes("importScripts('/model.js')"));
assert.equal(await readFile('_site/browser-api.mjs','utf8'),await readFile('worker/api.mjs','utf8'));
const {handleAPI}=await import('./_site/browser-api.mjs');assert.equal((await handleAPI(new Request('https://example.test/api/regis?lat=0&lon=0'))).status,400);
console.log('GitHub Pages subpath assets, worker/Python paths, browser API parity and validation checks passed.');
