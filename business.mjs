export const emptyBusiness=()=>({products:[],purchases:[],sales:[],payments:[],cash:[]});
export const saleTotal=s=>s.items.reduce((n,i)=>n+i.qty*i.price,0);
export const itemCost=i=>i.costTotal??i.qty*i.cost;
export const paidTotal=(b,id)=>b.payments.filter(p=>p.saleId===id).reduce((n,p)=>n+p.cents,0);
export function inventory(b,id){const purchases=b.purchases.filter(p=>p.productId===id),items=b.sales.flatMap(s=>s.items).filter(i=>i.productId===id);if(b.products.find(p=>p.id===id)?.kind==='service')return {qty:0,value:0,cost:b.products.find(p=>p.id===id).costCents||0,sold:items.reduce((n,i)=>n+i.qty,0)};const qty=purchases.reduce((n,p)=>n+p.qty,0)-items.reduce((n,i)=>n+i.qty,0);const value=purchases.reduce((n,p)=>n+p.qty*p.cost,0)-items.reduce((n,i)=>n+itemCost(i),0);return {qty,value,cost:qty?Math.round(value/qty):0,sold:items.reduce((n,i)=>n+i.qty,0)};}
export function businessSummary(b,month){const sum=(rows,fn)=>rows.reduce((n,r)=>n+fn(r),0),inMonth=r=>r.date.startsWith(month);const received=sum(b.payments,p=>p.cents),invested=sum(b.cash.filter(c=>c.type==='investment'),c=>c.cents),purchases=sum(b.purchases,p=>p.qty*p.cost),expenses=sum(b.cash.filter(c=>c.type==='expense'),c=>c.cents),withdrawals=sum(b.cash.filter(c=>c.type==='withdrawal'),c=>c.cents);const sales=b.sales.filter(inMonth),revenue=sum(sales,saleTotal),cost=sum(sales,s=>sum(s.items,itemCost)),serviceCost=sum(b.sales,s=>sum(s.items.filter(i=>b.products.find(p=>p.id===i.productId)?.kind==='service'),itemCost)),monthlyServiceCost=sum(sales,s=>sum(s.items.filter(i=>b.products.find(p=>p.id===i.productId)?.kind==='service'),itemCost)),monthlyExpenses=sum(b.cash.filter(c=>c.type==='expense'&&inMonth(c)),c=>c.cents);const monthlyReceived=sum(b.payments.filter(inMonth),p=>p.cents),monthlyOut=sum(b.purchases.filter(inMonth),p=>p.qty*p.cost)+sum(b.cash.filter(c=>c.type!=='investment'&&inMonth(c)),c=>c.cents)+monthlyServiceCost;return {cash:invested+received-purchases-expenses-withdrawals-serviceCost,invested,receivable:sum(b.sales,saleTotal)-received,profit:revenue-cost-monthlyExpenses,revenue,cost,monthlyExpenses,monthlyReceived,monthlyOut,stockValue:sum(b.products,p=>inventory(b,p.id).value)};}
const text=(v,max=100)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const money=v=>Number.isSafeInteger(v)&&v>=0&&v<=100000000000;
const qty=v=>Number.isSafeInteger(v)&&v>0&&v<=100000;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const rows=v=>Array.isArray(v)&&v.length<=5000&&v.every(r=>r&&text(r.id))&&new Set(v.map(r=>r.id)).size===v.length;
function checkBusiness(b){if(!b||!['products','purchases','sales','payments','cash'].every(k=>rows(b[k])))return false;
 if(b.profile&&(!text(b.profile.segment)||!text(b.profile.niche)))return false;
 const ids=new Set(b.products.map(p=>p.id));
 if(!b.products.every(p=>text(p.name)&&money(p.price)&&(p.kind===undefined||['product','service'].includes(p.kind))&&(p.costCents===undefined||money(p.costCents))&&(p.segment===undefined||text(p.segment))&&(p.niche===undefined||text(p.niche))&&(p.category===undefined||text(p.category))&&(p.brand===undefined||text(p.brand))))return false;
 if(!b.purchases.every(p=>ids.has(p.productId)&&b.products.find(x=>x.id===p.productId)?.kind!=='service'&&qty(p.qty)&&money(p.cost)&&p.qty*p.cost<=100000000000&&date(p.date)))return false;
 if(!b.sales.every(s=>text(s.customer)&&date(s.date)&&date(s.due)&&s.due>=s.date&&Array.isArray(s.items)&&s.items.length>0&&s.items.length<=100&&new Set(s.items.map(i=>i.productId)).size===s.items.length&&saleTotal(s)<=100000000000&&s.items.every(i=>i&&ids.has(i.productId)&&text(i.name)&&qty(i.qty)&&money(i.price)&&money(i.cost)&&money(i.costTotal)&&i.costTotal<=100000000000&&i.qty*i.price<=100000000000&&i.qty*i.cost<=100000000000)))return false;
 if(!b.payments.every(p=>b.sales.some(s=>s.id===p.saleId&&p.date>=s.date)&&date(p.date)&&money(p.cents)&&p.cents>0))return false;
 if(!b.cash.every(c=>['investment','expense','withdrawal'].includes(c.type)&&text(c.description)&&money(c.cents)&&c.cents>0&&date(c.date)&&(c.category===undefined||text(c.category))&&(c.transferPersonal===undefined||typeof c.transferPersonal==='boolean')))return false;
 if(!b.sales.every(s=>paidTotal(b,s.id)<=saleTotal(s)))return false;
 if(!b.products.every(p=>{const i=inventory(b,p.id);return i.qty>=0&&i.value>=0;}))return false;
 return true;
}

export function validBusiness(b){try{return checkBusiness(b);}catch{return false;}}

export function productDeletionDetails(b,productId){if(!b.products.some(p=>p.id===productId))throw Error('Este produto não existe mais. Atualize a página.');const sales=b.sales.filter(s=>s.items.some(i=>i.productId===productId));const ids=new Set(sales.map(s=>s.id));return {sales,purchases:b.purchases.filter(p=>p.productId===productId),payments:b.payments.filter(p=>ids.has(p.saleId)),mixedSales:sales.filter(s=>s.items.some(i=>i.productId!==productId))};}
export function deleteProduct(b,productId){const details=productDeletionDetails(b,productId);const ids=new Set(details.sales.map(s=>s.id));const next={...b,products:b.products.filter(p=>p.id!==productId),purchases:b.purchases.filter(p=>p.productId!==productId),sales:b.sales.filter(s=>!ids.has(s.id)),payments:b.payments.filter(p=>!ids.has(p.saleId))};if(!validBusiness(next))throw Error('Não foi possível excluir sem inconsistência. Confira os registros.');return next;}

export function deleteCashMovement(b,id){if(!b.cash.some(c=>c.id===id))throw Error('Esta movimentação não existe mais. Atualize a página.');return {...b,cash:b.cash.filter(c=>c.id!==id)};}
