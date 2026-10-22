/* MIT. Browser-only presentation translations; model keys, units and saved numbers stay unchanged. */
(function(root){
 const catalog=root.BorefieldDutch||{text:{},help:{},prefixes:[]};
 let language='en';try{language=localStorage.getItem('borefield-language')||((navigator.language||'').toLowerCase().startsWith('nl')?'nl':'en');}catch{}if(!['en','nl'].includes(language))language='en';
 const dictionary=new Map(Object.entries(catalog.text)),originals=new WeakMap();
 function registerHelp(english){for(const [key,value]of Object.entries(english)){const dutch=catalog.help[key];if(!dutch)continue;value.split('|').forEach((part,i)=>dictionary.set(part,dutch.split('|')[i]||part));}}
 function translate(text){if(language!=='nl')return String(text);const source=String(text),trim=source.trim();let result=dictionary.get(trim);if(result===undefined){for(const [prefix,replacement]of catalog.prefixes||[])if(trim.startsWith(prefix)){result=typeof replacement==='function'?replacement(trim):replacement;break;}}if(result===undefined)result=root.BorefieldDutch.dynamic(trim,translate);return result===undefined?source:source.slice(0,source.indexOf(trim))+result+source.slice(source.indexOf(trim)+trim.length);}
 function update(node,key,get,set){let state=originals.get(node);if(!state){state={};originals.set(node,state);}const current=get(),old=state[key];const source=old&&current===old.output?old.source:current,output=translate(source);state[key]={source,output};if(output!==current)set(output);}
 const ignored=el=>el.closest('script,style,textarea,code,pre,[data-no-i18n],#addresses');
 function apply(container=document){const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))if(node.parentElement&&!ignored(node.parentElement)&&node.nodeValue.trim())update(node,'text',()=>node.nodeValue,v=>node.nodeValue=v);
 for(const el of container.querySelectorAll('[aria-label],[placeholder],[title],optgroup[label]')){if(ignored(el))continue;for(const attr of ['aria-label','placeholder','title',...(el.tagName==='OPTGROUP'?['label']:[])])if(el.hasAttribute(attr))update(el,attr,()=>el.getAttribute(attr),v=>el.setAttribute(attr,v));}}
 let queued=false;function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply();});}
 function setLanguage(next){if(!['en','nl'].includes(next))return;language=next;try{localStorage.setItem('borefield-language',next);}catch{}document.documentElement.lang=next;document.getElementById('language').value=next;document.title=next==='nl'?'Borefield | Van bodemprofiel naar bodemlusontwerp':'Borefield | Geology to heat pump design';root.dispatchEvent(new CustomEvent('borefield:languagechange',{detail:{language:next}}));apply();}
 root.I18n={t:translate,registerHelp,apply,setLanguage,get language(){return language;},get locale(){return language==='nl'?'nl-NL':'en-GB';}};
 function start(){document.getElementById('language').addEventListener('change',e=>setLanguage(e.target.value));setLanguage(language);new MutationObserver(schedule).observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['aria-label','placeholder','title','label']});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
