import test from 'node:test';
import assert from 'node:assert/strict';
import {valid} from './validation.mjs';
const debt={id:'1',creditor:'Cartão',cents:80000,due:'2026-10-20',paid:false,notes:''};
test('aceita dívidas e lançamentos válidos',()=>assert.ok(valid({entries:[],debts:[debt],reserve:20})));
test('rejeita valores inválidos e dívidas duplicadas',()=>{for(const debts of [[{...debt,cents:-10}],[{...debt,cents:1.5}],[debt,debt]])assert.equal(valid({entries:[],debts,reserve:20}),false);});
