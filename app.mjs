import {initChoices} from './choices.mjs';
import {initPersonal} from './personal-ui.mjs';
import {reservePercent} from './personal.mjs';
import {valid} from './validation.mjs';
import {initRecurring} from './recurring-ui.mjs';
import {personalEntries,validRecurring} from './recurring.mjs';
import {initBusiness} from './business-ui.mjs';
import {summary} from './finance.mjs';
const $=id=>document.getElementById(id);
let version=0;
let businessUI;
let recurringUI;
let personalUI;
const currency=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const now=new Date(), today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
let state={entries:[],debts:[],reserve:20};
const choiceUI=initChoices({getState:()=>state});
const entryForm=$('entry-form'),entryCategory=choiceUI.create(entryForm.elements.namedItem('category'),'entryCategories',['Alimentação','Moradia','Transporte','Saúde','Lazer','Salário']);
$('month').value=today.slice(0,7);$('date').value=today;$('reserve').value=reservePercent(state);
async function api(path,method='GET',body){const response=await fetch('/api/'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await response.json();if(!response.ok)throw Error(data.error||'Falha de conexão');return data;}
let saving=false;
async function persist(next){if(saving){$('storage-message').textContent='Aguarde o salvamento atual antes de alterar outro registro.';return false;}saving=true;try{const result=await api('state','PUT',{state:next,version});version=result.version;state=next;choiceUI.refresh();render();$('storage-message').textContent='Salvo na sua conta.';return true;}catch(error){$('storage-message').textContent=error.message;return false;}finally{saving=false;}}
function showAccount(data){version=data.version;state={...data.state,debts:data.state.debts||[]};$('reserve').value=reservePercent(state);$('account').textContent='Conta: '+data.email;document.querySelector('main').hidden=false;$('auth').hidden=true;choiceUI.refresh();businessUI?.loadProfile();render();}
async function authenticate(mode){$('auth-error').textContent='';try{const result=await api(mode,'POST',{email:$('email').value,password:$('password').value});if(result.confirmationRequired){$('auth-error').textContent='Confira seu e-mail para confirmar a conta. Depois volte aqui e entre.';return;}showAccount(result);$('password').value='';}catch(error){$('auth-error').textContent=error.message;}}
$('auth-form').onsubmit=event=>{event.preventDefault();authenticate('login');};$('register').onclick=()=>{if($('auth-form').reportValidity())authenticate('register');};$('logout').onclick=async()=>{try{await api('logout','POST',{});state={entries:[],debts:[],reserve:20};document.querySelector('main').hidden=true;$('auth').hidden=false;$('entries').replaceChildren();}catch(error){$('storage-message').textContent=error.message;}};

function render(){const month=$('month').value;if(!month)return;$('reserve').value=reservePercent(state);const s=summary(personalEntries(state,month),month,reservePercent(state));for(const field of ['income','spent','remaining','balance'])$(field).textContent=currency(s[field]);$('remaining').classList.toggle('danger',s.remaining<0);$('remaining-note').textContent=s.remaining<0?'Você ultrapassou o orçamento':'Dentro do seu orçamento mensal';$('limit').textContent=`Limite mensal: ${currency(s.limit)}`;$('reserve-note').textContent=`Meta de reserva: ${currency(s.reserve)} (${reservePercent(state)}%)`;
 const ratio=s.limit?s.spent/s.limit:s.spent?1:0;$('progress').value=Math.min(100,ratio*100);const alert=$('alert');alert.className='';
 if(!s.income){alert.textContent=s.spent?'Atenção: você registrou despesas sem receitas neste mês.':'Registre suas receitas para calcular quanto pode gastar.';if(s.spent)alert.className='danger';}
 else if(s.remaining<0){alert.textContent=`Você gastou ${currency(-s.remaining)} acima do limite. Evite novas despesas e reveja os gastos.`;alert.className='danger';}
 else if(ratio>=0.8){alert.textContent=`Atenção: você já usou ${Math.round(ratio*100)}% do orçamento. Restam ${currency(s.remaining)}.`;alert.className='warning';}
 else alert.textContent='Seus gastos estão dentro do limite. Continue acompanhando seus lançamentos.';
 const entries=personalEntries(state,month).sort((a,b)=>b.date.localeCompare(a.date));$('count').textContent=`${entries.length} registros`;$('entries').replaceChildren();if(!entries.length){const p=document.createElement('p');p.className='empty';p.textContent='Seu mês começa aqui. Adicione seu primeiro lançamento.';$('entries').append(p);}
 const fragment=document.createDocumentFragment();for(const e of entries){const row=document.createElement('div');row.className='entry';const left=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('p');title.textContent=e.description;meta.textContent=`${e.date.split('-').reverse().join('/')} · ${e.category}${e.fixed?' · fixo confirmado':''}`;left.append(title,meta);const right=document.createElement('div');right.className='entry-right';const value=document.createElement('span');value.className='value'+(e.type==='income'?' positive':'');value.textContent=(e.type==='income'?'+ ':'− ')+currency(e.cents);const button=document.createElement('button');button.className='delete';button.textContent='×';button.setAttribute('aria-label',`Excluir ${e.description}`);button.onclick=async()=>{if(confirm(`Excluir o lançamento “${e.description}”?`))persist({...state,entries:state.entries.filter(x=>x.id!==e.id)});};right.append(value);if(!e.fixed&&!e.debtPayment&&!e.transfer)right.append(button);row.append(left,right);fragment.append(row);}$('entries').append(fragment);personalUI?.render();businessUI?.render();recurringUI?.render();
}
$('month').onchange=render;$('reserve').onchange=async()=>{const percent=Number($('reserve').value);if(!Number.isFinite(percent)||percent<0||percent>100)return;const next={...state,reserve:percent};if(state.personalSettings)next.personalSettings={...state.personalSettings,reservePercent:percent};if(await persist(next))};
$('entry-form').onsubmit=async event=>{event.preventDefault();const form=event.target,data=new FormData(form),amount=String(data.get('amount')).trim();$('form-error').textContent='';if(!/^\d+(?:[,.]\d{1,2})?$/.test(amount)){$('form-error').textContent='Informe um valor como 1250,50, sem separador de milhar.';return;}const cents=Math.round(Number(amount.replace(',','.'))*100),description=String(data.get('description')).trim();if(!description||!Number.isSafeInteger(cents)||cents<=0||cents>100000000000){$('form-error').textContent='Informe uma descrição e um valor positivo válido.';return;}let chosenCategory;try{chosenCategory=entryCategory.value();}catch(e){$('form-error').textContent=e.message;return;}const entry={id:crypto.randomUUID(),description,cents,type:data.get('type'),date:data.get('date'),category:chosenCategory};if(await persist(entryCategory.augment({...state,entries:[...state.entries,entry]}))){form.elements.description.value='';form.elements.amount.value='';$('month').value=entry.date.slice(0,7);render();}};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`meu-equilibrio-${today}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>10000000)throw Error();const data=JSON.parse(await file.text());if(!valid(data))throw Error();if(confirm('Importar este backup substituirá os dados da sua conta. Deseja continuar?')){if(await persist(data)){$('reserve').value=reservePercent(state);$('storage-message').textContent='Backup importado.';businessUI.loadProfile();}}}catch{$('storage-message').textContent='Backup inválido. Os dados atuais foram preservados.';}event.target.value='';};

recurringUI=initRecurring({getState:()=>state,save:persist,getMonth:()=>$('month').value,currency,choices:choiceUI});
businessUI=initBusiness({getState:()=>state,save:persist,getMonth:()=>$('month').value,today,currency,choices:choiceUI});
function selectArea(business){$('business-area').hidden=!business;$('personal-area').hidden=business;$('business-tab').setAttribute('aria-pressed',String(business));$('personal-tab').setAttribute('aria-pressed',String(!business));}
$('business-tab').onclick=()=>selectArea(true);$('personal-tab').onclick=()=>selectArea(false);
personalUI=initPersonal({getState:()=>state,save:persist,getMonth:()=>$('month').value,today,currency,choices:choiceUI});
render();
try{showAccount(await api('me'));}catch{}
