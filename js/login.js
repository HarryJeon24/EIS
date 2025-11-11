import { isEmoryEmail } from './validators.js';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const pwdInput = document.getElementById('password');
const msg = document.getElementById('formMessage');
const togglePwd = document.getElementById('togglePwd');
const loginBtn = document.getElementById('loginBtn');

function setMessage(type, text) {
  msg.className = `form-message ${type}`;
  msg.textContent = text;
}

togglePwd.addEventListener('click', () => {
  const showing = pwdInput.type === 'text';
  pwdInput.type = showing ? 'password' : 'text';
  togglePwd.textContent = showing ? 'Show' : 'Hide';
  pwdInput.focus();
});

// Prefill if remembered
(function prefill() {
  const saved = localStorage.getItem('emoryRemember');
  if (saved) {
    emailInput.value = saved;
    const remember = document.getElementById('remember');
    if (remember) remember.checked = true;
  }
})();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('', '');

  const email = emailInput.value.trim().toLowerCase();
  const password = pwdInput.value;

  // DEMO BYPASS: admin/admin
  if (email === 'admin' && password === 'admin') {
    setMessage('success', 'Welcome admin! Redirecting…');
    setTimeout(() => (window.location.href = './main.html'), 400);
    return;
  }

  // Normal validation path
  if (!isEmoryEmail(email)) {
    setMessage('error', 'Please use a valid Emory email ending in @emory.edu (or use admin/admin for demo).');
    emailInput.focus();
    return;
  }
  if (!password || password.length < 8) {
    setMessage('error', 'Password must be at least 8 characters.');
    pwdInput.focus();
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in…';

  try {
    await new Promise((r) => setTimeout(r, 700));
    setMessage('success', 'Success! Redirecting…');

    const remember = document.getElementById('remember')?.checked;
    if (remember) localStorage.setItem('emoryRemember', email);
    else localStorage.removeItem('emoryRemember');

    window.location.href = './main.html';
  } catch (err) {
    console.error(err);
    setMessage('error', 'Something went wrong. Please try again.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log in';
  }
});
