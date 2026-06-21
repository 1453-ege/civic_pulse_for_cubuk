// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Belediye Yönetim Paneli
//  Şifre: cubuk2024  (aşağıda değiştirebilirsiniz)
// ═══════════════════════════════════════════════════════════════

const ADMIN_PASSWORD = 'cubuk2024';

// ── Yardımcı: Toast ───────────────────────────────────────────
function showToast(type, msg, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:calc(var(--space-6,24px) + ${container.children.length * 60}px);right:var(--space-6,24px);
    background:#1a2236;border:1px solid ${colors[type]||colors.info}60;
    color:#e2e8f0;padding:14px 18px;border-radius:12px;
    font-size:14px;font-weight:600;max-width:340px;z-index:9999;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);
    border-left:4px solid ${colors[type]||colors.info};
    animation:slideUp 0.3s ease;`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

// ── Yardımcı: Durum ───────────────────────────────────────────
function getStatusConfig(status) {
  const map = {
    received:   { label: 'Alındı',          color: 'muted', icon: '📥' },
    reviewing:  { label: 'İnceleniyor',      color: 'blue',  icon: '🔍' },
    dispatched: { label: 'Ekip Görevlendi', color: 'amber', icon: '🚗' },
    resolved:   { label: 'Çözüldü',         color: 'green', icon: '✅' },
  };
  return map[status] || map.received;
}

// ── Yardımcı: Zaman farkı ─────────────────────────────────────
function timeAgo(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : toDate(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)    return 'Az önce';
  if (diff < 3600)  return Math.floor(diff/60) + ' dk önce';
  if (diff < 86400) return Math.floor(diff/3600) + ' saat önce';
  return Math.floor(diff/86400) + ' gün önce';
}

// ── State ─────────────────────────────────────────────────────
let allIssues     = [];
let selectedIssue = null;
let newStatus     = null;
let statusFilter  = 'all';
let priorityFilter = 'all';
let searchQuery   = '';

// ═══════════════════════════════════════════════════════════════
//  Ana Başlangıç — Her şey DOMContentLoaded içinde
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {

  // ── Giriş Formu ─────────────────────────────────────────────
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const pass = document.getElementById('admin-pass').value.trim();
      if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', '1');
        showDashboard();
      } else {
        const err = document.getElementById('login-error');
        if (err) err.classList.remove('hidden');
        document.getElementById('admin-pass').value = '';
        document.getElementById('admin-pass').focus();
      }
    });
  }

  // Önceki oturum varsa direkt dashboard aç
  if (sessionStorage.getItem('admin_auth') === '1') {
    showDashboard();
  }

  // ── Sidebar Navigasyon ───────────────────────────────────────
  document.querySelectorAll('.admin-nav-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.admin-nav-item').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const section = btn.dataset.section;
      document.querySelectorAll('.admin-section').forEach(function(s) { s.classList.remove('active'); });
      const el = document.getElementById('section-' + section);
      if (el) el.classList.add('active');
      if (section === 'stats') renderStats();
    });
  });

  // ── Çıkış ───────────────────────────────────────────────────
  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem('admin_auth');
      location.reload();
    });
  }

  // ── Filtreler ────────────────────────────────────────────────
  const searchEl = document.getElementById('admin-search');
  if (searchEl) searchEl.addEventListener('input', function(e) { searchQuery = e.target.value; renderTable(); });

  const statusSel = document.getElementById('admin-status-filter');
  if (statusSel) statusSel.addEventListener('change', function(e) { statusFilter = e.target.value; renderTable(); });

  const prioSel = document.getElementById('admin-priority-filter');
  if (prioSel) prioSel.addEventListener('change', function(e) { priorityFilter = e.target.value; renderTable(); });

  // ── Durum Seçimi ─────────────────────────────────────────────
  document.querySelectorAll('.status-opt').forEach(function(opt) {
    opt.addEventListener('click', function() {
      document.querySelectorAll('.status-opt').forEach(function(o) { o.classList.remove('active'); });
      opt.classList.add('active');
      newStatus = opt.dataset.status;
    });
  });

  // ── Modal Kapat ──────────────────────────────────────────────
  const closeModal = document.getElementById('close-status-modal');
  if (closeModal) closeModal.addEventListener('click', closeStatusModal);

  const overlay = document.getElementById('status-modal-overlay');
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === e.currentTarget) closeStatusModal();
  });

  // ── Durum Kaydet ─────────────────────────────────────────────
  const saveBtn = document.getElementById('status-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveStatus);

}); // DOMContentLoaded sonu

// ═══════════════════════════════════════════════════════════════
//  Fonksiyonlar
// ═══════════════════════════════════════════════════════════════

function showDashboard() {
  const login = document.getElementById('admin-login');
  const app   = document.getElementById('admin-app');
  if (login) login.classList.add('hidden');
  if (app)   app.classList.remove('hidden');
  listenToIssues();
}

// ── Firestore Dinleyici ───────────────────────────────────────
function listenToIssues() {
  const tbody = document.getElementById('admin-issues-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="admin-loading"><span class="spinner"></span> Yükleniyor…</td></tr>';

  if (typeof db === 'undefined') {
    console.error('Firestore db tanımlı değil!');
    showToast('error', 'Veritabanı bağlantısı kurulamadı.');
    return;
  }

  db.collection('issues')
    .orderBy('submittedAt', 'desc')
    .onSnapshot(function(snap) {
      allIssues = snap.docs.map(function(doc) {
        const d = doc.data();
        return Object.assign({}, d, {
          _docId:        doc.id,
          submittedAt:   toDate(d.submittedAt),
          statusHistory: (d.statusHistory || []).map(function(h) {
            return Object.assign({}, h, { date: toDate(h.date) });
          }),
        });
      });
      updateStats();
      renderTable();
    }, function(err) {
      console.error('Firestore hatası:', err);
      showToast('error', 'Veriler yüklenemedi: ' + err.message);
    });
}

// ── İstatistik Güncelle ───────────────────────────────────────
function updateStats() {
  const set = function(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('stat-total',      allIssues.length);
  set('stat-received',   allIssues.filter(function(i) { return i.status === 'received'; }).length);
  set('stat-reviewing',  allIssues.filter(function(i) { return i.status === 'reviewing'; }).length);
  set('stat-dispatched', allIssues.filter(function(i) { return i.status === 'dispatched'; }).length);
  set('stat-resolved',   allIssues.filter(function(i) { return i.status === 'resolved'; }).length);
  set('nav-badge-total', allIssues.length);
}

// ── Filtre ────────────────────────────────────────────────────
function getFiltered() {
  return allIssues.filter(function(issue) {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (issue.title || '').toLowerCase().includes(q)
        || (issue.neighborhood || '').toLowerCase().includes(q)
        || (issue._docId || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// ── Tablo Render ──────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('admin-issues-body');
  if (!tbody) return;
  const issues = getFiltered();

  if (issues.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="admin-loading">🔍 Eşleşen sorun bulunamadı.</td></tr>';
    return;
  }

  const prioMap = {
    urgent: { label: '🚨 Acil',    color: 'red' },
    high:   { label: '🔴 Yüksek',  color: 'red' },
    medium: { label: '🟡 Orta',    color: 'amber' },
    low:    { label: '🟢 Düşük',   color: 'green' },
  };

  tbody.innerHTML = issues.map(function(issue) {
    const sc  = getStatusConfig(issue.status);
    const pc  = prioMap[issue.priority] || prioMap.medium;
    const tid = 'CP-' + issue._docId.slice(0, 8).toUpperCase();
    const dt  = issue.submittedAt instanceof Date
      ? issue.submittedAt.toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' })
      : '—';

    return '<tr>' +
      '<td><div class="admin-table-thumb">' +
        (issue.photoUrl ? '<img src="' + issue.photoUrl + '" alt=""/>' : (issue.categoryIcon || '📋')) +
      '</div></td>' +
      '<td><div class="admin-issue-title" title="' + (issue.title||'') + '">' + (issue.title||'—') + '</div>' +
          '<div class="admin-issue-id">' + tid + ' · ' + (issue.categoryLabel||'Diğer') + '</div></td>' +
      '<td><div style="font-size:var(--text-sm);color:var(--text-secondary)">📍 ' + (issue.neighborhood||'—') + '<br/>' +
          '<span style="font-size:var(--text-xs);color:var(--text-muted)">' + (issue.submittedBy||'Anonim') + '</span></div></td>' +
      '<td><span class="badge badge-' + pc.color + '">' + pc.label + '</span></td>' +
      '<td style="font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap">' + dt + '</td>' +
      '<td><span class="badge badge-' + sc.color + '">' + sc.icon + ' ' + sc.label + '</span></td>' +
      '<td><button class="admin-update-btn" data-docid="' + issue._docId + '">✏️ Güncelle</button></td>' +
      '</tr>';
  }).join('');

  tbody.querySelectorAll('.admin-update-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const issue = allIssues.find(function(i) { return i._docId === btn.dataset.docid; });
      if (issue) openStatusModal(issue);
    });
  });
}

// ── Durum Modalı ─────────────────────────────────────────────
function openStatusModal(issue) {
  selectedIssue = issue;
  newStatus     = issue.status;

  const tid = 'CP-' + issue._docId.slice(0, 8).toUpperCase();
  const prev = document.getElementById('status-issue-preview');
  if (prev) prev.innerHTML =
    '<div class="preview-title">' + (issue.categoryIcon||'📋') + ' ' + (issue.title||'') + '</div>' +
    '<div class="preview-meta">📍 ' + (issue.neighborhood||'—') + ' · 👤 ' + (issue.submittedBy||'Anonim') + ' · 🆔 ' + tid + '</div>';

  document.querySelectorAll('.status-opt').forEach(function(opt) {
    opt.classList.toggle('active', opt.dataset.status === issue.status);
  });

  const noteEl = document.getElementById('status-note');
  if (noteEl) noteEl.value = '';

  const saveBtn = document.getElementById('status-save-btn');
  if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '💾 Durumu Kaydet'; }

  const mo = document.getElementById('status-modal-overlay');
  if (mo) { mo.classList.remove('hidden'); mo.classList.add('open'); }
}

function closeStatusModal() {
  const mo = document.getElementById('status-modal-overlay');
  if (mo) { mo.classList.remove('open'); setTimeout(function() { mo.classList.add('hidden'); }, 300); }
  selectedIssue = null;
  newStatus = null;
}

// ── Durum Kaydet ─────────────────────────────────────────────
async function saveStatus() {
  if (!selectedIssue || !newStatus) return;

  const note    = (document.getElementById('status-note')?.value || '').trim();
  const saveBtn = document.getElementById('status-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<span class="spinner"></span> Kaydediliyor…'; }

  const labels = { received:'Alındı', reviewing:'İnceleniyor', dispatched:'Ekip Görevlendi', resolved:'Çözüldü' };

  const entry = {
    status: newStatus,
    label:  labels[newStatus] || newStatus,
    note:   note || ('"' + (labels[newStatus]||newStatus) + '" durumuna güncellendi.'),
    date:   firebase.firestore.Timestamp.fromDate(new Date()),
  };

  try {
    await db.collection('issues').doc(selectedIssue._docId).update({
      status:        newStatus,
      statusHistory: firebase.firestore.FieldValue.arrayUnion(entry),
    });
    showToast('success', '✅ Durum "' + (labels[newStatus]||newStatus) + '" olarak güncellendi!');
    closeStatusModal();
  } catch (err) {
    console.error('Güncelleme hatası:', err);
    showToast('error', 'Güncelleme başarısız: ' + err.message);
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '💾 Durumu Kaydet'; }
  }
}

// ── İstatistikler ─────────────────────────────────────────────
function renderStats() {
  const grid = document.getElementById('stats-grid');
  if (!grid || allIssues.length === 0) {
    if (grid) grid.innerHTML = '<p style="color:var(--text-muted);padding:var(--space-8)">Henüz veri yok.</p>';
    return;
  }

  const total    = allIssues.length;
  const resolved = allIssues.filter(function(i) { return i.status === 'resolved'; }).length;
  const rate     = total > 0 ? Math.round(resolved / total * 100) : 0;

  const byNeighborhood = {};
  allIssues.forEach(function(i) {
    const n = i.neighborhood || 'Bilinmiyor';
    byNeighborhood[n] = (byNeighborhood[n] || 0) + 1;
  });
  const topN = Object.entries(byNeighborhood).sort(function(a,b){ return b[1]-a[1]; }).slice(0,5);

  const byCategory = {};
  allIssues.forEach(function(i) {
    const c = i.categoryLabel || 'Diğer';
    byCategory[c] = (byCategory[c] || 0) + 1;
  });
  const topC = Object.entries(byCategory).sort(function(a,b){ return b[1]-a[1]; }).slice(0,5);

  grid.innerHTML =
    '<div class="stats-card" style="grid-column:1/-1">' +
      '<div class="stats-card-title">📊 Genel Özet</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-4)">' +
        [
          { label:'Toplam Bildirim', val:total,       color:'var(--text-primary)' },
          { label:'Çözüm Oranı',    val:rate+'%',     color:'var(--green-light)' },
          { label:'Bekleyen',       val:allIssues.filter(function(i){return i.status==='received';}).length,   color:'var(--amber-light)' },
          { label:'İnceleniyor',    val:allIssues.filter(function(i){return i.status==='reviewing';}).length,  color:'var(--blue-light)' },
          { label:'Görevde',        val:allIssues.filter(function(i){return i.status==='dispatched';}).length, color:'hsl(38,95%,70%)' },
          { label:'Çözüldü',       val:resolved,      color:'var(--green-light)' },
        ].map(function(s) {
          return '<div style="text-align:center;padding:var(--space-4);background:var(--bg-raised);border-radius:var(--radius-lg)">' +
            '<div style="font-size:var(--text-3xl);font-weight:900;color:'+s.color+';letter-spacing:-0.04em">'+s.val+'</div>' +
            '<div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-1)">'+s.label+'</div></div>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="stats-card">' +
      '<div class="stats-card-title">📍 Mahalle Dağılımı</div>' +
      topN.map(function(entry) {
        return '<div class="stats-bar-row">' +
          '<div class="stats-bar-label">'+entry[0]+'</div>' +
          '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:'+Math.round(entry[1]/total*100)+'%"></div></div>' +
          '<div class="stats-bar-count">'+entry[1]+'</div></div>';
      }).join('') +
    '</div>' +

    '<div class="stats-card">' +
      '<div class="stats-card-title">📂 Kategori Dağılımı</div>' +
      topC.map(function(entry) {
        return '<div class="stats-bar-row">' +
          '<div class="stats-bar-label">'+entry[0]+'</div>' +
          '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:'+Math.round(entry[1]/total*100)+'%;background:var(--purple)"></div></div>' +
          '<div class="stats-bar-count">'+entry[1]+'</div></div>';
      }).join('') +
    '</div>';
}
