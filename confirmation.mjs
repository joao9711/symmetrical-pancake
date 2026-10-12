export function createConfirmation(remote,appURL){
 const url=new URL(appURL);if(url.protocol!=='https:')throw Error('PUBLIC_APP_URL deve usar HTTPS.');
 const destination=url.origin+'/';
 return {
  signupPath:'/auth/v1/signup?redirect_to='+encodeURIComponent(destination),
  async resend(email){await remote('/auth/v1/resend','POST',{type:'signup',email,options:{emailRedirectTo:destination}});return {message:'Se houver uma conta aguardando confirmação, enviaremos um novo link. Use o e-mail mais recente e confira também o spam.'};},
  async verify({tokenHash,accessToken}){let user;if(tokenHash){const result=await remote('/auth/v1/verify','POST',{token_hash:tokenHash,type:'signup'});user=result?.user;}else user=await remote('/auth/v1/user','GET',undefined,accessToken);
   if(!user?.email_confirmed_at){const error=Error('Confirmação inválida');error.status=400;throw error;}
   return {ok:true,message:'E-mail confirmado! Entre com o e-mail e a senha que você cadastrou.'};
  }
 };
}
export function confirmationFailure(error){if(error.status===429)return {status:429,message:'Muitas solicitações de e-mail. Aguarde alguns minutos antes de tentar novamente.'};if([400,401,403,422].includes(error.status))return {status:400,message:'Este link de confirmação é inválido ou expirou. Solicite um novo em Reenviar confirmação do e-mail.'};return {status:503,message:'Não foi possível confirmar seu e-mail agora. Tente novamente em instantes.'};}
