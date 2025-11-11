// js/main.js — EIS Main / Feed logic

document.addEventListener('DOMContentLoaded', () => {
  console.log('[EIS] main.js loaded, initializing…');

  /* =========================
     Fake data (front-end only)
     ========================= */
  const CATEGORIES = ['All','Housing','Food','Visa','Jobs','Activities/Clubs','Courses'];

  const GUIDES = [
    { title:'CPT/OPT basics for Emory intl students', updated:'Updated Oct 2025', category:'Visa' },
    { title:'Housing Safety — Avoid scams',           updated:'Updated Sept 2025', category:'Housing' },
    { title:'Getting your SSN in Atlanta',            updated:'Updated Sept 2025', category:'Visa' },
    { title:'Top spots near Emory Village',           updated:'Updated Aug 2025',  category:'Food' },
  ];

  const POSTS = [
    {
      id: 1,
      title: 'Looking for sublet near campus (Dec–Jan)',
      excerpt: 'Arriving from Korea for winter. Need a short-term sublet near Emory, walking distance or shuttle.',
      category: 'Housing',
      comments: 4,
      timeAgo: '2h ago',
      author: 'bohan',
      verified: true,
      score: 18,
      tags: ['Verified Housing']
    },
    {
      id: 2,
      title: 'CPT timeline for MSCS? Anyone did Summer 2026?',
      excerpt: 'Trying to confirm when ISSS will issue CPT for summer internships. I have offer from AWS.',
      category: 'Visa',
      comments: 9,
      timeAgo: '5h ago',
      author: 'harry',
      verified: true,
      score: 25,
      tags: ['Important']
    },
    {
      id: 3,
      title: 'Part-time campus jobs for intl students this spring',
      excerpt: 'Sharing a list of openings in the library and Rec Center that said “ok for F-1”.',
      category: 'Jobs',
      comments: 2,
      timeAgo: 'Today',
      author: 'gede',
      verified: false,
      score: 11,
      tags: []
    },
    {
      id: 4,
      title: 'DMV experience: how to get GA ID as intl student',
      excerpt: 'Went to the Decatur DMV, took I-20, passport, I-94, proof of residence from Emory.',
      category: 'Visa',
      comments: 6,
      timeAgo: '1d ago',
      author: 'lee_ji',
      verified: true,
      score: 15,
      tags: []
    },
    {
      id: 5,
      title: 'Good halal options around Emory?',
      excerpt: 'New here (Ethiopia). Any halal place around campus or Decatur side?',
      category: 'Food',
      comments: 7,
      timeAgo: '1d ago',
      author: 'gede',
      verified: false,
      score: 14,
      tags: []
    },
    {
      id: 6,
      title: 'Course review: CS 570 DB Systems',
      excerpt: 'Tough but fair. Group project worth it. Here’s how to prepare.',
      category: 'Courses',
      comments: 3,
      timeAgo: '2d ago',
      author: 'harry',
      verified: true,
      score: 10,
      tags: []
    },
    {
      id: 7,
      title: 'K-sports club recruiting (badminton)',
      excerpt: 'We meet Fri nights at the gym. Beginners ok.',
      category: 'Activities/Clubs',
      comments: 1,
      timeAgo: '2d ago',
      author: 'eaglestudent',
      verified: false,
      score: 5,
      tags: []
    },
    {
      id: 8,
      title: 'Visa: can we do remote internship?',
      excerpt: 'My company is in NYC, but I am staying in ATL. Do I still need CPT?',
      category: 'Visa',
      comments: 5,
      timeAgo: '3d ago',
      author: 'intlgrad',
      verified: false,
      score: 9,
      tags: []
    }
  ];

  // autosuggestions based on interviews
  const SUGGESTIONS = [
    'SIM card','Getting SSN','DMV','CPT timeline','Sublets near campus',
    'OPT grace period','Housing safety','Part-time campus jobs',
    'Best Korean food','On-campus research openings'
  ];

  /* ================
     DOM references
     ================ */
  const categoryFilters   = document.getElementById('categoryFilters');
  const postsContainer    = document.getElementById('postsContainer');
  const postsFallback     = document.getElementById('postsFallback');
  const sortSelect        = document.getElementById('sortSelect');
  const guidesGrid        = document.getElementById('guidesGrid');
  const trendingList      = document.getElementById('trendingList');
  const loadMoreBtn       = document.getElementById('loadMoreBtn');

  const searchInput       = document.getElementById('searchInput');
  const searchSuggestions = document.getElementById('searchSuggestions');

  const createPostBtn     = document.getElementById('createPostBtn');
  const composeModal      = document.getElementById('composeModal');
  const cancelCompose     = document.getElementById('cancelCompose');
  const saveCompose       = document.getElementById('saveCompose');

  const userMenuBtn       = document.getElementById('userMenuBtn');
  const userMenu          = document.getElementById('userMenu');
  const reportLink        = document.getElementById('reportLink');

  /* ================
     State
     ================ */
  let currentCategory = 'All';
  let currentQuery    = '';
  let currentSort     = 'top';
  let visibleCount    = 6; // initial number of posts to display

  /* ================
     Init
     ================ */
  try {
    initCategories();
    renderGuides();
    renderTrending();
    renderPosts();
    if (postsFallback) postsFallback.remove();
    console.log('[EIS] Render complete.');
  } catch (err) {
    console.error('[EIS] Failed to initialize feed:', err);
    if (postsContainer) {
      postsContainer.innerHTML = `
        <div style="background:#fff;border:1px solid #eceef1;border-radius:12px;padding:12px;">
          <strong>Could not load posts.</strong>
          <div style="font-size:.9rem;color:#666;">Check the console for errors in <code>js/main.js</code>.</div>
        </div>`;
    }
    return;
  }

  /* ================
     Renderers
     ================ */
  function initCategories() {
    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-pill' + (cat === 'All' ? ' active' : '');
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = cat;
        visibleCount = 6;
        renderPosts();
      });
      categoryFilters.appendChild(btn);
    });
  }

  function renderGuides() {
    guidesGrid.innerHTML = '';
    GUIDES.forEach(g => {
      const div = document.createElement('div');
      div.className = 'guide-card';
      div.innerHTML = `
        <div class="guide-card-title">${g.title}</div>
        <div class="guide-card-meta">${g.updated} • ${g.category}</div>
      `;
      guidesGrid.appendChild(div);
    });
  }

  function renderTrending() {
    trendingList.innerHTML = '';
    const top = [...POSTS].sort((a,b) => b.score - a.score).slice(0, 5);
    top.forEach((p, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="trending-rank">${idx + 1}</span><span>${p.title}</span>`;
      trendingList.appendChild(li);
    });
  }

  function renderPosts() {
    postsContainer.innerHTML = '';

    let filtered = POSTS.filter(p => {
      const matchesCat = currentCategory === 'All' || p.category === currentCategory;
      const q = currentQuery.toLowerCase();
      const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    if (currentSort === 'top')    filtered.sort((a,b) => b.score - a.score);
    if (currentSort === 'recent') filtered.sort((a,b) => b.id - a.id);

    const toShow = filtered.slice(0, visibleCount);

    if (toShow.length === 0) {
      postsContainer.innerHTML = `
        <div style="background:#fff;border:1px solid #eceef1;border-radius:12px;padding:12px;">
          <strong>No posts match your filters.</strong>
          <div style="font-size:.9rem;color:#666;">Try clearing search or switching categories.</div>
        </div>`;
      loadMoreBtn.style.display = 'none';
      return;
    }

    toShow.forEach(post => {
      const card = document.createElement('article');
      card.className = 'post-card';
      card.innerHTML = `
        <div class="post-main">
          <h3 class="post-title"><a href="./post.html?id=${post.id}">${post.title}</a></h3>
          <p class="post-excerpt">${post.excerpt}</p>
          <div class="post-meta">
            <span class="post-tag">${post.category}</span>
            ${post.tags?.map(t => `<span class="post-badge">${t}</span>`).join('') || ''}
            <span>by ${post.author}${post.verified ? ' • ✅ Verified' : ''}</span>
            <span>${post.timeAgo}</span>
          </div>
        </div>
        <div class="post-right">
          <div class="comment-count" aria-label="${post.comments} comments">💬 ${post.comments}</div>
          <div class="post-actions">
            <button class="post-action" type="button" aria-label="More actions">⋯</button>
          </div>
        </div>`;
      postsContainer.appendChild(card);
    });

    loadMoreBtn.style.display = filtered.length > visibleCount ? 'block' : 'none';
  }

  /* ================
     Search & suggest
     ================ */
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    currentQuery = q;
    renderPosts();

    if (!q) {
      searchSuggestions.classList.remove('show');
      return;
    }
    const matched = SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 6);
    searchSuggestions.innerHTML = matched.map(m => `<li>${m}</li>`).join('');
    searchSuggestions.classList.toggle('show', matched.length > 0);
  });

  searchSuggestions.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      const val = e.target.textContent;
      searchInput.value = val;
      currentQuery = val.toLowerCase();
      searchSuggestions.classList.remove('show');
      renderPosts();
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchSuggestions.contains(e.target) && e.target !== searchInput) {
      searchSuggestions.classList.remove('show');
    }
  });

  /* ================
     Sort & pagination
     ================ */
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderPosts();
  });

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 4;
    renderPosts();
  });

  /* ================
     Compose modal (demo)
     ================ */
  createPostBtn.addEventListener('click', () => {
    composeModal.classList.add('show');
  });
  cancelCompose.addEventListener('click', () => {
    composeModal.classList.remove('show');
  });
  saveCompose.addEventListener('click', () => {
    const title = document.getElementById('newTitle').value.trim();
    const body  = document.getElementById('newBody').value.trim();
    const cat   = document.getElementById('newCategory').value;
    if (!title) return alert('Please add a title');

    POSTS.unshift({
      id: Date.now(),
      title,
      excerpt: body || 'New post from you.',
      category: cat,
      comments: 0,
      timeAgo: 'just now',
      author: 'you',
      verified: true,
      score: 1,
      tags: []
    });

    composeModal.classList.remove('show');
    document.getElementById('newTitle').value = '';
    document.getElementById('newBody').value  = '';

    // reset filters to show the new post
    currentCategory = 'All';
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    const allPill = [...document.querySelectorAll('.filter-pill')].find(p => p.dataset.category === 'All');
    if (allPill) allPill.classList.add('active');

    renderPosts();
  });

  /* ================
     User menu & safety
     ================ */
  userMenuBtn.addEventListener('click', () => {
    userMenu.style.display = userMenu.style.display === 'flex' ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.style.display = 'none';
    }
  });

  reportLink.addEventListener('click', () => {
    alert('Report flow placeholder: would open a modal / navigate to detail.');
  });
});
