import {validAuthPassword} from './supabase-client.mjs';
import {normalizeProfile,publicProfile} from './profile.mjs';
import {validVisit} from './login-session.mjs';
import {valid} from './validation.mjs';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scrypt as derive,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
await mkdir(new URL('./data/',import.meta.url),{recursive:true});
const db=new DatabaseSync(new URL('./data/finance.db',import.meta.url).pathname);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE,password TEXT,salt TEXT,state TEXT); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user INTEGER,expires INTEGER);');
if(!db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='version'))db.exec('ALTER TABLE users ADD COLUMN version INTEGER NOT NULL DEFAULT 0');
if(!db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='profile'))db.exec("ALTER TABLE users ADD COLUMN profile TEXT NOT NULL DEFAULT '{}'");
const sessionColumns=db.prepare('PRAGMA table_info(sessions)').all();if(!sessionColumns.some(c=>c.name==='remember'))db.exec('ALTER TABLE sessions ADD COLUMN remember INTEGER NOT NULL DEFAULT 0');if(!sessionColumns.some(c=>c.name==='visit'))db.exec("ALTER TABLE sessions ADD COLUMN visit TEXT NOT NULL DEFAULT ''");
const files={'/privacidade':'privacidade.html','/termos':'termos.html','/manifest.webmanifest':'manifest.webmanifest','/assets/favicon.ico':'assets/favicon.ico','/assets/icon-180.png':'assets/icon-180.png','/assets/icon-192.png':'assets/icon-192.png','/assets/icon-512.png':'assets/icon-512.png','/':'index.html','/google-ui.mjs':'google-ui.mjs','/confirmation-ui.mjs':'confirmation-ui.mjs','/calculator.mjs':'calculator.mjs','/profile.mjs':'profile.mjs','/app.mjs':'app.mjs','/feedback.mjs':'feedback.mjs','/layout.mjs':'layout.mjs','/password-ui.mjs':'password-ui.mjs','/finance.mjs':'finance.mjs','/style.css':'style.css','/business.mjs':'business.mjs','/cosmetics.mjs':'cosmetics.mjs','/business-workspaces.mjs':'business-workspaces.mjs','/business-ui.mjs':'business-ui.mjs','/recurring.mjs':'recurring.mjs','/recurring-ui.mjs':'recurring-ui.mjs','/personal.mjs':'personal.mjs','/personal-ui.mjs':'personal-ui.mjs','/choices.mjs':'choices.mjs','/segments.mjs':'segments.mjs','/validation.mjs':'validation.mjs'};
const attempts=new Map();
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}

http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/api/')){
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return send(res,403,{error:'Origem inválida'});
  let body={};if(['POST','PUT'].includes(req.method)){if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'Formato inválido'});let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>5000000)return send(res,413,{error:'Dados muito grandes'});}try{body=JSON.parse(raw);}catch{return send(res,400,{error:'Dados inválidos'});}}
  if(path.startsWith('/api/google/'))return send(res,503,{error:'O login com Google está disponível na versão Supabase e precisa ser ativado no painel.'});
  if(['/api/resend-confirmation','/api/confirm-email','/api/forgot-password','/api/verify-recovery','/api/reset-password'].includes(path))return send(res,503,{error:'Recuperação por e-mail está disponível na versão publicada com Supabase.'});
  if(['/api/login','/api/register'].includes(path)&&req.method==='POST'){
   if(body.remember!==true&&!validVisit(body.visit))return send(res,400,{error:'Atualize a página e tente entrar novamente.'});
   const ip=req.socket.remoteAddress,now=Date.now();let limit=attempts.get(ip);if(!limit||limit.until<now){limit={count:0,until:now+600000};attempts.set(ip,limit);}if(++limit.count>20)return send(res,429,{error:'Muitas tentativas. Aguarde 10 minutos.'});
   const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const password=body.password;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!validAuthPassword(password,path==='/api/register'))return send(res,400,{error:'Use um e-mail válido e uma senha de 10 a 128 caracteres.'});
   let user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
   if(path==='/api/register'){const profile=normalizeProfile(body.profile);if(!profile)return send(res,400,{error:'Informe nome completo e celular com DDD ou código do país.'});if(user)return send(res,409,{error:'Não foi possível cadastrar esse e-mail. Tente entrar.'});const salt=randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');try{db.prepare('INSERT INTO users(email,password,salt,state,profile) VALUES(?,?,?,?,?)').run(email,hash,salt,JSON.stringify({entries:[],debts:[],reserve:20}),JSON.stringify(profile));}catch{return send(res,409,{error:'Não foi possível cadastrar esse e-mail.'});}user=db.prepare('SELECT * FROM users WHERE email=?').get(email);}
   else{const hash=await scrypt(password,user?.salt||'invalid-user-salt',64);if(!user||!timingSafeEqual(hash,Buffer.from(user.password,'hex')))return send(res,401,{error:'E-mail ou senha incorretos.'});}
   const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());db.prepare('INSERT INTO sessions(token,user,expires,remember,visit) VALUES(?,?,?,?,?)').run(token,user.id,Date.now()+(body.remember===true?604800000:28800000),body.remember===true?1:0,body.visit||'');res.setHeader('Set-Cookie',`session=${token}; HttpOnly; SameSite=Strict; Path=/${body.remember===true?'; Max-Age=604800':''}${process.env.COOKIE_SECURE==='1'?'; Secure':''}`);return send(res,200,{email:user.email,profile:publicProfile(JSON.parse(user.profile)),state:JSON.parse(user.state),version:user.version});
  }
  const token=req.headers.cookie?.match(/(?:^|;\s*)session=([a-f0-9]{64})(?:;|$)/)?.[1];const user=token&&db.prepare('SELECT users.*,sessions.remember AS sessionRemember,sessions.visit AS sessionVisit FROM sessions JOIN users ON users.id=sessions.user WHERE token=? AND expires>?').get(token,Date.now());if(!user||(!user.sessionRemember&&(!validVisit(req.headers['x-session-visit'])||user.sessionVisit!==req.headers['x-session-visit'])))return send(res,401,{error:'Entre na sua conta.'});
  if(path==='/api/profile'&&req.method==='PUT'){const profile=normalizeProfile(body);if(!profile)return send(res,400,{error:'Informe nome completo e celular com DDD ou código do país.'});db.prepare('UPDATE users SET profile=? WHERE id=?').run(JSON.stringify(profile),user.id);return send(res,200,{profile});}
  if(path==='/api/me'&&req.method==='GET')return send(res,200,{email:user.email,profile:publicProfile(JSON.parse(user.profile)),state:JSON.parse(user.state),version:user.version});
  if(path==='/api/state'&&req.method==='PUT'){if(!valid(body.state)||!Number.isInteger(body.version))return send(res,400,{error:'Lançamentos inválidos.'});const changed=db.prepare('UPDATE users SET state=?,version=version+1 WHERE id=? AND version=?').run(JSON.stringify(body.state),user.id,body.version);if(!changed.changes)return send(res,409,{error:'Os dados foram alterados em outro aparelho. Recarregue antes de salvar.'});return send(res,200,{ok:true,version:body.version+1});}
  if(path==='/api/logout'&&req.method==='POST'){db.prepare('DELETE FROM sessions WHERE token=?').run(token);res.setHeader('Set-Cookie','session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return send(res,200,{ok:true});}
  return send(res,404,{error:'Não encontrado'});
 }
 const file=files[path];if(!file||!['GET','HEAD'].includes(req.method)){res.writeHead(404);res.end();return;}
 const body=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.png')?'image/png':file.endsWith('.ico')?'image/x-icon':file.endsWith('.webmanifest')?'application/manifest+json':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'",'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:body);
 }catch{send(res,500,{error:'Não foi possível concluir. Tente novamente.'});}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Aplicativo iniciado na porta '+(process.env.PORT||3000)));
