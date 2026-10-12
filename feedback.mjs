const timers=new WeakMap();
export function setFeedback(element,text,kind='error'){
 const timer=timers.get(element);if(timer){clearTimeout(timer);timers.delete(element);}
 element.textContent=text;
 if(!text){delete element.dataset.feedback;return;}
 element.dataset.feedback=kind;
 element.setAttribute('role',kind==='error'?'alert':'status');
}

export function setDeletionFeedback(element,text){
 const storage=globalThis.document?.getElementById('storage-message');
 if(storage&&storage!==element&&storage.textContent==='Salvo na sua conta.')setFeedback(storage,'');
 setFeedback(element,text,'deletion');
 timers.set(element,setTimeout(()=>setFeedback(element,''),3000));
}
