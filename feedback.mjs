export function setFeedback(element,text,kind='error'){
 element.textContent=text;
 if(!text){delete element.dataset.feedback;return;}
 element.dataset.feedback=kind;
 element.setAttribute('role',kind==='error'?'alert':'status');
}
