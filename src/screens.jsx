import React, { useEffect, useRef, useState } from 'react'
import * as D from './data.js'
import { useDB, getDB, mutate, audit, notify, startSession, endSession, otpCheck, normPhone, fmtPhone, maskPhone, maskTail, maskPlate, validTC, validPlate, tl, num, dateTR, timeTR, today, daysUntil, trustProfile, clean, uid } from './lib.js'
import { go, Icon, Tag, Note, Header, Choice, Field, Modal, Empty, Toggle } from './ui.jsx'
import { ListingCard, ReportModal, vehLabel, placeTxt } from './App.jsx'

// ---------- Giriş ----------
export function Auth() {
  const [mode, setMode] = useState('phone'), [phone, setPhone] = useState(''), [email, setEmail] = useState(''), [code, setCode] = useState(''), [sent, setSent] = useState(false), [err, setErr] = useState(''), [kvkk, setKvkk] = useState(false)
  const d = useDB()
  const sendCode = e => {
    e.preventDefault(); setErr('')
    if (mode === 'phone' && !normPhone(phone)) return setErr('Lütfen 05XX XXX XX XX biçiminde bir cep telefonu girin.')
    if (mode === 'admin' && clean(email).toLowerCase() !== 'admin@servisteyim.demo') return setErr('Bu e-posta ile yönetici hesabı bulunamadı.')
    setSent(true)
  }
  const verify = e => {
    e.preventDefault()
    const r = otpCheck(code.trim()); if (!r.ok) return setErr(r.msg)
    const db = getDB()
    let u = mode === 'admin' ? db.users.find(x => x.role === 'admin') : db.users.find(x => x.phone === normPhone(phone))
    if (u && u.status === 'SUSPENDED') return setErr('Hesabınız geçici olarak askıya alındı. Destek için bizimle iletişime geçin.')
    if (u && u.status === 'DELETED') return setErr('Bu hesap silinmiş.')
    if (!u) {
      if (!db.settings.allowRegistration) return setErr('Yeni kayıtlar şu an kapalı.')
      u = { id: uid('u'), name: 'Yeni Kullanıcı', phone: normPhone(phone), role: '', city: '', phoneVerified: false, status: 'ACTIVE', completedJobs: 0, createdAt: today(), vehicles: [], docs: {} }
      mutate(x => { x.users.push(u); audit(x, u.id, 'USER_REGISTERED', u.id, null, 'ACTIVE') })
    }
    mutate(x => audit(x, u.id, mode === 'admin' ? 'ADMIN_LOGIN' : 'LOGIN', u.id, null, null))
    startSession(u); go(mode === 'admin' ? '/admin' : '/')
  }
  return (
    <div className="min-h-screen bg-navy text-white flex flex-col">
      <div className="max-w-md w-full mx-auto p-6 flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-wide">SERVİSTEYİM</h1>
        <p className="text-xl mt-1 mb-8">Yükün de işin de burada.</p>
        <div className="bg-white text-ink rounded p-5">
          {!sent ? <form onSubmit={sendCode} noValidate>
            {mode === 'phone' ? <Field label="Cep telefonu" error={err}><div className="flex"><span className="inp w-auto flex items-center bg-bg rounded-r-none border-r-0">+90</span><input className="inp rounded-l-none" type="tel" inputMode="tel" autoComplete="tel" placeholder="5XX XXX XX XX" value={phone} onChange={e => { setErr(''); setPhone(e.target.value.slice(0, 16)) }} /></div></Field>
              : <Field label="Yönetici e-postası" error={err}><input className="inp" type="email" autoComplete="username" value={email} onChange={e => { setErr(''); setEmail(e.target.value) }} placeholder="admin@servisteyim.demo" /></Field>}
            {mode === 'phone' && <Toggle checked={kvkk} onChange={setKvkk} label="Aydınlatma metnini okudum." desc={<>Kişisel verilerin nasıl işlendiği hakkında bilgilendirme. <button type="button" className="underline font-bold" onClick={() => setMode('info')}>Metni oku</button></>} />}
            <button className="btn-p w-full min-h-[56px] text-lg mt-2" disabled={mode === 'phone' && !kvkk}>Kod gönder</button>
            <button type="button" className="btn-s w-full mt-2" onClick={() => { setErr(''); setMode(mode === 'admin' ? 'phone' : 'admin') }}>{mode === 'admin' ? 'Telefonla giriş' : 'Yönetici girişi'}</button>
            <p className="mt-4 text-slate-600">Demo: <b>0555 555 55 55</b> (Mehmet Kaya, şoför) · yönetici: <b>admin@servisteyim.demo</b></p>
          </form> : <form onSubmit={verify} noValidate>
            <Note tone="warn">DEMO OTP: Gerçek SMS gönderilmez. Kod: <b>123456</b></Note>
            <Field label="6 haneli kod" error={err}><input className="inp text-2xl tracking-[0.5em] text-center mt-3" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => { setErr(''); setCode(e.target.value.replace(/\D/g, '')) }} autoFocus /></Field>
            <button className="btn-p w-full min-h-[56px] text-lg" disabled={code.length !== 6}>Giriş yap</button>
            <button type="button" className="btn-s w-full mt-2" onClick={() => { setSent(false); setCode(''); setErr('') }}>Geri</button>
          </form>}
          {mode === 'info' && <Modal title="Aydınlatma Metni" onClose={() => setMode('phone')}><Aydinlatma /><button className="btn-p w-full mt-3" onClick={() => { setKvkk(true); setMode('phone') }}>Okudum</button></Modal>}
        </div>
        <p className="mt-6 text-slate-300">Bu bir demo sürümdür. Gerçek para transferi, SMS ve resmî doğrulama yapılmaz.</p>
      </div>
    </div>
  )
}
const Aydinlatma = () => (
  <div className="space-y-2">
    <p><b>Kim?</b> Servisteyim (veri sorumlusu) — demo sürüm.</p>
    <p><b>Hangi veriler?</b> Telefon, ad, rol, şehir, araç ve belge bilgileri, ilan ve mesajlarınız.</p>
    <p><b>Neden?</b> Hesabınızı açmak, ilanları göstermek, sizi ilgili kişilerle eşleştirmek ve güvenliği sağlamak için.</p>
    <p><b>Kimlerle paylaşılır?</b> Yalnızca sizin onayladığınız kişilerle ve yasal zorunluluk hâlinde yetkili kurumlarla.</p>
    <p><b>Haklarınız:</b> Verilerinizi görme, düzeltme, silme ve itiraz etme hakkınız var. Gizlilik Merkezi'nden talep oluşturabilirsiniz.</p>
    <p className="text-slate-600">Bu metin bilgilendirmedir; açık rıza değildir. İsteğe bağlı izinleri Gizlilik Merkezi'nden ayrıca yönetirsiniz.</p>
  </div>
)

// ---------- Mesajlar ----------
export function Messages({ me }) {
  const d = useDB()
  const list = d.conversations.filter(c => c.members.includes(me.id)).sort((a, b) => b.updatedAt - a.updatedAt)
  const jobs = d.jobs.filter(j => j.carrierId === me.id || j.shipperId === me.id)
  return (
    <div>
      <Header title="Mesajlar" noBack />
      {jobs.length > 0 && <section className="mb-6"><h2 className="h2 mb-2">İş emirlerim</h2><ul className="space-y-2">{jobs.map(j => { const l = d.listings.find(x => x.id === j.listingId); return <li key={j.id}><a href={'#/is/' + j.id} className="card p-4 flex items-center gap-3"><Icon n="work" /><span className="flex-1 font-bold">{l?.from.city} → {l?.to.city}</span><Tag tone={j.status === 'COMPLETED' ? 'ok' : j.status === 'DISPUTED' ? 'err' : 'warn'}>{D.JOB_STATUS[j.status]}</Tag></a></li> })}</ul></section>}
      {list.length ? <ul className="space-y-2">{list.map(c => {
        const other = d.users.find(u => u.id === c.members.find(m => m !== me.id)), l = d.listings.find(x => x.id === c.listingId), last = c.messages.at(-1)
        return <li key={c.id}><a href={'#/mesajlar/' + c.id} className="card p-4 flex gap-3 items-center">
          <div className="flex-1 min-w-0"><p className="font-bold text-lg">{other?.company || other?.name}</p><p className="text-slate-700">{l ? `${l.from.city} → ${l.to.city}` : 'İlan kaldırıldı'}</p><p className="truncate">{last ? (last.type === 'text' ? last.text : last.type === 'offer' ? 'Teklif' : 'Operasyon özeti') : 'Henüz mesaj yok'}</p></div>
          {c.unread?.[me.id] > 0 && <span className="bg-act text-white rounded-full px-2 font-bold" aria-label="okunmamış">{c.unread[me.id]}</span>}
        </a></li>
      })}</ul> : <Empty text="Henüz mesajınız yok. Bir ilan açıp “İletişime geç”e dokunun."><button className="btn-p" onClick={() => go('/ara')}>İlan ara</button></Empty>}
    </div>
  )
}

const pushMsg = (x, c, from, m) => { c.messages.push({ id: uid('m'), from, at: Date.now(), ...m }); c.updatedAt = Date.now(); c.members.filter(id => id !== from).forEach(id => { c.unread[id] = (c.unread[id] || 0) + 1 }) }
// Karşı taraf demo simülasyonu (gerçek kullanıcı yokken akışı göstermek için)
function simulate(cid, me, kind, offerId) {
  setTimeout(() => mutate(x => {
    const c = x.conversations.find(c => c.id === cid); if (!c) return
    const other = c.members.find(m => m !== me.id), l = x.listings.find(y => y.id === c.listingId)
    if (kind === 'offer') {
      const o = x.offers.find(o => o.id === offerId); if (!o || o.status !== 'PENDING') return
      const ok = !l?.budget || o.price >= l.budget * 0.9
      o.status = ok ? 'ACCEPTED' : 'REJECTED'
      pushMsg(x, c, other, { type: 'text', text: ok ? 'Teklifinizi kabul ettim. İş emri oluşturuldu. (Demo otomatik yanıt)' : 'Teşekkürler, bu fiyat bizim için uygun değil. (Demo otomatik yanıt)' })
      notify(x, me.id, ok ? 'Teklifiniz kabul edildi.' : 'Teklifiniz reddedildi.', 'important', '/mesajlar/' + cid, 'offer')
      if (ok) createJob(x, o, l, me.id)
    } else pushMsg(x, c, other, { type: 'text', text: 'Mesajınızı aldım, kısa süre içinde dönüş yapacağım. (Demo otomatik yanıt)' })
  }), 2000)
}
function createJob(x, o, l, actor) {
  const carrierIsOfferer = D.LISTING_TYPES[l.type].cat === 'yuk'
  const j = { id: uid('j'), listingId: l.id, offerId: o.id, price: o.price, carrierId: carrierIsOfferer ? o.fromId : l.ownerId, shipperId: carrierIsOfferer ? l.ownerId : o.fromId, status: 'CREATED', history: [{ s: 'CREATED', at: Date.now() }], receiver: '', proof: null, reviews: {} }
  x.jobs.unshift(j); audit(x, actor, 'JOB_CREATED', 'job#' + j.id, null, 'CREATED')
  x.conversations.find(c => c.id === o.convId).jobId = j.id
}

export function Chat({ me, id, drive }) {
  const d = useDB(), c = d.conversations.find(c => c.id === id && c.members.includes(me.id))
  const [text, setText] = useState(''), [offer, setOffer] = useState(false), [summary, setSummary] = useState(false), [report, setReport] = useState(false)
  const end = useRef()
  useEffect(() => { if (c?.unread?.[me.id]) mutate(x => { x.conversations.find(y => y.id === id).unread[me.id] = 0 }) ; end.current?.scrollIntoView() }, [c?.messages.length])
  if (!c) return <Empty text="Bu konuşma bulunamadı."><button className="btn-p" onClick={() => go('/mesajlar')}>Mesajlara dön</button></Empty>
  const other = d.users.find(u => u.id === c.members.find(m => m !== me.id)), l = d.listings.find(x => x.id === c.listingId)
  const send = t => {
    const v = clean(t, 1000); if (!v) return
    mutate(x => { const cc = x.conversations.find(y => y.id === id); pushMsg(x, cc, me.id, { type: 'text', text: v }); notify(x, other.id, `${me.name} size mesaj gönderdi.`, 'important', '/mesajlar/' + id, 'msg') })
    setText(''); if (c.messages.filter(m => m.from === me.id).length < 2) simulate(id, me, 'text')
  }
  return (
    <div className="max-w-2xl flex flex-col min-h-[calc(100vh-9rem)]">
      <Header title={other?.company || other?.name} right={<button className="btn-s px-3" onClick={() => setReport(true)} aria-label="Kullanıcıyı şikâyet et"><Icon n="flag" /></button>} />
      {l && <a href={'#/ilan/' + l.id} className="card p-3 mb-3 flex items-center gap-2"><Icon n="route" /><b className="flex-1">{l.from.city} → {l.to.city}</b><span className="font-bold">{tl(l.budget)}</span></a>}
      {c.jobId && <a href={'#/is/' + c.jobId} className="btn-p w-full mb-3"><Icon n="work" />İş emrini aç</a>}
      <ol className="flex-1 space-y-2 mb-3" aria-live="polite">
        {c.messages.map(m => <Msg key={m.id} m={m} me={me} d={d} />)}
        <li ref={end} />
      </ol>
      {drive ? <Note tone="warn">Sürüş modundasınız. Mesaj yazmak için güvenli bir yerde durun ve sürüş modunu kapatın.</Note> : <>
        <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Hızlı mesajlar">{D.QUICK_MSGS.map(q => <button key={q} className="btn-s min-h-[44px] shrink-0 font-normal" onClick={() => send(q)}>{q}</button>)}</div>
        <div className="flex gap-2 mb-2">
          <button className="btn-s flex-1" onClick={() => setOffer(true)}><Icon n="money" />Teklif ver</button>
          <button className="btn-s flex-1" onClick={() => setSummary(true)}><Icon n="doc" />Operasyon özeti</button>
        </div>
        <form className="flex gap-2 sticky bottom-16 md:bottom-0 bg-bg py-2" onSubmit={e => { e.preventDefault(); send(text) }}>
          <input className="inp flex-1" value={text} maxLength={1000} onChange={e => setText(e.target.value)} placeholder="Mesaj yaz" aria-label="Mesaj" />
          <button className="btn-p" disabled={!text.trim()}><Icon n="send" />Gönder</button>
        </form>
      </>}
      {offer && <OfferModal me={me} c={c} l={l} onClose={() => setOffer(false)} />}
      {summary && <SummaryModal me={me} c={c} l={l} other={other} onClose={() => setSummary(false)} />}
      {report && <ReportModal me={me} targetType="user" targetId={other.id} onClose={() => setReport(false)} />}
    </div>
  )
}
function Msg({ m, me, d }) {
  const mine = m.from === me.id
  const box = `max-w-[85%] p-3 rounded border ${mine ? 'ml-auto bg-orange-50 border-orange-200' : 'bg-white border-line'}`
  if (m.type === 'offer') {
    const o = d.offers.find(o => o.id === m.offerId)
    const canAnswer = !mine && o?.status === 'PENDING'
    const answer = ok => mutate(x => {
      const oo = x.offers.find(y => y.id === o.id); oo.status = ok ? 'ACCEPTED' : 'REJECTED'
      notify(x, oo.fromId, ok ? 'Teklifiniz kabul edildi.' : 'Teklifiniz reddedildi.', 'important', '/mesajlar/' + oo.convId, 'offer')
      if (ok) createJob(x, oo, x.listings.find(l => l.id === oo.listingId), me.id)
    })
    return <li className={box}><p className="font-bold flex items-center gap-1"><Icon n="money" s={18} />Teklif</p>
      <p className="text-2xl font-bold">{tl(o?.price)}</p><p>Geçiş ücretleri: {o?.tolls ? 'Dahil' : 'Hariç'} · Yakıt: {o?.fuel ? 'Dahil' : 'Hariç'}</p><p>Geçerlilik: {o?.hours} saat</p>
      <p className="mt-1"><Tag tone={o?.status === 'ACCEPTED' ? 'ok' : o?.status === 'PENDING' ? 'warn' : 'err'}>{D.OFFER_STATUS[o?.status]}</Tag></p>
      {canAnswer && <div className="flex gap-2 mt-2"><button className="btn-p flex-1" onClick={() => answer(true)}>Kabul et</button><button className="btn-s flex-1" onClick={() => answer(false)}>Reddet</button></div>}
      {mine && o?.status === 'PENDING' && <button className="btn-s w-full mt-2" onClick={() => mutate(x => { x.offers.find(y => y.id === o.id).status = 'CANCELLED' })}>Teklifi geri çek</button>}
      <p className="text-sm text-slate-600 mt-1">{timeTR(m.at)}</p></li>
  }
  if (m.type === 'summary') return <li className={box}><p className="font-bold flex items-center gap-1"><Icon n="doc" s={18} />Operasyon özeti</p><dl>{m.fields.map(([k, v]) => <div key={k} className="flex gap-2"><dt className="text-slate-600">{k}:</dt><dd className="font-bold">{v}</dd></div>)}</dl><p className="text-sm text-slate-600 mt-1">{timeTR(m.at)}</p></li>
  return <li className={box}><p className="whitespace-pre-wrap break-words">{m.text}</p><p className="text-sm text-slate-600 mt-1">{timeTR(m.at)}</p></li>
}
function OfferModal({ me, c, l, onClose }) {
  const [price, setPrice] = useState(String(l?.budget || '')), [tolls, setTolls] = useState(true), [fuel, setFuel] = useState(true), [hours, setHours] = useState(24), [err, setErr] = useState('')
  const send = () => {
    if (!(+price >= 100 && +price <= 5e6)) return setErr('Lütfen 100 ₺ ile 5.000.000 ₺ arasında bir ücret girin.')
    const oid = uid('o')
    mutate(x => {
      x.offers.unshift({ id: oid, convId: c.id, listingId: l.id, fromId: me.id, price: +price, tolls, fuel, hours, status: 'PENDING', at: Date.now(), expiresAt: Date.now() + hours * 36e5 })
      const cc = x.conversations.find(y => y.id === c.id); pushMsg(x, cc, me.id, { type: 'offer', offerId: oid })
      notify(x, cc.members.find(m => m !== me.id), `${me.name} size teklif gönderdi.`, 'important', '/mesajlar/' + c.id, 'offer')
      audit(x, me.id, 'OFFER_SENT', 'offer#' + oid, null, 'PENDING')
    })
    simulate(c.id, me, 'offer', oid); onClose()
  }
  return (
    <Modal title="Teklif ver" onClose={onClose}>
      <Field label="Sefer ücreti (₺)" error={err}><input className="inp text-2xl" inputMode="numeric" value={price} onChange={e => { setErr(''); setPrice(e.target.value.replace(/\D/g, '').slice(0, 7)) }} /></Field>
      <p className="lbl">Geçiş ücretleri</p><Choice name="Geçiş ücretleri" value={tolls} onChange={setTolls} options={[[true, 'Dahil'], [false, 'Hariç']]} />
      <p className="lbl mt-3">Yakıt</p><Choice name="Yakıt" value={fuel} onChange={setFuel} options={[[true, 'Dahil'], [false, 'Hariç']]} />
      <p className="lbl mt-3">Teklif süresi</p><Choice cols={3} name="Teklif süresi" value={hours} onChange={setHours} options={[[6, '6 saat'], [24, '24 saat'], [48, '48 saat']]} />
      <p className="text-slate-600 mt-3">Platform üzerinden para transferi yapılmaz. Ödeme koşullarını taraflar belirler.</p>
      <button className="btn-p w-full min-h-[56px] mt-3" onClick={send}>Teklif gönder</button>
    </Modal>
  )
}
function SummaryModal({ me, c, l, other, onClose }) {
  const d = useDB(), consent = d.consents[me.id] || {}
  const v = me.vehicles?.[0]
  const all = [
    ['route', 'Rota', l ? `${placeTxt(l.from)} → ${placeTxt(l.to)}` : '—', true],
    ['vehicle', 'Araç', v ? `${vehLabel(v.type)} · ${v.tollClass}. sınıf · ${v.tonnage} ton` : '—', true],
    ['plate', 'Plaka', v?.plate || '—', true],
    ['driver', 'Sürücü bilgisi', me.name, true],
    ['phone', 'Telefon', me.phone ? fmtPhone(me.phone) : '—', false],
    ['tc', 'T.C. Kimlik No', me.tcLast ? maskTail(me.tcLast) + ' (maskeli)' : 'Kayıtlı değil', false]
  ]
  const [sel, setSel] = useState(Object.fromEntries(all.map(([k, , , def]) => [k, def]))), [confirm, setConfirm] = useState(false)
  const sensitiveOn = sel.tc || sel.phone
  const send = () => {
    const fields = all.filter(([k]) => sel[k]).map(([, label, val]) => [label, val])
    mutate(x => {
      pushMsg(x, x.conversations.find(y => y.id === c.id), me.id, { type: 'summary', fields })
      x.shareLog.unshift({ id: uid('s'), userId: me.id, toId: other.id, fields: fields.map(f => f[0]), at: Date.now() })
      audit(x, me.id, 'SUMMARY_SHARED', 'conv#' + c.id, null, fields.map(f => f[0]).join(', '))
    }); onClose()
  }
  return (
    <Modal title="Paylaşılacak bilgiler" onClose={onClose}>
      <p className="mb-2">Karşı taraf: <b>{other.company || other.name}</b>. Hangi bilgileri göreceğini siz seçersiniz.</p>
      {all.map(([k, label, val, def]) => <Toggle key={k} label={`${label}${def ? '' : ' (hassas)'}`} desc={val} checked={sel[k]} disabled={k === 'tc' && !consent.shareTc} onChange={x => { setConfirm(false); setSel(s => ({ ...s, [k]: x })) }} />)}
      {!consent.shareTc && <p className="text-slate-600 mt-1">T.C. kimlik paylaşımı için Gizlilik Merkezi'nden ayrıca izin vermeniz gerekir.</p>}
      {sensitiveOn && <div className="mt-3"><Toggle label="Hassas bilgiyi bu kişiyle paylaşmayı onaylıyorum." checked={confirm} onChange={setConfirm} /></div>}
      <button className="btn-p w-full min-h-[56px] mt-3" disabled={sensitiveOn && !confirm} onClick={send}>Özeti gönder</button>
    </Modal>
  )
}

// ---------- İş emri ----------
export function JobView({ me, id }) {
  const d = useDB(), j = d.jobs.find(j => j.id === id && (j.carrierId === me.id || j.shipperId === me.id || me.role === 'admin'))
  const [proof, setProof] = useState(''), [rev, setRev] = useState({}), [err, setErr] = useState('')
  if (!j) return <Empty text="İş emri bulunamadı."><button className="btn-p" onClick={() => go('/mesajlar')}>Mesajlara dön</button></Empty>
  const l = d.listings.find(x => x.id === j.listingId), carrier = d.users.find(u => u.id === j.carrierId), shipper = d.users.find(u => u.id === j.shipperId)
  const v = carrier?.vehicles?.[0], idx = D.JOB_FLOW.indexOf(j.status), nextS = D.JOB_FLOW[idx + 1]
  const otherId = me.id === j.carrierId ? j.shipperId : j.carrierId
  const advance = () => {
    if (nextS === 'DELIVERED' && !clean(proof)) return setErr('Lütfen teslim alan kişinin adını veya teslim notunu yazın.')
    mutate(x => {
      const t = x.jobs.find(y => y.id === id); audit(x, me.id, 'JOB_STATUS', 'job#' + id, t.status, nextS)
      t.status = nextS; t.history.push({ s: nextS, at: Date.now() })
      if (nextS === 'DELIVERED') t.proof = { note: clean(proof, 300), at: Date.now() }
      if (nextS === 'COMPLETED') { const ls = x.listings.find(y => y.id === t.listingId); if (ls) ls.status = 'COMPLETED'; [t.carrierId, t.shipperId].forEach(u => { const uu = x.users.find(z => z.id === u); if (uu) uu.completedJobs = (uu.completedJobs || 0) + 1 }) }
      notify(x, otherId, `İş durumu: ${D.JOB_STATUS[nextS]}`, 'important', '/is/' + id, 'job')
    }); setErr('')
  }
  const dispute = () => mutate(x => {
    const t = x.jobs.find(y => y.id === id); audit(x, me.id, 'JOB_STATUS', 'job#' + id, t.status, 'DISPUTED'); t.status = 'DISPUTED'
    x.complaints.unshift({ id: uid('k'), targetType: 'job', targetId: id, reporterId: me.id, reason: 'Anlaşmazlık', text: 'İş emri için anlaşmazlık bildirildi.', status: 'OPEN', at: Date.now() })
  })
  const myReview = j.reviews?.[me.id]
  const sendReview = () => mutate(x => {
    const t = x.jobs.find(y => y.id === id); t.reviews = { ...t.reviews, [me.id]: rev }
    x.reviews.push({ id: uid('r'), jobId: id, fromId: me.id, toId: otherId, metrics: rev, positive: Object.values(rev).filter(Boolean).length, at: Date.now() })
  })
  const uetds = { sender: shipper?.company || shipper?.name, receiver: j.receiver, date: l?.date && dateTR(l.date), plate: v?.plate && maskPlate(v.plate), cargo: l?.cargo, weight: l?.tonnage ? l.tonnage + ' ton' : '', loadPlace: l && placeTxt(l.from), unloadPlace: l && placeTxt(l.to), loadTime: j.history.find(h => h.s === 'LOADING') && timeTR(j.history.find(h => h.s === 'LOADING').at), unloadTime: j.history.find(h => h.s === 'DELIVERED') && timeTR(j.history.find(h => h.s === 'DELIVERED').at), driver: carrier?.name }
  const filled = D.ComplianceRules.uETDSRequirements.filter(([k]) => uetds[k]).length
  return (
    <div className="max-w-2xl space-y-4">
      <Header title="İş emri" />
      <div className="card p-4"><p className="text-2xl font-bold">{l?.from.city} → {l?.to.city}</p><p className="text-xl font-bold text-navy">{tl(j.price)}</p><p>Taşıyan: {carrier?.name} · Yük sahibi: {shipper?.company || shipper?.name}</p></div>
      <section className="card p-4">
        <h2 className="h2 mb-3">Durum</h2>
        <ol className="space-y-2">{D.JOB_FLOW.map((s, i) => { const h = j.history.find(x => x.s === s); return <li key={s} className="flex items-center gap-2"><span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${h ? 'bg-ok border-ok text-white' : 'border-line'}`}>{h ? <Icon n="check" s={18} /> : i + 1}</span><span className={`flex-1 ${h ? 'font-bold' : ''}`}>{D.JOB_STATUS[s]}</span>{h && <span className="text-slate-600">{timeTR(h.at)}</span>}</li> })}</ol>
        {j.status === 'DISPUTED' && <div className="mt-3"><Note tone="err">Anlaşmazlık bildirildi. Platform ekibi inceliyor.</Note></div>}
        {j.proof && <p className="mt-3"><b>Teslim kanıtı:</b> {j.proof.note}</p>}
        {nextS && j.status !== 'DISPUTED' && <div className="mt-4">
          {nextS === 'DELIVERED' && <Field label="Teslim kanıtı" error={err} hint="Teslim alan kişinin adı, irsaliye no veya not."><input className="inp" maxLength={300} value={proof} onChange={e => { setErr(''); setProof(e.target.value) }} /></Field>}
          <button className="btn-p w-full min-h-[56px]" onClick={advance}>{D.JOB_STATUS[nextS]} olarak işaretle</button>
          <button className="btn-d w-full mt-2" onClick={dispute}>Sorun bildir</button>
        </div>}
      </section>
      {j.status === 'COMPLETED' && <section className="card p-4">
        <h2 className="h2 mb-2">Değerlendirme</h2>
        {myReview ? <Note tone="ok" icon="check">Değerlendirmeniz kaydedildi. Teşekkürler.</Note> : <>
          {Object.entries(D.REVIEW_METRICS).map(([k, lbl]) => <Toggle key={k} label={lbl} checked={rev[k]} onChange={v => setRev(r => ({ ...r, [k]: v }))} />)}
          <button className="btn-p w-full mt-3" onClick={sendReview}>Değerlendirmeyi gönder</button>
        </>}
      </section>}
      <section className="card p-4">
        <div className="flex items-center gap-2 mb-2"><h2 className="h2 flex-1">U-ETDS hazırlık</h2><Tag>{filled} / {D.ComplianceRules.uETDSRequirements.length}</Tag></div>
        <p className="text-slate-700 mb-2">Bu bölüm yalnızca veri eşlemesidir. Servisteyim U-ETDS'ye bildirim yapmaz; bildirim yükümlülüğü ilgili taşımacıdadır.</p>
        <dl className="grid grid-cols-2 gap-y-1">{D.ComplianceRules.uETDSRequirements.map(([k, lbl]) => <React.Fragment key={k}><dt>{lbl}</dt><dd className={`text-right font-bold ${uetds[k] ? '' : 'text-err'}`}>{uetds[k] || 'Eksik'}</dd></React.Fragment>)}</dl>
        {!j.receiver && me.id === j.shipperId && <Field label="Alıcı (firma adı)"><input className="inp mt-2" maxLength={120} onBlur={e => { const r = clean(e.target.value, 120); if (r) mutate(x => { x.jobs.find(y => y.id === id).receiver = r }) }} /></Field>}
      </section>
    </div>
  )
}

// ---------- Profil ----------
function TrustBox({ u }) {
  const d = useDB(), t = trustProfile(u, d)
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2"><Icon n="shield" /><h2 className="h2 flex-1">Güven profili</h2><span className="text-2xl font-bold">%{Math.max(0, t.pct)}</span></div>
      <ul className="mt-2">{t.items.map(([l, ok]) => <li key={l} className="flex items-center gap-2 py-1"><Icon n={ok ? 'check' : 'x'} s={20} className={ok ? 'text-ok' : 'text-err'} /><span>{l}</span><span className="sr-only">{ok ? 'var' : 'yok'}</span></li>)}</ul>
      <p className="text-slate-600 mt-2">Bu oran platform içi davranış ve beyanlardan hesaplanır. Devlet veya resmî kurum tarafından verilen bir puan değildir.</p>
    </section>
  )
}
export function Profile({ me }) {
  const d = useDB(), [edit, setEdit] = useState(false)
  const [f, setF] = useState({ name: me.name, city: me.city, role: me.role, company: me.company || '' }), [err, setErr] = useState('')
  const save = () => {
    const name = clean(f.name, 60); if (name.length < 3) return setErr('Lütfen adınızı ve soyadınızı yazın.')
    mutate(x => { const u = x.users.find(u => u.id === me.id); audit(x, me.id, 'PROFILE_UPDATED', me.id, `${u.name}/${u.role}`, `${name}/${f.role}`); Object.assign(u, { name, city: f.city, role: f.role, company: clean(f.company, 80) }) })
    setEdit(false)
  }
  const jobs = d.jobs.filter(j => j.carrierId === me.id || j.shipperId === me.id)
  const reviews = d.reviews.filter(r => r.toId === me.id)
  const menu = [['/ilanlarim', 'list', 'İlanlarım'], ['/profil/favoriler', 'star', 'Favoriler'], ['/profil/belgeler', 'doc', 'Belgelerim'], ['/bildirimler', 'bell', 'Bildirimler'], ['/gizlilik', 'lock', 'Gizlilik Merkezi']]
  return (
    <div className="max-w-2xl space-y-4">
      <Header title="Profil" noBack />
      <section className="card p-4 flex gap-4 items-center">
        <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold shrink-0" aria-hidden="true">{me.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
        <div className="flex-1 min-w-0"><p className="text-xl font-bold">{me.name}</p><p>{D.ROLES[me.role] || 'Rol seçilmedi'}{me.company && ` · ${me.company}`} · {me.city || 'Şehir yok'}</p>
          <p className="mt-1">{me.phoneVerified ? <Tag tone="ok" icon="check">Telefon doğrulandı (demo)</Tag> : <Tag tone="warn">Telefon doğrulanmadı</Tag>}</p></div>
      </section>
      {me.role === 'admin' ? <button className="btn-p w-full" onClick={() => go('/admin')}>Yönetim paneli</button> : <>
        {!edit ? <button className="btn-s w-full" onClick={() => setEdit(true)}>Profili düzenle</button> : <section className="card p-4">
          <Field label="Ad soyad" error={err}><input className="inp" value={f.name} maxLength={60} onChange={e => { setErr(''); setF({ ...f, name: e.target.value }) }} /></Field>
          <Field label="Şehir"><select className="inp" value={f.city} onChange={e => setF({ ...f, city: e.target.value })}><option value="">Seçin</option>{D.PLACES.map(p => <option key={p.city}>{p.city}</option>)}</select></Field>
          {['company', 'shipper'].includes(f.role) && <Field label="Firma adı"><input className="inp" maxLength={80} value={f.company} onChange={e => setF({ ...f, company: e.target.value })} /></Field>}
          <p className="lbl">Rol</p><Choice name="Rol" value={f.role} onChange={v => setF({ ...f, role: v })} options={[['driver', 'Şoför'], ['owner', 'Araç sahibi'], ['company', 'Firma'], ['shipper', 'Yük sahibi']]} />
          <div className="flex gap-2 mt-4"><button className="btn-s flex-1" onClick={() => setEdit(false)}>Vazgeç</button><button className="btn-p flex-1" onClick={save}>Kaydet</button></div>
        </section>}
        <TrustBox u={me} />
        <section className="card p-4">
          <div className="flex items-center mb-2"><h2 className="h2 flex-1">Araçlarım</h2><button className="btn-s" onClick={() => go('/profil/arac')}><Icon n="plus" />Araç ekle</button></div>
          {me.vehicles.length ? <ul className="space-y-2">{me.vehicles.map(v => <li key={v.id} className="border border-line rounded p-3 flex items-center gap-2"><Icon n="truck" /><div className="flex-1"><p className="font-bold">{v.plate} · {vehLabel(v.type)}</p><p>{v.brand} {v.model} {v.year} · {v.axles} aks · {v.tollClass}. sınıf · {v.tonnage} ton · {v.body}</p></div><button className="btn-s" onClick={() => go('/profil/arac/' + v.id)}>Düzenle</button></li>)}</ul> : <p>Henüz araç eklemediniz.</p>}
          <p className="text-slate-600 mt-2">Plakanız herkese açık profilde maskeli görünür: {me.vehicles[0] ? maskPlate(me.vehicles[0].plate) : '34 *** 23'}</p>
        </section>
        <section className="card p-4"><h2 className="h2 mb-2">İş geçmişi ve değerlendirmeler</h2><p>{me.completedJobs || 0} tamamlanan iş · {jobs.length} platform iş emri · {reviews.length} değerlendirme</p>
          {reviews.length > 0 && <ul className="mt-2">{Object.entries(D.REVIEW_METRICS).map(([k, l]) => <li key={k}>{l}: <b>{reviews.filter(r => r.metrics[k]).length} / {reviews.length}</b></li>)}</ul>}</section>
      </>}
      <nav className="card divide-y divide-line" aria-label="Profil menüsü">{menu.map(([p, i, l]) => <a key={p} href={'#' + p} className="flex items-center gap-3 px-4 min-h-[56px] font-bold"><Icon n={i} />{l}</a>)}</nav>
      <button className="btn-s w-full" onClick={() => { mutate(x => audit(x, me.id, 'LOGOUT', me.id)); endSession(); go('/') }}><Icon n="out" />Çıkış yap</button>
    </div>
  )
}
export function PublicProfile({ me, id }) {
  const d = useDB(), u = d.users.find(x => x.id === id && x.role !== 'admin')
  const pref = d.consents[id] || {}
  if (!u || u.status !== 'ACTIVE' || pref.privateProfile) return <Empty text="Bu profil görüntülenemiyor."><button className="btn-p" onClick={() => go('/')}>Ana sayfa</button></Empty>
  const ls = d.listings.filter(l => l.ownerId === id && l.status === 'APPROVED' && l.date >= today())
  return (
    <div className="max-w-2xl space-y-4">
      <Header title={u.company || u.name} />
      <p className="text-lg">{D.ROLES[u.role]} · {u.city} · {u.completedJobs || 0} tamamlanan iş · Telefon: {maskPhone(u.phone)}</p>
      {u.vehicles.map(v => <p key={v.id} className="card p-3"><b>{maskPlate(v.plate)}</b> · {vehLabel(v.type)} · {v.tollClass}. sınıf · {v.body}</p>)}
      <TrustBox u={u} />
      <section className="card p-4"><h2 className="h2 mb-2">Belgeler</h2>{Object.entries(D.DOC_TYPES).map(([k, l]) => { const doc = u.docs[k]; return <p key={k} className="flex justify-between py-1 border-b border-line last:border-0"><span>{l}</span>{doc ? <Tag tone={D.DOC_STATUS[doc.status].tone}>{D.DOC_STATUS[doc.status].label}</Tag> : <span className="text-slate-600">Yok</span>}</p> })}</section>
      {ls.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{ls.map(l => <ListingCard key={l.id} l={l} me={me} />)}</div>}
    </div>
  )
}

export function VehicleForm({ me, id }) {
  const ex = me.vehicles.find(v => v.id === id)
  const [f, setF] = useState(ex || { plate: '', type: '', brand: '', model: '', year: '', axles: '', tollClass: 0, tonnage: '', body: '', equipment: [] }), [err, setErr] = useState('')
  const set = (k, v) => { setErr(''); setF(x => ({ ...x, [k]: v })) }
  const save = () => {
    const plate = f.plate.toLocaleUpperCase('tr-TR').replace(/\s+/g, ' ').trim()
    if (!validPlate(plate)) return setErr('Lütfen geçerli bir plaka girin. Örn: 34 ABC 123')
    if (!f.type) return setErr('Lütfen araç tipini seçin.')
    if (!(+f.year >= 1980 && +f.year <= new Date().getFullYear() + 1)) return setErr('Lütfen geçerli bir model yılı girin.')
    if (!(+f.axles >= 2 && +f.axles <= 9)) return setErr('Lütfen aks sayısını girin (2–9).')
    if (!f.tollClass) return setErr('Lütfen otoyol sınıfını onaylayın.')
    const v = { ...f, id: ex?.id || uid('v'), plate, brand: clean(f.brand, 40), model: clean(f.model, 40), year: +f.year, axles: +f.axles, tonnage: +f.tonnage || 0 }
    mutate(x => { const u = x.users.find(u => u.id === me.id); u.vehicles = ex ? u.vehicles.map(y => y.id === ex.id ? v : y) : [...u.vehicles, v]; audit(x, me.id, ex ? 'VEHICLE_UPDATED' : 'VEHICLE_ADDED', 'vehicle#' + v.id, null, maskPlate(plate)) })
    go('/profil')
  }
  const del = () => { mutate(x => { const u = x.users.find(u => u.id === me.id); u.vehicles = u.vehicles.filter(y => y.id !== ex.id); audit(x, me.id, 'VEHICLE_DELETED', 'vehicle#' + ex.id) }); go('/profil') }
  return (
    <div className="max-w-xl">
      <Header title={ex ? 'Aracı düzenle' : 'Araç ekle'} />
      <Field label="Plaka" hint="Herkese açık profilde maskeli gösterilir."><input className="inp uppercase" maxLength={12} value={f.plate} onChange={e => set('plate', e.target.value)} placeholder="34 ABC 123" /></Field>
      <p className="lbl">Araç tipi</p><Choice name="Araç tipi" value={f.type} onChange={v => set('type', v)} options={D.VEHICLES.map(v => [v.id, v.label])} />
      <div className="grid grid-cols-2 gap-x-2 mt-4">
        <Field label="Marka"><input className="inp" maxLength={40} value={f.brand} onChange={e => set('brand', e.target.value)} /></Field>
        <Field label="Model"><input className="inp" maxLength={40} value={f.model} onChange={e => set('model', e.target.value)} /></Field>
        <Field label="Model yılı"><input className="inp" inputMode="numeric" maxLength={4} value={f.year} onChange={e => set('year', e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="Aks sayısı"><input className="inp" inputMode="numeric" maxLength={1} value={f.axles} onChange={e => { const a = +e.target.value.replace(/\D/g, ''); set('axles', a || ''); if (a >= 2) set('tollClass', D.ComplianceRules.tollClassByAxles(a)) }} /></Field>
        <Field label="Tonaj (ton)"><input className="inp" inputMode="decimal" maxLength={5} value={f.tonnage} onChange={e => set('tonnage', e.target.value.replace(/[^\d.]/g, ''))} /></Field>
        <Field label="Kasa"><select className="inp" value={f.body} onChange={e => set('body', e.target.value)}><option value="">Seçin</option>{D.BODIES.map(b => <option key={b}>{b}</option>)}</select></Field>
      </div>
      <p className="lbl">Otoyol (HGS) sınıfı</p><Choice cols={3} name="Otoyol sınıfı" value={f.tollClass} onChange={v => set('tollClass', v)} options={[1, 2, 3, 4, 5].map(c => [c, `${c}. sınıf`])} />
      <p className="text-slate-600 mt-1">Aks sayısından önerildi. {D.ComplianceRules.tollClassNote}</p>
      <p className="lbl mt-4">Özel ekipman</p>
      <div className="grid grid-cols-2 gap-x-2">{D.EQUIPMENT.map(e => <Toggle key={e} label={e} checked={f.equipment.includes(e)} onChange={v => set('equipment', v ? [...f.equipment, e] : f.equipment.filter(x => x !== e))} />)}</div>
      {err && <p className="text-err font-bold mt-3" role="alert">{err}</p>}
      <button className="btn-p w-full min-h-[56px] mt-4" onClick={save}>Kaydet</button>
      {ex && <button className="btn-d w-full mt-2" onClick={del}>Aracı sil</button>}
    </div>
  )
}

export function Documents({ me }) {
  const [open, setOpen] = useState(null), [f, setF] = useState({}), [err, setErr] = useState('')
  const [tc, setTc] = useState(''), [tcErr, setTcErr] = useState('')
  const save = () => {
    if (!f.expires || f.expires < today()) return setErr('Lütfen geçerlilik bitiş tarihini girin.')
    mutate(x => { const u = x.users.find(u => u.id === me.id); u.docs[open] = { status: 'IN_REVIEW', expires: f.expires, level: clean(f.level || '', 20), no: f.no ? '***' + f.no.replace(/\D/g, '').slice(-4) : '' }; audit(x, me.id, 'DOC_SUBMITTED', `doc:${open}`, null, 'IN_REVIEW') })
    setOpen(null); setF({})
  }
  const saveTc = () => {
    if (!validTC(tc)) return setTcErr('T.C. kimlik numarası geçerli görünmüyor. Lütfen kontrol edin.')
    mutate(x => { x.users.find(u => u.id === me.id).tcLast = tc.slice(-3); audit(x, me.id, 'TC_SAVED', me.id, null, 'masked') }); setTc('')
  }
  const need = D.ComplianceRules.documentRequirements[me.vehicles[0]?.type] || []
  return (
    <div className="max-w-2xl space-y-3">
      <Header title="Belgelerim" />
      <Note>Belgeler platform ekibi tarafından incelenir. Resmî kurumlarla entegrasyon henüz yoktur; bu nedenle hiçbir belge “resmî olarak doğrulandı” gösterilmez.</Note>
      {Object.entries(D.DOC_TYPES).map(([k, l]) => {
        const doc = me.docs[k], left = doc?.expires && daysUntil(doc.expires), st = doc && (left < 0 ? 'EXPIRED' : doc.status)
        return <section key={k} className="card p-4">
          <div className="flex items-center gap-2"><Icon n="doc" /><h2 className="text-lg font-bold flex-1">{l}{need.includes(k) && <span className="text-slate-600 font-normal"> · aracınız için önerilir</span>}</h2></div>
          {doc ? <><p className="mt-2"><Tag tone={D.DOC_STATUS[st].tone}>{D.DOC_STATUS[st].label}</Tag> {doc.level && <Tag>{doc.level}</Tag>}</p>
            <p className="mt-1">Geçerlilik: {dateTR(doc.expires)}{left >= 0 && left <= 30 && <b className="text-err"> · {left} gün kaldı</b>}{doc.no && ` · No: ${doc.no}`}</p></> : <p className="mt-1 text-slate-700">Eklenmedi</p>}
          <button className="btn-s w-full mt-3" onClick={() => { setOpen(k); setF({ level: doc?.level || '' }); setErr('') }}>{doc ? 'Güncelle' : 'Beyan et'}</button>
        </section>
      })}
      <section className="card p-4">
        <h2 className="text-lg font-bold">T.C. Kimlik No (hassas)</h2>
        <p>Kayıtlı: <b>{maskTail(me.tcLast)}</b></p>
        <p className="text-slate-600">Bu cihazda yalnızca son 3 hane saklanır. İlan, arama ve profilde gösterilmez.</p>
        <Field label="Güncelle" error={tcErr}><input className="inp mt-2" inputMode="numeric" maxLength={11} autoComplete="off" value={tc} onChange={e => { setTcErr(''); setTc(e.target.value.replace(/\D/g, '')) }} /></Field>
        <button className="btn-s w-full" disabled={tc.length !== 11} onClick={saveTc}>Kaydet</button>
      </section>
      {open && <Modal title={D.DOC_TYPES[open]} onClose={() => setOpen(null)}>
        {open === 'src' && <Field label="SRC türü"><select className="inp" value={f.level} onChange={e => setF({ ...f, level: e.target.value })}><option value="">Seçin</option>{['SRC 1', 'SRC 2', 'SRC 3', 'SRC 4', 'SRC 5'].map(s => <option key={s}>{s}</option>)}</select></Field>}
        {open === 'yetki' && <Field label="Yetki belgesi türü"><select className="inp" value={f.level} onChange={e => setF({ ...f, level: e.target.value })}><option value="">Seçin</option>{['K1', 'K2', 'K3', 'L1', 'L2', 'N1', 'N2', 'R1', 'R2'].map(s => <option key={s}>{s}</option>)}</select></Field>}
        <Field label="Belge numarası (isteğe bağlı)" hint="Yalnızca son 4 hanesi saklanır."><input className="inp" maxLength={20} value={f.no || ''} onChange={e => setF({ ...f, no: e.target.value })} /></Field>
        <Field label="Geçerlilik bitiş tarihi" error={err}><input type="date" className="inp" min={today()} value={f.expires || ''} onChange={e => { setErr(''); setF({ ...f, expires: e.target.value }) }} /></Field>
        <p className="text-slate-600 mb-3">Belge görseli yükleme, sunucu tarafı güvenli depolama eklendiğinde açılacaktır.</p>
        <button className="btn-p w-full" onClick={save}>İncelemeye gönder</button>
      </Modal>}
    </div>
  )
}

export function Favorites({ me }) {
  const d = useDB(), ids = d.favorites[me.id] || [], ls = d.listings.filter(l => ids.includes(l.id))
  return <div><Header title="Favoriler" />{ls.length ? <div className="grid gap-3 sm:grid-cols-2">{ls.map(l => <ListingCard key={l.id} l={l} me={me} />)}</div> : <Empty text="Favori ilanınız yok. İlanlardaki “Favori” düğmesiyle ekleyebilirsiniz."><button className="btn-p" onClick={() => go('/ara')}>İlan ara</button></Empty>}</div>
}

// ---------- Bildirimler ----------
const PR = { urgent: ['Acil', 'err'], important: ['Önemli', 'warn'], normal: ['Normal', 'info'] }
export function Notifications({ me, drive }) {
  const d = useDB()
  useEffect(() => {
    // Belge süresi yaklaşan / dolan bildirimleri üret (günde bir kez)
    const k = 'svt:docscan:' + me.id + ':' + today()
    if (localStorage.getItem(k)) return
    mutate(x => Object.entries(me.docs || {}).forEach(([t, doc]) => { const left = daysUntil(doc.expires); if (left <= 30) notify(x, me.id, left < 0 ? `${D.DOC_TYPES[t]} süresi doldu.` : `${D.DOC_TYPES[t]} süresi ${left} gün içinde doluyor.`, 'urgent', '/profil/belgeler', 'doc') }))
    localStorage.setItem(k, '1')
  }, [])
  const order = { urgent: 0, important: 1, normal: 2 }
  const list = d.notifications.filter(n => n.userId === me.id && (!drive || n.priority === 'urgent')).sort((a, b) => order[a.priority] - order[b.priority] || b.at - a.at)
  const open = n => { mutate(x => { x.notifications.find(y => y.id === n.id).read = true }); if (n.link) go(n.link) }
  return (
    <div className="max-w-2xl">
      <Header title="Bildirimler" right={list.some(n => !n.read) && <button className="btn-s" onClick={() => mutate(x => x.notifications.forEach(n => { if (n.userId === me.id) n.read = true }))}>Tümünü okundu yap</button>} />
      {drive && <div className="mb-3"><Note tone="warn">Sürüş modunda yalnızca acil bildirimler gösterilir.</Note></div>}
      {list.length ? <ul className="space-y-2">{list.map(n => <li key={n.id}><button onClick={() => open(n)} className={`card p-4 w-full text-left flex gap-3 items-start ${n.read ? '' : 'border-l-4 border-l-act'}`}>
        <Tag tone={PR[n.priority][1]}>{PR[n.priority][0]}</Tag><span className="flex-1"><span className={`block ${n.read ? '' : 'font-bold'}`}>{n.text}</span><span className="text-slate-600">{timeTR(n.at)}</span></span></button></li>)}</ul>
        : <Empty text="Yeni bildiriminiz yok." />}
    </div>
  )
}

// ---------- Gizlilik Merkezi (KVKK) ----------
const CONSENTS = [
  ['marketing', 'Kampanya ve duyuru mesajları', 'SMS veya bildirimle tanıtım mesajları almak istiyorum.'],
  ['location', 'Konumumu yakın ilanlar için kullanma', 'Yalnızca uygulama açıkken, yakınındaki ilanları göstermek için.'],
  ['shareTc', 'T.C. kimlik numaramı operasyon özetinde paylaşabilme', 'Kapalıyken T.C. kimlik numaranız hiçbir koşulda paylaşılamaz. Açıkken bile her paylaşımda ayrıca onay istenir.'],
  ['analytics', 'Ürün geliştirme için anonim kullanım verisi', 'Hangi ekranların kullanıldığını kimliğinizden bağımsız olarak ölçmemize izin verir.']
]
export function PrivacyCenter({ me }) {
  const d = useDB(), c = d.consents[me.id] || {}
  const [tab, setTab] = useState('rıza'), [reqType, setReqType] = useState(''), [reqText, setReqText] = useState(''), [sent, setSent] = useState('')
  const setC = (k, v) => mutate(x => { x.consents[me.id] = { ...(x.consents[me.id] || {}), [k]: v, [k + 'At']: Date.now() }; audit(x, me.id, v ? 'CONSENT_GIVEN' : 'CONSENT_WITHDRAWN', 'consent:' + k, !v, v) })
  const myReqs = d.privacyRequests.filter(r => r.userId === me.id)
  const shares = d.shareLog.filter(s => s.userId === me.id)
  const exportData = () => {
    const u = { ...me, phone: maskPhone(me.phone), tcLast: me.tcLast ? 'maskeli' : null }
    const data = { kullanici: u, ilanlar: d.listings.filter(l => l.ownerId === me.id), teklifler: d.offers.filter(o => o.fromId === me.id), izinler: c, paylasimlar: shares, talepler: myReqs }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'servisteyim-verilerim.json'; a.click(); URL.revokeObjectURL(a.href)
  }
  const sendReq = type => {
    mutate(x => { x.privacyRequests.unshift({ id: uid('p'), userId: me.id, type, text: clean(reqText, 600), status: 'OPEN', at: Date.now() }); audit(x, me.id, 'PRIVACY_REQUEST', me.id, null, type) })
    setReqText(''); setReqType(''); setSent(type === 'DELETE' ? 'Hesap silme talebiniz alındı. En geç 30 gün içinde sonuçlandırılır.' : 'Talebiniz alındı. En geç 30 gün içinde yanıtlanır.')
  }
  const tabs = [['rıza', 'İzinlerim'], ['bilgi', 'Aydınlatma Metni'], ['tercih', 'Veri tercihleri'], ['gecmis', 'Paylaşım geçmişi'], ['veri', 'Hesap verilerim'], ['talep', 'Talepler']]
  return (
    <div className="max-w-2xl">
      <Header title="Gizlilik Merkezi" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" role="tablist">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn min-h-[44px] shrink-0 ${tab === k ? 'bg-navy text-white border-navy' : 'bg-white border-line text-navy'}`}>{l}</button>)}</div>
      <section className="card p-4">
        {tab === 'bilgi' && <Aydinlatma />}
        {tab === 'rıza' && <><p className="mb-2">Bu izinlerin hiçbiri hizmeti kullanmak için zorunlu değildir. İstediğiniz zaman değiştirebilirsiniz.</p>{CONSENTS.map(([k, l, desc]) => <Toggle key={k} label={l} desc={<>{desc}{c[k + 'At'] && <span className="block">Son değişiklik: {timeTR(c[k + 'At'])}</span>}</>} checked={c[k]} onChange={v => setC(k, v)} />)}</>}
        {tab === 'tercih' && <>
          <Toggle label="Profilimi gizle" desc="Diğer kullanıcılar profil sayfanızı göremez. İlanlarınızda yalnızca adınız görünür." checked={c.privateProfile} onChange={v => setC('privateProfile', v)} />
          <p className="mt-3">Telefonunuz diğer kullanıcılara her zaman maskeli görünür: <b>{maskPhone(me.phone)}</b></p>
          <p>Plakanız herkese açık alanlarda maskeli görünür.</p>
        </>}
        {tab === 'gecmis' && (shares.length ? <ul className="space-y-2">{shares.map(s => <li key={s.id} className="border-b border-line pb-2"><b>{d.users.find(u => u.id === s.toId)?.name}</b> ile paylaşıldı: {s.fields.join(', ')}<span className="block text-slate-600">{timeTR(s.at)}</span></li>)}</ul> : <p>Henüz kimseyle operasyon özeti paylaşmadınız.</p>)}
        {tab === 'veri' && <><p className="mb-2">Hesabınızla ilgili tuttuğumuz verilerin bir kopyasını indirebilirsiniz. Hassas alanlar maskeli gelir.</p>
          <ul className="list-disc pl-5 mb-3"><li>Profil: ad, rol, şehir, maskeli telefon</li><li>{me.vehicles.length} araç, {Object.keys(me.docs).length} belge beyanı</li><li>{d.listings.filter(l => l.ownerId === me.id).length} ilan, {d.offers.filter(o => o.fromId === me.id).length} teklif</li></ul>
          <button className="btn-p w-full" onClick={exportData}>Verilerimi indir (JSON)</button></>}
        {tab === 'talep' && <>
          {sent && <div className="mb-3"><Note tone="ok" icon="check">{sent}</Note></div>}
          <p className="lbl">Talep türü</p>
          <Choice cols={1} name="Talep türü" value={reqType} onChange={setReqType} options={[['ACCESS', 'Verilerim hakkında bilgi istiyorum'], ['CORRECT', 'Verilerimin düzeltilmesini istiyorum'], ['OBJECT', 'Bir işleme itiraz ediyorum'], ['DELETE', 'Hesabımın silinmesini istiyorum']]} />
          {reqType && <><Field label="Açıklama (isteğe bağlı)"><textarea className="inp min-h-[96px] py-2 mt-3" maxLength={600} value={reqText} onChange={e => setReqText(e.target.value)} /></Field>
            {reqType === 'DELETE' && <div className="mb-3"><Note tone="warn">Hesabınız silindiğinde ilanlarınız ve mesajlarınız kaldırılır. Yasal saklama süresi olan kayıtlar (ör. işlem kayıtları) bu süre boyunca saklanır.</Note></div>}
            <button className={reqType === 'DELETE' ? 'btn-d w-full' : 'btn-p w-full'} onClick={() => sendReq(reqType)}>Talebi gönder</button></>}
          {myReqs.length > 0 && <><h3 className="font-bold mt-4">Taleplerim</h3><ul>{myReqs.map(r => <li key={r.id} className="flex justify-between py-1 border-b border-line"><span>{{ ACCESS: 'Bilgi', CORRECT: 'Düzeltme', OBJECT: 'İtiraz', DELETE: 'Hesap silme' }[r.type]} · {timeTR(r.at)}</span><Tag tone={r.status === 'DONE' ? 'ok' : r.status === 'REJECTED' ? 'err' : 'warn'}>{{ OPEN: 'Açık', DONE: 'Tamamlandı', REJECTED: 'Reddedildi' }[r.status]}</Tag></li>)}</ul></>}
        </>}
      </section>
      <p className="text-slate-600 mt-3">Servisteyim, KVKK gereksinimleri dikkate alınarak tasarlanmıştır. Ticari yayından önce hukuki inceleme yapılmalıdır.</p>
    </div>
  )
}
