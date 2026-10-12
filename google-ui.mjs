import {setFeedback} from './feedback.mjs';
export function initGoogle({api,newVisit,restoreVisit,showAccount}){
 const $=id=>document.getElementById(id);
 $('google-login').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{const result=await api('google/start','POST',{visit:newVisit(),remember:$('remember-login').checked});location.assign(result.url);}catch(error){setFeedback($('auth-error'),error.message);button.disabled=false;}};
 async function start(){const query=new URLSearchParams(location.search);if(query.get('google_callback')!=='1')return false;const code=query.get('code');history.replaceState(null,'',location.pathname);if(!code||query.has('error')){setFeedback($('auth-error'),'O acesso pelo Google foi cancelado ou não pôde ser concluído. Tente novamente.');return true;}try{restoreVisit();showAccount(await api('google/finish','POST',{code}));}catch(error){setFeedback($('auth-error'),error.message);}return true;}
 return {start};
}
