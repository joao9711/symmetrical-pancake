export function requestHeaders(key, token) {
  const headers = {apikey:key, 'Content-Type':'application/json'};
  if (token) headers.Authorization = 'Bearer ' + token;
  return headers;
}
export function authFailure(error) {
  if(error.status===429) return {status:429,message:'Muitas tentativas. Aguarde antes de tentar novamente.'};
  if(error.code==='email_not_confirmed') return {status:400,message:'Seu e-mail ainda não foi confirmado. Confira a mensagem de confirmação.'};
  if(error.code==='invalid_credentials') return {status:400,message:'E-mail ou senha incorretos. Use a senha criada no Meu Equilíbrio.'};
  if(error.code==='user_already_exists') return {status:400,message:'Esta conta já existe. Clique em Entrar.'};
  if(error.status===401||error.status===403) return {status:503,message:'Não foi possível autenticar com o serviço. Verifique a configuração da chave Supabase no Render.'};
  return {status:503,message:'Não foi possível conectar ao serviço de login. Tente novamente em instantes.'};
}
