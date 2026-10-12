import test from 'node:test';
import assert from 'node:assert/strict';
import {requestHeaders,authFailure} from './supabase-client.mjs';
test('chave publishable não é enviada como JWT nas chamadas públicas',()=>{assert.deepEqual(requestHeaders('sb_publishable_example'),{apikey:'sb_publishable_example','Content-Type':'application/json'});});
test('chamadas autenticadas usam apenas token de usuário como Bearer',()=>{assert.equal(requestHeaders('public-key','user-jwt').Authorization,'Bearer user-jwt');});
test('distingue confirmação, credenciais e configuração sem expor resposta privada',()=>{assert.match(authFailure({code:'email_not_confirmed',status:400}).message,/não foi confirmado/);assert.match(authFailure({code:'invalid_credentials',status:400}).message,/senha incorretos/);assert.equal(authFailure({status:401}).status,503);});

test('login aceita senha anterior curta sem reduzir exigência de cadastro novo',async()=>{
 const {validAuthPassword}=await import('./supabase-client.mjs');
 assert.equal(validAuthPassword('antiga6'),true);
 assert.equal(validAuthPassword('antiga6',true),false);
 assert.equal(validAuthPassword('nova-senha-segura',true),true);
 for(const password of ['',null,'x'.repeat(129)])assert.equal(validAuthPassword(password),false);
});
