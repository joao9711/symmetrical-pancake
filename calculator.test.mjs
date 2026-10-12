import test from 'node:test';
import assert from 'node:assert/strict';
import {createCalculator} from './calculator.mjs';
function run(keys){const calc=createCalculator();let result;for(const key of keys)result=calc.press(key);return result;}
test('operações, decimais e porcentagens para contas financeiras',()=>{
 assert.equal(run(['1','0',',','5','+','2',',','3','=']),'12.8');
 assert.equal(run(['2','0','0','+','1','0','%','=']),'220');
 assert.equal(run(['2','0','0','−','1','0','%','=']),'180');
 assert.equal(run(['2','0','0','×','1','0','%','=']),'20');
 assert.equal(run(['9','÷','3','=']),'3');
 assert.equal(run(['0',',','1','+','0',',','2','=']),'0.3');
});
test('correção, sinal, encadeamento e recuperação após divisão por zero',()=>{
 assert.equal(run(['5','2','⌫','±'] ),'-5');
 assert.equal(run(['2','+','3','×','4','=']),'20');
 assert.equal(run(['2','+','−','1','=']),'1');
 assert.equal(run(['9','C','3']),'3');
 const calc=createCalculator();calc.press('1');calc.press('÷');calc.press('0');assert.throws(()=>calc.press('='),/dividir por zero/);calc.reset();assert.equal(calc.press('3'),'3');
});
