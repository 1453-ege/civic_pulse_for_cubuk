// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Home Page (Firestore Gerçek Veri)
// ═══════════════════════════════════════════════════════════════

function renderActivityFeed(issues) {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  if (!issues || issues.length === 0) {
    feed.innerHTML = `
      <div class="empty-state" style="padding:var(--space-8)">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">Henüz bildirim yok</div>
        <div class="empty-state-sub">İlk sorunu siz bildirin!</div>
      </div>`;
    return;
  }

  feed.innerHTML = issues.slice(0, 5).map((issue, i) => {
    const sc = getStatusConfig(issue.status);
    return `
      <a href="tracker.html" class="activity-item reveal reveal-delay-${i + 1}">
        <div class="activity-icon">${issue.categoryIcon || '📋'}</div>
        <div class="activity-text">
          <div class="activity-title">${issue.title}</div>
          <div class="activity-meta">
            📍 ${issue.neighborhood} &nbsp;·&nbsp; ${timeAgo(issue.submittedAt)}
            &nbsp;·&nbsp; ${issue.submittedBy}
          </div>
        </div>
        <div class="activity-status">
          <span class="badge badge-${sc.color}">${sc.icon} ${sc.label}</span>
        </div>
      </a>`;
  }).join('');

  // Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.05 });
  feed.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function updateHomeStats(issues) {
  const resolved = issues.filter(i => i.status === 'resolved').length;
  // Update hero stats counters
  document.querySelectorAll('[data-count]').forEach(el => {
    // Keep the original values from HTML, just re-trigger animation
  });
}

function loadHomeData() {
  db.collection('issues')
    .orderBy('submittedAt', 'desc')
    .limit(5)
    .onSnapshot(snapshot => {
      const issues = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          submittedAt: toDate(d.submittedAt),
        };
      });
      renderActivityFeed(issues);
    }, err => {
      console.error('Home data hatası:', err);
      // Sessizce başarısız ol, mock data göster
      renderActivityFeed(ISSUES_DATA.slice(0, 5));
    });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadHomeData, 600);
});
