// js/post.js

// --- tiny data set just for detail pages (id 5 is the Halal post) ---
const POSTS = {
  5: {
    id: 5,
    title: 'Good halal options around Emory?',
    category: 'Food',
    author: 'gede',
    verified: false,
    timeAgo: '1d ago',
    badges: [],
    body: `
I'm new here (from Ethiopia). Any **halal** places around campus or in Decatur?

Prefer walking distance or short shuttle/UBER. Bonus if it's affordable and open late.

Things I've tried so far:
• Falafel Nation (good but not sure about halal certification).
• Ponko (tasty but I think not halal?).

Any recommendations + tips appreciated! Also if there's a grocery for halal meats near Emory that would be amazing.
    `.trim()
  },
  // (optional) you can add more post bodies later using their IDs from the feed
};


// --- voting helpers (persisted in localStorage) ---
(function ensureVoteStyles(){
  if (document.getElementById('eis-vote-style')) return;
  const s = document.createElement('style');
  s.id = 'eis-vote-style';
  s.textContent = `
    .vote-inline{display:inline-flex;align-items:center;gap:8px;font-size:.9rem;user-select:none}
    .vote-inline button{border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:4px 8px;line-height:1;cursor:pointer}
    .vote-inline .count{min-width:24px;text-align:center;font-weight:600;color:#1f2937}
    .vote-inline button.active{border-color:#1d4ed8;box-shadow:0 0 0 2px rgba(29,78,216,.1)}
    .post-vote-row{display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
  `;
  document.head.appendChild(s);
})();

function voteKey(key){ return `eis_demo:vote:${key}`; }
function userKey(key){ return `eis_demo:vote:${key}:user`; }
function getCount(key){ return parseInt(localStorage.getItem(voteKey(key)) || '0', 10); }
function setCount(key, val){ localStorage.setItem(voteKey(key), String(val)); }
function getUserVote(key){ return parseInt(localStorage.getItem(userKey(key)) || '0', 10); } // -1,0,1
function setUserVote(key, val){ localStorage.setItem(userKey(key), String(val)); }

function voteWidgetHTML(key){
  const count = getCount(key);
  const user = getUserVote(key);
  return `
    <span class="vote-inline" data-votekey="${key}">
      <button type="button" class="up ${user===1?'active':''}" aria-label="Upvote">▲</button>
      <span class="count" aria-live="polite">${count}</span>
      <button type="button" class="down ${user===-1?'active':''}" aria-label="Downvote">▼</button>
    </span>
  `;
}

// Event delegation for all vote widgets
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.vote-inline .up, .vote-inline .down');
  if (!btn) return;
  const wrap = btn.closest('.vote-inline');
  const key = wrap?.getAttribute('data-votekey');
  if (!key) return;

  const dir = btn.classList.contains('up') ? 1 : -1; // intended new vote
  const prev = getUserVote(key);
  let next = dir;
  if (prev === dir) next = 0; // toggle off

  const delta = next - prev; // -1,0,+1
  setUserVote(key, next);
  setCount(key, getCount(key) + delta);

  // refresh UI
  const countEl = wrap.querySelector('.count');
  countEl.textContent = getCount(key);
  wrap.querySelector('.up').classList.toggle('active', next === 1);
  wrap.querySelector('.down').classList.toggle('active', next === -1);
});


// --- helpers ---
const qs = new URLSearchParams(location.search);
const postId = Number(qs.get('id') || '5'); // default to halal post if no id
const storeKey = (id) => `eis_demo:comments:${id}`;

// Try to read current user (from sign-up demo storage)
function currentUser() {
  const email = localStorage.getItem('emoryRemember') || '';
  if (!email) return { username: 'you', verified: true };
  try {
    const raw = localStorage.getItem(`eis_demo:${email}:profile`);
    if (!raw) return { username: 'you', verified: true };
    const { username, name } = JSON.parse(raw);
    return { username: username || name || 'you', verified: true };
  } catch {
    return { username: 'you', verified: true };
  }
}

// DOM refs
const postHero = document.getElementById('postHero');
const commentsList = document.getElementById('commentsList');
const commentCount = document.getElementById('commentCount');
const commentForm = document.getElementById('commentForm');
const commentText = document.getElementById('commentText');
const commentMsg = document.getElementById('commentMsg');
const cancelComment = document.getElementById('cancelComment');

// bootstrap
init();

function init() {
  const post = POSTS[postId];
  if (!post) {
    postHero.innerHTML = `
      <h1>Post not found</h1>
      <p class="muted">The post you’re looking for doesn’t exist. <a class="link" href="./main.html">Back to feed</a></p>
    `;
    return;
  }

  // Render post hero
  postHero.innerHTML = `
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-meta">
      <span class="post-tag">${post.category}</span>
      ${post.badges?.map(b => `<span class="post-badge">${escapeHtml(b)}</span>`).join('') || ''}
      <span>by ${escapeHtml(post.author)}${post.verified ? ' • ✅ Verified' : ''}</span>
      <span>${escapeHtml(post.timeAgo)}</span>
    </div>
    <div class="post-body">${mdToHtml(post.body)}</div>
    <div class="post-vote-row">${voteWidgetHTML(`post:${postId}`)}</div>
    <div class="post-toolbar">
      <button type="button" class="ghost small" id="reportBtn">Report</button>
      <button type="button" class="ghost small" id="shareBtn">Share</button>
    </div>
  `;

  // Seed demo comments if none exist yet (only once per browser)
  const existing = readComments(postId);
  if (existing.length === 0 && postId === 5) {
    saveComments(postId, [
      { user: 'harry', text: 'Falafel Nation is great, but not certified halal AFAIK. Try Cafe Sababa (short drive).', ts: Date.now() - 1000 * 60 * 90 },
      { user: 'intlgrad', text: 'Masti in Toco Hills has halal options. Also check Alkhouzama market for halal meats.', ts: Date.now() - 1000 * 60 * 50 },
      { user: 'gede', text: 'Thank you! Will check out Sababa + Toco Hills area 🙏', ts: Date.now() - 1000 * 60 * 20 }
    ]);
  }

  renderComments();

  // events
  commentForm.addEventListener('submit', onSubmitComment);
  cancelComment.addEventListener('click', onCancel);
  postHero.querySelector('#reportBtn')?.addEventListener('click', () => alert('Report placeholder'));
  postHero.querySelector('#shareBtn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(location.href);
    alert('Link copied!');
  });
}

function onSubmitComment(e) {
  e.preventDefault();
  setMsg('', '');

  const text = commentText.value.trim();
  if (!text) {
    setMsg('error', 'Write something helpful before submitting.');
    return;
  }

  const user = currentUser();
  const comments = readComments(postId);
  comments.push({ user: user.username, text, ts: Date.now() });
  saveComments(postId, comments);

  commentText.value = '';
  renderComments();
  setMsg('success', 'Comment added.');
}

function onCancel() {
  commentText.value = '';
  setMsg('', '');
}

function renderComments() {
  const comments = readComments(postId)
    // newest first
    .sort((a, b) => b.ts - a.ts);

  commentCount.textContent = `${comments.length}`;
  commentsList.innerHTML = comments.map((c,i)=>renderComment(c,i)).join('') || `
    <div class="muted" style="margin-top:8px;">No comments yet. Be the first to help!</div>
  `;
}

function renderComment(c, i) {
  return `
    <div class="comment">
      <div class="meta">by ${escapeHtml(c.user)} • ${timeAgo(c.ts)}</div>
      <div class="text">${escapeHtml(c.text)}</div>\n      ${voteWidgetHTML(`comment:${postId}:${i}`)}
    </div>
  `;
}

// storage
function readComments(id) {
  try {
    const raw = localStorage.getItem(storeKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveComments(id, arr) {
  localStorage.setItem(storeKey(id), JSON.stringify(arr));
}

// helpers
function setMsg(type, text) {
  commentMsg.className = `form-message ${type}`;
  commentMsg.textContent = text;
}
function pad(n){ return n < 10 ? '0' + n : '' + n; }
function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function mdToHtml(md='') {
  // super-lightweight: convert **bold** and line breaks
  return escapeHtml(md)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}
