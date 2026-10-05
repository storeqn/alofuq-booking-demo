import { campaigns, products, capacities, colors } from './data/catalog.js';
import { renderStep, renderAside, stepNames } from './components/wizard.js';
import { validateCustomer, normalizePhone } from './utils/validation.js';
import { submitBooking } from './services/bookingService.js';
const draftKey = 'alofuq-demo-selection-v1';
const emptyState = () => ({campaignId:campaigns[0].id,step:0,productId:null,capacity:null,colorId:null,customer:{name:'',phone:'',email:''},errors:{},busy:false,success:null});
let state = emptyState();
try {
  const draft = JSON.parse(sessionStorage.getItem(draftKey));
  if (draft?.campaignId === state.campaignId) {
    state.productId = products.find(p=>p.id===draft.productId)?.id || null;
    state.capacity = capacities.includes(draft.capacity) ? draft.capacity : null;
    state.colorId = colors.find(c=>c.id===draft.colorId)?.id || null;
  }
} catch { /* Storage may be unavailable in private browsing. */ }
const content = document.querySelector('#step-content');
function persistSelection() {
  try {sessionStorage.setItem(draftKey,JSON.stringify({campaignId:state.campaignId,productId:state.productId,capacity:state.capacity,colorId:state.colorId}));} catch {}
}
function render(focus=false) {
  document.querySelector('#progress').innerHTML = stepNames.map((name,i)=>`<li class="${i===state.step?'active':i<state.step?'complete':''}" ${i===state.step?'aria-current="step"':''}><span>${i<state.step?'✓':i+1}</span><small>${name}</small></li>`).join('');
  document.querySelector('#progress').hidden = Boolean(state.success);
  content.innerHTML = renderStep(state);
  document.querySelector('#aside').innerHTML = renderAside(state);
  if (focus) content.querySelector('h3')?.focus({preventScroll:true});
}
function move(step) {
  state.step = step;state.errors={};render(true);
  document.querySelector('#booking').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
content.addEventListener('input',e=> {
  if (e.target.name in state.customer) {
    state.customer[e.target.name] = e.target.value;
    e.target.setAttribute('aria-invalid','false');
    document.getElementById(e.target.name+'-error').textContent='';
    delete state.errors[e.target.name];
  }
});
content.addEventListener('submit',e=>{e.preventDefault();advance();});
function advance() {
  state.errors = {};
  const messages=['يرجى اختيار الجهاز','يرجى اختيار سعة التخزين','يرجى اختيار اللون'];
  if (state.step<3 && ![state.productId,state.capacity,state.colorId][state.step]) state.errors.selection=messages[state.step];
  if (state.step===3) {
    state.errors=validateCustomer(state.customer);
    if (!Object.keys(state.errors).length) state.customer={name:state.customer.name.trim().replace(/\s+/g,' '),phone:normalizePhone(state.customer.phone),email:state.customer.email.trim()};
  }
  if (Object.keys(state.errors).length) {render();content.querySelector('[aria-invalid="true"]')?.focus();return;}
  move(state.step+1);
}
content.addEventListener('click',async e=> {
  const button=e.target.closest('button');
  if (!button || state.busy) return;
  for (const [key,field] of [['product','productId'],['capacity','capacity'],['color','colorId']]) {
    if (button.dataset[key]) {
      state[field]=button.dataset[key];state.errors={};persistSelection();render();
      content.querySelector(`[data-${key}="${button.dataset[key]}"]`)?.focus({preventScroll:true});return;
    }
  }
  if (button.dataset.edit) {move(Number(button.dataset.edit));return;}
  const action=button.dataset.action;
  if(action==='next') advance();
  if(action==='back') move(state.step-1);
  if(action==='reset'||action==='home') {
    state=emptyState();try{sessionStorage.removeItem(draftKey);}catch{}render(true);
    document.querySelector(action==='home'?'#home':'#booking').scrollIntoView({behavior:'smooth'});
  }
  if(action==='submit') {
    state.busy=true;state.errors={};render();
    try {
      state.success=await submitBooking({campaignId:state.campaignId,productId:state.productId,capacity:state.capacity,colorId:state.colorId,customer:{...state.customer}});
      state.customer={name:'',phone:'',email:''};try{sessionStorage.removeItem(draftKey);}catch{}
    } catch {state.errors.submission='تعذر إرسال الحجز. يرجى المحاولة مرة أخرى.';}
    finally {state.busy=false;render(true);}
  }
});
render();
