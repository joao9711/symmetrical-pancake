import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfile,publicProfile} from './profile.mjs';
test('contato normaliza DDD brasileiro e preserva números internacionais',()=>{
 assert.deepEqual(normalizeProfile({fullName:' Maria  Silva ',phone:'(92) 99999-9999'}),{fullName:'Maria Silva',phone:'+5592999999999'});
 assert.equal(normalizeProfile({fullName:'Maria Silva',phone:'+351 912345678'}).phone,'+351912345678');
});
test('contas antigas continuam acessíveis e contatos inválidos são rejeitados',()=>{
 assert.deepEqual(publicProfile({}),{fullName:'',phone:''});
 for(const phone of ['abc92999999999','123','+00000000000'])assert.equal(normalizeProfile({fullName:'Maria Silva',phone}),null);
 assert.equal(normalizeProfile({fullName:'',phone:'92999999999'}),null);
});
test('foto de perfil aceita JPEG limitado e rejeita URLs externas ou conteúdo ativo',()=>{
 const contact={fullName:'Maria Silva',phone:'92999999999'};
 assert.equal(normalizeProfile({...contact,photo:'data:image/jpeg;base64,/9j/AA=='}).photo,'data:image/jpeg;base64,/9j/AA==');
 for(const photo of ['https://example.com/photo.jpg','data:image/svg+xml;base64,AAAA','data:image/jpeg;base64,'+'A'.repeat(65001)])assert.equal(normalizeProfile({...contact,photo}),null);
 assert.equal(normalizeProfile({...contact,photo:''}).photo,undefined);
});
