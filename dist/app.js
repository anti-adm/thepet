const dialog = document.querySelector('dialog');
function showNotice(title, message) {
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-body').textContent = message;
  dialog.showModal();
}
// Sandbox checkout; live mode is deliberately disabled on the server.
function handlePurchaseIntent() {
  window.location.assign('/checkout.html');
}
document.querySelectorAll('[data-purchase]').forEach(button => button.addEventListener('click', handlePurchaseIntent));
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
  const title = button.dataset.info;
  showNotice(title, title === 'Contact' ? 'Contact details are being prepared and will be available before the store opens.' : `${title} content is pending. It will be available to review before checkout opens.`);
}));
document.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) { const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) dialog.close(); } });
document.querySelectorAll('.faq-item button').forEach(button => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  const answer = document.getElementById(button.getAttribute('aria-controls'));
  answer.classList.toggle('open', !expanded);
  answer.inert = expanded;
}));
