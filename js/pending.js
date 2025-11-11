const email = new URLSearchParams(location.search).get('email') || '';
const emailLabel = document.getElementById('emailLabel');
const pendMsg = document.getElementById('pendMessage');
const resendBtn = document.getElementById('resendBtn');

if (emailLabel) emailLabel.textContent = email || '(your email)';

function setMessage(type, text) {
  pendMsg.className = `form-message ${type}`;
  pendMsg.textContent = text;
}

// Auto-advance after 3s to verified
setTimeout(() => {
  window.location.href = `./verified.html?email=${encodeURIComponent(email)}`;
}, 3000);

// Resend simulation
resendBtn.addEventListener('click', () => {
  setMessage('success', 'Verification email re-sent. (Demo)');
});
