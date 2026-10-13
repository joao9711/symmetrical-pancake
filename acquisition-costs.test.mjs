import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBusiness,addPurchaseWithExpenses,businessSummary,inventory,cashMovements,validBusiness,allocateAcquisitionCost,deleteCashMovement} from './business.mjs';
const make=()=>({...emptyBusiness(),products:[{id:'p',name:'Essencial',price:3500,variants:[{id:'a',fragrance:'A',volumeMl:100,price:3500},{id:'b',fragrance:'B',volumeMl:100,price:3500},{id:'c',fragrance:'C',volumeMl:100,price:3500}]}]});
const buy=()=>addPurchaseWithExpenses(make(),'p',[{variantId:'a',qty:1,cost:2000},{variantId:'b',qty:1,cost:2000},{variantId:'c',qty:1,cost:2000}],'2026-10-13',[{description:'Frete',category:'Frete',cents:1700,costTreatment:'stock'}],undefined,'own');
test('R60 de produtos mais R17 de frete próprio viram investimento e estoque77, caixa e lucro0',()=>{
 const b=buy(),s=businessSummary(b,'2026-10');assert.ok(validBusiness(b));assert.equal(s.invested,7700);assert.equal(s.stockValue,7700);assert.equal(s.cash,0);assert.equal(s.profit,0);assert.equal(s.monthlyOut,7700);assert.equal(s.monthlyExpenses,0);assert.deepEqual(b.purchases.map(p=>p.additionalCostCents),[567,567,566]);assert.equal(cashMovements(b).reduce((sum,m)=>sum+m.cents,0),s.cash);
});
test('lucro só reconhece o custo de aquisição da variação vendida, sem alterar outras',()=>{
 const b=buy();b.sales=[{id:'sale',customer:'Ana',date:'2026-10-13',due:'2026-10-13',items:[{productId:'p',variantId:'a',name:'Essencial A',qty:1,price:3500,cost:2567,costTotal:2567}]}];b.payments=[{id:'pay',saleId:'sale',cents:3500,date:'2026-10-13'}];assert.ok(validBusiness(b));const s=businessSummary(b,'2026-10');assert.equal(s.profit,933);assert.equal(s.stockValue,5133);assert.equal(s.cash,3500);assert.equal(inventory(b,'p','a').qty,0);assert.equal(inventory(b,'p','b').value,2567);
});
test('despesa geral e registros anteriores mantêm tratamento imediato',()=>{
 const b=addPurchaseWithExpenses(make(),'p',[{variantId:'a',qty:1,cost:6000}],'2026-10-13',[{description:'Publicidade',cents:1000,costTreatment:'expense'}],undefined,'own');assert.equal(businessSummary(b,'2026-10').stockValue,6000);assert.equal(businessSummary(b,'2026-10').profit,-1000);assert.equal(businessSummary(b,'2026-10').cash,0);
});
test('rateio é exato em centavos e custos sem vínculo coerente são recusados',()=>{
 assert.deepEqual(allocateAcquisitionCost([{qty:1,cost:100},{qty:1,cost:200}],100),[33,67]);assert.equal(allocateAcquisitionCost([{qty:1,cost:100000000000},{qty:1,cost:99999999999}],99999999999).reduce((a,b)=>a+b),99999999999);const b=buy();b.purchases[0].additionalCostCents++;assert.equal(validBusiness(b),false);const original=buy();const next=deleteCashMovement(original,original.cash.find(c=>c.costTreatment==='stock').id);assert.equal(businessSummary(next,'2026-10').stockValue,6000);assert.ok(validBusiness(next));
});
test('não remove frete incorporado a estoque totalmente vendido nem altera o histórico da venda',()=>{
 const b=buy();b.sales=[{id:'sold',customer:'Ana',date:'2026-10-13',due:'2026-10-13',items:b.products[0].variants.map(v=>{const cost=inventory(b,'p',v.id).cost;return {productId:'p',variantId:v.id,name:'Essencial '+v.fragrance,qty:1,price:3500,cost,costTotal:cost};})}];assert.ok(validBusiness(b));assert.equal(businessSummary(b,'2026-10').stockValue,0);assert.throws(()=>deleteCashMovement(b,b.cash.find(c=>c.costTreatment==='stock').id),/produtos vendidos/);assert.equal(b.sales[0].items.reduce((sum,i)=>sum+i.costTotal,0),7700);
});
