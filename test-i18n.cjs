/* Verify the translation contract across technical guidance, dynamic results and data-neutral locale changes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},navigator:{language:'nl-NL'},localStorage:{getItem:()=>null},document:{readyState:'loading',addEventListener(){}},console};vm.createContext(context);
for(const f of ['i18n-nl.js','i18n.js'])vm.runInContext(fs.readFileSync('public/'+f,'utf8'),context);
const english=fs.readFileSync('public/field-help.js','utf8').split(' window.I18n?.registerHelp(H);')[0]+'\nwindow.allHelp=H;})();';vm.runInContext(english,context);
const {I18n,BorefieldDutch,allHelp}=context.window;I18n.registerHelp(allHelp);assert.equal(I18n.language,'nl');assert.equal(I18n.locale,'nl-NL');
for(const [key,value]of Object.entries(allHelp)){assert(BorefieldDutch.help[key],'Missing Dutch help: '+key);assert.equal(BorefieldDutch.help[key].split('|').length,3,key);for(const part of value.split('|'))assert.notEqual(I18n.t(part),part,'Untranslated technical guidance: '+key);}
const cases={
 'Explain Electricity, EUR/kWh':'Uitleg: Elektriciteit, EUR/kWh',
 'Layer 18':'Laag 18',
 'Monthly total: 50.179,91 kWh/year':'Maandtotaal: 50.179,91 kWh/jaar',
 'Completed · pyg-ubwt · 136 candidates · 25 years':'Voltooid · pyg-ubwt · 136 ontwerpen · 25 jaar',
 'Lifetime NPV EUR':'Contante levensduurkosten EUR',
 'First-year OPEX · EUR':'Bedrijfskosten jaar 1 · EUR',
 '1 borehole × 285 m · Single U-tube':'1 boring × 285 m · Enkele U-lus',
 '2 × 180 m · Coaxial · BELOW TEMPERATURE LIMIT':'2 × 180 m · Coaxiaal · ONDER TEMPERATUURGRENS',
 ['REGIS NUBRk1 · λ reference: 0.90–1.42 W/mK. '+require('./public/presets.js').clay.note]:'REGIS NUBRk1 · λ-referentie: 0.90–1.42 W/mK. '+BorefieldDutch.text[require('./public/presets.js').clay.note]
};
for(const [en,nl]of Object.entries(cases))assert.equal(I18n.t(en),nl);
for(const s of ['NUBRk1','EUR','DKK','pyg-ubwt','23.16','51,172.8','285','W/(m·K)','https://www.dinoloket.nl/'])assert.equal(I18n.t(s),s,'Model identifiers and numbers must not be translated');
for(const lithology of Object.values(require('./public/presets.js')))assert.notEqual(I18n.t(lithology.name),lithology.name,'Missing lithology: '+lithology.name);
const html=fs.readFileSync('public/index.html','utf8');assert(html.includes('id="language"'));assert(html.indexOf('id="language"')<html.indexOf('id="currency"'));assert(html.includes('./i18n-nl.js'));assert(html.includes('./i18n.js'));
console.log('Dutch technical guidance ('+Object.keys(allHelp).length+' fields), dynamic results, money labels, lithologies and data-neutral translation checks passed.');
