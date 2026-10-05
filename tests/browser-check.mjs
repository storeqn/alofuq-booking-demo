import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
await mkdir('.test-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
for(const width of [320,375,390,430,768,1440]) {
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const issues=[];const external=[];
 page.on('pageerror',e=>issues.push(e.message));
 page.on('console',m=>{if(m.type()==='error')issues.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)issues.push(`${r.status()} ${r.url()}`);});
 page.on('request',r=>{if(!r.url().startsWith('http://localhost:4173'))external.push(r.url());});
 await page.goto('http://localhost:4173');
 async function layout(label){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: overflow ${label}`);
  assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.some(i=>i.complete && i.naturalWidth===0)),false,'Broken image');
 }
 await layout('hero');await page.screenshot({path:`.test-artifacts/home-${width}.png`,fullPage:true});
 await page.locator('[data-action=next]').click();await page.getByText('يرجى اختيار الجهاز',{exact:true}).waitFor();
 await page.locator('[data-product="18-pro-max"]').click();await page.locator('[data-action=next]').click();
 await page.locator('[data-action=next]').click();await page.getByText('يرجى اختيار سعة التخزين',{exact:true}).waitFor();
 await page.locator('[data-capacity="256GB"]').click();await page.locator('[data-action=next]').click();
 await page.locator('[data-action=next]').click();await page.getByText('يرجى اختيار اللون',{exact:true}).waitFor();
 await page.locator('[data-color=burgundy]').click();await layout('color');
 await page.locator('[data-action=back]').click();assert.equal(await page.locator('[data-capacity="256GB"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-action=back]').click();assert.equal(await page.locator('[data-product="18-pro-max"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-action=next]').click();await page.locator('[data-action=next]').click();
 assert.equal(await page.locator('[data-color=burgundy]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-action=next]').click();await page.locator('[data-action=next]').click();
 assert.equal(await page.locator('[aria-invalid=true]').count(),3);
 await page.locator('#name').fill('بهاء علي المالكي');await page.locator('#phone').fill('٠٧٨١٢٣٤٥٦٧٨');await page.locator('#email').fill('demo@example.com');
 await page.locator('[data-action=back]').click();await page.locator('[data-action=next]').click();assert.equal(await page.locator('#email').inputValue(),'demo@example.com');
 await page.locator('[data-action=next]').click();await layout('review');
 await page.screenshot({path:`.test-artifacts/review-${width}.png`,fullPage:true});
 const storage=await page.evaluate(()=>JSON.stringify({...sessionStorage,...localStorage}));assert.ok(!storage.includes('example.com'));assert.ok(!storage.includes('بهاء'));
 await page.locator('[data-action=submit]').click();assert.equal(await page.locator('[data-action=submit]').isDisabled(),true);
 await page.getByText('تم استلام طلب الحجز بنجاح',{exact:true}).waitFor();assert.match(await page.locator('.reservation-id strong').textContent(),/^AH-/);
 await layout('success');await page.screenshot({path:`.test-artifacts/success-${width}.png`,fullPage:true});
 await page.locator('[data-action=reset]').click();await page.locator('[data-product="18-pro"]').click();await page.locator('[data-action=next]').click();await page.locator('[data-capacity="512GB"]').click();
 await page.reload();assert.equal(await page.locator('[data-product="18-pro"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-action=next]').click();assert.equal(await page.locator('[data-capacity="512GB"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(issues,[]);assert.deepEqual(external,[]);
 results.push({width,result:'passed',consoleErrors:issues.length,externalRequests:external.length});await page.close();
}
await browser.close();await writeFile('.test-artifacts/report.json',JSON.stringify(results,null,2));console.log(results);
