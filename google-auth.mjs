import {randomBytes,createHash} from 'node:crypto';
import {validVisit} from './login-session.mjs';
export function createGoogleAuth(remote,base,appURL){
 const app=new URL(appURL);if(app.protocol!=='https:')throw Error('PUBLIC_APP_URL deve usar HTTPS.');
 return {
 async start({visit,remember}){if(!validVisit(visit))throw Error('Atualize a página e tente novamente.');const settings=await remote('/auth/v1/settings');if(!settings?.external?.google)throw Error('O login com Google ainda precisa ser ativado no Supabase.');
 const verifier=randomBytes(32).toString('base64url');const value=Buffer.from(JSON.stringify({verifier,visit,remember:remember===true,expires:Date.now()+600000})).toString('base64url');
 const url=new URL('/auth/v1/authorize',base);url.searchParams.set('provider','google');url.searchParams.set('redirect_to',app.origin+'/?google_callback=1');url.searchParams.set('code_challenge',createHash('sha256').update(verifier).digest('base64url'));url.searchParams.set('code_challenge_method','s256');return {url:url.href,value};},
 async finish(code,value){let pending;try{pending=JSON.parse(Buffer.from(value||'','base64url').toString());}catch{throw Error('O acesso pelo Google expirou. Tente novamente.');}if(!pending||pending.expires<Date.now()||!validVisit(pending.visit)||typeof pending.verifier!=='string'||pending.verifier.length!==43||typeof code!=='string'||!code||code.length>2048)throw Error('O acesso pelo Google expirou. Tente novamente.');
 const session=await remote('/auth/v1/token?grant_type=pkce','POST',{auth_code:code,code_verifier:pending.verifier});if(!session?.access_token||!session?.refresh_token||!session?.user)throw Error('Não foi possível concluir o acesso pelo Google.');return {session,remember:pending.remember===true,visit:pending.visit};}
 };
}
export function googleCookie(value,secure=true){return 'google_login='+value+'; HttpOnly; SameSite=Lax; Path=/; Max-Age='+(value?'600':'0')+(secure?'; Secure':'');}
