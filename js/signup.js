import { isEmoryEmail, passwordsMatch, sixDigit } from './validators.js';

// Step containers
const stepCreate = document.getElementById('stepCreate');
const stepVerify = document.getElementById('stepVerify');

// Create form fields
const form = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const pwdInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const roleSelect = document.getElementById('role');
const agree = document.getElementById('agree');
const msg = document.getElementById('formMessage');
const btn = document.getElementById('signupBtn');
const togglePwd = document.getElementById('togglePwd');

// Verify form fields
const verifyForm = document.getElementById('verifyForm');
const codeInput = document.getElementById('code');
const verifyMsg = document.getElementById('verifyMessage');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const changeEmail = document.getElementById('changeEmail');
const verifyEmailLabel = document.getElementById('verifyEmailLabel');
const demoHint = document.getElementById('demoHint');

const STORAGE_PREFIX = 'eis_demo';
function keyFor(email, suffix) {
  return `${STORAGE_PREFIX}:${email}:${suffix}`;
}

function setMessage(el, type, text) {
  el.className = `form-message ${type}`;
  el.textContent = text;
}

togglePwd.addEventListener('click', () => {
  const showing = pwdInput.type === 'text';
  pwdInput.type = showing ? 'password' : 'text';
  togglePwd.textContent = showing ? 'Show' : 'Hide';
  togglePwd.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  pwdInput.focus();
});

// Create account -> move to verify step
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage(msg, '', '');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = pwdInput.value;
  const confirm = confirmInput.value;
  const role = roleSelect.value;

  if (!name) {
    setMessage(msg, 'error', 'Please enter your name.');
    nameInput.focus();
    return;
  }
  if (!isEmoryEmail(email)) {
    setMessage(msg, 'error', 'Please use a valid Emory email ending in @emory.edu.');
    emailInput.focus();
    return;
  }
  if (!passwordsMatch(password, confirm)) {
    setMessage(msg, 'error', 'Passwords must match and be at least 8 characters.');
    confirmInput.focus();
    return;
  }
  if (!role) {
    setMessage(msg, 'error', 'Please select your role.');
    roleSelect.focus();
    return;
  }
  if (!agree.checked) {
    setMessage(msg, 'error', 'You must agree to the community rules to continue.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    // Simulate account creation
    await new Promise((r) => setTimeout(r, 600));

    // Generate a mock 6-digit code and "send" it (store locally for demo)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(keyFor(email, 'code'), code);
    localStorage.setItem(keyFor(email, 'profile'), JSON.stringify({ name, role }));

    // For demo class: show the code hint so graders can test quickly.
    demoHint.textContent = `For demo: your code is ${code}`;

    // Show verify step
    verifyEmailLabel.textContent = email;
    stepCreate.style.display = 'none';
    stepVerify.style.display = 'block';
    setMessage(verifyMsg, 'success', 'Verification code sent. Check your inbox.');
    codeInput.focus();
  } catch (err) {
    console.error(err);
    setMessage(msg, 'error', 'Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create account';
  }
});

// Verify code
verifyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  setMessage(verifyMsg, '', '');

  const email = verifyEmailLabel.textContent.trim().toLowerCase();
  const inputCode = codeInput.value.trim();

  if (!sixDigit(inputCode)) {
    setMessage(verifyMsg, 'error', 'Enter the 6-digit code.');
    codeInput.focus();
    return;
  }

  const saved = localStorage.getItem(keyFor(email, 'code'));
  if (!saved || inputCode !== saved) {
    setMessage(verifyMsg, 'error', 'Invalid code. Please try again or resend.');
    codeInput.focus();
    return;
  }

  // Mark email as verified for the demo
  localStorage.setItem(keyFor(email, 'verified'), 'true');

  setMessage(verifyMsg, 'success', 'Email verified! Redirecting to log in…');

  // Optionally prefill login with this email (mimic Remember)
  localStorage.setItem('emoryRemember', email);

  // Redirect to login
  setTimeout(() => {
    window.location.href = './login.html';
  }, 700);
});

// Resend code
resendBtn.addEventListener('click', () => {
  setMessage(verifyMsg, '', '');
  const email = verifyEmailLabel.textContent.trim().toLowerCase();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  localStorage.setItem(keyFor(email, 'code'), code);
  demoHint.textContent = `For demo: your code is ${code}`;
  setMessage(verifyMsg, 'success', 'A new code has been sent.');
});

// Change email (go back to form)
changeEmail.addEventListener('click', (e) => {
  e.preventDefault();
  stepVerify.style.display = 'none';
  stepCreate.style.display = 'block';
  setMessage(msg, '', '');
  setMessage(verifyMsg, '', '');
  emailInput.focus();
});
