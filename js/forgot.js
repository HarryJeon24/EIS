import { isEmoryEmail } from './validators.js';

const form = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const sendBtn = document.getElementById('sendBtn');
const msg = document.getElementById('formMessage');

function setMessage(type, text) {
  msg.className = `form-message ${type}`;
  msg.textContent = text;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('', '');

  const email = emailInput.value.trim().toLowerCase();

  // Allow demo user "admin" as well as real Emory emails
  if (!(email === 'admin' || isEmoryEmail(email))) {
    setMessage('error', 'Please enter a valid Emory email (or use "admin" for demo).');
    emailInput.focus();
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';

  try {
    // Simulate sending a reset link
    await new Promise((r) => setTimeout(r, 700));

    // Stash a mock reset token for demo
    const token = Math.random().toString(36).slice(2, 8);
    localStorage.setItem(`eis_demo:${email}:reset_token`, token);

    setMessage('success', `Reset link sent to ${email === 'admin' ? 'admin (demo)' : email}. Redirecting to Log in…`);

    // Redirect back to Log in in ~3 seconds
    setTimeout(() => {
      window.location.href = './login.html';
    }, 3000);
  } catch (err) {
    console.error(err);
    setMessage('error', 'Something went wrong. Please try again.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send reset link';
  }
});
