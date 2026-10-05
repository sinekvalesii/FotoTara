import { useSyncExternalStore } from 'react'
import * as D from './data.js'

// ---------- Biçimlendirme ----------
const nf = new Intl.NumberFormat('tr-TR')
export const tl = n => (n ? '₺' + nf.format(Math.round(n)) : 'Teklif usulü')
export const num = n => nf.format(n)
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
export const dateTR = iso => { if (!iso) return '—'; const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
export const today = () => new Date().toISOString().slice(0, 10)
export const dayLabel = iso => {
  const diff = Math.round((Date.parse(iso) - Date.parse(today())) / 864e5)
  return diff === 0 ? 'Bugün' : diff === 1 ? 'Yarın' : diff === -1 ? 'Dün' : dateTR(iso)
}
export const timeTR = ts => new Date(ts).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const daysUntil = iso => Math.ceil((Date.parse(iso) - Date.now()) / 864e5)

// ---------- Güvenlik yardımcıları ----------
// Kullanıcı metni hiçbir zaman HTML olarak işlenmez (React kaçışlar); burada kontrol karakterleri ve uzunluk temizlenir.
export const clean = (s, max = 500) => String(s ?? '').replace(/[\u0000-\u0008\u000B-\u001F\u007F‪-‮]/g, '').replace(/[<>]/g, '').trim().slice(0, max)
export const normPhone = s => { const d = String(s).replace(/\D/g, ''); const t = d.startsWith('90') ? d.slice(2) : d.startsWith('0') ? d.slice(1) : d; return /^5\d{9}$/.test(t) ? '+90' + t : null }
export const fmtPhone = p => { const t = p.replace('+90', ''); return `0${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6, 8)} ${t.slice(8)}` }
export const maskPhone = p => (p ? `0${p.slice(3, 5)}* *** ** ${p.slice(-2)}` : '—')
export const maskTail = (last, len = 11) => (last ? '*'.repeat(len - last.length) + last : '—')
export const maskPlate = p => (p ? p.split(' ')[0] + ' *** ' + p.slice(-2) : '—')
export const validTC = s => {
  if (!/^[1-9]\d{10}$/.test(s)) return false
  const d = [...s].map(Number), o = d[0] + d[2] + d[4] + d[6] + d[8], e = d[1] + d[3] + d[5] + d[7]
  return ((o * 7 - e) % 10 + 10) % 10 === d[9] && d.slice(0, 10).reduce((a, b) => a + b) % 10 === d[10]
}
export const validVKN = s => /^\d{10}$/.test(s)
export const validPlate = s => /^(0[1-9]|[1-7]\d|8[01]) ?[A-ZÇĞİÖŞÜ]{1,3} ?\d{2,5}$/.test(s.toUpperCase().trim())
export const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// ---------- Kalıcı demo veritabanı (localStorage) ----------
// Hassas veriler (T.C. / VKN) tam hâliyle hiç saklanmaz; yalnızca son 3 hane tutulur.
const KEY = 'svt:db:v1', SKEY = 'svt:session', VERSION = 1
const seed = () => ({
  v: VERSION, users: D.SEED_USERS, listings: D.SEED_LISTINGS, conversations: D.SEED_CONVERSATIONS, offers: [], jobs: [], reviews: [],
  notifications: D.SEED_NOTIFS, complaints: [{ id: 'k1', targetType: 'listing', targetId: 131, reporterId: 'u4', reason: 'Yanlış fiyat', text: 'Bütçe piyasanın çok altında görünüyor.', status: 'OPEN', at: Date.now() - 864e5 }],
  tollRates: D.SEED_TOLLS, fuelPrices: D.SEED_FUEL, sources: D.SEED_SOURCES, settings: D.SEED_SETTINGS, audit: [], consents: {}, privacyRequests: [], shareLog: [],
  favorites: {}, searches: {}, nextListing: 141
})
const read = () => {
  try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === VERSION && Array.isArray(x.users) && Array.isArray(x.listings)) return x } catch { /* bozuk veri: yeniden kur */ }
  return seed()
}
let db = read(), subs = new Set()
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); return true } catch { return false } }
persist()
export const getDB = () => db
export const subscribe = fn => { subs.add(fn); return () => subs.delete(fn) }
export const useDB = () => useSyncExternalStore(subscribe, getDB)
export function mutate(fn) { const next = structuredClone(db); fn(next); db = next; persist(); subs.forEach(f => f()) }
export const resetDB = () => { db = seed(); persist(); subs.forEach(f => f()) }
addEventListener('storage', e => { if (e.key === KEY) { db = read(); subs.forEach(f => f()) } })

export function audit(d, actorId, action, target, before, after) {
  d.audit.unshift({ id: uid('a'), actorId, action, target: String(target), before: before ?? null, after: after ?? null, at: Date.now() })
  d.audit.length = Math.min(d.audit.length, 1000)
}
export function notify(d, userId, text, priority = 'normal', link = '', type = 'info') {
  d.notifications.unshift({ id: uid('n'), userId, type, priority, text, link, at: Date.now(), read: false })
}

// ---------- Oturum ----------
const TTL = { user: 7 * 864e5, admin: 60 * 60e3 }
export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SKEY))
    const u = s && db.users.find(x => x.id === s.userId)
    if (!u || s.exp < Date.now() || u.status === 'SUSPENDED' || u.status === 'DELETED') return null
    return u
  } catch { return null }
}
export const startSession = u => localStorage.setItem(SKEY, JSON.stringify({ userId: u.id, exp: Date.now() + (u.role === 'admin' ? TTL.admin : TTL.user) }))
export const endSession = () => localStorage.removeItem(SKEY)

// OTP deneme sınırı: 5 hatalı denemede 60 sn kilit
const LKEY = 'svt:otp'
export function otpCheck(code) {
  let s; try { s = JSON.parse(localStorage.getItem(LKEY)) || { n: 0, until: 0 } } catch { s = { n: 0, until: 0 } }
  if (s.until > Date.now()) return { ok: false, msg: `Çok fazla hatalı deneme. ${Math.ceil((s.until - Date.now()) / 1000)} saniye sonra tekrar deneyin.` }
  if (code === '123456') { localStorage.removeItem(LKEY); return { ok: true } }
  s.n++; if (s.n >= 5) { s.until = Date.now() + 60e3; s.n = 0 }
  localStorage.setItem(LKEY, JSON.stringify(s))
  return { ok: false, msg: 'Kod hatalı. Lütfen tekrar deneyin.' }
}

// ---------- Konum / rota ----------
export const cityNames = D.PLACES.map(p => p.city)
export function coord(city, district) {
  const c = D.PLACES.find(p => p.city === city); if (!c) return null
  const d = c.districts.find(x => x[0] === district)
  return d ? { lat: d[1], lon: d[2], zone: d[3], side: d[4] || c.side || 'AS' } : { lat: c.lat, lon: c.lon, zone: '', side: c.side || 'AS' }
}
export function km(a, b) {
  if (!a || !b) return null
  const r = x => (x * Math.PI) / 180, R = 6371
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
export const roadKm = (f, t) => { const k = km(coord(f.city, f.district), coord(t.city, t.district)); return k == null ? null : Math.max(5, Math.round(k * 1.25)) }

// Yasal rota değerlendirmesi: kesin hüküm vermez, uyarı üretir.
export function routeInfo(from, to, tollClass, tolls) {
  const r = D.ComplianceRules.routeRestrictions[`${from.city}|${to.city}`] || D.ComplianceRules.routeRestrictions[`${to.city}|${from.city}`]
  const segments = (r?.segments || []).map(s => tolls.find(t => t.segment === s && t.vehicleClass === tollClass)).filter(Boolean)
  const a = coord(from.city, from.district), b = coord(to.city, to.district)
  const notes = []; let status = 'UYGUN'
  const crosses = a && b && a.side !== b.side
  for (const v of D.ComplianceRules.vehicleRestrictions) if (v.rule === 'bosphorus' && crosses && tollClass >= v.minClass) { status = 'KISITLI'; notes.push(v.text) }
  if (!r) notes.push('Bu rota için geçiş verisi yok; otoyol ve köprü ücreti hesaplanmadı.')
  notes.push('Geçiş kısıtlamaları değişebilir. Resmî kaynaklardan kontrol edin.')
  return { km: roadKm(from, to), segments, toll: segments.reduce((s, x) => s + x.price, 0), status, notes, hasData: !!r }
}
export function costEstimate(l, d) {
  const r = routeInfo(l.from, l.to, l.tollClass, d.tollRates)
  const veh = D.VEHICLES.find(v => v.id === l.vehicleType) || D.VEHICLES[4]
  const fuelP = d.fuelPrices.find(f => f.id === 'motorin')
  const fuel = r.km ? (r.km * veh.fuel / 100) * fuelP.price : 0
  return { ...r, fuel, fuelPrice: fuelP, total: fuel + r.toll, perKm: veh.fuel }
}

// ---------- Basit doğal dil arama: "Arnavutköyden İzmir'e tır" ----------
const lower = s => s.toLocaleLowerCase('tr-TR')
const SUFFIX = /('|’)?(dan|den|tan|ten|ndan|nden|ya|ye|a|e|na|ne|da|de|ta|te)$/
const VKEYS = { cekici: ['tır', 'tir', 'çekici', 'cekici', 'dorse'], kamyon: ['kamyon'], kamyonet: ['kamyonet'], panelvan: ['panelvan', 'van'] }
export function parseQuery(q) {
  const out = { places: [] }
  const words = lower(q).replace(/[→>\-,]/g, ' ').split(/\s+/).filter(Boolean)
  for (const w of words) {
    const t = parseFloat(w.replace(',', '.')); if (/ton$/.test(w) || (words[words.indexOf(w) + 1] === 'ton' && t)) { if (t) out.tonnage = t; continue }
    if (/^[1-6]\.?$/.test(w) && words[words.indexOf(w) + 1]?.startsWith('sınıf')) { out.tollClass = +w[0]; continue }
    const v = Object.entries(VKEYS).find(([, ks]) => ks.includes(w)); if (v) { out.vehicle = v[0]; continue }
    if (w === 'parsiyel' || w === 'komple') { out.mode = w; continue }
    const stem = [w, w.replace(SUFFIX, '')]
    let hit = null
    for (const p of D.PLACES) {
      if (stem.includes(lower(p.city))) { hit = { city: p.city, district: '' }; break }
      const dd = p.districts.find(d => stem.includes(lower(d[0]))); if (dd) { hit = { city: p.city, district: dd[0] }; break }
    }
    if (hit) out.places.push({ ...hit, dir: /(dan|den|tan|ten)$/.test(w) ? 'from' : /(ya|ye|a|e|na|ne)$/.test(w.replace(/['’]/g, '')) ? 'to' : '' })
  }
  const from = out.places.find(p => p.dir === 'from') || out.places.find(p => p.dir !== 'to')
  const to = out.places.find(p => p !== from)
  return { from, to, vehicle: out.vehicle, tonnage: out.tonnage, tollClass: out.tollClass, mode: out.mode }
}

// ---------- Eşleştirme skoru (deterministik) ----------
export function matchScore(l, u, d, origin) {
  const veh = u?.vehicles?.[0]
  const o = origin || (u && coord(u.city, u.district))
  const dist = o ? km(o, coord(l.from.city, l.from.district)) : null
  const location = dist == null ? 0.5 : Math.max(0, 1 - dist / 150)
  const vehicle = !veh ? 0.5 : veh.type === l.vehicleType ? (l.tonnage && veh.tonnage < l.tonnage ? 0.4 : 1) : 0.2
  const route = 0.6 + (l.to.city === u?.city ? 0.4 : 0)
  const needSrc = l.reqs.src, hasSrc = u?.docs?.src && u.docs.src.status !== 'EXPIRED'
  const document = (!needSrc || hasSrc ? 0.7 : 0) + (!l.reqs.psiko || u?.docs?.psiko ? 0.3 : 0)
  const dd = (Date.parse(l.date) - Date.parse(today())) / 864e5
  const date = dd < 0 ? 0 : dd <= 2 ? 1 : Math.max(0, 1 - dd / 10)
  const budget = l.budget ? 1 : 0.5
  const trust = trustProfile(d.users.find(x => x.id === l.ownerId), d).pct / 100
  const s = location * 25 + vehicle * 20 + route * 15 + document * 15 + date * 10 + budget * 10 + trust * 5
  return { score: Math.round(s), dist: dist == null ? null : Math.round(dist * 1.2) }
}

// ---------- Güven profili (platform içi gösterge; resmî puan değildir) ----------
export function trustProfile(u, d) {
  if (!u) return { pct: 0, items: [] }
  const reviews = d.reviews.filter(r => r.toId === u.id)
  const complaints = d.complaints.filter(c => (c.targetType === 'user' && c.targetId === u.id) || (c.targetType === 'listing' && d.listings.find(l => l.id === c.targetId)?.ownerId === u.id)).filter(c => c.status === 'UPHELD')
  const docReviewed = Object.values(u.docs || {}).some(x => ['PLATFORM_REVIEWED', 'OFFICIAL_VERIFIED'].includes(x.status))
  const items = [
    ['Telefon doğrulandı', u.phoneVerified, 20],
    ['Profil tamamlandı', !!(u.name && u.city && u.role), 15],
    ['Belge incelendi', docReviewed, 20],
    ['Araç bilgisi mevcut', (u.vehicles || []).length > 0 || ['shipper', 'company'].includes(u.role), 10],
    [`Tamamlanan iş: ${u.completedJobs || 0}`, (u.completedJobs || 0) >= 5, 15],
    [`Değerlendirme: ${reviews.length}`, reviews.length === 0 || reviews.filter(r => r.positive >= 3).length / reviews.length >= 0.7, 10],
    [complaints.length ? `Onaylanan şikâyet: ${complaints.length}` : 'Onaylanmış şikâyet yok', complaints.length === 0, 10]
  ]
  return { pct: items.reduce((s, [, ok, w]) => s + (ok ? w : 0), 0) - (u.warnings || 0) * 5, items }
}
