import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
const dir=mkdtempSync(join(tmpdir(),'pet-test-'));
const secret='whsec_'+randomUUID();
const child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,PORT:'8792',DATA_DIR:dir,STRIPE_WEBHOOK_SECRET:secret},stdio:'ignore'});
const base='http://127.0.0.1:8792';
try{
 let ready=false;for(let i=0;i<40;i++){try{ready=(await fetch(base+'/api/health')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,250));}assert(ready,'Test service ready');
 const payload=JSON.stringify({id:'evt_test_signature',type:'test.ignored',livemode:false,data:{object:{}}});
 const header=Stripe.webhooks.generateTestHeaderString({payload,secret});
 const post=(body,signature)=>fetch(base+'/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':signature},body});
 assert.equal((await post(payload,header)).status,200);
 assert.equal((await post(payload,header)).status,200);
 assert.equal((await post(payload+' ',header)).status,400);
 assert.equal((await post(payload,'invalid')).status,400);
 assert.equal((await fetch(base+'/api/checkout',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'})).status,403);
 assert.equal((await fetch(base+'/api/checkout',{method:'POST',headers:{Origin:'https://westieada.com'},body:'{}'})).status,400);
 assert.equal((await fetch(base+'/api/order')).status,404);
 console.log('PASS: valid signature, duplicate event, tampering, invalid signature, origin, input validation, order isolation');
}finally{child.kill();await new Promise(r=>child.once('exit',r));rmSync(dir,{recursive:true,force:true});}
