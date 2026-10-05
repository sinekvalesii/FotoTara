// Demo veri ve merkezi kurallar. Gerçek kişi verisi içermez.
export const DEMO_DATE = '2026-10-05'

// İl / ilçe / lojistik nokta modeli: Türkiye → İl → İlçe → Bölge (OSB, liman, havalimanı, depo...)
export const PLACES = [
  { city: 'İstanbul', lat: 41.01, lon: 28.97, side: 'EU', districts: [
    ['Arnavutköy', 41.18, 28.74, 'İstanbul Havalimanı çevresi · Lojistik bölge'], ['Başakşehir', 41.09, 28.80, 'İkitelli OSB'],
    ['Esenyurt', 41.03, 28.67, ''], ['Çatalca', 41.14, 28.46, ''], ['Silivri', 41.07, 28.25, ''], ['Hadımköy', 41.12, 28.62, 'Lojistik bölge'],
    ['Ambarlı', 40.97, 28.69, 'Liman'], ['Tuzla', 40.82, 29.30, 'Tuzla OSB · Tersane', 'AS'], ['Pendik', 40.88, 29.25, '', 'AS'], ['Ümraniye', 41.02, 29.12, '', 'AS']] },
  { city: 'Ankara', lat: 39.93, lon: 32.86, districts: [['Sincan', 39.97, 32.58, 'Sincan OSB'], ['Etimesgut', 39.95, 32.67, ''], ['Kazan', 40.21, 32.68, 'Lojistik merkez']] },
  { city: 'İzmir', lat: 38.42, lon: 27.14, districts: [['Kemalpaşa', 38.43, 27.42, 'Kemalpaşa OSB'], ['Aliağa', 38.80, 26.97, 'Liman'], ['Torbalı', 38.16, 27.36, '']] },
  { city: 'Bursa', lat: 40.19, lon: 29.06, districts: [['Nilüfer', 40.21, 28.98, 'Nilüfer OSB'], ['Gemlik', 40.43, 29.15, 'Liman']] },
  { city: 'Kocaeli', lat: 40.77, lon: 29.94, districts: [['Gebze', 40.80, 29.43, 'Gebze OSB'], ['Dilovası', 40.78, 29.54, 'OSB'], ['Derince', 40.76, 29.83, 'Liman']] },
  { city: 'Sakarya', lat: 40.78, lon: 30.40, districts: [['Arifiye', 40.71, 30.36, ''], ['Hendek', 40.80, 30.75, 'OSB']] },
  { city: 'Tekirdağ', lat: 40.98, lon: 27.51, side: 'EU', districts: [['Çorlu', 41.16, 27.80, 'Çorlu OSB'], ['Çerkezköy', 41.29, 28.00, 'Çerkezköy OSB']] },
  { city: 'Eskişehir', lat: 39.78, lon: 30.52, districts: [['Odunpazarı', 39.76, 30.53, 'Eskişehir OSB']] },
  { city: 'Konya', lat: 37.87, lon: 32.48, districts: [['Selçuklu', 37.95, 32.50, 'Konya OSB']] },
  { city: 'Antalya', lat: 36.90, lon: 30.70, districts: [['Döşemealtı', 37.02, 30.60, 'OSB']] },
  { city: 'Adana', lat: 37.00, lon: 35.32, districts: [['Sarıçam', 37.05, 35.42, 'Hacı Sabancı OSB']] },
  { city: 'Mersin', lat: 36.81, lon: 34.64, districts: [['Akdeniz', 36.80, 34.63, 'Mersin Limanı']] },
  { city: 'Kayseri', lat: 38.73, lon: 35.48, districts: [['Melikgazi', 38.72, 35.49, 'Kayseri OSB']] },
  { city: 'Gaziantep', lat: 37.07, lon: 37.38, districts: [['Şehitkamil', 37.09, 37.36, 'Gaziantep OSB']] },
  { city: 'Samsun', lat: 41.29, lon: 36.33, districts: [['Tekkeköy', 41.21, 36.46, 'Liman']] },
  { city: 'Manisa', lat: 38.61, lon: 27.43, districts: [['Yunusemre', 38.62, 27.40, 'Manisa OSB']] },
  { city: 'Denizli', lat: 37.78, lon: 29.09, districts: [] },
  { city: 'Edirne', lat: 41.68, lon: 26.56, side: 'EU', districts: [['Kapıkule', 41.72, 26.36, 'Gümrük']] }
]

export const VEHICLES = [
  { id: 'cekici', label: 'Tır / Çekici', fuel: 33, axles: 5 },
  { id: 'kamyon', label: 'Kamyon', fuel: 26, axles: 3 },
  { id: 'kamyonet', label: 'Kamyonet', fuel: 13, axles: 2 },
  { id: 'panelvan', label: 'Panelvan', fuel: 10, axles: 2 },
  { id: 'diger', label: 'Diğer', fuel: 20, axles: 2 }
]
export const BODIES = ['Tenteli', 'Kapalı kasa', 'Frigorifik', 'Açık kasa', 'Damperli', 'Lowbed', 'Konteyner', 'Tanker']
export const EQUIPMENT = ['Liftli', 'Forklift', 'Spanzet', 'ADR', 'Isı kontrol', 'Vinç']
export const CARGO = ['Paletli yük', 'Gıda', 'Tekstil', 'İnşaat malzemesi', 'Makine', 'Beyaz eşya', 'Otomotiv parça', 'Ev eşyası', 'Kimyasal (ADR)', 'Diğer']

export const LISTING_TYPES = {
  ARAC_ARIYOR: { label: 'Araç Arıyorum', cat: 'yuk', who: 'Yükü var, araç arıyor' },
  TASIMA_ARIYOR: { label: 'Taşıma Hizmeti Arıyorum', cat: 'yuk', who: 'Taşıma hizmeti arıyor' },
  YUK_ARIYOR: { label: 'Yük Arıyorum', cat: 'arac', who: 'Aracı boş, yük arıyor' },
  IS_ARIYOR: { label: 'Araç / Şoför İş Arıyor', cat: 'arac', who: 'İş arıyor' },
  SOFOR_ARIYOR: { label: 'Şoför Arıyorum', cat: 'is', who: 'İş fırsatı' }
}
export const CATS = { yuk: 'Yük Bul', arac: 'Araç Bul', is: 'İş Bul' }

export const ROLES = { driver: 'Şoför', owner: 'Araç Sahibi', company: 'Firma', shipper: 'Yük Sahibi', admin: 'Yönetici' }

export const DOC_TYPES = { src: 'SRC Belgesi', psiko: 'Psikoteknik', yetki: 'Yetki Belgesi', arac: 'Araç Belgeleri (ruhsat / muayene)' }
export const DOC_STATUS = {
  DECLARED: { label: 'Beyan edildi', tone: 'warn' },
  IN_REVIEW: { label: 'İncelemede', tone: 'warn' },
  PLATFORM_REVIEWED: { label: 'Platform tarafından incelendi', tone: 'ok' },
  OFFICIAL_VERIFIED: { label: 'Resmî entegrasyonla doğrulandı', tone: 'ok' },
  EXPIRED: { label: 'Süresi dolmuş', tone: 'err' },
  REJECTED: { label: 'Reddedildi', tone: 'err' }
}
export const LISTING_STATUS = { DRAFT: 'Taslak', PENDING: 'Onay bekliyor', APPROVED: 'Yayında', REJECTED: 'Reddedildi', EXPIRED: 'Süresi doldu', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal', SUSPENDED: 'Askıda' }
export const OFFER_STATUS = { PENDING: 'Bekliyor', ACCEPTED: 'Kabul edildi', REJECTED: 'Reddedildi', EXPIRED: 'Süresi doldu', CANCELLED: 'İptal edildi' }
export const JOB_STATUS = { CREATED: 'İş emri oluştu', LOADING: 'Yükleniyor', IN_TRANSIT: 'Yolda', DELIVERED: 'Teslim edildi', COMPLETED: 'Tamamlandı', DISPUTED: 'Anlaşmazlık' }
export const JOB_FLOW = ['CREATED', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED']
export const COMPLAINT_REASONS = ['Sahte belge', 'Yanlış bilgi', 'Dolandırıcılık şüphesi', 'Spam', 'Uygunsuz davranış', 'Yanlış fiyat', 'Sahte ilan']
export const REVIEW_METRICS = { onTime: 'Zamanında geldi', comm: 'İletişimi iyiydi', vehicle: 'Araç uygundu', loading: 'Yükleme sorunsuzdu', delivery: 'Teslimat sorunsuzdu' }
export const QUICK_MSGS = ['İlan hâlâ aktif mi?', 'Yük hazır mı?', 'Kaç ton?', 'Fiyat nedir?', 'Konumu gönderebilir misiniz?', 'Bugün çıkabilir misiniz?']

// Mevzuat değişince yalnızca bu yapı güncellenir. Kesin hukuki sonuç üretmez.
export const ComplianceRules = {
  documentRequirements: {
    cekici: ['src', 'psiko', 'yetki', 'arac'], kamyon: ['src', 'psiko', 'yetki', 'arac'],
    kamyonet: ['src', 'arac'], panelvan: ['arac'], diger: ['arac']
  },
  // KGM sınıfı araç adından değil aks sayısından önerilir; kullanıcı onaylar.
  tollClassByAxles: axles => (axles <= 2 ? 2 : axles === 3 ? 3 : axles <= 5 ? 4 : 5),
  tollClassNote: 'Sınıf; aks sayısı ve aks aralığına göre belirlenir. Kesin sınıf için KGM tablosunu kontrol edin.',
  vehicleRestrictions: [
    { minClass: 3, rule: 'bosphorus', text: 'Ağır vasıtalar için şehir içi Boğaz köprülerinde saat ve sınıf kısıtı olabilir. Genellikle Yavuz Sultan Selim Köprüsü / Kuzey Marmara Otoyolu kullanılır.' }
  ],
  routeRestrictions: {
    'İstanbul|İzmir': { segments: ['YSS', 'O7', 'OSMANGAZI', 'O5'] },
    'İstanbul|Bursa': { segments: ['YSS', 'O7', 'OSMANGAZI', 'O5B'] },
    'İstanbul|Ankara': { segments: ['YSS', 'O7', 'O4'] },
    'İstanbul|Kocaeli': { segments: ['YSS', 'O7'] },
    'İstanbul|Sakarya': { segments: ['YSS', 'O7'] },
    'İstanbul|Eskişehir': { segments: ['YSS', 'O7', 'O4E'] },
    'İstanbul|Edirne': { segments: ['O3'] },
    'İstanbul|Tekirdağ': { segments: [] },
    'Kocaeli|İzmir': { segments: ['OSMANGAZI', 'O5'] },
    'Kocaeli|Bursa': { segments: ['OSMANGAZI', 'O5B'] },
    'Kocaeli|Ankara': { segments: ['O4'] },
    'Bursa|İzmir': { segments: ['O5'] },
    'Ankara|Konya': { segments: [] }
  },
  uETDSRequirements: [
    ['sender', 'Gönderici'], ['receiver', 'Alıcı'], ['date', 'Taşıma tarihi'], ['plate', 'Plaka'], ['cargo', 'Eşya cinsi'], ['weight', 'Ağırlık'],
    ['loadPlace', 'Yükleme yeri'], ['unloadPlace', 'Boşaltma yeri'], ['loadTime', 'Yükleme zamanı'], ['unloadTime', 'Boşaltma zamanı'], ['driver', 'Sürücü bilgisi']
  ]
}

const src = 'DEMO VERİ — gerçek tarife değildir'
const seg = (id, operator, road, entry, exit, prices) => prices.map((price, i) => ({
  id: `${id}-${i + 1}`, segment: id, operator, road, entry, exit, vehicleClass: i + 1, price,
  effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', source: src, sourceUrl: '', updatedAt: DEMO_DATE
}))
export const SEED_TOLLS = [
  ...seg('YSS', 'KGM / İşletmeci', 'Yavuz Sultan Selim Köprüsü', 'Avrupa', 'Anadolu', [95, 120, 225, 560, 700]),
  ...seg('O7', 'KGM / İşletmeci', 'Kuzey Marmara Otoyolu', 'Odayeri', 'Akyazı', [280, 350, 560, 1150, 1450]),
  ...seg('OSMANGAZI', 'KGM / İşletmeci', 'Osmangazi Köprüsü', 'Dilovası', 'Altınova', [995, 1590, 1890, 2510, 3170]),
  ...seg('O5', 'KGM / İşletmeci', 'İstanbul–İzmir Otoyolu', 'Altınova', 'İzmir', [1180, 1890, 2240, 2980, 3760]),
  ...seg('O5B', 'KGM / İşletmeci', 'İstanbul–İzmir Otoyolu', 'Altınova', 'Bursa', [310, 495, 590, 785, 990]),
  ...seg('O4', 'KGM', 'Anadolu Otoyolu', 'Akyazı', 'Ankara', [190, 220, 260, 520, 650]),
  ...seg('O4E', 'KGM', 'Anadolu Otoyolu', 'Akyazı', 'Bozüyük ayrımı', [60, 70, 85, 170, 215]),
  ...seg('O3', 'KGM', 'Edirne–İstanbul Otoyolu', 'Mahmutbey', 'Edirne', [125, 145, 175, 350, 440])
]
export const SEED_FUEL = [
  { id: 'motorin', label: 'Motorin', price: 58.9, date: DEMO_DATE, source: 'Demo fiyat' },
  { id: 'benzin', label: 'Benzin', price: 57.4, date: DEMO_DATE, source: 'Demo fiyat' },
  { id: 'lpg', label: 'LPG', price: 27.1, date: DEMO_DATE, source: 'Demo fiyat' }
]
export const SEED_SOURCES = [
  { id: 's1', name: 'Otoyol ve köprü ücretleri', source: 'KGM (demo kopya)', sourceUrl: 'https://www.kgm.gov.tr', effectiveDate: '2026-01-01', lastChecked: DEMO_DATE, notes: 'Gerçek tarife ile eşlenmedi. Yayından önce güncellenmeli.' },
  { id: 's2', name: 'Akaryakıt fiyatları', source: 'Demo fiyat', sourceUrl: '', effectiveDate: DEMO_DATE, lastChecked: DEMO_DATE, notes: 'Canlı fiyat API bağlı değil.' },
  { id: 's3', name: 'U-ETDS alanları', source: 'UDHB U-ETDS (alan listesi)', sourceUrl: 'https://uetds.uab.gov.tr', effectiveDate: '2026-01-01', lastChecked: DEMO_DATE, notes: 'Yalnızca veri eşleme. Bildirim yapılmaz.' }
]

const day = n => { const d = new Date(DEMO_DATE + 'T09:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
export const SEED_USERS = [
  { id: 'u1', name: 'Mehmet Kaya', phone: '+905555555555', role: 'driver', city: 'İstanbul', district: 'Arnavutköy', age: 52, experience: 20, phoneVerified: true, status: 'ACTIVE', tcLast: '123', completedJobs: 14, createdAt: '2025-03-12',
    vehicles: [{ id: 'v1', plate: '34 ABC 123', type: 'cekici', brand: 'Mercedes-Benz', model: 'Actros', year: 2019, axles: 5, tollClass: 5, tonnage: 26, body: 'Tenteli', equipment: ['Spanzet'] }],
    docs: { src: { status: 'PLATFORM_REVIEWED', no: '***4512', expires: day(400), level: 'SRC 3' }, psiko: { status: 'IN_REVIEW', expires: day(21) }, yetki: { status: 'DECLARED', expires: day(700), level: 'K1' }, arac: { status: 'PLATFORM_REVIEWED', expires: day(200) } } },
  { id: 'u2', name: 'Ayşe Demir', phone: '+905321112233', role: 'company', company: 'Demir Lojistik (demo)', city: 'Kocaeli', district: 'Gebze', phoneVerified: true, status: 'ACTIVE', completedJobs: 62, createdAt: '2024-11-02', vehicles: [], docs: { yetki: { status: 'PLATFORM_REVIEWED', expires: day(500), level: 'R2' } } },
  { id: 'u3', name: 'Hasan Yıldız', phone: '+905441234567', role: 'shipper', company: 'Yıldız Tekstil (demo)', city: 'Bursa', district: 'Nilüfer', phoneVerified: true, status: 'ACTIVE', completedJobs: 9, createdAt: '2025-06-20', vehicles: [], docs: {} },
  { id: 'u4', name: 'Kemal Arslan', phone: '+905069876543', role: 'owner', city: 'Ankara', district: 'Sincan', phoneVerified: true, status: 'ACTIVE', completedJobs: 31, createdAt: '2025-01-08',
    vehicles: [{ id: 'v2', plate: '06 KA 4521', type: 'kamyon', brand: 'Ford', model: 'Cargo', year: 2017, axles: 3, tollClass: 3, tonnage: 15, body: 'Kapalı kasa', equipment: ['Liftli'] }], docs: { src: { status: 'DECLARED', level: 'SRC 4', expires: day(300) } } },
  { id: 'u5', name: 'Zeynep Çelik', phone: '+905339871122', role: 'shipper', company: 'Çelik Gıda (demo)', city: 'İzmir', district: 'Kemalpaşa', phoneVerified: false, status: 'ACTIVE', completedJobs: 0, createdAt: '2026-09-28', vehicles: [], docs: {} },
  { id: 'admin', name: 'Platform Yöneticisi', phone: '', email: 'admin@servisteyim.demo', role: 'admin', city: 'İstanbul', phoneVerified: false, status: 'ACTIVE', vehicles: [], docs: {} }
]

const L = (id, type, owner, from, to, vehicle, tonnage, budget, d, time, extra = {}) => ({
  id, type, ownerId: owner, from: { city: from[0], district: from[1] || '' }, to: { city: to[0], district: to[1] || '' },
  vehicleType: vehicle, tollClass: extra.tollClass || ({ cekici: 5, kamyon: 3, kamyonet: 2, panelvan: 2 }[vehicle] || 2), tonnage, budget, date: day(d), time,
  mode: extra.mode || 'komple', cargo: extra.cargo || 'Paletli yük', reqs: { src: extra.src || '', psiko: !!extra.psiko }, equipment: extra.equipment || [],
  note: extra.note || '', isSponsored: !!extra.sponsored, status: extra.status || 'APPROVED', createdAt: day(extra.created ?? -1), views: extra.views || 0
})
export const SEED_LISTINGS = [
  L(125, 'ARAC_ARIYOR', 'u2', ['İstanbul', 'Arnavutköy'], ['İzmir', 'Kemalpaşa'], 'cekici', 18, 32500, 0, '18:00', { src: 'SRC 3', psiko: true, cargo: 'Beyaz eşya', views: 48 }),
  L(126, 'ARAC_ARIYOR', 'u3', ['Bursa', 'Nilüfer'], ['İstanbul', 'Hadımköy'], 'kamyon', 10, 14000, 1, '08:00', { cargo: 'Tekstil', mode: 'parsiyel', sponsored: true, views: 112 }),
  L(127, 'ARAC_ARIYOR', 'u2', ['Kocaeli', 'Gebze'], ['İzmir', 'Torbalı'], 'cekici', 24, 34000, 1, '07:00', { src: 'SRC 3', psiko: true, cargo: 'Otomotiv parça' }),
  L(128, 'TASIMA_ARIYOR', 'u5', ['İzmir', 'Kemalpaşa'], ['Ankara', 'Sincan'], 'kamyon', 8, 21000, 2, '10:00', { cargo: 'Gıda', equipment: ['Isı kontrol'], note: 'Soğuk zincir gerekli.' }),
  L(129, 'ARAC_ARIYOR', 'u2', ['İstanbul', 'Esenyurt'], ['Ankara', 'Kazan'], 'cekici', 20, 29500, 0, '20:00', { src: 'SRC 3', cargo: 'Paletli yük', created: 0 }),
  L(130, 'ARAC_ARIYOR', 'u3', ['İstanbul', 'Başakşehir'], ['Sakarya', 'Hendek'], 'kamyonet', 2.5, 6500, 0, '14:00', { mode: 'parsiyel', cargo: 'Tekstil', created: 0 }),
  L(131, 'ARAC_ARIYOR', 'u2', ['İstanbul', 'Silivri'], ['Tekirdağ', 'Çorlu'], 'kamyon', 12, 7800, 1, '09:00', { cargo: 'İnşaat malzemesi' }),
  L(132, 'ARAC_ARIYOR', 'u5', ['İstanbul', 'Tuzla'], ['Eskişehir', 'Odunpazarı'], 'cekici', 22, 23500, 3, '06:00', { src: 'SRC 3', psiko: true, cargo: 'Makine', equipment: ['Spanzet'] }),
  L(133, 'ARAC_ARIYOR', 'u2', ['Ankara', 'Sincan'], ['İstanbul', 'Arnavutköy'], 'cekici', 19, 28000, 2, '16:00', { src: 'SRC 3', cargo: 'Paletli yük', sponsored: true }),
  L(134, 'ARAC_ARIYOR', 'u3', ['İstanbul', 'Çatalca'], ['Kocaeli', 'Dilovası'], 'panelvan', 1, 3200, 0, '11:00', { mode: 'parsiyel', cargo: 'Ev eşyası', created: 0 }),
  L(135, 'YUK_ARIYOR', 'u4', ['Ankara', 'Sincan'], ['İstanbul', ''], 'kamyon', 15, 18000, 1, '07:00', { note: 'Kapalı kasa, liftli. Dönüş yükü arıyorum.', src: 'SRC 4' }),
  L(136, 'YUK_ARIYOR', 'u1', ['İstanbul', 'Arnavutköy'], ['İzmir', ''], 'cekici', 26, 30000, 2, '05:00', { note: 'Tenteli dorse boş.', src: 'SRC 3', psiko: true }),
  L(137, 'IS_ARIYOR', 'u4', ['Ankara', ''], ['Konya', ''], 'kamyon', 15, 0, 3, '', { note: 'Kontratlı iş arıyorum.' }),
  L(138, 'SOFOR_ARIYOR', 'u2', ['Kocaeli', 'Gebze'], ['İzmir', ''], 'cekici', 0, 0, 5, '', { src: 'SRC 3', psiko: true, note: 'Gebze çıkışlı düzenli hat. Şartlar görüşmede konuşulur. (İş fırsatı — işe yerleştirme hizmeti değildir.)' }),
  L(139, 'ARAC_ARIYOR', 'u5', ['İzmir', 'Aliağa'], ['Bursa', 'Gemlik'], 'cekici', 25, 19500, 4, '08:30', { cargo: 'Kimyasal (ADR)', equipment: ['ADR'], src: 'SRC 5' }),
  L(140, 'ARAC_ARIYOR', 'u3', ['Bursa', 'Nilüfer'], ['İstanbul', 'Ambarlı'], 'cekici', 20, 15500, 0, '22:00', { cargo: 'Tekstil', status: 'PENDING', created: 0 })
]

export const SEED_CONVERSATIONS = [
  { id: 'c1', listingId: 125, members: ['u1', 'u2'], updatedAt: Date.parse(day(-1) + 'T10:12:00'), unread: { u1: 1 },
    messages: [
      { id: 'm1', from: 'u1', type: 'text', text: 'İlan hâlâ aktif mi?', at: Date.parse(day(-1) + 'T10:05:00') },
      { id: 'm2', from: 'u2', type: 'text', text: 'Evet aktif. Yükleme Arnavutköy depoda, 18:00 hazır olur.', at: Date.parse(day(-1) + 'T10:12:00') }
    ] }
]
export const SEED_NOTIFS = [
  { id: 'n1', userId: 'u1', type: 'doc', priority: 'urgent', text: 'Psikoteknik belgenizin süresi 21 gün içinde doluyor.', at: Date.parse(DEMO_DATE + 'T08:00:00'), read: false, link: '/profil/belgeler' },
  { id: 'n2', userId: 'u1', type: 'msg', priority: 'important', text: 'Ayşe Demir size mesaj gönderdi.', at: Date.parse(day(-1) + 'T10:12:00'), read: false, link: '/mesajlar/c1' },
  { id: 'n3', userId: 'u1', type: 'listing', priority: 'normal', text: 'Rotanıza uygun yeni ilan: İstanbul → Ankara', at: Date.parse(DEMO_DATE + 'T07:30:00'), read: true, link: '/ilan/129' }
]
export const SEED_SETTINGS = { autoApprove: false, maintenance: false, maxSponsored: 3, listingDays: 14, allowRegistration: true, announcement: '' }
