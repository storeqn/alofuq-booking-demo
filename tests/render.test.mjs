import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {renderStep,renderAside} from '../src/components/wizard.js';
const state={step:0,productId:'18-pro-max',capacity:'256GB',colorId:'burgundy',customer:{name:'بهاء علي المالكي',phone:'07812345678',email:'demo@example.com'},errors:{},busy:false,success:null};
test('every booking step and success screen render valid selected content',()=>{
 for(let step=0;step<5;step++) {const html=renderStep({...state,step});assert.ok(html.includes('tabindex="-1"'));assert.ok(html.includes(step===4?'data-action="submit"':'data-action="next"'));}
 assert.ok(renderStep({...state,step:4,busy:true}).includes('disabled aria-busy="true"'));
 assert.ok(renderStep({...state,success:{id:'AH-TEST'}}).includes('AH-TEST'));
 assert.ok(renderAside(state).includes('Burgundy'));
});
test('customer input is escaped in fields and review',()=>{
 const customer={...state.customer,name:'<img src=x onerror=alert(1)>'};
 for(const step of [3,4]) {const html=renderStep({...state,customer,step});assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;img'));}
});
test('all statically referenced local resources exist in production',async()=>{
 const html=await readFile('dist/index.html','utf8');
 for(const [,path] of html.matchAll(/(?:src|href)="(\/[^"#]*)"/g)) assert.ok((await stat('dist'+path)).isFile(),path);
 for(const image of ['phone-pro.svg','phone-max.svg','og-preview.png','icon-192.png','icon-512.png'])assert.ok((await stat('dist/assets/'+image)).size>0);
 assert.ok(!html.includes('__SITE_URL__'));
});
