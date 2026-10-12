import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBusiness,deleteProduct,productDeletionDetails,validBusiness,inventory} from './business.mjs';
import {deleteWorkspace,businessWorkspaces} from './business-workspaces.mjs';
import {transferEntries} from './personal.mjs';
import {valid} from './validation.mjs';
const make=()=>({...emptyBusiness(),products:[{id:'p',name:'Perfume',price:15000},{id:'q',name:'Creme',price:10000}],purchases:[{id:'stock-p',productId:'p',qty:2,cost:10000,date:'2026-10-10'},{id:'stock-q',productId:'q',qty:2,cost:5000,date:'2026-10-10'}],sales:[{id:'mixed',customer:'Ana',date:'2026-10-10',due:'2026-10-15',items:[{productId:'p',name:'Perfume',qty:1,price:15000,cost:10000,costTotal:10000},{productId:'q',name:'Creme',qty:1,price:10000,cost:5000,costTotal:5000}]},{id:'other',customer:'Bia',date:'2026-10-10',due:'2026-10-15',items:[{productId:'q',name:'Creme',qty:1,price:10000,cost:5000,costTotal:5000}]}],payments:[{id:'pay-mixed',saleId:'mixed',cents:10000,date:'2026-10-10'},{id:'pay-other',saleId:'other',cents:10000,date:'2026-10-10'}]});
test('exclusão remove vínculos, recompõe outros itens da venda mista e preserva registros sem vínculo',()=>{
 const b=make();assert.ok(validBusiness(b));assert.equal(productDeletionDetails(b,'p').mixedSales.length,1);const next=deleteProduct(b,'p');assert.ok(validBusiness(next));assert.deepEqual(next.products,[b.products[1]]);assert.deepEqual(next.purchases,[b.purchases[1]]);assert.deepEqual(next.sales,[b.sales[1]]);assert.deepEqual(next.payments,[b.payments[1]]);assert.deepEqual(next.cash,b.cash);assert.equal(inventory(next,'q').qty,1);assert.equal(b.sales.length,2);assert.equal(b.products.length,2);
});
test('cadastro sem movimentos pode ser excluído; produto inexistente é recusado',()=>{
 const b={...emptyBusiness(),products:[{id:'p',name:'Perfume',price:0}]};assert.deepEqual(deleteProduct(b,'p'),emptyBusiness());assert.throws(()=>deleteProduct(b,'unknown'),/não existe/);
});
test('excluir segmento remove seus dados e transferências sem afetar outras atividades',()=>{
 const a={...make(),id:'a',name:'Beleza',cash:[{id:'c',type:'withdrawal',description:'Retirada',cents:1000,date:'2026-10-10',transferPersonal:true}]},b={...emptyBusiness(),id:'b',name:'Roupas'};const state={entries:[],debts:[],reserve:20,businesses:[a,b],activeBusinessId:'a'};const next=deleteWorkspace(state,'a');assert.deepEqual(next.businesses,[b]);assert.equal(next.activeBusinessId,'b');assert.equal(transferEntries(next).length,0);assert.deepEqual(state.businesses,[a,b]);assert.ok(valid(next));assert.equal(deleteWorkspace(next,'b').activeBusinessId,null);assert.ok(valid(deleteWorkspace(next,'b')));assert.equal(deleteWorkspace(state,'b').activeBusinessId,'a');assert.throws(()=>deleteWorkspace(next,'unknown'));
});
test('excluir segmento legado não permite que seus registros reapareçam',()=>{
 const next=deleteWorkspace({entries:[],debts:[],reserve:20,business:make()},'legacy-business');assert.equal(next.business,undefined);assert.deepEqual(businessWorkspaces(next),[]);assert.ok(valid(next));
});
test('excluir dívida apaga pagamentos e despesas derivadas preservando outra dívida',async()=>{
 const {deleteDebt,debtEntries}=await import('./personal.mjs');const debt={id:'d',creditor:'Banco',cents:10000,totalCents:10000,monthlyCents:1000,due:'2026-10-10',paid:false,notes:''};const other={...debt,id:'other'};const state={entries:[],debts:[debt,other],reserve:20,debtPayments:[{id:'pay',debtId:'d',cents:1000,date:'2026-10-10'}]};const next=deleteDebt(state,'d');assert.deepEqual(next.debts,[other]);assert.equal(debtEntries(next).length,0);assert.ok(valid(next));assert.equal(state.debtPayments.length,1);
});
test('excluir conta fixa remove versões, confirmações e exceções somente dela',async()=>{
 const {deleteFixedRule}=await import('./recurring.mjs');const rule={id:'fixed',versions:[{from:'2026-10',type:'income',description:'Salário',cents:10000,category:'Salário',day:10,enabled:true}]};const state={entries:[],debts:[],reserve:20,fixed:[rule,{...rule,id:'other'}],fixedRecords:[{ruleId:'fixed',month:'2026-10',status:'confirmed',entry:{type:'income',description:'Salário',cents:10000,category:'Salário',date:'2026-10-10'}},{ruleId:'other',month:'2026-10',status:'skipped'}]};const next=deleteFixedRule(state,'fixed');assert.equal(next.fixed.length,1);assert.equal(next.fixedRecords[0].ruleId,'other');assert.ok(valid(next));
});
test('excluir lançamento derivado desfaz só seu vínculo preservando o cadastro pai',async()=>{
 const {deletePersonalEntry}=await import('./personal.mjs');const state={entries:[{id:'e'}],debts:[{id:'d'}],debtPayments:[{id:'pay',debtId:'d'}],fixed:[{id:'rule'}],fixedRecords:[{ruleId:'rule',month:'2026-10'}],businesses:[{...emptyBusiness(),id:'a',name:'A',cash:[{id:'withdraw',type:'withdrawal',transferPersonal:true}]}],activeBusinessId:'a'};assert.equal(deletePersonalEntry(state,{id:'debt-payment:pay',debtPayment:true}).debtPayments.length,0);assert.equal(deletePersonalEntry(state,{id:'fixed:rule:2026-10',ruleId:'rule',fixed:true}).fixedRecords.length,0);assert.equal(deletePersonalEntry(state,{id:'business-transfer:a:withdraw',transfer:true}).businesses[0].cash.length,0);assert.equal(deletePersonalEntry(state,{id:'e'}).entries.length,0);assert.equal(state.entries.length,1);
});
test('aporte permanece ao excluir produto e sua própria exclusão zera caixa e investimento',async()=>{
 const {deleteCashMovement,businessSummary}=await import('./business.mjs');const b={...emptyBusiness(),products:[{id:'p',name:'Perfume',price:1000}],cash:[{id:'aporte',type:'investment',description:'Capital próprio',cents:220000,date:'2026-10-10'}]};const withoutProduct=deleteProduct(b,'p');assert.equal(businessSummary(withoutProduct,'2026-10').cash,220000);const next=deleteCashMovement(withoutProduct,'aporte');const summary=businessSummary(next,'2026-10');assert.equal(summary.cash,0);assert.equal(summary.invested,0);assert.equal(b.cash.length,1);assert.throws(()=>deleteCashMovement(next,'aporte'));
});
test('excluir retirada remove entrada pessoal vinculada preservando outras movimentações',async()=>{
 const {deleteCashMovement}=await import('./business.mjs');const {withBusiness}=await import('./business-workspaces.mjs');const state={businesses:[{...emptyBusiness(),id:'a',name:'Beleza',cash:[{id:'capital',type:'investment',description:'Capital',cents:10000,date:'2026-10-10'},{id:'retirada',type:'withdrawal',description:'Retirada',cents:1000,date:'2026-10-10',transferPersonal:true}]}],activeBusinessId:'a'};const next=withBusiness(state,deleteCashMovement(state.businesses[0],'retirada'),'a');assert.equal(transferEntries(next).length,0);assert.equal(next.businesses[0].cash[0].id,'capital');
});
