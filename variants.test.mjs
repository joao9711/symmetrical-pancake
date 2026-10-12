import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBusiness,saveVariant,inventory,validBusiness,businessSummary,variantLabel,deleteProduct} from './business.mjs';
const b=()=>({...emptyBusiness(),products:[{id:'p',name:'Essencial',brand:'Natura',price:15000,variants:[{id:'a',fragrance:'Oud',volumeMl:100,price:15000},{id:'b',fragrance:'Oud',volumeMl:50,price:9000},{id:'c',fragrance:'Floral',volumeMl:100,price:14000}]}],purchases:[{id:'pa',productId:'p',variantId:'a',qty:2,cost:10000,date:'2026-10-10'},{id:'pb',productId:'p',variantId:'b',qty:1,cost:6000,date:'2026-10-10'}]});
test('fragrância e ml separam estoque e custo dentro do mesmo produto',()=>{
 const state=b();assert.ok(validBusiness(state));assert.equal(inventory(state,'p','a').qty,2);assert.equal(inventory(state,'p','b').qty,1);assert.equal(inventory(state,'p','c').qty,0);assert.equal(inventory(state,'p').qty,3);assert.equal(inventory(state,'p').value,26000);assert.equal(variantLabel(state.products[0].variants[1]),'Oud · 50 ml');assert.equal(businessSummary(state,'2026-10').stockValue,26000);
});
test('venda aceita duas variações do mesmo produto sem consumir estoque de outra',()=>{
 const state=b();state.sales=[{id:'s',customer:'Ana',date:'2026-10-10',due:'2026-10-20',items:[{productId:'p',variantId:'a',name:'Essencial Oud100',qty:1,price:15000,cost:10000,costTotal:10000},{productId:'p',variantId:'b',name:'Essencial Oud50',qty:1,price:9000,cost:6000,costTotal:6000}]}];assert.ok(validBusiness(state));assert.equal(inventory(state,'p','a').qty,1);assert.equal(inventory(state,'p','b').qty,0);assert.equal(businessSummary(state,'2026-10').profit,8000);state.sales[0].items[1].variantId='c';assert.equal(validBusiness(state),false);
});
test('custo de reposições e histórico preservam variação e preço antigo',()=>{
 const state=b();state.sales=[{id:'s',customer:'Ana',date:'2026-10-10',due:'2026-10-20',items:[{productId:'p',variantId:'a',name:'Essencial Oud100',qty:1,price:15000,cost:10000,costTotal:10000}]}];state.purchases.push({id:'repor',productId:'p',variantId:'a',qty:1,cost:12000,date:'2026-10-11'});const next=saveVariant(state,'p',{id:'a',fragrance:'Oud',volumeMl:100,price:17000});assert.equal(inventory(next,'p','a').cost,11000);assert.equal(inventory(next,'p','b').cost,6000);assert.equal(next.sales[0].items[0].price,15000);assert.equal(state.products[0].variants[0].price,15000);
});
test('rejeita combinações duplicadas, referência a outra variação e estoque anterior negativo',()=>{
 const state=b();assert.throws(()=>saveVariant(state,'p',{id:'other',fragrance:' oud ',volumeMl:100,price:1000}));assert.throws(()=>saveVariant(state,'p',{id:'other',fragrance:'',volumeMl:0,price:1000}));assert.equal(validBusiness({...state,purchases:[{...state.purchases[0],variantId:'other'}]}),false);const legacy={...state,purchases:[...state.purchases,{id:'old',productId:'p',qty:1,cost:100,date:'2026-10-10'}]};assert.equal(inventory(legacy,'p','').qty,1);assert.equal(deleteProduct(legacy,'p').purchases.length,0);
});
