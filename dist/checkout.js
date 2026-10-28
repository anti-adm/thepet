const message=document.getElementById('message');
const start=document.getElementById('start-form');
const form=document.getElementById('payment-form');
const pay=document.getElementById('pay');
async function api(path,options){const r=await fetch(path,options);const data=await r.json();if(!r.ok)throw Error(data.error||'Please try again.');return data;}
if(new URLSearchParams(location.search).has('return')){
 start.hidden=true;document.getElementById('checkout-heading').textContent='Payment status';
 message.textContent='Checking your test payment…';
 api('/api/order').then(data=>{
  message.textContent=data.paymentStatus==='paid'?'Test payment succeeded. No real money was charged. '+(data.webhookConfirmed?'The server also received Stripe’s signed confirmation.':'Webhook confirmation is not complete yet. '):'Payment is not complete. You can return to checkout and try again.';
  document.getElementById('retry').hidden=false;
 }).catch(e=>message.textContent=e.message);
}
start.addEventListener('submit',async e=>{
 e.preventDefault();const button=document.getElementById('continue');button.disabled=true;message.textContent='Preparing your secure payment form…';
 try{
  if(typeof Stripe!=='function')throw Error('Stripe could not load. Check your connection and reload this page.');
  const data=await api('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('email').value,sandboxAcknowledged:document.getElementById('ack').checked})});
  const stripe=Stripe(data.publicKey);
  const checkout=stripe.initCheckoutElementsSdk({clientSecret:data.clientSecret,elementsOptions:{appearance:{theme:'stripe',variables:{colorPrimary:'#815361',colorBackground:'#fffdfb',colorText:'#493833',colorDanger:'#a02d49',fontFamily:'Arial, sans-serif',fontSizeBase:'16px',borderRadius:'8px'}}}});
  const result=await checkout.loadActions();if(result.type==='error')throw Error(result.error.message);
  checkout.createPaymentElement().mount('#payment-element');start.hidden=true;form.hidden=false;message.textContent='';pay.disabled=false;
  form.onsubmit=async event=>{event.preventDefault();pay.disabled=true;message.textContent='Processing test payment…';try{const r=await result.actions.confirm();if(r.type==='error')throw Error(r.error.message);}catch(err){message.textContent=err.message;pay.disabled=false;}};
 }catch(err){message.textContent=err.message;button.disabled=false;}
});
