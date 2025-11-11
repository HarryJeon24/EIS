import { isEmoryEmail, passwordsMatch, validUsername } from './validators.js';

const form = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const pwdInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const roleSelect = document.getElementById('role');
const agree = document.getElementById('agree');
const msg = document.getElementById('formMessage');
const btn = document.getElementById('signupBtn');
const togglePwd = document.getElementById('togglePwd');

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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('', '');

  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = pwdInput.value;
  const confirm = confirmInput.value;
  const role = roleSelect.value;

  if (!name) { setMessage('error', 'Please enter your name.'); nameInput.focus(); return; }
  if (!validUsername(username)) { setMessage('error', 'Please choose a valid username (3–20 letters, numbers, underscore).'); usernameInput.focus(); return; }
  if (!isEmoryEmail(email)) { setMessage('error', 'Please use a valid Emory email ending in @emory.edu.'); emailInput.focus(); return; }
  if (!passwordsMatch(password, confirm)) { setMessage('error', 'Passwords must match and be at least 8 characters.'); confirmInput.focus(); return; }
  if (!role) { setMessage('error', 'Please select your role.'); roleSelect.focus(); return; }
  if (!agree.checked) { setMessage('error', 'You must agree to the community rules to continue.'); return; }

  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    // For demo: stash minimal profile
    localStorage.setItem(`eis_demo:${email}:profile`, JSON.stringify({ name, username, role }));
    localStorage.setItem(`eis_demo:${email}:verified`, 'pending');

    // Simulate “send email” and go to pending page with email query param
    await new Promise((r) => setTimeout(r, 600));
    window.location.href = `./pending.html?email=${encodeURIComponent(email)}`;
  } catch (err) {
    console.error(err);
    setMessage('error', 'Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create account';
  }
});
