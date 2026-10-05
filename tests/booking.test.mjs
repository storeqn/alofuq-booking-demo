import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCustomer,normalizePhone} from '../src/utils/validation.js';
import {submitBooking,validateBooking} from '../src/services/bookingService.js';
const customer={name:'بهاء علي المالكي',phone:'٠٧٨١٢٣٤٥٦٧٨',email:'demo@example.com'};
const booking={campaignId:'iphone-18-preview',productId:'18-pro-max',capacity:'256GB',colorId:'burgundy',customer};
test('Iraqi digits and international formats normalize consistently',()=>{
 for(const phone of ['٠٧٨١٢٣٤٥٦٧٨','07812345678','+964 781 234 5678','009647812345678']) assert.equal(normalizePhone(phone),'07812345678');
});
test('validation rejects incomplete name, phone and email',()=>{
 assert.deepEqual(validateCustomer(customer),{});
 assert.equal(Object.keys(validateCustomer({name:'بهاء علي',phone:'01234',email:'bad@'})).length,3);
 assert.ok(validateCustomer({...customer,name:'123 456 789'}).name);
});
test('service rejects tampered campaign or selections',()=>{
 assert.doesNotThrow(()=>validateBooking(booking));
 for(const field of ['campaignId','productId','capacity','colorId']) assert.throws(()=>validateBooking({...booking,[field]:'invalid'}));
});
test('mock produces different demo IDs without network traffic',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>{throw new Error('Network is forbidden');};
 try{const results=await Promise.all([submitBooking(booking),submitBooking(booking)]);assert.notEqual(results[0].id,results[1].id);assert.ok(results.every(r=>r.demo));}finally{globalThis.fetch=original;}
});
