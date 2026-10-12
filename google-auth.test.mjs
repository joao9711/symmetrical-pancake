import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGoogleAuth,googleCookie} from './google-auth.mjs';
test('Google usa PKCE, endereço fixo e preferência de sessão',async()=>{
 const calls=[];const google=createGoogleAuth(async(...args)=>{calls.push(args);return args[0].endsWith('settings')?{external:{google:true}}:{access_token:'a',refresh_token:'r',user:{id:'u'}};},'https://example.supabase.co','https://meu-equilibrio.onrender.com');
 const start=await google.start({visit:'abcdefghijabcdefghij',remember:false});const pending=JSON.parse(Buffer.from(start.value,'base64url'));const url=new URL(start.url);assert.equal(url.searchParams.get('code_challenge'),createHash('sha256').update(pending.verifier).digest('base64url'));assert.equal(url.searchParams.get('redirect_to'),'https://meu-equilibrio.onrender.com/?google_callback=1');
 const result=await google.finish('auth-code',start.value);assert.equal(result.remember,false);assert.equal(result.visit,pending.visit);assert.deepEqual(calls[1],['/auth/v1/token?grant_type=pkce','POST',{auth_code:'auth-code',code_verifier:pending.verifier}]);assert.match(googleCookie(start.value),/HttpOnly; SameSite=Lax/);assert.match(googleCookie(''),/Max-Age=0/);
});
test('Google desativado e callback sem vínculo com navegador são recusados',async()=>{
 const google=createGoogleAuth(async()=>({external:{google:false}}),'https://example.com','https://app.example.com');await assert.rejects(google.start({visit:'abcdefghijabcdefghij'}),/ativado/);await assert.rejects(google.finish('code','bad'),/expirou/);
});
