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
