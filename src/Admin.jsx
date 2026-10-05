import React, { useState } from 'react'
import * as D from './data.js'
import { useDB, mutate, audit, notify, resetDB, endSession, tl, dateTR, timeTR, today, maskPhone, maskPlate, trustProfile, clean, uid } from './lib.js'
import { go, Icon, Tag, Note, Field, Toggle, Modal } from './ui.jsx'
import { placeTxt, vehLabel } from './App.jsx'

const TABS = [['genel', 'Genel Bakış'], ['ilanlar', 'İlanlar'], ['kullanicilar', 'Kullanıcılar'], ['sikayetler', 'Şikâyetler'], ['belgeler', 'Belgeler'], ['sponsorlu', 'Sponsorlu İlanlar'], ['isler', 'İş Emirleri'], ['ucretler', 'Rota Ücretleri'], ['akaryakit', 'Akaryakıt'], ['kaynaklar', 'Veri Kaynakları'], ['kvkk', 'KVKK Talepleri'], ['ayarlar', 'Sistem Ayarları'], ['audit', 'İşlem Kayıtları']]

// Her yönetici işlemi işlem kaydına (audit log) yazılır.
const act = (me, action, target, fn) => mutate(x => { const r = fn(x) || {}; audit(x, me.id, action, target, r.before, r.after) })
const Btn = ({ tone = 's', children, ...p }) => <button className={`${tone === 'p' ? 'btn-p' : tone === 'd' ? 'btn-d' : 'btn-s'} min-h-[44px] px-3`} {...p}>{children}</button>
const Table = ({ head, children }) => <div className="overflow-x-auto card"><table className="w-full text-left text-base"><thead className="bg-bg"><tr>{head.map(h => <th key={h} className="p-2 font-bold whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-line">{children}</tbody></table></div>
const Td = ({ children, className = '' }) => <td className={`p-2 align-top ${className}`}>{children}</td>

export default function Admin({ me, tab }) {
  const d = useDB()
  const counts = { ilanlar: d.listings.filter(l => l.status === 'PENDING').length, sikayetler: d.complaints.filter(c => ['OPEN', 'IN_REVIEW'].includes(c.status)).length, belgeler: d.users.flatMap(u => Object.values(u.docs || {})).filter(x => ['IN_REVIEW', 'DECLARED'].includes(x.status)).length, kvkk: d.privacyRequests.filter(r => r.status === 'OPEN').length }
  const Page = { genel: Overview, ilanlar: Listings, kullanicilar: Users, sikayetler: Complaints, belgeler: Docs, sponsorlu: Sponsored, isler: Jobs, ucretler: Tolls, akaryakit: Fuel, kaynaklar: Sources, kvkk: Privacy, ayarlar: Settings, audit: AuditLog }[tab] || Overview
  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><h1 className="h1 flex-1">Yönetim</h1><Tag tone="warn">Oturum 1 saat geçerli</Tag></div>
      <nav aria-label="Yönetim menüsü" className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {TABS.map(([k, l]) => <a key={k} href={'#/admin/' + k} aria-current={tab === k ? 'page' : undefined} className={`btn min-h-[44px] shrink-0 ${tab === k ? 'bg-navy text-white border-navy' : 'bg-white border-line text-navy'}`}>{l}{counts[k] > 0 && <span className="bg-act text-white rounded-full px-2 text-sm">{counts[k]}</span>}</a>)}
      </nav>
      <Page me={me} d={d} counts={counts} />
    </div>
  )
}

function Overview({ d, counts }) {
  const stats = [['Kullanıcı', d.users.filter(u => u.role !== 'admin' && u.status !== 'DELETED').length], ['Yayındaki ilan', d.listings.filter(l => l.status === 'APPROVED').length], ['Onay bekleyen ilan', counts.ilanlar, 'ilanlar'], ['Açık şikâyet', counts.sikayetler, 'sikayetler'], ['İncelenecek belge', counts.belgeler, 'belgeler'], ['Açık KVKK talebi', counts.kvkk, 'kvkk'], ['Teklif', d.offers.length], ['İş emri', d.jobs.length]]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{stats.map(([l, v, t]) => <a key={l} href={t ? '#/admin/' + t : undefined} className={`card p-4 ${t && v ? 'border-act' : ''}`}><p className="text-3xl font-bold text-navy">{v}</p><p>{l}</p></a>)}</div>
      <section className="card p-4"><h2 className="h2 mb-2">Son işlemler</h2><ul>{d.audit.slice(0, 8).map(a => <li key={a.id} className="py-1 border-b border-line last:border-0"><b>{a.actorId}</b> · {a.action} · {a.target} <span className="text-slate-600">{timeTR(a.at)}</span></li>)}</ul></section>
      <Note>Bu panel demo amaçlıdır; tüm veriler bu tarayıcıda saklanır. Gerçek yayında yetkilendirme ve işlem kayıtları sunucu tarafında tutulmalıdır.</Note>
    </div>
  )
}

function Listings({ me, d }) {
  const [st, setSt] = useState('PENDING'), [q, setQ] = useState(''), [reject, setReject] = useState(null), [reason, setReason] = useState('')
  const list = d.listings.filter(l => (!st || l.status === st) && (!q || `${l.id} ${l.from.city} ${l.to.city}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))))
  const setStatus = (l, s, msg) => act(me, 'LISTING_' + s, 'listing#' + l.id, x => { const t = x.listings.find(y => y.id === l.id), b = t.status; t.status = s; notify(x, t.ownerId, msg || `İlan #${t.id}: ${D.LISTING_STATUS[s]}`, s === 'REJECTED' ? 'important' : 'normal', '/ilan/' + t.id, 'listing'); return { before: b, after: s } })
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <select className="inp w-auto" value={st} onChange={e => setSt(e.target.value)} aria-label="Durum"><option value="">Tüm durumlar</option>{Object.entries(D.LISTING_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input className="inp flex-1 min-w-[160px]" placeholder="İlan no veya şehir" value={q} onChange={e => setQ(e.target.value)} aria-label="İlan ara" />
      </div>
      <Table head={['No', 'Rota', 'Sahibi', 'Bütçe', 'Durum', 'İşlem']}>
        {list.map(l => <tr key={l.id}>
          <Td><a className="underline font-bold" href={'#/ilan/' + l.id}>#{l.id}</a></Td>
          <Td>{placeTxt(l.from)} → {placeTxt(l.to)}<br /><span className="text-slate-600">{D.LISTING_TYPES[l.type].label} · {vehLabel(l.vehicleType)} · {dateTR(l.date)}</span>{l.note && <span className="block text-slate-700">“{l.note}”</span>}</Td>
          <Td>{d.users.find(u => u.id === l.ownerId)?.name}</Td><Td>{tl(l.budget)}</Td>
          <Td><Tag tone={l.status === 'APPROVED' ? 'ok' : ['REJECTED', 'SUSPENDED'].includes(l.status) ? 'err' : 'warn'}>{D.LISTING_STATUS[l.status]}</Tag>{l.isSponsored && <Tag tone="act">SPONSORLU</Tag>}</Td>
          <Td><div className="flex flex-wrap gap-1">
            {l.status !== 'APPROVED' && <Btn tone="p" onClick={() => setStatus(l, 'APPROVED', `İlan #${l.id} onaylandı ve yayında.`)}>Onayla</Btn>}
            {l.status !== 'REJECTED' && <Btn onClick={() => { setReject(l); setReason('') }}>Reddet</Btn>}
            {l.status === 'APPROVED' && <Btn onClick={() => setStatus(l, 'SUSPENDED')}>Askıya al</Btn>}
            <Btn onClick={() => go('/ilan-ver?id=' + l.id)}>Düzenle</Btn>
            <Btn tone="d" onClick={() => confirm(`İlan #${l.id} kalıcı olarak silinsin mi?`) && act(me, 'LISTING_DELETED', 'listing#' + l.id, x => { x.listings = x.listings.filter(y => y.id !== l.id); return { before: l.status, after: 'DELETED' } })}>Sil</Btn>
          </div></Td>
        </tr>)}
      </Table>
      {!list.length && <p className="mt-3">Bu filtrede ilan yok.</p>}
      {reject && <Modal title={`İlan #${reject.id} reddet`} onClose={() => setReject(null)}>
        <Field label="Red nedeni (kullanıcıya gönderilir)"><textarea className="inp min-h-[96px] py-2" maxLength={300} value={reason} onChange={e => setReason(e.target.value)} /></Field>
        <Btn tone="d" disabled={!reason.trim()} onClick={() => { setStatus(reject, 'REJECTED', `İlan #${reject.id} reddedildi: ${clean(reason, 300)}`); setReject(null) }}>Reddet ve bildir</Btn>
      </Modal>}
    </div>
  )
}

function Users({ me, d }) {
  const [q, setQ] = useState(''), [sel, setSel] = useState(null)
  const list = d.users.filter(u => u.id !== me.id && (!q || `${u.name} ${u.company || ''} ${u.city} ${u.phone}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))))
  const upd = (u, action, fn, msg) => act(me, action, 'user#' + u.id, x => { const t = x.users.find(y => y.id === u.id); const r = fn(t, x); if (msg) notify(x, t.id, msg, 'important', '/profil', 'admin'); return r })
  const s = sel && d.users.find(u => u.id === sel)
  return (
    <div>
      <input className="inp mb-3" placeholder="Ad, firma, şehir veya telefon" value={q} onChange={e => setQ(e.target.value)} aria-label="Kullanıcı ara" />
      <Table head={['Ad', 'Rol', 'Şehir', 'Telefon', 'Güven', 'Durum', '']}>
        {list.map(u => <tr key={u.id}>
          <Td><b>{u.name}</b>{u.company && <span className="block text-slate-600">{u.company}</span>}</Td><Td>{D.ROLES[u.role] || '—'}</Td><Td>{u.city || '—'}</Td><Td>{maskPhone(u.phone)}</Td>
          <Td>%{trustProfile(u, d).pct}</Td><Td><Tag tone={u.status === 'ACTIVE' ? 'ok' : 'err'}>{{ ACTIVE: 'Aktif', SUSPENDED: 'Askıda', DELETED: 'Silindi' }[u.status]}</Tag>{u.warnings > 0 && <Tag tone="warn">{u.warnings} uyarı</Tag>}</Td>
          <Td><Btn onClick={() => setSel(u.id)}>Yönet</Btn></Td>
        </tr>)}
      </Table>
      {s && <Modal title={s.name} onClose={() => setSel(null)}>
        <p className="mb-2">{s.id} · Kayıt: {dateTR(s.createdAt)} · {s.completedJobs || 0} iş · {s.vehicles.map(v => maskPlate(v.plate)).join(', ')}</p>
        <Field label="Rol"><select className="inp" value={s.role} onChange={e => upd(s, 'USER_ROLE_CHANGED', t => { const b = t.role; t.role = e.target.value; return { before: b, after: t.role } })}>{Object.entries(D.ROLES).filter(([k]) => k !== 'admin').map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Toggle label="Telefon doğrulandı olarak işaretle (demo)" checked={s.phoneVerified} onChange={v => upd(s, 'USER_PHONE_VERIFIED', t => { t.phoneVerified = v; return { before: !v, after: v } })} />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Btn onClick={() => upd(s, 'USER_WARNED', t => { t.warnings = (t.warnings || 0) + 1; return { after: t.warnings } }, 'Platform kurallarına aykırı davranış nedeniyle uyarı aldınız.')}>Kullanıcıyı uyar</Btn>
          {s.status === 'ACTIVE' ? <Btn tone="d" onClick={() => upd(s, 'USER_SUSPENDED', t => { t.status = 'SUSPENDED'; return { before: 'ACTIVE', after: 'SUSPENDED' } })}>Askıya al</Btn>
            : <Btn tone="p" onClick={() => upd(s, 'USER_ACTIVATED', t => { const b = t.status; t.status = 'ACTIVE'; return { before: b, after: 'ACTIVE' } })}>Etkinleştir</Btn>}
          <Btn onClick={() => upd(s, 'USER_WARNINGS_CLEARED', t => { t.warnings = 0 })}>Uyarıları sıfırla</Btn>
          <Btn tone="d" onClick={() => confirm('Kullanıcı silinsin ve verileri anonimleştirilsin mi?') && (anonymize(me, s.id), setSel(null))}>Sil / anonimleştir</Btn>
        </div>
      </Modal>}
    </div>
  )
}
function anonymize(me, id) {
  act(me, 'USER_DELETED', 'user#' + id, x => {
    const u = x.users.find(y => y.id === id)
    Object.assign(u, { name: 'Silinmiş kullanıcı', phone: '', company: '', tcLast: '', vehicles: [], docs: {}, status: 'DELETED' })
    x.listings.forEach(l => { if (l.ownerId === id && ['APPROVED', 'PENDING'].includes(l.status)) l.status = 'CANCELLED' })
    delete x.consents[id]; delete x.favorites[id]; delete x.searches[id]
    return { before: 'ACTIVE', after: 'DELETED' }
  })
}

function Complaints({ me, d }) {
  const [st, setSt] = useState('open')
  const list = d.complaints.filter(c => st === 'all' || (st === 'open' ? ['OPEN', 'IN_REVIEW'].includes(c.status) : !['OPEN', 'IN_REVIEW'].includes(c.status)))
  const ownerOf = c => c.targetType === 'user' ? c.targetId : c.targetType === 'listing' ? d.listings.find(l => l.id === c.targetId)?.ownerId : null
  const set = (c, s, extra) => act(me, 'COMPLAINT_' + s, 'complaint#' + c.id, x => {
    const t = x.complaints.find(y => y.id === c.id), b = t.status; t.status = s
    if (s !== 'IN_REVIEW') notify(x, t.reporterId, `Şikâyetiniz sonuçlandı: ${{ UPHELD: 'haklı bulundu', DISMISSED: 'reddedildi' }[s] || s}.`, 'normal', '', 'complaint')
    extra?.(x); return { before: b, after: s }
  })
  const STAT = { OPEN: ['Yeni', 'warn'], IN_REVIEW: ['İncelemede', 'warn'], UPHELD: ['Onaylandı', 'err'], DISMISSED: ['Reddedildi', 'ok'] }
  return (
    <div>
      <select className="inp w-auto mb-3" value={st} onChange={e => setSt(e.target.value)} aria-label="Filtre"><option value="open">Açık</option><option value="closed">Kapanmış</option><option value="all">Tümü</option></select>
      <div className="space-y-2">{list.map(c => { const oid = ownerOf(c), owner = d.users.find(u => u.id === oid); return (
        <section key={c.id} className="card p-4">
          <div className="flex flex-wrap gap-2 items-center"><b className="text-lg flex-1">{c.reason}</b><Tag tone={STAT[c.status][1]}>{STAT[c.status][0]}</Tag></div>
          <p>Hedef: {c.targetType === 'listing' ? <a className="underline" href={'#/ilan/' + c.targetId}>İlan #{c.targetId}</a> : c.targetType === 'job' ? <a className="underline" href={'#/is/' + c.targetId}>İş emri</a> : 'Kullanıcı'} {owner && `· ${owner.name}`} · Bildiren: {d.users.find(u => u.id === c.reporterId)?.name} · {timeTR(c.at)}</p>
          {c.text && <p className="mt-1">“{c.text}”</p>}
          {['OPEN', 'IN_REVIEW'].includes(c.status) && <div className="flex flex-wrap gap-1 mt-2">
            {c.status === 'OPEN' && <Btn onClick={() => set(c, 'IN_REVIEW')}>İncele</Btn>}
            <Btn tone="p" onClick={() => set(c, 'UPHELD')}>Onayla (haklı)</Btn>
            <Btn onClick={() => set(c, 'DISMISSED')}>Reddet</Btn>
            {c.targetType === 'listing' && <Btn tone="d" onClick={() => set(c, 'UPHELD', x => { const l = x.listings.find(y => y.id === c.targetId); if (l) l.status = 'SUSPENDED' })}>İlanı askıya al</Btn>}
            {oid && <Btn onClick={() => set(c, 'UPHELD', x => { const u = x.users.find(y => y.id === oid); u.warnings = (u.warnings || 0) + 1; notify(x, oid, 'Hakkınızdaki bir şikâyet haklı bulundu. Hesabınıza uyarı eklendi.', 'urgent', '', 'admin') })}>Kullanıcıyı uyar</Btn>}
            {oid && <Btn tone="d" onClick={() => set(c, 'UPHELD', x => { x.users.find(y => y.id === oid).status = 'SUSPENDED' })}>Kullanıcıyı askıya al</Btn>}
          </div>}
        </section>) })}
        {!list.length && <p>Bu filtrede şikâyet yok.</p>}
      </div>
    </div>
  )
}

function Docs({ me, d }) {
  const rows = d.users.flatMap(u => Object.entries(u.docs || {}).map(([k, doc]) => ({ u, k, doc }))).sort((a, b) => ['IN_REVIEW', 'DECLARED'].includes(b.doc.status) - ['IN_REVIEW', 'DECLARED'].includes(a.doc.status))
  const set = (r, s) => act(me, 'DOC_' + s, `user#${r.u.id}/doc:${r.k}`, x => { const doc = x.users.find(y => y.id === r.u.id).docs[r.k], b = doc.status; doc.status = s; notify(x, r.u.id, `${D.DOC_TYPES[r.k]}: ${D.DOC_STATUS[s].label}`, 'important', '/profil/belgeler', 'doc'); return { before: b, after: s } })
  return (
    <div>
      <div className="mb-3"><Note>“Resmî entegrasyonla doğrulandı” durumu, gerçek bir resmî entegrasyon olmadan atanamaz.</Note></div>
      <Table head={['Kullanıcı', 'Belge', 'Bilgi', 'Durum', 'İşlem']}>
        {rows.map(r => <tr key={r.u.id + r.k}>
          <Td>{r.u.name}</Td><Td>{D.DOC_TYPES[r.k]}</Td><Td>{r.doc.level} {r.doc.no} · Bitiş: {dateTR(r.doc.expires)}{r.doc.expires < today() && <b className="text-err"> (dolmuş)</b>}</Td>
          <Td><Tag tone={D.DOC_STATUS[r.doc.status].tone}>{D.DOC_STATUS[r.doc.status].label}</Tag></Td>
          <Td><div className="flex flex-wrap gap-1">
            {r.doc.status !== 'PLATFORM_REVIEWED' && <Btn tone="p" onClick={() => set(r, 'PLATFORM_REVIEWED')}>İncelendi</Btn>}
            {r.doc.status !== 'REJECTED' && <Btn onClick={() => set(r, 'REJECTED')}>Reddet</Btn>}
            {r.doc.status !== 'EXPIRED' && <Btn onClick={() => set(r, 'EXPIRED')}>Süresi dolmuş</Btn>}
            <Btn disabled title="Resmî entegrasyon yok">Resmî doğrula</Btn>
          </div></Td>
        </tr>)}
      </Table>
    </div>
  )
}

function Sponsored({ me, d }) {
  const live = d.listings.filter(l => l.status === 'APPROVED')
  const n = live.filter(l => l.isSponsored).length
  return (
    <div>
      <p className="mb-3">Aktif sponsorlu ilan: <b>{n}</b> · Ana sayfada en fazla {d.settings.maxSponsored} gösterilir. Sponsorlu ilanlar her zaman “SPONSORLU” etiketiyle görünür.</p>
      <Table head={['No', 'Rota', 'Sahibi', 'Sponsorlu']}>
        {live.map(l => <tr key={l.id}><Td>#{l.id}</Td><Td>{l.from.city} → {l.to.city}</Td><Td>{d.users.find(u => u.id === l.ownerId)?.name}</Td>
          <Td><Toggle label={l.isSponsored ? 'Evet' : 'Hayır'} checked={l.isSponsored} onChange={v => act(me, v ? 'SPONSOR_ON' : 'SPONSOR_OFF', 'listing#' + l.id, x => { x.listings.find(y => y.id === l.id).isSponsored = v; return { before: !v, after: v } })} /></Td></tr>)}
      </Table>
    </div>
  )
}

function Jobs({ me, d }) {
  return (
    <Table head={['İş', 'Rota', 'Taşıyan', 'Yük sahibi', 'Ücret', 'Durum', 'İşlem']}>
      {d.jobs.map(j => { const l = d.listings.find(x => x.id === j.listingId); return <tr key={j.id}>
        <Td><a className="underline" href={'#/is/' + j.id}>{j.id}</a></Td><Td>{l?.from.city} → {l?.to.city}</Td><Td>{d.users.find(u => u.id === j.carrierId)?.name}</Td><Td>{d.users.find(u => u.id === j.shipperId)?.name}</Td><Td>{tl(j.price)}</Td>
        <Td><Tag tone={j.status === 'DISPUTED' ? 'err' : j.status === 'COMPLETED' ? 'ok' : 'warn'}>{D.JOB_STATUS[j.status]}</Tag></Td>
        <Td><select className="inp w-auto" value={j.status} aria-label="Durum değiştir" onChange={e => act(me, 'JOB_STATUS_ADMIN', 'job#' + j.id, x => { const t = x.jobs.find(y => y.id === j.id), b = t.status; t.status = e.target.value; t.history.push({ s: t.status, at: Date.now() }); return { before: b, after: t.status } })}>{Object.entries(D.JOB_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Td>
      </tr> })}
      {!d.jobs.length && <tr><Td>Henüz iş emri yok.</Td></tr>}
    </Table>
  )
}

function Tolls({ me, d }) {
  const [f, setF] = useState({ segment: '', road: '', operator: 'KGM', entry: '', exit: '', vehicleClass: 1, price: '', source: 'DEMO VERİ', effectiveFrom: today(), effectiveTo: '' }), [err, setErr] = useState('')
  const save = (t, k, v) => act(me, 'TOLL_UPDATED', 'toll#' + t.id, x => { const r = x.tollRates.find(y => y.id === t.id), b = r[k]; r[k] = v; r.updatedAt = today(); return { before: `${k}=${b}`, after: `${k}=${v}` } })
  const add = () => {
    if (!f.segment || !f.road || !(+f.price > 0)) return setErr('Lütfen segment kodu, yol adı ve fiyatı girin.')
    act(me, 'TOLL_ADDED', 'toll#' + f.segment, x => { x.tollRates.push({ ...f, id: uid('t'), segment: clean(f.segment, 20).toUpperCase(), road: clean(f.road, 80), entry: clean(f.entry, 40), exit: clean(f.exit, 40), source: clean(f.source, 120), price: +f.price, vehicleClass: +f.vehicleClass, updatedAt: today() }) }); setErr('')
  }
  return (
    <div className="space-y-4">
      <Note tone="warn">Tüm ücretler DEMO VERİ'dir. Gerçek KGM tarifesiyle güncellenmeden yayına alınmamalıdır. Rota → segment eşlemesi ComplianceRules.routeRestrictions içinde tutulur.</Note>
      <Table head={['Segment', 'Yol', 'Giriş → Çıkış', 'Sınıf', 'Fiyat (₺)', 'Geçerlilik', 'Kaynak', '']}>
        {d.tollRates.map(t => <tr key={t.id}>
          <Td>{t.segment}</Td><Td>{t.road}<span className="block text-slate-600">{t.operator}</span></Td><Td>{t.entry} → {t.exit}</Td><Td>{t.vehicleClass}</Td>
          <Td><input className="inp w-28" inputMode="numeric" defaultValue={t.price} aria-label="Fiyat" onBlur={e => { const v = +e.target.value; if (v > 0 && v !== t.price) save(t, 'price', v) }} /></Td>
          <Td>{dateTR(t.effectiveFrom)} – {t.effectiveTo ? dateTR(t.effectiveTo) : '…'}<span className="block text-slate-600">Güncelleme: {dateTR(t.updatedAt)}</span></Td><Td>{t.source}</Td>
          <Td><Btn tone="d" onClick={() => act(me, 'TOLL_DELETED', 'toll#' + t.id, x => { x.tollRates = x.tollRates.filter(y => y.id !== t.id) })}>Sil</Btn></Td>
        </tr>)}
      </Table>
      <section className="card p-4"><h2 className="h2 mb-2">Ücret ekle</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2">
          {[['segment', 'Segment kodu'], ['road', 'Yol / köprü'], ['operator', 'İşletmeci'], ['entry', 'Giriş'], ['exit', 'Çıkış'], ['price', 'Fiyat (₺)'], ['source', 'Kaynak']].map(([k, l]) => <Field key={k} label={l}><input className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></Field>)}
          <Field label="Sınıf"><select className="inp" value={f.vehicleClass} onChange={e => setF({ ...f, vehicleClass: +e.target.value })}>{[1, 2, 3, 4, 5, 6].map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Başlangıç"><input type="date" className="inp" value={f.effectiveFrom} onChange={e => setF({ ...f, effectiveFrom: e.target.value })} /></Field>
          <Field label="Bitiş"><input type="date" className="inp" value={f.effectiveTo} onChange={e => setF({ ...f, effectiveTo: e.target.value })} /></Field>
        </div>
        {err && <p className="text-err font-bold mb-2" role="alert">{err}</p>}
        <Btn tone="p" onClick={add}>Ekle</Btn>
      </section>
    </div>
  )
}

function Fuel({ me, d }) {
  return (
    <div className="space-y-2 max-w-xl">
      <Note tone="warn">Canlı akaryakıt API'si bağlı değil. Fiyatlar “Demo fiyat” olarak gösterilir.</Note>
      {d.fuelPrices.map(f => <section key={f.id} className="card p-4 grid grid-cols-2 gap-x-2">
        <h2 className="h2 col-span-2 mb-2">{f.label}</h2>
        <Field label="Fiyat (TL/L)"><input className="inp" inputMode="decimal" defaultValue={f.price} onBlur={e => { const v = +e.target.value.replace(',', '.'); if (v > 0 && v < 500 && v !== f.price) act(me, 'FUEL_UPDATED', 'fuel#' + f.id, x => { const t = x.fuelPrices.find(y => y.id === f.id), b = t.price; t.price = v; t.date = today(); return { before: b, after: v } }) }} /></Field>
        <Field label="Kaynak"><input className="inp" defaultValue={f.source} onBlur={e => { const v = clean(e.target.value, 60); if (v && v !== f.source) act(me, 'FUEL_SOURCE', 'fuel#' + f.id, x => { x.fuelPrices.find(y => y.id === f.id).source = v }) }} /></Field>
        <p className="col-span-2 text-slate-600">Son güncelleme: {dateTR(f.date)}</p>
      </section>)}
    </div>
  )
}

function Sources({ me, d }) {
  const upd = (s, k, v) => act(me, 'SOURCE_UPDATED', 'source#' + s.id, x => { const t = x.sources.find(y => y.id === s.id), b = t[k]; t[k] = clean(v, 300); t.lastChecked = today(); return { before: b, after: t[k] } })
  return (
    <div className="space-y-2">
      {d.sources.map(s => <section key={s.id} className="card p-4">
        <h2 className="h2 mb-2">{s.name}</h2>
        <div className="grid md:grid-cols-2 gap-x-2">{[['source', 'Kaynak'], ['sourceUrl', 'Kaynak adresi'], ['effectiveDate', 'Yürürlük tarihi'], ['notes', 'Notlar']].map(([k, l]) => <Field key={k} label={l}><input className="inp" type={k === 'effectiveDate' ? 'date' : 'text'} defaultValue={s[k]} onBlur={e => e.target.value !== s[k] && upd(s, k, e.target.value)} /></Field>)}</div>
        <p className="text-slate-600">Son kontrol: {dateTR(s.lastChecked)}</p>
      </section>)}
      <Btn tone="p" onClick={() => act(me, 'SOURCE_ADDED', 'source', x => { x.sources.push({ id: uid('s'), name: 'Yeni kaynak', source: '', sourceUrl: '', effectiveDate: today(), lastChecked: today(), notes: '' }) })}>Kaynak ekle</Btn>
    </div>
  )
}

function Privacy({ me, d }) {
  const T = { ACCESS: 'Bilgi talebi', CORRECT: 'Düzeltme', OBJECT: 'İtiraz', DELETE: 'Hesap silme' }
  const set = (r, s) => act(me, 'PRIVACY_' + s, 'privacy#' + r.id, x => {
    const t = x.privacyRequests.find(y => y.id === r.id); t.status = s; t.closedAt = Date.now()
    notify(x, r.userId, `${T[r.type]} talebiniz ${s === 'DONE' ? 'tamamlandı' : 'reddedildi'}.`, 'important', '/gizlilik', 'privacy')
    return { before: 'OPEN', after: s }
  })
  return (
    <div className="space-y-2">
      <Note>KVKK başvuruları en geç 30 gün içinde sonuçlandırılmalıdır.</Note>
      {d.privacyRequests.map(r => { const u = d.users.find(x => x.id === r.userId), left = 30 - Math.floor((Date.now() - r.at) / 864e5); return (
        <section key={r.id} className="card p-4">
          <div className="flex gap-2 items-center"><b className="flex-1 text-lg">{T[r.type]} · {u?.name}</b><Tag tone={r.status === 'OPEN' ? (left < 7 ? 'err' : 'warn') : 'ok'}>{r.status === 'OPEN' ? `${left} gün kaldı` : r.status === 'DONE' ? 'Tamamlandı' : 'Reddedildi'}</Tag></div>
          <p>{timeTR(r.at)}{r.text && ` · “${r.text}”`}</p>
          {r.status === 'OPEN' && <div className="flex flex-wrap gap-1 mt-2">
            {r.type === 'DELETE' ? <Btn tone="d" onClick={() => { anonymize(me, r.userId); set(r, 'DONE') }}>Hesabı sil ve tamamla</Btn> : <Btn tone="p" onClick={() => set(r, 'DONE')}>Tamamlandı</Btn>}
            <Btn onClick={() => set(r, 'REJECTED')}>Reddet</Btn>
          </div>}
        </section>) })}
      {!d.privacyRequests.length && <p>Talep yok.</p>}
    </div>
  )
}

function Settings({ me, d }) {
  const s = d.settings
  const set = (k, v) => act(me, 'SETTING_CHANGED', 'settings.' + k, x => { const b = x.settings[k]; x.settings[k] = v; return { before: b, after: v } })
  return (
    <div className="max-w-xl space-y-4">
      <section className="card p-4">
        <Toggle label="İlanları otomatik onayla" desc="Kapalıyken yeni ilanlar yönetici onayından sonra yayınlanır." checked={s.autoApprove} onChange={v => set('autoApprove', v)} />
        <Toggle label="Yeni kayıtlara izin ver" checked={s.allowRegistration} onChange={v => set('allowRegistration', v)} />
        <Toggle label="Bakım modu" desc="Açıkken yönetici dışındaki kullanıcılar uygulamayı kullanamaz." checked={s.maintenance} onChange={v => set('maintenance', v)} />
        <Field label="Ana sayfada en fazla sponsorlu ilan"><input className="inp mt-3" type="number" min={0} max={10} defaultValue={s.maxSponsored} onBlur={e => set('maxSponsored', Math.max(0, Math.min(10, +e.target.value || 0)))} /></Field>
        <Field label="Duyuru (tüm kullanıcılara üstte gösterilir)"><input className="inp" maxLength={160} defaultValue={s.announcement} onBlur={e => set('announcement', clean(e.target.value, 160))} /></Field>
      </section>
      <section className="card p-4">
        <h2 className="h2 mb-2">Demo veriler</h2>
        <p className="mb-2">Tüm ilanlar, kullanıcılar, mesajlar ve ayarlar başlangıç hâline döner.</p>
        <Btn tone="d" onClick={() => { if (confirm('Tüm demo veriler sıfırlansın mı?')) { resetDB(); endSession(); go('/') } }}>Demo verileri sıfırla</Btn>
      </section>
    </div>
  )
}

function AuditLog({ d }) {
  const [q, setQ] = useState('')
  const list = d.audit.filter(a => !q || `${a.actorId} ${a.action} ${a.target}`.toLowerCase().includes(q.toLowerCase()))
  const csv = () => {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`
    const rows = [['Zaman', 'Kim', 'İşlem', 'Kayıt', 'Önceki', 'Yeni'], ...list.map(a => [new Date(a.at).toISOString(), a.actorId, a.action, a.target, a.before, a.after])]
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(esc).join(';')).join('\n')], { type: 'text/csv' })); link.download = 'islem-kayitlari.csv'; link.click(); URL.revokeObjectURL(link.href)
  }
  return (
    <div>
      <div className="flex gap-2 mb-3"><input className="inp flex-1" placeholder="Kim, işlem veya kayıt ara" value={q} onChange={e => setQ(e.target.value)} aria-label="Kayıt ara" /><Btn onClick={csv}>CSV indir</Btn></div>
      <Table head={['Zaman', 'Kim', 'Ne yaptı', 'Kayıt', 'Önceki', 'Yeni']}>
        {list.slice(0, 300).map(a => <tr key={a.id}><Td className="whitespace-nowrap">{timeTR(a.at)}</Td><Td>{a.actorId}</Td><Td>{a.action}</Td><Td>{a.target}</Td><Td>{String(a.before ?? '—')}</Td><Td>{String(a.after ?? '—')}</Td></tr>)}
      </Table>
      {!list.length && <p className="mt-3">Kayıt yok.</p>}
    </div>
  )
}
