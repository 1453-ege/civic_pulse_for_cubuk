// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Report Wizard Logic
//  4-step form: Category → Photo → Location → Submit
// ═══════════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────────
const reportState = {
  step: 1,
  category: null,
  categoryLabel: null,
  photoFile: null,
  photoDataURL: null,
  title: '',
  description: '',
  lat: null,
  lng: null,
  address: '',
  priority: 'medium',
};

let map = null;
let marker = null;

// ── Step Navigation ───────────────────────────────────────────
function goToStep(n, direction = 'forward') {
  const panels = document.querySelectorAll('.wizard-panel');
  const steps  = document.querySelectorAll('.wizard-step');
  const lines  = document.querySelectorAll('.wizard-step-line');

  panels.forEach(p => p.classList.remove('active'));
  document.getElementById(`step-${n}`)?.classList.add('active');
  if (n === 'success') {
    document.getElementById('step-success').classList.add('active');
  }

  reportState.step = n;

  // Update step indicators
  steps.forEach((s, i) => {
    const stepNum = i + 1;
    s.classList.remove('active', 'done');
    if (typeof n === 'number') {
      if (stepNum < n)  s.classList.add('done');
      if (stepNum === n) s.classList.add('active');
    } else {
      s.classList.add('done');
    }
  });

  lines.forEach((l, i) => {
    l.classList.toggle('done', typeof n === 'number' ? i + 1 < n : true);
  });

  // Scroll to top of wizard
  document.querySelector('.report-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Init map on step 3
  if (n === 3) setTimeout(initMap, 100);
}

// ── Step 1: Category ──────────────────────────────────────────
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    btn.style.animation = 'popIn 0.35s var(--ease-spring)';
    setTimeout(() => btn.style.animation = '', 400);
    reportState.category      = btn.dataset.cat;
    reportState.categoryLabel = btn.dataset.catLabel;
    document.getElementById('step1-next').disabled = false;
  });
});

document.getElementById('step1-next')?.addEventListener('click', () => goToStep(2));

// ── Step 2: Photo & Description ───────────────────────────────
const photoInput   = document.getElementById('photo-input');
const photoDropZone = document.getElementById('photo-drop-zone');
const photoPreviewWrap = document.getElementById('photo-preview-wrap');
const photoPlaceholder = document.getElementById('photo-placeholder');
const photoPreview = document.getElementById('photo-preview');
const removeBtn    = document.getElementById('photo-remove-btn');
const cameraBtn    = document.getElementById('photo-camera-btn');
const titleInput   = document.getElementById('issue-title');
const descInput    = document.getElementById('issue-desc');
const titleCount   = document.getElementById('title-count');
const descCount    = document.getElementById('desc-count');
const step2Next    = document.getElementById('step2-next');

function checkStep2Valid() {
  step2Next.disabled = !titleInput?.value.trim();
}

// Click drop zone → trigger file input
photoDropZone?.addEventListener('click', (e) => {
  if (e.target === removeBtn) return;
  photoInput?.click();
});
cameraBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  photoInput?.click();
});

// File input change
photoInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handlePhoto(file);
});

// Drag & drop
photoDropZone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  photoDropZone.classList.add('dragover');
});
photoDropZone?.addEventListener('dragleave', () => photoDropZone.classList.remove('dragover'));
photoDropZone?.addEventListener('drop', (e) => {
  e.preventDefault();
  photoDropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file?.type.startsWith('image/')) handlePhoto(file);
});

function handlePhoto(file) {
  reportState.photoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    reportState.photoDataURL = e.target.result;
    photoPreview.src = e.target.result;
    photoPreviewWrap.classList.remove('hidden');
    photoPlaceholder.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

removeBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  reportState.photoFile = null;
  reportState.photoDataURL = null;
  photoPreview.src = '';
  photoPreviewWrap.classList.add('hidden');
  photoPlaceholder.classList.remove('hidden');
  photoInput.value = '';
});

titleInput?.addEventListener('input', () => {
  reportState.title = titleInput.value;
  titleCount.textContent = titleInput.value.length;
  checkStep2Valid();
});
descInput?.addEventListener('input', () => {
  reportState.description = descInput.value;
  descCount.textContent = descInput.value.length;
});

document.getElementById('step2-back')?.addEventListener('click', () => goToStep(1, 'back'));
step2Next?.addEventListener('click', () => goToStep(3));

// ── Step 3: Map ───────────────────────────────────────────────
function initMap() {
  if (map) { map.invalidateSize(); return; }

  // Çubuk, Ankara coordinates
  const CUBUK = [40.2324, 33.0313];

  map = L.map('leaflet-map', {
    center: CUBUK,
    zoom: 15,
    zoomControl: true,
  });

  // Dark-friendly tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '©OpenStreetMap ©CARTO',
    maxZoom: 19,
  }).addTo(map);

  // Custom marker icon
  const icon = L.divIcon({
    html: `<div style="
      width:36px;height:44px;display:flex;flex-direction:column;
      align-items:center;pointer-events:none;
    ">
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:hsl(221,88%,60%);border:3px solid #fff;
        transform:rotate(-45deg);box-shadow:0 4px 12px rgba(80,120,255,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:16px">📍</span>
      </div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    className: '',
  });

  marker = L.marker(CUBUK, { icon, draggable: true }).addTo(map);
  reportState.lat = CUBUK[0];
  reportState.lng = CUBUK[1];
  reverseGeocode(CUBUK[0], CUBUK[1]);

  // Drag end → reverse geocode
  marker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    reportState.lat = pos.lat;
    reportState.lng = pos.lng;
    reverseGeocode(pos.lat, pos.lng);
  });

  // Map click → move marker
  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    reportState.lat = e.latlng.lat;
    reportState.lng = e.latlng.lng;
    reverseGeocode(e.latlng.lat, e.latlng.lng);
  });

  // Trigger bounce animation on marker
  marker.getElement()?.style.setProperty('animation', 'pinBounce 0.6s var(--ease-spring)');
}

function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      reportState.address = address;
      showLocationCard(address);
      document.getElementById('step3-next').disabled = false;
    })
    .catch(() => {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      reportState.address = fallback;
      showLocationCard(fallback);
      document.getElementById('step3-next').disabled = false;
    });
}

function showLocationCard(address) {
  const card = document.getElementById('location-card');
  const addrEl = document.getElementById('location-address');
  if (card && addrEl) {
    addrEl.textContent = address;
    card.classList.remove('hidden');
  }
}

// Geolocation
document.getElementById('locate-btn')?.addEventListener('click', () => {
  const btn = document.getElementById('locate-btn');
  btn.innerHTML = '<span class="spinner"></span> Konum Tespit Ediliyor…';
  btn.disabled = true;

  if (!navigator.geolocation) {
    showToast('error', 'Tarayıcınız konum özelliğini desteklemiyor.');
    btn.innerHTML = '🎯 Konumumu Otomatik Tespit Et';
    btn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (map && marker) {
        map.setView([lat, lng], 17);
        marker.setLatLng([lat, lng]);
      }
      reportState.lat = lat;
      reportState.lng = lng;
      reverseGeocode(lat, lng);
      btn.innerHTML = '✅ Konum Tespit Edildi';
      setTimeout(() => {
        btn.innerHTML = '🎯 Konumumu Otomatik Tespit Et';
        btn.disabled = false;
      }, 2000);
    },
    () => {
      showToast('error', 'Konum izni verilmedi. Haritadan manuel seçin.');
      btn.innerHTML = '🎯 Konumumu Otomatik Tespit Et';
      btn.disabled = false;
    },
    { timeout: 10000 }
  );
});

document.getElementById('step3-back')?.addEventListener('click', () => goToStep(2, 'back'));
document.getElementById('step3-next')?.addEventListener('click', () => {
  populateReview();
  goToStep(4);
});

// ── Step 4: Review ────────────────────────────────────────────
function populateReview() {
  document.getElementById('review-cat').textContent = reportState.categoryLabel || '—';
  document.getElementById('review-title').textContent = reportState.title || '—';
  document.getElementById('review-desc').textContent = reportState.description || 'Açıklama girilmedi.';
  document.getElementById('review-address').textContent = reportState.address || '—';
  document.getElementById('review-user').textContent = currentUser
    ? `${currentUser.name} · ${currentUser.neighborhood}`
    : 'Anonim';

  const reviewPhoto = document.getElementById('review-photo');
  if (reportState.photoDataURL) {
    reviewPhoto.innerHTML = `<img src="${reportState.photoDataURL}" style="width:100%;height:100%;object-fit:cover" alt="Sorun fotoğrafı"/>`;
  }
}

// Priority options
document.querySelectorAll('.priority-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.priority-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    reportState.priority = opt.dataset.val;
  });
});

document.getElementById('step4-back')?.addEventListener('click', () => goToStep(3, 'back'));

// ── Submit (Firestore'a Kaydet) ───────────────────────────────
document.getElementById('submit-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  document.getElementById('submit-btn-text').innerHTML = '<span class="spinner"></span> Gönderiliyor…';

  const catIconMap = {
    road: '🛣️', lighting: '💡', water: '🚰', park: '🌳',
    waste: '🗑️', traffic: '🚦', building: '🏗️', other: '📋',
  };

  try {
    const docRef = await db.collection('issues').add({
      category:      reportState.category      || 'other',
      categoryLabel: reportState.categoryLabel || 'Diğer',
      categoryIcon:  catIconMap[reportState.category] || '📋',
      title:         reportState.title,
      description:   reportState.description || '',
      location: {
        lat:     reportState.lat     || null,
        lng:     reportState.lng     || null,
        address: reportState.address || 'Konum belirtilmedi',
      },
      neighborhood:  currentUser?.neighborhood || 'Bilinmiyor',
      submittedBy:   currentUser?.name         || 'Anonim',
      submittedAt:   firebase.firestore.FieldValue.serverTimestamp(),
      status:        'received',
      statusHistory: [{
        status: 'received',
        label:  'Alındı',
        note:   'Başvurunuz sisteme kaydedildi.',
        date:   firebase.firestore.Timestamp.fromDate(new Date()),
      }],
      priority:   reportState.priority || 'medium',
      upvotes:    0,
      hasPhoto:   !!reportState.photoDataURL,
      photoColor: '#1a2a3e',
    });

    const trackingId = 'CP-' + docRef.id.slice(0, 8).toUpperCase();
    document.getElementById('success-tracking-id').textContent = trackingId;

    launchParticles();
    goToStep('success');
    showToast('success', `✅ Bildiriminiz alındı! Takip no: ${trackingId}`);
  } catch (err) {
    console.error('Kayıt hatası:', err);
    showToast('error', 'Bildirim gönderilemedi. Lütfen tekrar deneyin.');
    btn.disabled = false;
    document.getElementById('submit-btn-text').innerHTML = '🚀 Bildirimi Gönder';
  }
});

// ── Particle Burst ────────────────────────────────────────────
function launchParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.5) * 14 - 4,
    r: Math.random() * 6 + 2,
    color: ['#4fa3ff', '#40c8a0', '#f5a623', '#ff6b6b', '#c77dff'][Math.floor(Math.random() * 5)],
    life: 1,
    decay: Math.random() * 0.025 + 0.012,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.25;
      p.life -= p.decay;
      if (p.life <= 0) return;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (particles.some(p => p.life > 0)) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(draw);
}
