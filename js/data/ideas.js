// ═══════════════════════════════════════════════════════════════
//  CivicPulse – Mock Ideas Data  |  Çubuk, Ankara
// ═══════════════════════════════════════════════════════════════

const IDEAS_DATA = [
  {
    id: 'IDEA-001',
    title: 'Merkez Parkına Bisiklet Yolu',
    description: 'Belediye Merkez Parkı\'nı çevreleyen bir bisiklet şeridi yapılması için öneri. Bu sayede hem spor aktivitesi artacak hem de araç trafiği azalacak. Komşu illerdeki başarılı örnekler bize ilham olabilir.',
    category: 'Ulaşım & Mobilite',
    categoryIcon: '🚲',
    tags: ['Bisiklet', 'Park', 'Spor', 'Çevre'],
    submittedBy: 'Emre D.',
    submittedAt: new Date(Date.now() - 7 * 86400000),
    score: 142,
    userVoted: null,
    commentCount: 18,
    status: 'reviewing',
    statusLabel: 'İnceleniyor',
    comments: [
      { author: 'Süleyman K.', text: 'Mükemmel fikir! Çocuklarımla parka gittiğimizde bisiklet sürebiliriz.', date: new Date(Date.now() - 5*86400000), likes: 12 },
      { author: 'Neslihan A.', text: 'Bisiklet yolunun aydınlatması da olursa harika olur.', date: new Date(Date.now() - 3*86400000), likes: 8 },
      { author: 'Kadir M.', text: 'Turşu Festivali\'nde de kullanılabilir bu alan.', date: new Date(Date.now() - 1*86400000), likes: 5 },
    ]
  },
  {
    id: 'IDEA-002',
    title: 'Çarşı Meydanına Oturma & Dinlenme Alanı',
    description: 'Ana çarşı meydanına modern tasarımlı oturma bankları, pergole ve bitki düzenlemeleri yapılması. Vatandaşların sosyal alanı olacak bu meydanı daha yaşanabilir kılalım. Üstüne bir de Wi-Fi eklenirse süper olur.',
    category: 'Kent Tasarımı',
    categoryIcon: '🏙️',
    tags: ['Çarşı', 'Sosyal Alan', 'Meydan', 'Tasarım'],
    submittedBy: 'Saadet Y.',
    submittedAt: new Date(Date.now() - 12 * 86400000),
    score: 98,
    userVoted: null,
    commentCount: 11,
    status: 'approved',
    statusLabel: 'Onaylandı',
    comments: [
      { author: 'Burhan T.', text: 'Nihayet! Çarşıda oturacak yer yok ki şu an.', date: new Date(Date.now() - 10*86400000), likes: 22 },
      { author: 'Hacer Ö.', text: 'Yaşlılarımız için de düşünün, oturma alanları erişilebilir olsun.', date: new Date(Date.now() - 8*86400000), likes: 17 },
    ]
  },
  {
    id: 'IDEA-003',
    title: 'Ücretsiz Şehir Wi-Fi - Merkez & Park Alanları',
    description: 'Belediye meydanı, merkez park ve çarşı bölgesine ücretsiz Wi-Fi altyapısı kurulması. Gençlerin ve esnafın dijital kullanımını artıracak. Diğer ilçelerde başarıyla uygulandı.',
    category: 'Dijital Hizmetler',
    categoryIcon: '📡',
    tags: ['WiFi', 'Dijital', 'Gençlik', 'Altyapı'],
    submittedBy: 'Tolga Ş.',
    submittedAt: new Date(Date.now() - 4 * 86400000),
    score: 76,
    userVoted: null,
    commentCount: 7,
    status: 'proposed',
    statusLabel: 'Önerildi',
    comments: [
      { author: 'Dilan K.', text: 'Kesinlikle gerekli! Özellikle gençler çok faydalanır.', date: new Date(Date.now() - 2*86400000), likes: 9 },
    ]
  },
  {
    id: 'IDEA-004',
    title: 'Çubuk Turşu Festivali Dijital Platformu',
    description: 'Çubuk\'un dünyaca ünlü turşu festivalini dijital dünyaya taşıyalım! Online bilet satışı, etkinlik takvimi, üretici profilleri ve festivale özel mobil uygulama ile hem tanıtım hem de katılımı artırabiliriz.',
    category: 'Kültür & Turizm',
    categoryIcon: '🥒',
    tags: ['Festival', 'Turşu', 'Turizm', 'Dijital'],
    submittedBy: 'Mustafa E.',
    submittedAt: new Date(Date.now() - 20 * 86400000),
    score: 203,
    userVoted: null,
    commentCount: 34,
    status: 'approved',
    statusLabel: 'Onaylandı',
    comments: [
      { author: 'Rüya B.', text: 'Çubuk\'un markası için harika bir adım olur!', date: new Date(Date.now() - 18*86400000), likes: 31 },
      { author: 'Sedat Y.', text: 'Üreticileri de platforma dahil etmek çok değerli.', date: new Date(Date.now() - 15*86400000), likes: 24 },
      { author: 'Arzu N.', text: 'Ankara ve dışından ziyaretçi çekmek için mükemmel olur.', date: new Date(Date.now() - 10*86400000), likes: 18 },
    ]
  },
  {
    id: 'IDEA-005',
    title: 'Organik Pazar - Haftalık Çiftçi Pazarı',
    description: 'Her Cumartesi gece 09:00-14:00 saatleri arasında meydanda lokal üreticilerin organik ürünlerini doğrudan satabileceği bir çiftçi pazarı kurulması. Hem yerel ekonomiyi hem sağlıklı beslenmeyi destekler.',
    category: 'Ekonomi & Ticaret',
    categoryIcon: '🥬',
    tags: ['Organik', 'Pazar', 'Yerel Üretici', 'Sağlık'],
    submittedBy: 'Gülsüm C.',
    submittedAt: new Date(Date.now() - 9 * 86400000),
    score: 55,
    userVoted: null,
    commentCount: 9,
    status: 'proposed',
    statusLabel: 'Önerildi',
    comments: [
      { author: 'Yaşar A.', text: 'Köylülerimiz için de büyük fırsat olur.', date: new Date(Date.now() - 7*86400000), likes: 14 },
    ]
  },
  {
    id: 'IDEA-006',
    title: 'Çubuk Gençlik Evi & Maker Atölyesi',
    description: 'Gençlerin bir araya gelip proje üretebileceği, 3D yazıcı ve lazer kesici gibi teknolojik aletlerin bulunduğu bir gençlik merkezi ve maker atölyesi kurulması. Girişimcilik ekosisteminin temeli olacak.',
    category: 'Gençlik & Eğitim',
    categoryIcon: '🎯',
    tags: ['Gençlik', 'Teknoloji', 'Girişimcilik', 'Eğitim'],
    submittedBy: 'Barış Y.',
    submittedAt: new Date(Date.now() - 2 * 86400000),
    score: 38,
    userVoted: null,
    commentCount: 5,
    status: 'proposed',
    statusLabel: 'Önerildi',
    comments: [
      { author: 'Elif M.', text: 'Üniversitelilerin ilçeye dönmesini sağlayabilir!', date: new Date(Date.now() - 1*86400000), likes: 7 },
    ]
  },
  {
    id: 'IDEA-007',
    title: 'Toplu Taşıma – Yeni Hat Talebi',
    description: 'Bahçelievler ve Yeni Mahalle\'den Çubuk merkezine bağlanan yeni bir belediye otobüs hattı açılması talebi. Mevcut hatlar çok seyrek çalışıyor ve bu iki mahalle kuytu kalıyor.',
    category: 'Ulaşım & Mobilite',
    categoryIcon: '🚌',
    tags: ['Otobüs', 'Toplu Taşıma', 'Mahalle', 'Ulaşım'],
    submittedBy: 'Naciye K.',
    submittedAt: new Date(Date.now() - 15 * 86400000),
    score: 127,
    userVoted: null,
    commentCount: 22,
    status: 'reviewing',
    statusLabel: 'İnceleniyor',
    comments: [
      { author: 'Veli T.', text: 'Bu sıkıntıyı yaşayan çok kişi var. Lütfen.', date: new Date(Date.now() - 14*86400000), likes: 28 },
      { author: 'Nesrin B.', text: 'İşe gitmek için sabah erken taksi tutmak zorunda kalıyoruz.', date: new Date(Date.now() - 12*86400000), likes: 19 },
    ]
  },
  {
    id: 'IDEA-008',
    title: 'Sokak Aydınlatmasında LED\'e Geçiş',
    description: 'Tüm sokak lambalarının enerji tasarruflu LED sistemlerine dönüştürülmesi. Uzun vadede belediyenin elektrik masraflarını %60 azaltacak. Karbondioksit emisyonunu da düşürerek çevre dostu bir adım atılmış olacak.',
    category: 'Çevre & Sürdürülebilirlik',
    categoryIcon: '🌿',
    tags: ['LED', 'Enerji', 'Çevre', 'Aydınlatma'],
    submittedBy: 'Okan S.',
    submittedAt: new Date(Date.now() - 30 * 86400000),
    score: 89,
    userVoted: null,
    commentCount: 13,
    status: 'approved',
    statusLabel: 'Onaylandı',
    comments: [
      { author: 'Leyla D.', text: 'Fatih Mah.\'de zaten bu yola gidilmiş ve harika olmuş.', date: new Date(Date.now() - 28*86400000), likes: 16 },
    ]
  },
];

const IDEA_CATEGORIES = ['Tümü', 'Ulaşım & Mobilite', 'Kent Tasarımı', 'Dijital Hizmetler', 'Kültür & Turizm', 'Ekonomi & Ticaret', 'Gençlik & Eğitim', 'Çevre & Sürdürülebilirlik'];

function getIdeaStatusConfig(status) {
  const map = {
    proposed: { label: '💡 Önerildi',   color: 'muted'  },
    reviewing:{ label: '🗳️ İnceleniyor', color: 'blue'   },
    approved: { label: '✅ Onaylandı',  color: 'green'  },
    declined: { label: '🚫 Reddedildi', color: 'red'    },
  };
  return map[status] || map.proposed;
}
