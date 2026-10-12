import test from 'node:test';
import assert from 'node:assert/strict';
import {createConfirmation,confirmationFailure} from './confirmation.mjs';
test('cadastro e reenvio apontam para o site publicado, sem localhost',async()=>{
 const calls=[];const api=createConfirmation(async(...args)=>{calls.push(args);},'https://meu-equilibrio.onrender.com');
 assert.equal(api.signupPath,'/auth/v1/signup?redirect_to=https%3A%2F%2Fmeu-equilibrio.onrender.com%2F');
 await api.resend('test@example.com');assert.deepEqual(calls[0],['/auth/v1/resend','POST',{type:'signup',email:'test@example.com',options:{emailRedirectTo:'https://meu-equilibrio.onrender.com/'}}]);
});
test('confirmação por hash ou token valida o usuário e não altera senha ou estado',async()=>{
 const calls=[];const api=createConfirmation(async(...args)=>{calls.push(args);return args[0]==='/auth/v1/verify'?{user:{email_confirmed_at:'2026-10-12'}}:{email_confirmed_at:'2026-10-12'};},'https://example.com');
 assert.equal((await api.verify({tokenHash:'hash-test'})).ok,true);assert.deepEqual(calls[0],['/auth/v1/verify','POST',{token_hash:'hash-test',type:'signup'}]);
 await api.verify({accessToken:'token-test'});assert.deepEqual(calls[1],['/auth/v1/user','GET',undefined,'token-test']);assert.equal(calls.length,2);
});
test('links não confirmados ou expirados geram orientação específica',async()=>{
 const api=createConfirmation(async()=>({}),'https://example.com');await assert.rejects(api.verify({accessToken:'bad'}));assert.match(confirmationFailure({status:403}).message,/Reenviar confirmação/);assert.equal(confirmationFailure({status:429}).status,429);
});
test('erro de envio não é apresentado como link expirado',()=>{
 assert.doesNotMatch(confirmationFailure({status:403},'resend').message,/expirou/);
 assert.match(confirmationFailure({status:403},'resend').message,/serviço de envio/);
});
