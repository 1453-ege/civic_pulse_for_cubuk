// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Firebase Yapılandırması & Başlangıç Verisi
//  Proje: cubugun-sesi | Çubuk Belediyesi
// ═══════════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyBBce9M_CvWA4jDMC4fEnK8FlkQKCrhxJI",
  authDomain: "cubugun-sesi.firebaseapp.com",
  projectId: "cubugun-sesi",
  storageBucket: "cubugun-sesi.firebasestorage.app",
  messagingSenderId: "12045808702",
  appId: "1:12045808702:web:89cdb97bcf2d517ae00d6f",
  measurementId: "G-40VK1W66DD"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Yardımcı: Firestore Timestamp → JS Date ───────────────────
function toDate(val) {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  return new Date(val);
}

// ── Kullanıcı ID (oturum bazlı) ───────────────────────────────
function getUserId() {
  let uid = localStorage.getItem('civicpulse_uid');
  if (!uid) {
    uid = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    localStorage.setItem('civicpulse_uid', uid);
  }
  return uid;
}
const UID = getUserId();

// ── Firestore'u Başlangıç Verisiyle Doldur (ilk açılışta) ─────
async function seedFirestoreIfEmpty() {
  try {
    const snap = await db.collection('issues').limit(1).get();
    if (!snap.empty) {
      console.log('[CivicPulse] Firestore zaten dolu, seed atlanıyor.');
      return;
    }

    console.log('[CivicPulse] Firestore boş, başlangıç verisi yükleniyor...');

    // Sorunları ekle
    const issueBatch = db.batch();
    ISSUES_DATA.forEach(issue => {
      const ref = db.collection('issues').doc(issue.id);
      issueBatch.set(ref, {
        id:            issue.id,
        category:      issue.category,
        categoryLabel: issue.categoryLabel,
        categoryIcon:  issue.categoryIcon,
        title:         issue.title,
        description:   issue.description,
        location:      issue.location || {},
        neighborhood:  issue.neighborhood,
        submittedBy:   issue.submittedBy,
        submittedAt:   firebase.firestore.Timestamp.fromDate(issue.submittedAt),
        status:        issue.status,
        statusHistory: (issue.statusHistory || []).map(h => ({
          status: h.status,
          label:  h.label,
          note:   h.note,
          date:   firebase.firestore.Timestamp.fromDate(h.date),
        })),
        priority:      issue.priority,
        upvotes:       issue.upvotes || 0,
        hasPhoto:      issue.hasPhoto || false,
        photoColor:    issue.photoColor || '#1a2a3e',
        resolvedNote:  issue.resolvedNote || null,
      });
    });
    await issueBatch.commit();

    // Fikirleri ekle
    const ideaBatch = db.batch();
    IDEAS_DATA.forEach(idea => {
      const ref = db.collection('ideas').doc(idea.id);
      ideaBatch.set(ref, {
        id:           idea.id,
        title:        idea.title,
        description:  idea.description,
        category:     idea.category,
        categoryIcon: idea.categoryIcon,
        tags:         idea.tags || [],
        submittedBy:  idea.submittedBy,
        submittedAt:  firebase.firestore.Timestamp.fromDate(idea.submittedAt),
        score:        idea.score || 0,
        commentCount: idea.commentCount || 0,
        status:       idea.status || 'proposed',
        statusLabel:  idea.statusLabel || 'Önerildi',
        comments:     (idea.comments || []).map(c => ({
          author: c.author,
          text:   c.text,
          likes:  c.likes || 0,
          date:   firebase.firestore.Timestamp.fromDate(c.date),
        })),
      });
    });
    await ideaBatch.commit();

    console.log('[CivicPulse] ✅ Başlangıç verisi başarıyla yüklendi!');
  } catch (err) {
    console.error('[CivicPulse] Seed hatası:', err);
  }
}

// Sayfa yüklendiğinde seed'i çalıştır
document.addEventListener('DOMContentLoaded', seedFirestoreIfEmpty);
