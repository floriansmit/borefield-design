import {cp,mkdir,rm,copyFile,writeFile} from 'node:fs/promises';
await rm('_site',{recursive:true,force:true});await mkdir('_site',{recursive:true});
await cp('public','_site',{recursive:true});await copyFile('worker/api.mjs','_site/browser-api.mjs');
await writeFile('_site/.nojekyll','');console.log('Built standalone GitHub Pages site in _site/.');
