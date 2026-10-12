export function createCalculator(){
 let display='0',left=null,operator=null,fresh=true;
 const number=()=>Number(display);
 function reset(){display='0';left=null;operator=null;fresh=true;}
 function apply(a,b,op){if(op==='÷'&&b===0)throw Error('Não é possível dividir por zero.');const result=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b;if(!Number.isFinite(result))throw Error('O resultado é muito grande.');return Number(result.toPrecision(12));}
 function press(key){
  if(key==='C'){reset();return display;}
  if(/^\d$/.test(key)){if(fresh){display=key;fresh=false;}else if(display.replace(/[-.]/g,'').length<15)display=display==='0'?key:display+key;}
  else if(key===','){if(fresh){display='0.';fresh=false;}else if(!display.includes('.'))display+='.';}
  else if(key==='⌫'){if(!fresh){display=display.slice(0,-1);if(!display||display==='-')display='0';}}
  else if(key==='±'){if(number()!==0)display=String(-number());}
  else if(key==='%'){display=String(Number(((left!==null&&['+','−'].includes(operator)?left*number()/100:number()/100)).toPrecision(12)));fresh=false;}
  else if(['+','−','×','÷'].includes(key)){if(left!==null&&operator&&!fresh)display=String(apply(left,number(),operator));left=number();operator=key;fresh=true;}
  else if(key==='='){if(left!==null&&operator&&!fresh)display=String(apply(left,number(),operator));left=null;operator=null;fresh=true;}
  return display;
 }
 return {press,reset};
}
export function initCalculator(){
 const root=document.getElementById('profile-calculator'),display=document.getElementById('calculator-display'),message=document.getElementById('calculator-message'),model=createCalculator();
 function press(key){try{display.textContent=model.press(key).replace('.',',');message.textContent='';}catch(error){message.textContent=error.message;message.dataset.feedback='error';model.reset();display.textContent='0';}}
 root.querySelectorAll('[data-calc]').forEach(button=>button.addEventListener('click',()=>press(button.dataset.calc)));
 root.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey)return;const map={'.':',','/':'÷','*':'×','-':'−',Enter:'=',Escape:'C',Backspace:'⌫',Delete:'C'};const key=map[event.key]||event.key;if(/^\d$/.test(key)||[',','÷','×','−','+','=','C','⌫','%'].includes(key)){event.preventDefault();press(key);}});
 return {reset(){model.reset();display.textContent='0';message.textContent='';}};
}
