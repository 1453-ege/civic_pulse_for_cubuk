// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Tracker (Firestore Gerçek Veri)
// ═══════════════════════════════════════════════════════════════

let activeFilter  = 'all';
let searchQuery   = '';
let allIssues     = [];
let selectedIssue = null;

// ── Özet istatistikleri güncelle ──────────────────────────────
function updateSummary() {
  const total    = allIssues.length;
  const resolved = allIssues.filter(i => i.status === 'resolved').length;
  const active   = allIssues.filter(i => i.status === 'dispatched').length;
  const review   = allIssues.filter(i => i.status === 'reviewing').length;

  const el = id => document.getElementById(id);
  if (el('ts-total'))    el('ts-total').textContent    = total;
  if (el('ts-resolved')) el('ts-resolved').textContent = resolved;
  if (el('ts-active'))   el('ts-active').textContent   = active;
  if (el('ts-review'))   el('ts-review').textContent   = review;
}

// ── Filtreleme ────────────────────────────────────────────────
function getFilteredIssues() {
  return allIssues.filter(issue => {
    const matchFilter = activeFilter === 'all' || issue.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || issue.id.toLowerCase().includes(q)
      || issue.title.toLowerCase().includes(q)
      || (issue.neighborhood || '').toLowerCase().includes(q)
      || (issue.categoryLabel || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

function getStepPercent(status) {
  return { received: 10, reviewing: 35, dispatched: 65, resolved: 100 }[status] ?? 10;
}

// ── Issue kartları render ─────────────────────────────────────
function renderIssues() {
  const grid = document.getElementById('issues-grid');
  if (!grid) return;
  const issues = getFilteredIssues();

  if (issues.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Sonuç Bulunamadı</div>
        <div class="empty-state-sub">Filtre veya arama terimini değiştirin.</div>
      </div>`;
    return;
  }

  grid.innerHTML = issues.map((issue, i) => {
    const sc  = getStatusConfig(issue.status);
    const pc  = getPriorityConfig(issue.priority);
    const pct = getStepPercent(issue.status);
    const r   = 18;
    const circ = 2 * Math.PI * r;
    const dash = circ - (circ * pct / 100);

    return `
      <div class="issue-card" data-id="${issue.id}" style="animation-delay:${i * 0.06}s">
        <div class="issue-card-thumb">
          <div class="issue-card-thumb-bg" style="background:${issue.photoColor || '#1a2a3e'}"></div>
          <div class="issue-card-thumb-icon">${issue.categoryIcon || '📋'}</div>
        </div>
        <div class="issue-card-body">
          <div class="issue-card-header">
            <div class="issue-card-title">${issue.title}</div>
            <span class="badge badge-${pc.color}">${pc.label}</span>
          </div>
          <div class="issue-card-meta">
            <span>📍 ${issue.neighborhood || ''}</span>
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
                  stroke-dasharray="${circ.toFixed(2)}"
                  stroke-dashoffset="${dash.toFixed(2)}"
                />
              </svg>
              <span>${pct}%</span>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.issue-card').forEach(card => {
    card.addEventListener('click', () => {
      const issue = allIssues.find(i => i.id === card.dataset.id);
      if (issue) openDetailPanel(issue);
    });
  });
}

// ── Detail Panel ──────────────────────────────────────────────
function openDetailPanel(issue) {
  selectedIssue = issue;
  const body    = document.getElementById('detail-body');
  document.getElementById('detail-id').textContent = issue.id;

  const sc = getStatusConfig(issue.status);
  const allStatuses = ['received', 'reviewing', 'dispatched', 'resolved'];
  const currentIdx  = allStatuses.indexOf(issue.status);

  const timelineHtml = allStatuses.map((status, i) => {
    const historyItem = (issue.statusHistory || []).find(h => h.status === status);
    const isDone    = i < currentIdx;
    const isCurrent = i === currentIdx;
    const icons  = { received: '📥', reviewing: '🔍', dispatched: '🚗', resolved: '✅' };
    const labels = { received: 'Alındı', reviewing: 'İnceleniyor', dispatched: 'Ekip Görevlendirildi', resolved: 'Çözüldü' };
    return `
      <div class="timeline-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
        <div class="timeline-dot">${isDone || isCurrent ? icons[status] : i + 1}</div>
        <div class="timeline-content">
          <div class="timeline-label">${labels[status]}</div>
          ${historyItem
            ? `<div class="timeline-date">${toDate(historyItem.date).toLocaleDateString('tr-TR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
               <div class="timeline-note">${historyItem.note}</div>`
            : `<div class="timeline-date" style="color:var(--text-subtle)">Henüz bu aşamaya ulaşılmadı</div>`}
        </div>
      </div>`;
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
    </div>` : '';

  body.innerHTML = `
    <div class="detail-photo" style="background:${issue.photoColor || 'var(--bg-raised)'}">
      <span style="font-size:64px">${issue.categoryIcon || '📋'}</span>
    </div>
    <div>
      <div class="detail-section-label">Sorun Detayı</div>
      <div class="detail-title">${issue.title}</div>
      <p class="detail-desc">${issue.description}</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
      <span class="badge badge-${sc.color}">${sc.icon} ${sc.label}</span>
      <span class="badge badge-muted">📍 ${issue.neighborhood || ''}</span>
      <span class="badge badge-muted">👤 ${issue.submittedBy || ''}</span>
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
    </div>`;

  document.getElementById('detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  if (issue.status === 'resolved') setTimeout(initBeforeAfterSlider, 300);
}

function initBeforeAfterSlider() {
  const wrap = document.getElementById('ba-wrap');
  const after = document.getElementById('ba-after');
  const handle = document.getElementById('ba-handle');
  if (!wrap || !after || !handle) return;
  let dragging = false;
  const update = x => {
    const rect = wrap.getBoundingClientRect();
    const pct  = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left    = `${pct}%`;
  };
  handle.addEventListener('mousedown',  () => dragging = true);
  wrap.addEventListener('mousemove',    e => { if (dragging) update(e.clientX); });
  window.addEventListener('mouseup',    () => dragging = false);
  handle.addEventListener('touchstart', () => dragging = true, { passive: true });
  wrap.addEventListener('touchmove',    e => { if (dragging) update(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',   () => dragging = false);
}

function closeDetailPanel() {
  document.getElementById('detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
  selectedIssue = null;
}

// ── Firestore gerçek zamanlı dinleyici ────────────────────────
function listenToIssues() {
  const grid = document.getElementById('issues-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="spinner" style="width:36px;height:36px"></div>
        <div class="empty-state-title" style="margin-top:var(--space-4)">Veriler yükleniyor…</div>
      </div>`;
  }

  db.collection('issues')
    .orderBy('submittedAt', 'desc')
    .onSnapshot(snapshot => {
      allIssues = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          submittedAt:   toDate(d.submittedAt),
          statusHistory: (d.statusHistory || []).map(h => ({ ...h, date: toDate(h.date) })),
        };
      });
      updateSummary();
      renderIssues();
    }, err => {
      console.error('Firestore hatası:', err);
      showToast('error', 'Veriler yüklenemedi. Lütfen sayfayı yenileyin.');
    });
}

// ── Filtre & arama olayları ───────────────────────────────────
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderIssues();
  });
});

document.getElementById('tracker-search')?.addEventListener('input', e => {
  searchQuery = e.target.value;
  renderIssues();
});

document.getElementById('detail-close')?.addEventListener('click', closeDetailPanel);
document.getElementById('detail-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeDetailPanel();
});

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(listenToIssues, 500); // Firebase config'in yüklenmesini bekle
});
