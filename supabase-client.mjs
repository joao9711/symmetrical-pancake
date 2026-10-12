export function requestHeaders(key, token) {
  const headers = {apikey:key, 'Content-Type':'application/json'};
  if (token) headers.Authorization = 'Bearer ' + token;
  return headers;
}
export function authFailure(error) {
  if(error.status===429) return {status:429,message:'Muitas tentativas. Aguarde antes de tentar novamente.'};
  if(['weak_password','validation_failed'].includes(error.code))return {status:400,message:'Confira os dados e use uma senha de 10 a 128 caracteres ao criar a conta.'};
  if(error.code==='email_address_invalid')return {status:400,message:'Informe um endereço de e-mail válido.'};
  if(['email_address_not_authorized','email_provider_disabled','signup_disabled'].includes(error.code))return {status:503,message:'O serviço de cadastro por e-mail precisa ser configurado no Supabase. Avise o responsável pelo aplicativo.'};
  if(error.code==='over_email_send_rate_limit')return {status:429,message:'O limite de envio de e-mails foi atingido. Aguarde antes de solicitar outro link.'};
  if(error.code==='email_not_confirmed') return {status:400,message:'Seu e-mail ainda não foi confirmado. Clique em Reenviar confirmação do e-mail e use o link da mensagem mais recente.'};
  if(error.code==='invalid_credentials') return {status:400,message:'E-mail ou senha incorretos. Confira o e-mail. Se já cadastrou sua conta, use Esqueci minha senha; se ainda não cadastrou, clique em Criar conta.'};
  if(error.code==='user_already_exists') return {status:400,message:'Esta conta já existe. Clique em Entrar.'};
  if(error.status===401||error.status===403) return {status:503,message:'Não foi possível autenticar com o serviço. Verifique a configuração da chave Supabase no Render.'};
  return {status:503,message:'Não foi possível conectar ao serviço de login. Tente novamente em instantes.'};
}

export function validAuthPassword(password,registering=false){return typeof password==='string'&&password.length>=(registering?10:1)&&password.length<=128;}
