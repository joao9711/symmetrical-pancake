import test from 'node:test';
import assert from 'node:assert/strict';
import {summary} from './finance.mjs';
const e=(type,cents,date='2026-10-10')=>({type,cents,date});
test('calcula limite com reserva e exclui outros meses',()=>{assert.deepEqual(summary([e('income',300000),e('expense',100000),e('expense',50000,'2026-09-01')],'2026-10',20),{income:300000,spent:100000,limit:240000,remaining:140000,balance:200000,reserve:60000});});
test('detecta gastos acima do limite',()=>{assert.equal(summary([e('income',300000),e('expense',250000)],'2026-10',20).remaining,-10000);});
test('despesas sem receitas não criam orçamento',()=>{const s=summary([e('expense',1234)],'2026-10');assert.equal(s.limit,0);assert.equal(s.remaining,-1234);});
test('mantém centavos inteiros',()=>{assert.equal(summary([e('income',101)],'2026-10',20).limit,80);});
