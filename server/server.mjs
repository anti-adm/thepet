import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import Stripe from 'stripe';
const {STRIPE_SECRET_KEY,STRIPE_PUBLIC_KEY,STRIPE_PRICE_ID,STRIPE_WEBHOOK_SECRET,DATA_DIR='/var/lib/pet-guide',PORT='8791'}=process.env;
if(!STRIPE_SECRET_KEY?.startsWith('sk_test_')||!STRIPE_PUBLIC_KEY?.startsWith('pk_test_')) throw Error('Sandbox keys required');
const stripe=new Stripe(STRIPE_SECRET_KEY,{apiVersion:'2026-09-30.endive',maxNetworkRetries:2});
const origin='https://westieada.com';
const db=new DatabaseSync(`${DATA_DIR}/orders.sqlite`);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, session TEXT, status TEXT, created TEXT); CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,type TEXT,created TEXT);');
const price=await stripe.prices.retrieve(STRIPE_PRICE_ID);
if(price.livemode||!price.active||price.currency!=='usd'||price.unit_amount!==1000||price.type!=='one_time') throw Error('Expected active sandbox one-time USD 10 price');
const send=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));};
const read=async req=>{let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>65536)throw Error('Body too large');}return data;};
const limits=new Map();
function limited(req){const ip=req.headers['x-forwarded-for']||req.socket.remoteAddress;const now=Date.now();for(const [k,v]of limits)if(now>v.until)limits.delete(k);const v=limits.get(ip)||{count:0,until:now+60000};v.count++;limits.set(ip,v);return v.count>15;}
const token=req=>(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('pet_order='))?.slice(10);
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(url.pathname==='/api/health'&&req.method==='GET')return send(res,200,{mode:'sandbox',webhookConfigured:!!STRIPE_WEBHOOK_SECRET});
 if(url.pathname==='/api/stripe/webhook'&&req.method==='POST'){
  if(!STRIPE_WEBHOOK_SECRET)return send(res,503,{error:'Webhook signing secret not configured'});
  let event;try{event=stripe.webhooks.constructEvent(await read(req),req.headers['stripe-signature'],STRIPE_WEBHOOK_SECRET);}catch{return send(res,400,{error:'Invalid signature'});}
  if(event.livemode)return send(res,400,{error:'Sandbox only'});
  if(db.prepare('SELECT id FROM events WHERE id=?').get(event.id))return send(res,200,{received:true});
  const relevant=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'];
  let session,order;
  if(relevant.includes(event.type)){
   session=await stripe.checkout.sessions.retrieve(event.data.object.id);
   order=db.prepare('SELECT * FROM orders WHERE session=?').get(session.id);
   if(order&&(session.livemode||session.amount_total!==1000||session.currency!=='usd'||session.metadata.order_id!==order.id))return send(res,400,{error:'Order mismatch'});
  }
  db.exec('BEGIN');try{
   if(order){const status=session.payment_status==='paid'?'paid':session.status==='expired'?'expired':'pending';db.prepare('UPDATE orders SET status=? WHERE id=?').run(status,order.id);}
   db.prepare('INSERT INTO events VALUES(?,?,?)').run(event.id,event.type,new Date().toISOString());db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
  return send(res,200,{received:true});
 }
 if(url.pathname==='/api/checkout'&&req.method==='POST'){
  if(req.headers.origin!==origin)return send(res,403,{error:'Invalid origin'});
  if(limited(req))return send(res,429,{error:'Please wait a minute before trying again.'});
  const body=JSON.parse(await read(req));
  if(body.sandboxAcknowledged!==true||typeof body.email!=='string'||body.email.length>254||!/^\S+@\S+\.\S+$/.test(body.email))return send(res,400,{error:'Enter a valid email and confirm sandbox mode.'});
  let order=db.prepare('SELECT * FROM orders WHERE id=?').get(token(req)||'');
  if(order?.session){const existing=await stripe.checkout.sessions.retrieve(order.session);if(existing.status==='open')return send(res,200,{clientSecret:existing.client_secret,publicKey:STRIPE_PUBLIC_KEY});}
  const id=randomUUID();db.prepare('INSERT INTO orders VALUES(?,?,?,?)').run(id,null,'created',new Date().toISOString());
  const session=await stripe.checkout.sessions.create({ui_mode:'elements',mode:'payment',line_items:[{price:STRIPE_PRICE_ID,quantity:1}],customer_email:body.email,return_url:`${origin}/checkout.html?return=1`,metadata:{order_id:id},payment_intent_data:{metadata:{order_id:id}},adaptive_pricing:{enabled:false}},{idempotencyKey:id});
  db.prepare('UPDATE orders SET session=?,status=? WHERE id=?').run(session.id,'pending',id);
  return send(res,200,{clientSecret:session.client_secret,publicKey:STRIPE_PUBLIC_KEY},{'Set-Cookie':`pet_order=${id}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=86400`});
 }
 if(url.pathname==='/api/order'&&req.method==='GET'){
  const order=db.prepare('SELECT * FROM orders WHERE id=?').get(token(req)||'');
  if(!order?.session)return send(res,404,{error:'No checkout found in this browser.'});
  const s=await stripe.checkout.sessions.retrieve(order.session);
  if(s.livemode||s.amount_total!==1000||s.currency!=='usd'||s.metadata.order_id!==order.id)throw Error('Order mismatch');
  return send(res,200,{paymentStatus:s.payment_status,webhookConfirmed:order.status==='paid',mode:'sandbox'});
 }
 send(res,404,{error:'Not found'});
}catch(e){console.error('Request failed:',e.type||e.name);send(res,500,{error:'Checkout is temporarily unavailable. Please try again.'});}}).listen(Number(PORT),'127.0.0.1',()=>console.log('Sandbox checkout listening'));
