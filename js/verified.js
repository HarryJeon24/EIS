const email = new URLSearchParams(location.search).get('email') || '';
if (email) localStorage.setItem(`eis_demo:${email}:verified`, 'true');

// Redirect to main after 2s
setTimeout(() => {
  window.location.href = './main.html';
}, 2000);
