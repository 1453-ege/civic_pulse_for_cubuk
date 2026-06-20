// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Mock Issues Data  |  Çubuk, Ankara
// ═══════════════════════════════════════════════════════════════

const ISSUES_DATA = [
  {
    id: 'CP-2024-001',
    category: 'yol',
    categoryLabel: 'Yol Hasarı',
    categoryIcon: '🕳️',
    title: 'Cumhuriyet Caddesi çukuru',
    description: 'Cumhuriyet Caddesi 14. sokak girişinde derin bir çukur oluşmuş. Araçlar zarar görüyor ve yayalar için tehlike oluşturuyor.',
    location: { lat: 40.2330, lng: 33.0318, address: 'Cumhuriyet Mah., Cumhuriyet Cad. No:14, Çubuk/Ankara' },
    neighborhood: 'Cumhuriyet Mahallesi',
    submittedBy: 'Mehmet Y.',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'dispatched',
    statusHistory: [
      { status: 'received',   label: 'Alındı',               date: new Date(Date.now() - 2*86400000), note: 'Başvurunuz sisteme kaydedildi. Teşekkürler.' },
      { status: 'reviewing',  label: 'İnceleniyor',           date: new Date(Date.now() - 1.5*86400000), note: 'Teknik ekibimiz bölgeyi inceliyor.' },
      { status: 'dispatched', label: 'Ekip Görevlendirildi',  date: new Date(Date.now() - 0.5*86400000), note: 'Yol bakım ekibi bölgeye yönlendirildi. 2 gün içinde tamamlanması planlanıyor.' },
    ],
    priority: 'high',
    upvotes: 34,
    hasPhoto: true,
    photoColor: '#2a3a5e',
  },
  {
    id: 'CP-2024-002',
    category: 'aydinlatma',
    categoryLabel: 'Aydınlatma',
    categoryIcon: '💡',
    title: 'Fatih Mah. sokak lambası arızalı',
    description: 'Fatih Mahallesi 3. sokakta 5 adet sokak lambası yanmıyor. Gece yürüyüş güvenli değil.',
    location: { lat: 40.2310, lng: 33.0295, address: 'Fatih Mah., 3. Sokak, Çubuk/Ankara' },
    neighborhood: 'Fatih Mahallesi',
    submittedBy: 'Ayşe K.',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'resolved',
    statusHistory: [
      { status: 'received',   label: 'Alındı',              date: new Date(Date.now() - 5*86400000), note: 'Başvurunuz sisteme kaydedildi.' },
      { status: 'reviewing',  label: 'İnceleniyor',          date: new Date(Date.now() - 4*86400000), note: 'Elektrik ekibimiz arızayı tespit etti.' },
      { status: 'dispatched', label: 'Ekip Görevlendirildi', date: new Date(Date.now() - 3*86400000), note: 'Elektrik bakım ekibi bölgede.' },
      { status: 'resolved',   label: 'Çözüldü',             date: new Date(Date.now() - 1*86400000), note: '5 adet sokak lambası değiştirildi. Aydınlatma yeniden aktif.' },
    ],
    priority: 'medium',
    upvotes: 22,
    hasPhoto: true,
    photoColor: '#2a4a3e',
    resolvedNote: 'Tüm lambalar yenilendi, LED\'e geçildi.',
  },
  {
    id: 'CP-2024-003',
    category: 'cop',
    categoryLabel: 'Atık / Çöp',
    categoryIcon: '🗑️',
    title: 'Bahçelievler Mah. konteyner taşıyor',
    description: 'Bahçelievler Mahallesi 7. sokaktaki çöp konteynerleri kapasitesinin üzerinde dolu. Koku ve sağlık sorunu yaşanıyor.',
    location: { lat: 40.2345, lng: 33.0335, address: 'Bahçelievler Mah., 7. Sokak, Çubuk/Ankara' },
    neighborhood: 'Bahçelievler Mahallesi',
    submittedBy: 'Ali R.',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'reviewing',
    statusHistory: [
      { status: 'received',  label: 'Alındı',       date: new Date(Date.now() - 1*86400000), note: 'Başvurunuz sisteme kaydedildi.' },
      { status: 'reviewing', label: 'İnceleniyor',   date: new Date(Date.now() - 0.5*86400000), note: 'Temizlik İşleri Müdürlüğü bilgilendirildi.' },
    ],
    priority: 'medium',
    upvotes: 18,
    hasPhoto: true,
    photoColor: '#3a2a1a',
  },
  {
    id: 'CP-2024-004',
    category: 'kaldirim',
    categoryLabel: 'Kaldırım',
    categoryIcon: '🚶',
    title: 'Atatürk Cad. kaldırım çökmüş',
    description: 'Atatürk Caddesi üzerinde yaklaşık 10 metrelik kaldırım çökmüş durumda. Engelli vatandaşlar geçemiyor.',
    location: { lat: 40.2350, lng: 33.0310, address: 'Atatürk Mah., Atatürk Cad., Çubuk/Ankara' },
    neighborhood: 'Atatürk Mahallesi',
    submittedBy: 'Fatma B.',
    submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    status: 'resolved',
    statusHistory: [
      { status: 'received',   label: 'Alındı',              date: new Date(Date.now() - 8*86400000), note: 'Kaydedildi.' },
      { status: 'reviewing',  label: 'İnceleniyor',          date: new Date(Date.now() - 7*86400000), note: 'İnceleme başlatıldı.' },
      { status: 'dispatched', label: 'Ekip Görevlendirildi', date: new Date(Date.now() - 5*86400000), note: 'Yapım ekibi yönlendirildi.' },
      { status: 'resolved',   label: 'Çözüldü',             date: new Date(Date.now() - 2*86400000), note: '12 metrelik kaldırım yenilendi ve erişilebilir hale getirildi.' },
    ],
    priority: 'high',
    upvotes: 45,
    hasPhoto: true,
    photoColor: '#1a2a3e',
    resolvedNote: 'Kaldırım yenilendi, engelli rampası eklendi.',
  },
  {
    id: 'CP-2024-005',
    category: 'park',
    categoryLabel: 'Park / Yeşil Alan',
    categoryIcon: '🌳',
    title: 'Merkez Park oyun grubu kırık',
    description: 'Belediye Merkez Parkı\'ndaki çocuk oyun grubunun kaydırağı kırık. Çocuklar için tehlike oluşturuyor.',
    location: { lat: 40.2320, lng: 33.0305, address: 'Merkez, Belediye Parkı, Çubuk/Ankara' },
    neighborhood: 'Merkez',
    submittedBy: 'Hasan Ö.',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'received',
    statusHistory: [
      { status: 'received', label: 'Alındı', date: new Date(Date.now() - 3*86400000), note: 'Başvurunuz sisteme kaydedildi. En kısa sürede değerlendirilecek.' },
    ],
    priority: 'medium',
    upvotes: 12,
    hasPhoto: true,
    photoColor: '#1a3a2a',
  },
  {
    id: 'CP-2024-006',
    category: 'su',
    categoryLabel: 'Su / Altyapı',
    categoryIcon: '💧',
    title: 'Yeni Mah. boru patlaması',
    description: 'Yeni Mahalle 2. sokakta su borusu patlamış. Yol su altında kaldı.',
    location: { lat: 40.2315, lng: 33.0330, address: 'Yeni Mah., 2. Sokak, Çubuk/Ankara' },
    neighborhood: 'Yeni Mahalle',
    submittedBy: 'Zeynep A.',
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: 'dispatched',
    statusHistory: [
      { status: 'received',   label: 'Alındı',              date: new Date(Date.now() - 12*3600000), note: 'ACİL olarak kaydedildi.' },
      { status: 'reviewing',  label: 'İnceleniyor',          date: new Date(Date.now() - 10*3600000), note: 'Su İdaresi ekibi bilgilendirildi.' },
      { status: 'dispatched', label: 'Ekip Görevlendirildi', date: new Date(Date.now() - 8*3600000), note: 'Ekip bölgede aktif çalışıyor.' },
    ],
    priority: 'urgent',
    upvotes: 28,
    hasPhoto: true,
    photoColor: '#0d2a4e',
  },
];

// Helper: get status config
function getStatusConfig(status) {
  const map = {
    received:   { label: 'Alındı',               color: 'muted',  icon: '📥', step: 0 },
    reviewing:  { label: 'İnceleniyor',           color: 'blue',   icon: '🔍', step: 1 },
    dispatched: { label: 'Ekip Görevlendirildi',  color: 'amber',  icon: '🚗', step: 2 },
    resolved:   { label: 'Çözüldü',              color: 'green',  icon: '✅', step: 3 },
  };
  return map[status] || map.received;
}

function getPriorityConfig(priority) {
  const map = {
    urgent: { label: 'Acil',   color: 'red'   },
    high:   { label: 'Yüksek', color: 'amber' },
    medium: { label: 'Normal', color: 'blue'  },
    low:    { label: 'Düşük',  color: 'muted' },
  };
  return map[priority] || map.medium;
}

function timeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)   return `${mins} dakika önce`;
  if (hours < 24)  return `${hours} saat önce`;
  return `${days} gün önce`;
}
