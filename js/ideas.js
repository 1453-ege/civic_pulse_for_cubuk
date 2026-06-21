// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Ideas Forum (Firestore Gerçek Veri)
// ═══════════════════════════════════════════════════════════════

let allIdeas        = [];
let activeSort      = 'top';
let activeCategory  = 'Tümü';
let selectedIdeaId  = null;
let newIdeaCategory = 'Genel';

// ── Oy durumunu localStorage'dan oku ─────────────────────────
function getVote(ideaId) {
  return localStorage.getItem('vote_' + UID + '_' + ideaId) || null;
}
function setVote(ideaId, dir) {
  if (dir) localStorage.setItem('vote_' + UID + '_' + ideaId, dir);
  else     localStorage.removeItem('vote_' + UID + '_' + ideaId);
}

// ── Sıralama ──────────────────────────────────────────────────
function getSortedIdeas() {
  let list = [...allIdeas];
  if (activeCategory !== 'Tümü') list = list.filter(i => i.category === activeCategory);
  if (activeSort === 'top')      list.sort((a, b) => b.score - a.score);
  else if (activeSort === 'new') list.sort((a, b) => b.submittedAt - a.submittedAt);
  else if (activeSort === 'trending') {
    list.sort((a, b) => {
      const dA = (Date.now() - a.submittedAt) / 86400000 + 1;
      const dB = (Date.now() - b.submittedAt) / 86400000 + 1;
      return (b.score / dB) - (a.score / dA);
    });
  }
  return list;
}

// ── Render ────────────────────────────────────────────────────
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
    const sc         = getIdeaStatusConfig(idea.status);
    const userVoted  = getVote(idea.id);
    const scoreClass = idea.score >= 100 ? 'high' : idea.score > 0 ? 'positive' : '';
    const initials   = (idea.submittedBy || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const statusColor = idea.status === 'approved' ? 'green' : idea.status === 'reviewing' ? 'blue' : idea.status === 'declined' ? 'red' : 'muted';

    return `
      <div class="idea-card reveal" data-id="${idea.id}" style="animation-delay:${i * 0.07}s">
        <div class="vote-col">
          <button class="vote-btn up ${userVoted === 'up' ? 'voted' : ''}" data-id="${idea.id}" data-dir="up">▲</button>
          <span class="vote-score ${scoreClass}" data-score-id="${idea.id}">${idea.score}</span>
          <button class="vote-btn down ${userVoted === 'down' ? 'voted' : ''}" data-id="${idea.id}" data-dir="down">▼</button>
        </div>
        <div class="idea-content">
          <div class="idea-header">
            <h3 class="idea-title">${idea.title}</h3>
            <span class="badge badge-${statusColor}">${sc.label}</span>
          </div>
          <p class="idea-desc">${idea.description}</p>
          <div class="idea-tags">
            <span class="badge badge-purple">${idea.categoryIcon || '💡'} ${idea.category}</span>
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
      </div>`;
  }).join('');

  // Intersection observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.05 });
  list.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Oy butonları
  list.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handleVote(btn.dataset.id, btn.dataset.dir);
    });
  });

  // Yorum butonları
  list.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openComments(btn.dataset.id);
    });
  });
}

// ── Oylama (Firestore'a yaz) ──────────────────────────────────
async function handleVote(ideaId, direction) {
  if (!currentUser) {
    showToast('warning', 'Oy kullanmak için giriş yapın.');
    showAuthModal();
    return;
  }

  const prevVote = getVote(ideaId);
  let delta = 0;

  if (prevVote === direction) {
    // Oyu geri al
    delta = direction === 'up' ? -1 : 1;
    setVote(ideaId, null);
  } else {
    if (prevVote === 'up')   delta -= 1;
    if (prevVote === 'down') delta += 1;
    delta += direction === 'up' ? 1 : -1;
    setVote(ideaId, direction);
  }

  try {
    await db.collection('ideas').doc(ideaId).update({
      score: firebase.firestore.FieldValue.increment(delta)
    });
    showToast('info',
      direction === 'up' && getVote(ideaId) === 'up' ? '👍 Oy verildi!'
      : direction === 'down' && getVote(ideaId) === 'down' ? '👎 Karşı oy verildi.'
      : 'Oyunuz geri alındı.', 2000);
  } catch (err) {
    console.error('Oy hatası:', err);
    showToast('error', 'Oy kaydedilemedi.');
  }
}

// ── Yorumlar ──────────────────────────────────────────────────
function openComments(ideaId) {
  const idea = allIdeas.find(i => i.id === ideaId);
  if (!idea) return;
  selectedIdeaId = ideaId;

  document.getElementById('comment-modal-title').textContent = `💬 ${idea.title}`;
  const list = document.getElementById('comments-list');

  if (!idea.comments || idea.comments.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:var(--space-8)">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-title">Henüz yorum yok</div>
      </div>`;
  } else {
    list.innerHTML = idea.comments.map((c, i) => {
      const initials = (c.author || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return `
        <div class="comment-item" style="animation-delay:${i * 0.08}s">
          <div class="comment-avatar">${initials}</div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="comment-author">${c.author}</span>
              <span class="comment-date">${timeAgo(toDate(c.date))}</span>
              <span class="badge badge-muted">👍 ${c.likes}</span>
            </div>
            <div class="comment-text">${c.text}</div>
          </div>
        </div>`;
    }).join('');
  }
  document.getElementById('comment-modal-overlay').classList.add('open');
}

document.getElementById('close-comment-modal')?.addEventListener('click', () => {
  document.getElementById('comment-modal-overlay').classList.remove('open');
});
document.getElementById('comment-modal-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) document.getElementById('comment-modal-overlay').classList.remove('open');
});

// ── Sıralama sekmeleri ────────────────────────────────────────
document.querySelectorAll('.sort-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeSort = tab.dataset.sort;
    renderIdeas();
  });
});

// ── Kategori filtresi ─────────────────────────────────────────
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

// ── Yeni fikir modal ──────────────────────────────────────────
function openIdeaModal() {
  if (!currentUser) { showToast('warning', 'Fikir eklemek için giriş yapın.'); showAuthModal(); return; }
  document.getElementById('idea-modal-overlay').classList.add('open');
}
function closeIdeaModal() {
  document.getElementById('idea-modal-overlay').classList.remove('open');
}
document.getElementById('open-idea-modal')?.addEventListener('click', openIdeaModal);
document.getElementById('ideas-fab')?.addEventListener('click', openIdeaModal);
document.getElementById('close-idea-modal')?.addEventListener('click', closeIdeaModal);
document.getElementById('idea-modal-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeIdeaModal();
});

document.querySelectorAll('.idea-cat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.idea-cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    newIdeaCategory = chip.dataset.cat;
  });
});

document.getElementById('idea-title')?.addEventListener('input', e => {
  document.getElementById('idea-title-count').textContent = e.target.value.length;
});
document.getElementById('idea-desc')?.addEventListener('input', e => {
  document.getElementById('idea-desc-count').textContent = e.target.value.length;
});

// ── Fikir gönder (Firestore'a yaz) ───────────────────────────
document.getElementById('idea-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('idea-title').value.trim();
  const desc  = document.getElementById('idea-desc').value.trim();
  if (!title || !desc) return;

  const btn = document.getElementById('idea-submit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Ekleniyor…';

  const catIcons = {
    'Genel': '🏙️', 'Ulaşım & Mobilite': '🚲', 'Kent Tasarımı': '🏗️',
    'Dijital Hizmetler': '📡', 'Kültür & Turizm': '🎭',
    'Gençlik & Eğitim': '🎓', 'Çevre & Sürdürülebilirlik': '🌿',
  };

  try {
    await db.collection('ideas').add({
      title,
      description:  desc,
      category:     newIdeaCategory,
      categoryIcon: catIcons[newIdeaCategory] || '💡',
      tags:         [],
      submittedBy:  currentUser.name,
      submittedAt:  firebase.firestore.FieldValue.serverTimestamp(),
      score:        1,
      commentCount: 0,
      status:       'proposed',
      statusLabel:  'Önerildi',
      comments:     [],
    });

    closeIdeaModal();
    showToast('success', '🎉 Fikriniz platforma eklendi! Oy kullanmaya başlayabilirsiniz.');
    e.target.reset();
    document.getElementById('idea-title-count').textContent = '0';
    document.getElementById('idea-desc-count').textContent = '0';
    document.querySelectorAll('.idea-cat-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.idea-cat-chip')?.classList.add('active');
    newIdeaCategory = 'Genel';
  } catch (err) {
    console.error('Fikir eklenemedi:', err);
    showToast('error', 'Fikir eklenemedi. Lütfen tekrar deneyin.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💡 Fikri Paylaş';
  }
});

// ── Firestore gerçek zamanlı dinleyici ────────────────────────
function listenToIdeas() {
  db.collection('ideas')
    .onSnapshot(snapshot => {
      allIdeas = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          id:          doc.id,
          submittedAt: toDate(d.submittedAt),
          comments:    (d.comments || []).map(c => ({ ...c, date: toDate(c.date) })),
        };
      });
      renderIdeas();
    }, err => {
      console.error('Firestore hatası:', err);
      showToast('error', 'Fikirler yüklenemedi.');
    });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryFilter();
  setTimeout(listenToIdeas, 500);
});
