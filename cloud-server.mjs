import {requestHeaders,authFailure} from './supabase-client.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {valid} from './validation.mjs';
const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
if(!base||!key)throw Error('Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY. Não use chave service_role.');
if(new URL(base).protocol!=='https:')throw Error('Supabase requer HTTPS.');
const files={'/':'index.html','/app.mjs':'app.mjs','/finance.mjs':'finance.mjs','/style.css':'style.css','/business.mjs':'business.mjs','/business-ui.mjs':'business-ui.mjs','/recurring.mjs':'recurring.mjs','/recurring-ui.mjs':'recurring-ui.mjs'};
const empty={entries:[],debts:[],reserve:20};
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function remote(path,method='GET',body,token){const response=await fetch(base+path,{method,headers:requestHeaders(key,token),body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const data=await response.json().catch(()=>null);if(!response.ok){const error=Error('Serviço indisponível');error.status=response.status;error.code=data?.error_code||data?.code;throw error;}return data;}
function cookies(res,session){const secure=process.env.COOKIE_SECURE==='0'?'':'; Secure';res.setHeader('Set-Cookie',[`access=${session.access_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600${secure}`,`refresh=${session.refresh_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure}`]);}
function readCookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=')));}
async function session(req,res){let {access,refresh}=readCookies(req);try{const user=await remote('/auth/v1/user','GET',undefined,access||'invalid');return {user,token:access};}catch(error){if(![401,403].includes(error.status)||!refresh)throw error;const renewed=await remote('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:refresh});cookies(res,renewed);return {user:renewed.user,token:renewed.access_token};}}
async function account(user,token){let rows=await remote('/rest/v1/financial_state?select=state,version','GET',undefined,token);if(!rows.length){try{await remote('/rest/v1/financial_state','POST',{user_id:user.id,state:empty},token);}catch(error){if(error.status!==409)throw error;}rows=await remote('/rest/v1/financial_state?select=state,version','GET',undefined,token);}if(rows.length!==1)throw Error('Dados indisponíveis');return {email:user.email,...rows[0]};}
http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/healthz'){return send(res,200,{ok:true});}
 if(path.startsWith('/api/')){
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return send(res,403,{error:'Origem inválida.'});
  let body={};if(['POST','PUT'].includes(req.method)){if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'Formato inválido.'});let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>5000000)return send(res,413,{error:'Dados muito grandes.'});}try{body=JSON.parse(raw);}catch{return send(res,400,{error:'Dados inválidos.'});}}
  if(['/api/login','/api/register'].includes(path)&&req.method==='POST'){
   const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof body.password!=='string'||body.password.length<10||body.password.length>128)return send(res,400,{error:'Use um e-mail válido e uma senha de 10 a 128 caracteres.'});
   let result;try{result=await remote(path==='/api/register'?'/auth/v1/signup':'/auth/v1/token?grant_type=password','POST',{email,password:body.password});}catch(error){const failure=authFailure(error);return send(res,failure.status,{error:failure.message});}
   if(!result.access_token)return send(res,200,{confirmationRequired:true});cookies(res,result);return send(res,200,await account(result.user,result.access_token));
  }
  let auth;try{auth=await session(req,res);}catch(error){return send(res,[400,401,403].includes(error.status)?401:503,{error:[400,401,403].includes(error.status)?'Entre na sua conta.':'Não foi possível conectar. Tente novamente.'});}
  if(path==='/api/me'&&req.method==='GET')return send(res,200,await account(auth.user,auth.token));
  if(path==='/api/state'&&req.method==='PUT'){if(!valid(body.state)||!Number.isSafeInteger(body.version)||body.version<0)return send(res,400,{error:'Lançamentos inválidos.'});const result=await remote('/rest/v1/rpc/save_financial_state','POST',{new_state:body.state,expected_version:body.version},auth.token);if(result===null)return send(res,409,{error:'Os dados foram alterados em outro aparelho. Recarregue antes de salvar.'});return send(res,200,{ok:true,version:result});}
  if(path==='/api/logout'&&req.method==='POST'){await remote('/auth/v1/logout','POST',{},auth.token);res.setHeader('Set-Cookie',['access=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0','refresh=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0']);return send(res,200,{ok:true});}
  return send(res,404,{error:'Não encontrado.'});
 }
 const file=files[path];if(!file||!['GET','HEAD'].includes(req.method)){res.writeHead(404);res.end();return;}
 const content=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'",'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:content);
 }catch{send(res,503,{error:'Não foi possível acessar os dados. Tente novamente.'});}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Servidor Supabase iniciado.'));
