export const OTHER='__custom__';
export function validChoices(s){try{const c=s.customChoices||{};return c&&typeof c==='object'&&!Array.isArray(c)&&Object.keys(c).length<=100&&Object.entries(c).every(([k,v])=>/^[a-zA-Z0-9_-]{1,80}$/.test(k)&&Array.isArray(v)&&v.length<=200&&v.every(t=>typeof t==='string'&&t.trim().length>0&&t.length<=100)&&new Set(v).size===v.length);}catch{return false;}}
export function initChoices({getState}){
 const controls=[];
 function create(select,key,options){const input=document.createElement('input');input.type='text';input.maxLength=100;input.placeholder='Escreva sua preferência';input.hidden=true;input.setAttribute('aria-label','Opção personalizada');select.after(input);
 let source=options;
 function choices(){try{return typeof source==='function'?source():source;}catch{return [];}}
 function bucket(){return typeof key==='function'?key():key;}
 function refresh(preferred=select.value){const names=[...new Set([...choices(),...(getState().customChoices?.[bucket()]||[])])].filter(t=>t!=='Outros');if(preferred&&preferred!==OTHER&&!names.includes(preferred))names.push(preferred);select.replaceChildren();for(const t of names)select.append(new Option(t,t));select.append(new Option('Outros — personalizar',OTHER));if(preferred)select.value=preferred;if(!select.value)select.selectedIndex=0;toggle();}
 function toggle(){input.hidden=select.value!==OTHER;input.required=!input.hidden;}
 select.addEventListener('change',toggle);
 const control={refresh,value(){const v=select.value===OTHER?input.value.trim():select.value;if(!v||v===OTHER)throw Error('Preencha a opção personalizada.');return v;},augment(state){if(select.value!==OTHER)return state;const v=this.value(),c=state.customChoices||{};return {...state,customChoices:{...c,[bucket()]:[...new Set([...(c[bucket()]||[]),v])]}};},set(value){input.value='';refresh(value);},reset(){input.value='';refresh();},replace(options,value){source=options;refresh(value===undefined?'':value);}};controls.push(control);select.form?.addEventListener('reset',()=>queueMicrotask(()=>refresh('')));refresh();return control;
 }
 return {create,refresh(){controls.forEach(c=>c.refresh());}};
}
