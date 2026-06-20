// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Ideas Forum Logic
// ═══════════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────────
let activeSort     = 'top';
let activeCategory = 'Tümü';
let selectedIdeaId = null;
let newIdeaCategory = 'Genel';

// Load vote state from localStorage
function loadVotes() {
  const saved = localStorage.getItem('civicpulse_votes');
  if (saved) {
    const votes = JSON.parse(saved);
    IDEAS_DATA.forEach(idea => {
      if (votes[idea.id]) {
        idea.userVoted = votes[idea.id].direction;
        idea.score     = votes[idea.id].score;
      }
    });
  }
}

function saveVotes() {
  const votes = {};
  IDEAS_DATA.forEach(idea => {
    if (idea.userVoted !== null) {
      votes[idea.id] = { direction: idea.userVoted, score: idea.score };
    }
  });
  localStorage.setItem('civicpulse_votes', JSON.stringify(votes));
}

// ── Sorting ───────────────────────────────────────────────────
function getSortedIdeas() {
  let list = [...IDEAS_DATA];

  if (activeCategory !== 'Tümü') {
    list = list.filter(i => i.category === activeCategory);
  }

  if (activeSort === 'top') {
    list.sort((a, b) => b.score - a.score);
  } else if (activeSort === 'new') {
    list.sort((a, b) => b.submittedAt - a.submittedAt);
  } else if (activeSort === 'trending') {
    // Trending = score / days ago
    list.sort((a, b) => {
      const daysA = (Date.now() - a.submittedAt) / 86400000 + 1;
      const daysB = (Date.now() - b.submittedAt) / 86400000 + 1;
      return (b.score / daysB) - (a.score / daysA);
    });
  }
  return list;
}

// ── Render Ideas ──────────────────────────────────────────────
function renderIdeas() {
  const list = document.getElementById('ideas-list');
  if (!list) return;
  const ideas = getSortedIdeas();

  if (ideas.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💡</div>
        <div class="empty-state-title">Bu kategoride henüz fikir yok</div>
        <div class="empty-state-sub">İlk fikri siz ekleyin!</div>
      </div>`;
    return;
  }

  list.innerHTML = ideas.map((idea, i) => {
    const sc = getIdeaStatusConfig(idea.status);
    const scoreClass = idea.score >= 100 ? 'high' : idea.score > 0 ? 'positive' : '';
    const upVoted   = idea.userVoted === 'up';
    const downVoted = idea.userVoted === 'down';
    const initials  = idea.submittedBy.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return `
      <div class="idea-card reveal" data-id="${idea.id}" style="animation-delay:${i * 0.07}s">
        <!-- Vote Column -->
        <div class="vote-col">
          <button class="vote-btn up ${upVoted ? 'voted' : ''}" data-id="${idea.id}" data-dir="up" title="Oy ver">▲</button>
          <span class="vote-score ${scoreClass}" data-score-id="${idea.id}">${idea.score}</span>
          <button class="vote-btn down ${downVoted ? 'voted' : ''}" data-id="${idea.id}" data-dir="down" title="Karşı çık">▼</button>
        </div>

        <!-- Content -->
        <div class="idea-content">
          <div class="idea-header">
            <h3 class="idea-title">${idea.title}</h3>
            <span class="badge badge-${sc.label.includes('✅') ? 'green' : sc.label.includes('🗳️') ? 'blue' : sc.label.includes('🚫') ? 'red' : 'muted'}">${sc.label}</span>
          </div>
          <p class="idea-desc">${idea.description}</p>
          <div class="idea-tags">
            <span class="badge badge-purple">${idea.categoryIcon} ${idea.category}</span>
            ${(idea.tags || []).slice(0, 3).map(t => `<span class="idea-tag">${t}</span>`).join('')}
          </div>
          <div class="idea-footer">
            <div class="idea-meta">
              <span class="idea-author-avatar">${initials}</span>
              <span>${idea.submittedBy}</span>
              <span>·</span>
              <span>${timeAgo(idea.submittedAt)}</span>
            </div>
            <div class="idea-actions">
              <button class="idea-action-btn comment-btn" data-id="${idea.id}">
                💬 ${idea.commentCount || 0} Yorum
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Reveal animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }});
  }, { threshold: 0.05 });
  list.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Vote button listeners
  list.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleVote(btn.dataset.id, btn.dataset.dir);
    });
  });

  // Comment button listeners
  list.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openComments(btn.dataset.id);
    });
  });
}

// ── Voting Logic ──────────────────────────────────────────────
function handleVote(ideaId, direction) {
  if (!currentUser) {
    showToast('warning', 'Oy kullanabilmek için giriş yapmanız gerekiyor.');
    showAuthModal();
    return;
  }

  const idea = IDEAS_DATA.find(i => i.id === ideaId);
  if (!idea) return;

  const prevVote = idea.userVoted;

  if (prevVote === direction) {
    // Undo vote
    idea.score   += direction === 'up' ? -1 : 1;
    idea.userVoted = null;
  } else {
    // Switch or new vote
    if (prevVote === 'up')   idea.score--;
    if (prevVote === 'down') idea.score++;
    idea.score   += direction === 'up' ? 1 : -1;
    idea.userVoted = direction;
  }

  saveVotes();

  // Update score display without full re-render
  const scoreEl = document.querySelector(`[data-score-id="${ideaId}"]`);
  if (scoreEl) {
    scoreEl.textContent = idea.score;
    scoreEl.className = `vote-score ${idea.score >= 100 ? 'high' : idea.score > 0 ? 'positive' : ''}`;
    scoreEl.style.animation = 'countUp 0.3s var(--ease-spring)';
    setTimeout(() => scoreEl.style.animation = '', 400);
  }

  // Update button states
  const card = document.querySelector(`.idea-card[data-id="${ideaId}"]`);
  if (card) {
    card.querySelector('.vote-btn.up')?.classList.toggle('voted', idea.userVoted === 'up');
    card.querySelector('.vote-btn.down')?.classList.toggle('voted', idea.userVoted === 'down');
  }

  const msg = direction === 'up' && idea.userVoted === 'up'
    ? '👍 Oy verildi!'
    : direction === 'down' && idea.userVoted === 'down'
    ? '👎 Karşı oy verildi.'
    : 'Oyunuz geri alındı.';
  showToast('info', msg, 2000);
}

// ── Comments ──────────────────────────────────────────────────
function openComments(ideaId) {
  const idea = IDEAS_DATA.find(i => i.id === ideaId);
  if (!idea) return;
  selectedIdeaId = ideaId;

  document.getElementById('comment-modal-title').textContent = `💬 ${idea.title}`;

  const list = document.getElementById('comments-list');
  if (!idea.comments || idea.comments.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:var(--space-8)">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-title">Henüz yorum yok</div>
        <div class="empty-state-sub">İlk yorumu siz yapın!</div>
      </div>`;
  } else {
    list.innerHTML = idea.comments.map((c, i) => {
      const initials = c.author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return `
        <div class="comment-item" style="animation-delay:${i * 0.08}s">
          <div class="comment-avatar">${initials}</div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="comment-author">${c.author}</span>
              <span class="comment-date">${timeAgo(c.date)}</span>
              <span class="badge badge-muted">👍 ${c.likes}</span>
            </div>
            <div class="comment-text">${c.text}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('comment-modal-overlay').classList.add('open');
}

document.getElementById('close-comment-modal')?.addEventListener('click', () => {
  document.getElementById('comment-modal-overlay').classList.remove('open');
});
document.getElementById('comment-modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) document.getElementById('comment-modal-overlay').classList.remove('open');
});

// ── Sort Tabs ─────────────────────────────────────────────────
document.querySelectorAll('.sort-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeSort = tab.dataset.sort;
    renderIdeas();
  });
});

// ── Category Filter ───────────────────────────────────────────
function renderCategoryFilter() {
  const container = document.getElementById('ideas-category-filter');
  if (!container) return;
  container.innerHTML = IDEA_CATEGORIES.map(cat => `
    <button class="filter-chip ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>
  `).join('');

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#ideas-category-filter .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      renderIdeas();
    });
  });
}

// ── New Idea Modal ────────────────────────────────────────────
function openIdeaModal() {
  if (!currentUser) {
    showToast('warning', 'Fikir eklemek için lütfen giriş yapın.');
    showAuthModal();
    return;
  }
  document.getElementById('idea-modal-overlay').classList.add('open');
}
function closeIdeaModal() {
  document.getElementById('idea-modal-overlay').classList.remove('open');
}

document.getElementById('open-idea-modal')?.addEventListener('click', openIdeaModal);
document.getElementById('ideas-fab')?.addEventListener('click', openIdeaModal);
document.getElementById('close-idea-modal')?.addEventListener('click', closeIdeaModal);
document.getElementById('idea-modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeIdeaModal();
});

// Category chips in modal
document.querySelectorAll('.idea-cat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.idea-cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    newIdeaCategory = chip.dataset.cat;
  });
});

// Title/desc counters
document.getElementById('idea-title')?.addEventListener('input', (e) => {
  document.getElementById('idea-title-count').textContent = e.target.value.length;
});
document.getElementById('idea-desc')?.addEventListener('input', (e) => {
  document.getElementById('idea-desc-count').textContent = e.target.value.length;
});

// Submit new idea
document.getElementById('idea-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('idea-title').value.trim();
  const desc  = document.getElementById('idea-desc').value.trim();
  if (!title || !desc) return;

  const btn = document.getElementById('idea-submit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Ekleniyor…';

  setTimeout(() => {
    const catIcons = {
      'Genel': '🏙️',
      'Ulaşım & Mobilite': '🚲',
      'Kent Tasarımı': '🏗️',
      'Dijital Hizmetler': '📡',
      'Kültür & Turizm': '🎭',
      'Gençlik & Eğitim': '🎓',
      'Çevre & Sürdürülebilirlik': '🌿',
    };

    IDEAS_DATA.unshift({
      id: `IDEA-00${IDEAS_DATA.length + 1}`,
      title,
      description: desc,
      category: newIdeaCategory,
      categoryIcon: catIcons[newIdeaCategory] || '💡',
      tags: [],
      submittedBy: currentUser.name,
      submittedAt: new Date(),
      score: 1,
      userVoted: 'up',
      commentCount: 0,
      status: 'proposed',
      statusLabel: 'Önerildi',
      comments: [],
    });

    closeIdeaModal();
    renderIdeas();
    showToast('success', '🎉 Fikriniz platforma eklendi! Topluluk oylaması başladı.');

    // Reset form
    e.target.reset();
    document.getElementById('idea-title-count').textContent = '0';
    document.getElementById('idea-desc-count').textContent = '0';
    document.querySelectorAll('.idea-cat-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.idea-cat-chip')?.classList.add('active');
    newIdeaCategory = 'Genel';
    btn.disabled = false;
    btn.innerHTML = '💡 Fikri Paylaş';
  }, 1000);
});

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadVotes();
  renderCategoryFilter();
  renderIdeas();
});
