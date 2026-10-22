/* Absolute delivered heat editor; model accepts these kWh as normalized weights. */
window.MonthlyDemand=(()=>{
 const names=['January','February','March','April','May','June','July','August','September','October','November','December'];
 const seasonal=[17,14,12,8,5,2,2,2,4,8,11,15];
 const annual=document.getElementById('annual'),host=document.getElementById('monthly-demand');
 host.innerHTML=`<h3>Monthly delivered heat</h3><p class="help">Enter heat delivered to the house, including hot water. Editing a month updates the annual total. Changing annual demand scales all months, keeping their proportions.</p><div class="monthly-grid">${names.map((n,i)=>`<label>${n}<span class="monthly-input"><input id="heat-month-${i}" aria-label="${n} delivered heat, kWh" type="number" min="0" step="any" required><span>kWh</span></span><small id="heat-share-${i}"></small></label>`).join('')}</div><p id="monthly-total" class="help" role="status"></p><button type="button" id="monthly-seasonal" class="secondary">Use seasonal distribution</button> <button type="button" id="monthly-equal" class="secondary">Spread equally</button><p class="help">Seasonal distribution is an illustrative heating profile, not local weather data. Measured monthly heat is preferable.</p>`;
 const fields=names.map((_,i)=>document.getElementById('heat-month-'+i));
 const values=()=>fields.map(el=>el.value===''?NaN:Number(el.value));
 function summary(){const v=values(),sum=v.reduce((a,b)=>a+b,0);fields.forEach((el,i)=>document.getElementById('heat-share-'+i).textContent=Number.isFinite(sum)&&sum>0?(100*v[i]/sum).toLocaleString(window.I18n?.locale||'en-GB',{minimumFractionDigits:1,maximumFractionDigits:1})+'% of annual heat':'—');document.getElementById('monthly-total').textContent=Number.isFinite(sum)?`Monthly total: ${sum.toLocaleString(window.I18n?.locale||'en-GB',{maximumFractionDigits:3})} kWh/year`:'Complete all twelve months.';}
 function set(profile,total){const sum=profile.reduce((a,b)=>a+b,0);let used=0,cumulative=0;fields.forEach((el,i)=>{cumulative+=profile[i];const next=(i===11?total:Math.round(total*cumulative/sum*1000)/1000)-used;el.value=String(Math.max(0,Number(next.toFixed(3))));used+=Number(el.value);});summary();}
 fields.forEach(el=>el.addEventListener('input',()=>{const v=values();if(v.every(x=>Number.isFinite(x)&&x>=0)){annual.value=String(Number(v.reduce((a,b)=>a+b,0).toFixed(3)));delete annual.dataset.precise;delete annual.dataset.formatted;}summary();}));
 annual.addEventListener('input',()=>{const total=Number(annual.value),v=values();if(annual.value!==''&&total>0&&v.every(x=>Number.isFinite(x)&&x>=0))set(v.reduce((a,b)=>a+b,0)>0?v:seasonal,total);});
 function preset(p){const total=Number(annual.value);if(total>0){set(p,total);stale();}}
 document.getElementById('monthly-seasonal').onclick=()=>preset(seasonal);
 document.getElementById('monthly-equal').onclick=()=>preset(Array(12).fill(1));
 window.addEventListener('borefield:languagechange',summary);
 set(seasonal,Number(annual.value));
 return {set,read:()=>{const v=values(),sum=v.reduce((a,b)=>a+b,0);if(v.some(x=>!Number.isFinite(x)||x<0)||sum<=0)throw Error('Enter non-negative delivered heat for all twelve months, with a positive annual total.');if(Math.abs(sum-Number(annual.value))>.002)throw Error('Monthly heat must add up to annual delivered heat. Adjust annual demand to rescale the months.');return v;}};
})();
