// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Tracker Page Logic
// ═══════════════════════════════════════════════════════════════

let activeFilter = 'all';
let searchQuery  = '';
let selectedIssue = null;

// ── Summary Counts ────────────────────────────────────────────
function updateSummary() {
  const total    = ISSUES_DATA.length;
  const resolved = ISSUES_DATA.filter(i => i.status === 'resolved').length;
  const active   = ISSUES_DATA.filter(i => i.status === 'dispatched').length;
  const review   = ISSUES_DATA.filter(i => i.status === 'reviewing').length;

  document.getElementById('ts-total').textContent    = total;
  document.getElementById('ts-resolved').textContent = resolved;
  document.getElementById('ts-active').textContent   = active;
  document.getElementById('ts-review').textContent   = review;
}

// ── Filter & Render ───────────────────────────────────────────
function getFilteredIssues() {
  return ISSUES_DATA.filter(issue => {
    const matchFilter = activeFilter === 'all' || issue.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || issue.id.toLowerCase().includes(q)
      || issue.title.toLowerCase().includes(q)
      || issue.neighborhood.toLowerCase().includes(q)
      || issue.categoryLabel.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

function getStepPercent(status) {
  const steps = { received: 10, reviewing: 35, dispatched: 65, resolved: 100 };
  return steps[status] ?? 10;
}

function renderIssues() {
  const grid = document.getElementById('issues-grid');
  if (!grid) return;
  const issues = getFilteredIssues();

  if (issues.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Sonuç Bulunamadı</div>
        <div class="empty-state-sub">Filtre veya arama terimini değiştirmeyi deneyin.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = issues.map((issue, i) => {
    const sc = getStatusConfig(issue.status);
    const pc = getPriorityConfig(issue.priority);
    const pct = getStepPercent(issue.status);
    const r = 18;
    const circ = 2 * Math.PI * r;
    const dash = circ - (circ * pct / 100);

    return `
      <div class="issue-card" data-id="${issue.id}" style="animation-delay:${i * 0.06}s">
        <div class="issue-card-thumb">
          <div class="issue-card-thumb-bg" style="background:${issue.photoColor || 'var(--bg-overlay)'}"></div>
          <div class="issue-card-thumb-icon">${issue.categoryIcon}</div>
        </div>
        <div class="issue-card-body">
          <div class="issue-card-header">
            <div class="issue-card-title">${issue.title}</div>
            <span class="badge badge-${pc.color}">${pc.label}</span>
          </div>
          <div class="issue-card-meta">
            <span>📍 ${issue.neighborhood}</span>
            <span>·</span>
            <span>${timeAgo(issue.submittedAt)}</span>
          </div>
          <div class="issue-card-footer">
            <span class="badge badge-${sc.color}">${sc.icon} ${sc.label}</span>
            <div class="issue-card-ring">
              <svg width="44" height="44" class="progress-ring">
                <circle class="progress-ring-bg" cx="22" cy="22" r="${r}" stroke-width="3"/>
                <circle class="progress-ring-fill"
                  cx="22" cy="22" r="${r}"
                  stroke="${pct === 100 ? 'var(--green)' : 'var(--blue)'}"
                  stroke-width="3"
                  stroke-dasharray="${circ}"
                  stroke-dashoffset="${dash}"
                />
              </svg>
              <span>${pct}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Click handlers
  grid.querySelectorAll('.issue-card').forEach(card => {
    card.addEventListener('click', () => {
      const issue = ISSUES_DATA.find(i => i.id === card.dataset.id);
      if (issue) openDetailPanel(issue);
    });
  });
}

// ── Detail Panel ──────────────────────────────────────────────
function openDetailPanel(issue) {
  selectedIssue = issue;
  const overlay = document.getElementById('detail-overlay');
  const body    = document.getElementById('detail-body');

  document.getElementById('detail-id').textContent = issue.id;

  const sc = getStatusConfig(issue.status);
  const allStatuses = ['received', 'reviewing', 'dispatched', 'resolved'];
  const currentIdx  = allStatuses.indexOf(issue.status);

  const timelineHtml = allStatuses.map((status, i) => {
    const historyItem = issue.statusHistory?.find(h => h.status === status);
    const isDone    = i < currentIdx;
    const isCurrent = i === currentIdx;
    const statusMap = { received: '📥', reviewing: '🔍', dispatched: '🚗', resolved: '✅' };
    const labelMap  = { received: 'Alındı', reviewing: 'İnceleniyor', dispatched: 'Ekip Görevlendirildi', resolved: 'Çözüldü' };

    return `
      <div class="timeline-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
        <div class="timeline-dot">${isDone || isCurrent ? statusMap[status] : i + 1}</div>
        <div class="timeline-content">
          <div class="timeline-label">${labelMap[status]}</div>
          ${historyItem ? `
            <div class="timeline-date">${historyItem.date.toLocaleDateString('tr-TR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
            <div class="timeline-note">${historyItem.note}</div>
          ` : `<div class="timeline-date" style="color:var(--text-subtle)">Henüz bu aşamaya ulaşılmadı</div>`}
        </div>
      </div>
    `;
  }).join('');

  const beforeAfterHtml = issue.status === 'resolved' ? `
    <div>
      <div class="detail-section-label">Öncesi & Sonrası</div>
      <div class="before-after-wrap" id="ba-wrap">
        <div class="before-after-before" style="background:${issue.photoColor || 'var(--bg-overlay)'}">
          <span>${issue.categoryIcon}</span>
        </div>
        <div class="before-after-after" style="background:var(--green-alpha)" id="ba-after">
          <span>✨</span>
        </div>
        <div class="before-after-handle" id="ba-handle"></div>
        <span class="before-label">Önce</span>
        <span class="after-label">✅ Sonra</span>
      </div>
    </div>
  ` : '';

  body.innerHTML = `
    <div class="detail-photo" style="background:${issue.photoColor || 'var(--bg-raised)'}">
      ${issue.categoryIcon ? `<span style="font-size:64px">${issue.categoryIcon}</span>` : ''}
    </div>

    <div>
      <div class="detail-section-label">Sorun Detayı</div>
      <div class="detail-title">${issue.title}</div>
      <p class="detail-desc">${issue.description}</p>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
      <span class="badge badge-${getStatusConfig(issue.status).color}">${sc.icon} ${sc.label}</span>
      <span class="badge badge-muted">📍 ${issue.neighborhood}</span>
      <span class="badge badge-muted">👤 ${issue.submittedBy}</span>
      <span class="badge badge-muted">🕐 ${timeAgo(issue.submittedAt)}</span>
    </div>

    <div>
      <div class="detail-section-label">Çözüm Süreci</div>
      <div class="timeline">${timelineHtml}</div>
    </div>

    ${beforeAfterHtml}

    <div>
      <div class="detail-section-label">Konum</div>
      <div class="detail-meta-row">📍 ${issue.location?.address || 'Konum bilgisi yok'}</div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Init before/after slider
  if (issue.status === 'resolved') {
    setTimeout(initBeforeAfterSlider, 300);
  }
}

function initBeforeAfterSlider() {
  const wrap   = document.getElementById('ba-wrap');
  const after  = document.getElementById('ba-after');
  const handle = document.getElementById('ba-handle');
  if (!wrap || !after || !handle) return;

  let dragging = false;

  function updateSlider(x) {
    const rect = wrap.getBoundingClientRect();
    const pct  = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left    = `${pct}%`;
  }

  handle.addEventListener('mousedown', () => { dragging = true; });
  wrap.addEventListener('mousemove',   (e) => { if (dragging) updateSlider(e.clientX); });
  window.addEventListener('mouseup',   () => { dragging = false; });
  handle.addEventListener('touchstart',() => { dragging = true; }, { passive: true });
  wrap.addEventListener('touchmove',   (e) => { if (dragging) updateSlider(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',  () => { dragging = false; });
}

function closeDetailPanel() {
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  selectedIssue = null;
}

// ── Event Listeners ───────────────────────────────────────────
document.getElementById('detail-close')?.addEventListener('click', closeDetailPanel);
document.getElementById('detail-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeDetailPanel();
});

// Filter chips
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderIssues();
  });
});

// Search
document.getElementById('tracker-search')?.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderIssues();
});

// Mock live update
let updateTimer = setInterval(() => {
  const unresolvedIssues = ISSUES_DATA.filter(i => i.status !== 'resolved');
  if (unresolvedIssues.length === 0) return;
  const randIssue = unresolvedIssues[Math.floor(Math.random() * unresolvedIssues.length)];
  showToast('info', `📍 ${randIssue.title} — durum güncellendi`);
}, 30000);

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateSummary();
  renderIssues();
});
