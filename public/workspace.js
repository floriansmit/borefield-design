/* MIT: setup/results workspace. Panels stay mounted to preserve all inputs and selections. */
(function(){
const $=id=>document.getElementById(id);
const setup=$('setup-panel'),results=$('results-panel'),tabs=[$('setup-tab'),$('results-tab')];
const statusRow=document.createElement('div');statusRow.className='workspace-status';$('status').before(statusRow);statusRow.append($('status'),$('cancel'));$('cancel').removeAttribute('style');
// Keep the map and import controls alongside one another on wide screens.
const location=$('setup-location'),locationGrid=document.createElement('div');locationGrid.className='location-grid';
const mapWrap=document.createElement('div');mapWrap.className='setup-map';mapWrap.append($('map'));
const locationControls=document.createElement('div');locationControls.className='location-controls';
const locationHeading=location.querySelector('h2'),locationIntro=location.querySelector('p.help');
for(const node of [...location.childNodes])if(node!==locationHeading&&node!==locationIntro)locationControls.append(node);
locationGrid.append(mapWrap,locationControls);location.append(locationGrid);
// Borehole preview beside a bounded editor: imported profiles never lengthen the whole page.
const geology=$('setup-geology'),ground=$('ground');
const exchanger=document.createElement('section');exchanger.id='setup-exchanger';exchanger.className='card setup-exchanger';
const exchangerHeading=document.createElement('h2');exchangerHeading.textContent='05 / Ground properties & heat exchanger';exchanger.append(exchangerHeading);
let cursor=ground;while(cursor){const next=cursor.nextSibling;exchanger.append(cursor);cursor=next;}
geology.after(exchanger);
$('setup-search').querySelector('h2').textContent='06 / Borefield search';$('setup-economics').querySelector('h2').textContent='07 / Lifetime economics';
const geologyGrid=document.createElement('div');geologyGrid.className='geology-grid';
const preview=document.createElement('div');preview.className='geology-preview';preview.append(geology.querySelector('.borehole-log'));
const layerPane=document.createElement('div');layerPane.className='layer-editor-pane';
const layerHeading=document.createElement('div');layerHeading.className='layer-editor-heading';layerHeading.innerHTML='<h3>Layer editor</h3><span id="layer-count" class="tab-badge"></span>';
layerPane.append(layerHeading,$('layers'),$('add'));geologyGrid.append(preview,layerPane);geology.querySelector('p.help').after(geologyGrid);
const count=()=>{$('layer-count').textContent=$('layers').children.length+' layers';};new MutationObserver(count).observe($('layers'),{childList:true});count();
// A fully visible model setup is the initial state; expensive calculation starts on request.
let ready=false,running=false,active='setup';const scrollPositions={setup:0,results:0};
function select(name,{focus=false,top=false}={}){scrollPositions[active]=window.scrollY;active=name;const showSetup=name==='setup';setup.hidden=!showSetup;results.hidden=showSetup;tabs.forEach((tab,i)=>{const selected=(i===0)===showSetup;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});requestAnimationFrame(()=>{window.dispatchEvent(new Event('resize'));if(focus)tabs[showSetup?0:1].focus({preventScroll:true});if(top)$('setup-tab').parentElement.scrollIntoView({block:'start',behavior:'smooth'});else window.scrollTo({top:scrollPositions[name],behavior:'instant'});});}
tabs[0].onclick=()=>select('setup');tabs[1].onclick=()=>select('results');$('back-to-setup').onclick=()=>select('setup',{focus:true,top:true});
for(const tab of tabs)tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();let name=e.key==='Home'?'setup':e.key==='End'?'results':active==='setup'?'results':'setup';select(name,{focus:true});}});
$('toprun').addEventListener('click',()=>{if(!$('form').checkValidity())select('setup',{top:true});});
function badge(){const text=$('status').textContent;$('results-badge').textContent=running?'Calculating…':ready?(/Inputs changed|compare again/i.test(text)?'Inputs changed':'Ready'):'Not calculated';}
new MutationObserver(badge).observe($('status'),{childList:true,subtree:true,characterData:true});
window.BorefieldWorkspace={
calculationStarted(){running=true;$('results-empty').hidden=ready;if(!ready){$('results-empty').querySelector('h2').textContent='Calculating your designs…';$('results-empty').querySelector('p').textContent='The selected engine is running. You can return to Model setup while it works; any later input changes will be marked.';}$('results-content').hidden=!ready;badge();select('results',{top:true});},
completed(){ready=true;running=false;$('results-empty').hidden=true;$('results-content').hidden=false;badge();},
failed(){running=false;badge();select('setup',{top:true});},
cancelled(){running=false;badge();select('setup',{top:true});}
};
})();
