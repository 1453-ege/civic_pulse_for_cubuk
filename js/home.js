// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Home Page Logic
// ═══════════════════════════════════════════════════════════════

function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  const recentIssues = [...ISSUES_DATA]
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 5);

  const items = recentIssues.map((issue, i) => {
    const sc = getStatusConfig(issue.status);
    return `
      <a href="tracker.html" class="activity-item reveal reveal-delay-${i + 1}">
        <div class="activity-icon">${issue.categoryIcon}</div>
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
      </a>
    `;
  }).join('');

  feed.innerHTML = items;

  // Reinit scroll reveal for new elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  feed.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  renderActivityFeed();
});
