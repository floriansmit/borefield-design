/* Thermal conductivity: Ditlefsen et al. (2014), GEUS Bulletin 31, Tables 1–2.
   Heat capacities: illustrative saturated bulk mixture estimates; not GEUS measurements. */
const LITHOLOGIES = {
 custom:{name:'Custom / measured values',k:2,cv:2.8,range:'Site-specific',note:'Enter measured or independently justified bulk properties.'},
 sand:{name:'Sand / gravel · zand / smeltevandssand',k:2.24,cv:2.73,range:'1.98–2.43',note:'GEUS water-saturated gravelly glacial sand; generic sand interpretation in Table 2. Cv estimate: porosity 0.35, solid 1.95 MJ/m³K.'},
 quartz:{name:'Quartz-rich sand · kwartszand',k:2.75,cv:2.84,range:'2.41–3.34',note:'GEUS water-saturated pure quartz sand. Cv estimate: porosity 0.40, solid 1.95 MJ/m³K.'},
 mica:{name:'Fine, mica-rich sand · glimmersand',k:1.81,cv:2.93,range:'1.48–2.19',note:'GEUS saturated mica-rich fine-grained sand. Cv estimate: porosity 0.40, solid 2.10 MJ/m³K.'},
 clay:{name:'Silty clay · klei / siltet ler',k:1.15,cv:3.19,range:'0.90–1.42',note:'GEUS saturated silty clay; generic clay interpretation in Table 2. Cv estimate: porosity 0.50, solid 2.20 MJ/m³K.'},
 smectite:{name:'Smectite-rich clay · plastisch ler',k:.98,cv:3.39,range:'0.80–1.14',note:'GEUS saturated smectite-rich clay. Cv estimate: porosity 0.60, solid 2.20 MJ/m³K.'},
 till:{name:'Glacial till · keileem / moræneler',k:1.89,cv:2.72,range:'1.40–2.66',note:'GEUS saturated till. Cv estimate: porosity 0.30, solid 2.10 MJ/m³K.'},
 chalk:{name:'Chalk / soft limestone · krijt / kalk',k:1.62,cv:2.99,range:'1.49–1.80',note:'GEUS chalk data from Balling et al. (1981); soft limestone interpreted similarly in Table 2. Not a general hard-limestone value. Cv estimate: porosity 0.40, solid 2.20 MJ/m³K.'},
 gyttja:{name:'Gyttja / organic lake sediment',k:.68,cv:3.78,range:'0.58–0.86',note:'GEUS water-saturated gyttja. Cv estimate: porosity 0.85, solid 1.50 MJ/m³K.'},
 peat:{name:'Peat · veen / tørv (illustrative)',k:.6,cv:3.91,range:'Illustrative 0.4–0.8',note:'Engineering starting assumption, not a measured GEUS peat mean. Strongly moisture-dependent. Cv estimate: porosity 0.90, organic solid 1.50 MJ/m³K.'},
 mixed:{name:'Alternating sand & clay · zand/klei',k:1.5,cv:2.96,range:'Interpretive 1.0–2.5',note:'GEUS interpretive conductivity for alternating water-laid sand/clay. Cv estimate: mean of sand and clay defaults. Review proportions.'},
 unsaturated:{name:'Unsaturated sediment · above water table',k:1,cv:1.6,range:'Very moisture-dependent',note:'GEUS tentative above-water-table conductivity. Cv 1.60 is an illustrative assumption; split layers at the water table.'}
};
if(typeof module!=='undefined')module.exports=LITHOLOGIES;
