// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Belediye Yönetim Paneli
//  Şifre: cubuk2024  (admin.js içinde değiştirebilirsiniz)
// ═══════════════════════════════════════════════════════════════

const ADMIN_PASSWORD = 'cubuk2024';  // ← Buradan şifreyi değiştirin

let allIssues     = [];
let selectedIssue = null;
let newStatus     = null;
let statusFilter  = 'all';
let priorityFilter = 'all';
let searchQuery   = '';

// ── Giriş ─────────────────────────────────────────────────────
document.getElementById('admin-login-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const pass = document.getElementById('admin-pass').value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('admin_auth', '1');
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');
    initDashboard();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-pass').focus();
    document.getElementById('admin-login-form').classList.add('shake');
    setTimeout(() => document.getElementById('admin-login-form').classList.remove('shake'), 500);
  }
});

// Oturum kontrolü (sayfa yenilenmesinde şifre tekrar isteme)
if (sessionStorage.getItem('admin_auth') === '1') {
  document.getElementById('admin-login').classList.add('hidden');
  document.getElementById('admin-app').classList.remove('hidden');
  document.addEventListener('DOMContentLoaded', initDashboard);
}

document.getElementById('admin-logout')?.addEventListener('click', () => {
  sessionStorage.removeItem('admin_auth');
  location.reload();
});

// ── Dashboard Başlatma ────────────────────────────────────────
function initDashboard() {
  listenToIssues();
  initSidebarNav();
}

// ── Sidebar Navigasyon ────────────────────────────────────────
function initSidebarNav() {
  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const section = btn.dataset.section;
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`)?.classList.add('active');
      if (section === 'stats') renderStats();
    });
  });
}

// ── Firestore Dinleyici ───────────────────────────────────────
function listenToIssues() {
  db.collection('issues')
    .orderBy('submittedAt', 'desc')
    .onSnapshot(snap => {
      allIssues = snap.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          _docId:        doc.id,
          submittedAt:   toDate(d.submittedAt),
          statusHistory: (d.statusHistory || []).map(h => ({ ...h, date: toDate(h.date) })),
        };
      });
      updateStats();
      renderTable();
    }, err => {
      console.error('Firestore hatası:', err);
      showToast('error', 'Veriler yüklenemedi.');
    });
}

// ── İstatistik Şeridi ─────────────────────────────────────────
function updateStats() {
  const total      = allIssues.length;
  const received   = allIssues.filter(i => i.status === 'received').length;
  const reviewing  = allIssues.filter(i => i.status === 'reviewing').length;
  const dispatched = allIssues.filter(i => i.status === 'dispatched').length;
  const resolved   = allIssues.filter(i => i.status === 'resolved').length;

  document.getElementById('stat-total').textContent      = total;
  document.getElementById('stat-received').textContent   = received;
  document.getElementById('stat-reviewing').textContent  = reviewing;
  document.getElementById('stat-dispatched').textContent = dispatched;
  document.getElementById('stat-resolved').textContent   = resolved;
  document.getElementById('nav-badge-total').textContent = total;
}

// ── Tablo Render ──────────────────────────────────────────────
function getFilteredIssues() {
  return allIssues.filter(issue => {
    const matchStatus   = statusFilter   === 'all' || issue.status   === statusFilter;
    const matchPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || issue.title?.toLowerCase().includes(q)
      || issue.neighborhood?.toLowerCase().includes(q)
      || issue._docId?.toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });
}

function renderTable() {
  const tbody = document.getElementById('admin-issues-body');
  if (!tbody) return;
  const issues = getFilteredIssues();

  if (issues.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="admin-loading">
      🔍 Eşleşen sorun bulunamadı.
    </td></tr>`;
    return;
  }

  const priorityMap = {
    urgent: { label: '🚨 Acil',   color: 'red'   },
    high:   { label: '🔴 Yüksek', color: 'red'   },
    medium: { label: '🟡 Orta',   color: 'amber' },
    low:    { label: '🟢 Düşük',  color: 'green' },
  };

  tbody.innerHTML = issues.map(issue => {
    const sc = getStatusConfig(issue.status);
    const pc = priorityMap[issue.priority] || priorityMap.medium;
    const trackId = 'CP-' + issue._docId.slice(0, 8).toUpperCase();
    const date = issue.submittedAt.toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' });

    return `
      <tr>
        <td>
          <div class="admin-table-thumb">
            ${issue.photoUrl
              ? `<img src="${issue.photoUrl}" alt="Fotoğraf"/>`
              : issue.categoryIcon || '📋'}
          </div>
        </td>
        <td>
          <div class="admin-issue-title" title="${issue.title}">${issue.title}</div>
          <div class="admin-issue-id">${trackId} · ${issue.categoryLabel || 'Diğer'}</div>
        </td>
        <td>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">
            📍 ${issue.neighborhood || '—'}<br/>
            <span style="font-size:var(--text-xs);color:var(--text-muted)">${issue.submittedBy || 'Anonim'}</span>
          </div>
        </td>
        <td><span class="badge badge-${pc.color}">${pc.label}</span></td>
        <td style="font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap">${date}</td>
        <td><span class="badge badge-${sc.color}">${sc.icon} ${sc.label}</span></td>
        <td>
          <button class="admin-update-btn" data-docid="${issue._docId}">
            ✏️ Güncelle
          </button>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.admin-update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const issue = allIssues.find(i => i._docId === btn.dataset.docid);
      if (issue) openStatusModal(issue);
    });
  });
}

// ── Durum Güncelleme Modalı ───────────────────────────────────
function openStatusModal(issue) {
  selectedIssue = issue;
  newStatus     = issue.status;

  const trackId = 'CP-' + issue._docId.slice(0, 8).toUpperCase();
  document.getElementById('status-issue-preview').innerHTML = `
    <div class="preview-title">${issue.categoryIcon || '📋'} ${issue.title}</div>
    <div class="preview-meta">
      📍 ${issue.neighborhood || '—'} &nbsp;·&nbsp;
      👤 ${issue.submittedBy || 'Anonim'} &nbsp;·&nbsp;
      🆔 ${trackId}
    </div>`;

  // Mevcut durumu seç
  document.querySelectorAll('.status-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.status === issue.status);
  });

  document.getElementById('status-note').value = '';
  document.getElementById('status-save-btn').disabled = false;
  document.getElementById('status-modal-overlay').classList.remove('hidden');
  document.getElementById('status-modal-overlay').classList.add('open');
}

function closeStatusModal() {
  document.getElementById('status-modal-overlay').classList.remove('open');
  setTimeout(() => document.getElementById('status-modal-overlay').classList.add('hidden'), 300);
  selectedIssue = null;
  newStatus     = null;
}

// Durum seçimi
document.querySelectorAll('.status-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.status-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    newStatus = opt.dataset.status;
  });
});

document.getElementById('close-status-modal')?.addEventListener('click', closeStatusModal);
document.getElementById('status-modal-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeStatusModal();
});

// ── Durumu Kaydet ─────────────────────────────────────────────
document.getElementById('status-save-btn')?.addEventListener('click', async () => {
  if (!selectedIssue || !newStatus) return;
  const note = document.getElementById('status-note').value.trim();

  const btn = document.getElementById('status-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Kaydediliyor…';

  const statusLabels = {
    received:   'Alındı',
    reviewing:  'İnceleniyor',
    dispatched: 'Ekip Görevlendi',
    resolved:   'Çözüldü',
  };

  const newHistoryEntry = {
    status: newStatus,
    label:  statusLabels[newStatus] || newStatus,
    note:   note || `Durum "${statusLabels[newStatus]}" olarak güncellendi.`,
    date:   firebase.firestore.Timestamp.fromDate(new Date()),
  };

  try {
    await db.collection('issues').doc(selectedIssue._docId).update({
      status:        newStatus,
      statusHistory: firebase.firestore.FieldValue.arrayUnion(newHistoryEntry),
    });

    showToast('success', `✅ Durum "${statusLabels[newStatus]}" olarak güncellendi!`);
    closeStatusModal();
  } catch (err) {
    console.error('Güncelleme hatası:', err);
    showToast('error', 'Güncelleme başarısız. Lütfen tekrar deneyin.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💾 Durumu Kaydet';
  }
});

// ── Filtre & Arama ────────────────────────────────────────────
document.getElementById('admin-search')?.addEventListener('input', e => {
  searchQuery = e.target.value;
  renderTable();
});
document.getElementById('admin-status-filter')?.addEventListener('change', e => {
  statusFilter = e.target.value;
  renderTable();
});
document.getElementById('admin-priority-filter')?.addEventListener('change', e => {
  priorityFilter = e.target.value;
  renderTable();
});

// ── İstatistikler Sayfası ─────────────────────────────────────
function renderStats() {
  const grid = document.getElementById('stats-grid');
  if (!grid || allIssues.length === 0) return;

  const total      = allIssues.length;
  const resolved   = allIssues.filter(i => i.status === 'resolved').length;
  const received   = allIssues.filter(i => i.status === 'received').length;
  const reviewing  = allIssues.filter(i => i.status === 'reviewing').length;
  const dispatched = allIssues.filter(i => i.status === 'dispatched').length;
  const rate       = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Mahalle bazlı
  const byNeighborhood = {};
  allIssues.forEach(i => {
    const n = i.neighborhood || 'Bilinmiyor';
    byNeighborhood[n] = (byNeighborhood[n] || 0) + 1;
  });
  const topNeighborhoods = Object.entries(byNeighborhood)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Kategori bazlı
  const byCategory = {};
  allIssues.forEach(i => {
    const c = i.categoryLabel || 'Diğer';
    byCategory[c] = (byCategory[c] || 0) + 1;
  });
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);

  grid.innerHTML = `
    <!-- Genel Özet -->
    <div class="stats-card" style="grid-column:1/-1">
      <div class="stats-card-title">📊 Genel Özet</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-4)">
        ${[
          { label: 'Toplam Bildirim', val: total, color: 'var(--text-primary)' },
          { label: 'Çözüm Oranı', val: rate + '%', color: 'var(--green-light)' },
          { label: 'Bekleyen', val: received, color: 'var(--amber-light)' },
          { label: 'İnceleniyor', val: reviewing, color: 'var(--blue-light)' },
          { label: 'Görevde', val: dispatched, color: 'hsl(38,95%,70%)' },
          { label: 'Çözüldü', val: resolved, color: 'var(--green-light)' },
        ].map(s => `
          <div style="text-align:center;padding:var(--space-4);background:var(--bg-raised);border-radius:var(--radius-lg)">
            <div style="font-size:var(--text-3xl);font-weight:900;color:${s.color};letter-spacing:-0.04em">${s.val}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-1)">${s.label}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Mahalle Dağılımı -->
    <div class="stats-card">
      <div class="stats-card-title">📍 Mahalle Dağılımı</div>
      ${topNeighborhoods.map(([name, count]) => `
        <div class="stats-bar-row">
          <div class="stats-bar-label">${name}</div>
          <div class="stats-bar-track">
            <div class="stats-bar-fill" style="width:${Math.round(count/total*100)}%"></div>
          </div>
          <div class="stats-bar-count">${count}</div>
        </div>`).join('')}
    </div>

    <!-- Kategori Dağılımı -->
    <div class="stats-card">
      <div class="stats-card-title">📂 Kategori Dağılımı</div>
      ${topCategories.map(([name, count]) => `
        <div class="stats-bar-row">
          <div class="stats-bar-label">${name}</div>
          <div class="stats-bar-track">
            <div class="stats-bar-fill" style="width:${Math.round(count/total*100)}%;background:var(--purple)"></div>
          </div>
          <div class="stats-bar-count">${count}</div>
        </div>`).join('')}
    </div>
  `;
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('admin_auth') === '1') {
    initDashboard();
  }
});
