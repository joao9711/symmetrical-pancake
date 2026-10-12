import {setFeedback} from './feedback.mjs';
export function initConfirmation({api}){
 const $=id=>document.getElementById(id);
 $('resend-confirmation').onclick=async event=>{const email=$('email').value.trim();if(!$('email').reportValidity()||!email)return;const button=event.currentTarget;button.disabled=true;try{const result=await api('resend-confirmation','POST',{email});setFeedback($('auth-error'),result.message,'success');}catch(error){setFeedback($('auth-error'),error.message);}finally{button.disabled=false;}};
 async function start(){const hash=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search),type=hash.get('type')||query.get('type');if(type==='recovery')return false;
  const accessToken=hash.get('access_token'),tokenHash=query.get('token_hash'),hasError=hash.has('error')||query.has('error')||hash.has('error_code')||query.has('error_code');
  if(!accessToken&&!tokenHash&&!hasError)return false;
  history.replaceState(null,'',location.pathname);$('auth').hidden=false;document.querySelector('main').hidden=true;
  if(hasError){setFeedback($('auth-error'),'O link de confirmação é inválido ou expirou. Informe seu e-mail e clique em Reenviar confirmação do e-mail.');return true;}
  try{const result=await api('confirm-email','POST',{accessToken,tokenHash});setFeedback($('auth-error'),result.message,'success');}catch(error){setFeedback($('auth-error'),error.message);}return true;
 }
 return {start};
}
