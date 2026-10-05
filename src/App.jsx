import React, { useEffect, useMemo, useState, Component } from 'react'
import * as D from './data.js'
import { useDB, mutate, audit, notify, getSession, endSession, tl, num, dateTR, dayLabel, today, coord, km, costEstimate, routeInfo, parseQuery, matchScore, trustProfile, cityNames, clean, uid } from './lib.js'
import { useRoute, go, back, Icon, Tag, Note, Header, Choice, Field, Modal, Empty, Toggle } from './ui.jsx'
import { Auth, Messages, Chat, JobView, Profile, VehicleForm, Documents, Notifications, PrivacyCenter, Favorites, PublicProfile } from './screens.jsx'
import Admin from './Admin.jsx'

class Boundary extends Component {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() {
    if (!this.state.err) return this.props.children
    return <div className="p-6 max-w-md mx-auto"><Note tone="err">Bir sorun oluştu. Lütfen tekrar deneyin.</Note><button className="btn-p w-full mt-4" onClick={() => { this.setState({ err: false }); go('/') }}>Ana sayfaya dön</button></div>
  }
}

export const vehLabel = id => D.VEHICLES.find(v => v.id === id)?.label || 'Araç'
export const isLive = l => l.status === 'APPROVED' && l.date >= today()
export const visibleListings = (d, me) => d.listings.filter(l => isLive(l) && d.users.find(u => u.id === l.ownerId)?.status === 'ACTIVE')
export const placeTxt = p => (p.district ? `${p.district} / ${p.city}` : p.city)

// Sürüş modu ve bağlantı durumu
const getDrive = () => { try { return localStorage.getItem('svt:drive') === '1' } catch { return false } }
function useOnline() {
  const [on, set] = useState(navigator.onLine)
  useEffect(() => { const a = () => set(true), b = () => set(false); addEventListener('online', a); addEventListener('offline', b); return () => { removeEventListener('online', a); removeEventListener('offline', b) } }, [])
  return on
}

export default function App() {
  const d = useDB()
  const { path, q } = useRoute()
  const me = useMemo(() => getSession(), [d, path])
  const [drive, setDrive] = useState(getDrive)
  const online = useOnline()
  useEffect(() => { document.documentElement.style.fontSize = drive ? '18px' : '16px'; localStorage.setItem('svt:drive', drive ? '1' : '0') }, [drive])
  const seg = path.split('/').filter(Boolean)

  if (!me) return <Boundary><Auth /></Boundary>
  if (me.role !== 'admin' && !me.onboarded && seg[0] !== 'gizlilik') return <Boundary><Onboarding me={me} /></Boundary>
  if (d.settings.maintenance && me.role !== 'admin') return <div className="p-6 max-w-md mx-auto"><Note tone="warn">Servisteyim kısa bir bakımda. Lütfen biraz sonra tekrar deneyin.</Note><button className="btn-s w-full mt-4" onClick={() => { endSession(); go('/') }}>Çıkış yap</button></div>

  let page
  switch (seg[0]) {
    case undefined: page = <Home me={me} />; break
    case 'ara': page = <Search me={me} q={q} />; break
    case 'ilan': page = <ListingDetail me={me} id={+seg[1]} />; break
    case 'ilan-ver': page = <CreateListing me={me} editId={+q.get('id') || null} />; break
    case 'ilanlarim': page = <MyListings me={me} />; break
    case 'mesajlar': page = seg[1] ? <Chat me={me} id={seg[1]} drive={drive} /> : <Messages me={me} />; break
    case 'is': page = <JobView me={me} id={seg[1]} />; break
    case 'profil':
      page = seg[1] === 'belgeler' ? <Documents me={me} /> : seg[1] === 'arac' ? <VehicleForm me={me} id={seg[2]} /> : seg[1] === 'favoriler' ? <Favorites me={me} /> : <Profile me={me} />; break
    case 'kullanici': page = <PublicProfile me={me} id={seg[1]} />; break
    case 'bildirimler': page = <Notifications me={me} drive={drive} />; break
    case 'gizlilik': page = <PrivacyCenter me={me} />; break
    case 'admin': page = me.role === 'admin' ? <Admin me={me} tab={seg[1] || 'genel'} /> : <Forbidden />; break
    default: page = <Empty text="Aradığınız sayfa bulunamadı."><button className="btn-p" onClick={() => go('/')}>Ana sayfaya dön</button></Empty>
  }
  const unreadMsg = d.conversations.filter(c => c.members.includes(me.id) && c.unread?.[me.id]).length
  const unreadN = d.notifications.filter(n => n.userId === me.id && !n.read && (!drive || n.priority === 'urgent')).length
  const nav = me.role === 'admin'
    ? [['/admin', 'settings', 'Yönetim'], ['/', 'home', 'Ana Sayfa'], ['/ara', 'search', 'Ara']]
    : [['/', 'home', 'Ana Sayfa'], ['/ara', 'search', 'Ara'], ['/ilan-ver', 'plus', 'İlan Ver'], ['/mesajlar', 'chat', 'Mesajlar', unreadMsg], ['/profil', 'user', 'Profil']]
  const active = p => (p === '/' ? path === '/' : path.startsWith(p))

  return (
    <Boundary>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-white">İçeriğe geç</a>
      <header className="bg-navy text-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-2 px-4 h-14">
          <button onClick={() => go('/')} className="font-bold text-xl tracking-wide flex-1 text-left">SERVİSTEYİM</button>
          {me.role !== 'admin' && <button onClick={() => setDrive(!drive)} aria-pressed={drive} className={`flex items-center gap-1 px-2 min-h-[44px] rounded border ${drive ? 'bg-warn text-ink border-warn' : 'border-slate-500'}`}><Icon n="wheel" s={20} /><span className="text-sm font-bold whitespace-nowrap">{drive ? 'Sürüşte' : <>Sürüş<span className="hidden sm:inline"> modu</span></>}</span></button>}
          <button onClick={() => go('/bildirimler')} className="relative p-2 min-h-[44px]" aria-label={`Bildirimler, ${unreadN} okunmamış`}><Icon n="bell" />{unreadN > 0 && <span className="absolute top-1 right-0 bg-act text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">{unreadN}</span>}</button>
        </div>
      </header>
      {drive && <div className="bg-warn text-ink font-bold text-lg p-3 text-center" role="status">Güvenli bir yerde durarak işlem yapın. Kritik olmayan bildirimler kapalı.</div>}
      {!online && <div className="bg-err text-white p-3 text-center font-bold" role="status">İnternet bağlantınız zayıf. Taslağınız kaydedildi; son görülen ilanlar gösteriliyor.</div>}
      {d.settings.announcement && <div className="bg-amber-50 border-b border-warn p-3 text-center">{d.settings.announcement}</div>}
      <div className="max-w-6xl mx-auto md:flex md:gap-6 md:px-4">
        <nav aria-label="Ana menü" className="hidden md:block w-52 shrink-0 pt-4">
          <ul className="sticky top-20 space-y-1">{nav.map(([p, i, l, b]) => (
            <li key={p}><a href={'#' + p} aria-current={active(p) ? 'page' : undefined} className={`flex items-center gap-3 px-3 min-h-[48px] rounded font-bold ${active(p) ? 'bg-white border border-line text-act' : 'text-navy hover:bg-white'}`}><Icon n={i} />{l}{b > 0 && <span className="ml-auto bg-act text-white text-sm rounded-full px-2">{b}</span>}</a></li>
          ))}</ul>
        </nav>
        <main id="main" className="flex-1 min-w-0 px-4 md:px-0 pt-4 pb-28 md:pb-10">{page}</main>
      </div>
      <nav aria-label="Alt menü" className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line grid" style={{ gridTemplateColumns: `repeat(${nav.length},1fr)`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {nav.map(([p, i, l, b]) => (
          <a key={p} href={'#' + p} aria-current={active(p) ? 'page' : undefined} className={`relative flex flex-col items-center justify-center h-16 text-[13px] leading-tight whitespace-nowrap font-bold ${active(p) ? 'text-act' : 'text-navy'}`}>
            {p === '/ilan-ver' ? <span className="bg-act text-white rounded p-1"><Icon n={i} /></span> : <Icon n={i} />}{l}
            {b > 0 && <span className="absolute top-1 right-[25%] bg-act text-white text-xs rounded-full px-1.5">{b}</span>}
          </a>
        ))}
      </nav>
    </Boundary>
  )
}

const Forbidden = () => <Empty text="Bu sayfayı görme yetkiniz yok."><button className="btn-p" onClick={() => go('/')}>Ana sayfaya dön</button></Empty>

// ---------- İlk kullanım ----------
function Onboarding({ me }) {
  const [step, setStep] = useState(0), [role, setRole] = useState(me.role || '')
  const slides = [['Yük bul.', 'Rotana uygun yükleri tek ekranda gör.', 'box'], ['Aracını bul.', 'Yükün için uygun aracı hızlıca bul.', 'truck'], ['İşini yönet.', 'Mesaj, teklif ve iş takibi aynı yerde.', 'work']]
  const finish = () => mutate(x => { const u = x.users.find(u => u.id === me.id); u.role = role; u.onboarded = true; audit(x, me.id, 'ROLE_SELECTED', me.id, null, role) })
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto p-6">
      <p className="font-bold text-navy text-xl mb-8">SERVİSTEYİM</p>
      {step < 3 ? <>
        <div className="flex-1 flex flex-col justify-center"><Icon n={slides[step][2]} s={64} className="text-act mb-6" /><h1 className="text-3xl font-bold text-navy mb-3">{slides[step][0]}</h1><p className="text-lg">{slides[step][1]}</p></div>
        <p className="text-center mb-3 font-bold">{step + 1} / 3</p>
        <button className="btn-p w-full min-h-[56px] text-lg" onClick={() => setStep(step + 1)}>{step < 2 ? 'Devam Et' : 'Başla'}</button>
        {step < 2 && <button className="btn-s w-full mt-2" onClick={() => setStep(3)}>Geç</button>}
      </> : <>
        <h1 className="h1 mb-2">Sen kimsin?</h1><p className="mb-4">Bunu daha sonra profilinden değiştirebilirsin.</p>
        <Choice cols={1} name="Rol" value={role} onChange={setRole} options={[['driver', 'Şoförüm'], ['owner', 'Araç sahibiyim'], ['company', 'Firmayım'], ['shipper', 'Yüküm var']]} />
        <button className="btn-p w-full min-h-[56px] text-lg mt-6" disabled={!role} onClick={finish}>Başla</button>
      </>}
    </div>
  )
}

// ---------- Ortak parçalar ----------
export function ListingCard({ l, me, dist, score }) {
  const d = useDB(), fav = (d.favorites[me.id] || []).includes(l.id)
  const t = D.LISTING_TYPES[l.type]
  return (
    <article className="card p-4 flex flex-col gap-2" aria-label={`${l.from.city} - ${l.to.city} ilanı`}>
      <div className="flex flex-wrap gap-1 items-center">
        {l.isSponsored && <Tag tone="act">SPONSORLU</Tag>}
        <Tag>{t.label}</Tag>
        {score >= 78 && me.role !== 'admin' && <Tag tone="ok" icon="check">Senin için uygun</Tag>}
        {l.status !== 'APPROVED' && <Tag tone="warn">{D.LISTING_STATUS[l.status]}</Tag>}
      </div>
      <h3 className="text-xl font-bold text-ink">{l.from.city} <span className="text-act">→</span> {l.to.city}</h3>
      <p className="text-slate-700 -mt-1">{placeTxt(l.from)} · {placeTxt(l.to)}</p>
      <p className="font-bold text-base">{l.tollClass}. sınıf · {vehLabel(l.vehicleType)}{l.tonnage ? ` · ${num(l.tonnage)} ton` : ''}</p>
      <div className="flex items-end justify-between gap-2">
        <div><p className="text-2xl font-bold text-navy">{tl(l.budget)}</p><p className="font-bold">{dayLabel(l.date)}{l.time && ` • ${l.time}`}</p></div>
        {dist != null && <p className="text-slate-700 text-right">Çıkış noktanıza<br /><b>{dist} km</b></p>}
      </div>
      <div className="flex flex-wrap gap-1">{l.reqs.src && <Tag>{l.reqs.src}</Tag>}{l.reqs.psiko && <Tag>PSİKOTEKNİK</Tag>}<Tag>{l.mode.toUpperCase()}</Tag>{l.equipment.map(e => <Tag key={e}>{e}</Tag>)}</div>
      <div className="flex gap-2 mt-1">
        <button className="btn-p flex-1" onClick={() => go('/ilan/' + l.id)}>Detay</button>
        <FavButton id={l.id} me={me} fav={fav} />
      </div>
    </article>
  )
}
export function FavButton({ id, me, fav, wide }) {
  const toggle = () => mutate(x => { const f = x.favorites[me.id] || (x.favorites[me.id] = []); const i = f.indexOf(id); i >= 0 ? f.splice(i, 1) : f.push(id) })
  return <button className={`btn-s ${wide ? 'flex-1' : ''}`} onClick={toggle} aria-pressed={fav}><Icon n="star" className={fav ? 'fill-warn text-warn' : ''} />{fav ? 'Favoride' : 'Favori'}</button>
}

export function CostBox({ from, to, tollClass, vehicleType, compact }) {
  const d = useDB()
  if (!from?.city || !to?.city) return null
  const c = costEstimate({ from, to, tollClass, vehicleType }, d)
  const st = { UYGUN: 'ok', KISITLI: 'warn', 'ALTERNATİF GEREKLİ': 'warn', 'GEÇİŞ UYGUN DEĞİL': 'err' }[c.status]
  return (
    <section className="card p-4" aria-label="Yaklaşık rota maliyeti">
      <div className="flex items-center justify-between mb-2 gap-2"><h2 className="h2">Yaklaşık rota maliyeti</h2><Tag tone="warn">SİMÜLASYON</Tag></div>
      <dl className="grid grid-cols-2 gap-y-1 text-base">
        <dt>Mesafe</dt><dd className="text-right font-bold">≈ {num(c.km)} km</dd>
        <dt>Tahmini yakıt</dt><dd className="text-right font-bold">{tl(c.fuel)}</dd>
        <dt>Tahmini geçiş ({tollClass}. sınıf)</dt><dd className="text-right font-bold">{c.hasData ? tl(c.toll) : 'Veri yok'}</dd>
        <dt className="font-bold border-t border-line pt-1">Tahmini toplam</dt><dd className="text-right font-bold text-xl border-t border-line pt-1">{tl(c.total)}</dd>
      </dl>
      {!compact && <>
        <p className="mt-2"><Tag tone={st} icon={st === 'ok' ? 'check' : 'alert'}>Rota: {c.status}</Tag></p>
        {c.segments.length > 0 && <ul className="mt-2 text-slate-700">{c.segments.map(s => <li key={s.id}>{s.road}: {tl(s.price)}</li>)}</ul>}
        <ul className="mt-2 text-slate-700 list-disc pl-5">{c.notes.map(n => <li key={n}>{n}</li>)}</ul>
      </>}
      <p className="text-slate-600 mt-2">Kesin fiyat değildir. Yakıt: {c.fuelPrice.label} {c.fuelPrice.price.toLocaleString('tr-TR')} TL/L ({c.fuelPrice.source}, {dateTR(c.fuelPrice.date)}), {c.perKm} L/100 km varsayımı. Geçiş ücretleri DEMO VERİ.</p>
    </section>
  )
}

function FuelWidget() {
  const d = useDB()
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-2"><Icon n="fuel" /><h2 className="h2 flex-1">Akaryakıt</h2><Tag tone="warn">Demo fiyat</Tag></div>
      {d.fuelPrices.map(f => <p key={f.id} className="flex justify-between py-1 border-b border-line last:border-0"><span>{f.label}</span><b>{f.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL/L</b></p>)}
      <p className="text-slate-600 mt-1">Son güncelleme: {dateTR(d.fuelPrices[0]?.date)}</p>
    </section>
  )
}
function TollWidget() {
  const [f, setF] = useState('İstanbul'), [t, setT] = useState('İzmir'), [c, setC] = useState(5)
  return (
    <section>
      <div className="card p-4 mb-2">
        <div className="flex items-center gap-2 mb-2"><Icon n="route" /><h2 className="h2">Geçiş ücreti hesapla</h2></div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select className="inp" aria-label="Nereden" value={f} onChange={e => setF(e.target.value)}>{cityNames.map(x => <option key={x}>{x}</option>)}</select>
          <select className="inp" aria-label="Nereye" value={t} onChange={e => setT(e.target.value)}>{cityNames.map(x => <option key={x}>{x}</option>)}</select>
        </div>
        <select className="inp" aria-label="Otoyol sınıfı" value={c} onChange={e => setC(+e.target.value)}>{[1, 2, 3, 4, 5].map(x => <option key={x} value={x}>{x}. sınıf</option>)}</select>
      </div>
      {f !== t && <CostBox compact from={{ city: f }} to={{ city: t }} tollClass={c} vehicleType={c >= 4 ? 'cekici' : c === 3 ? 'kamyon' : 'kamyonet'} />}
    </section>
  )
}

// ---------- Ana sayfa ----------
function Home({ me }) {
  const d = useDB()
  const [text, setText] = useState('')
  const live = visibleListings(d, me)
  const scored = live.map(l => ({ l, ...matchScore(l, me, d) }))
  const sponsored = live.filter(l => l.isSponsored).slice(0, d.settings.maxSponsored)
  const forYou = scored.filter(x => !x.l.isSponsored && x.l.ownerId !== me.id).sort((a, b) => b.score - a.score).slice(0, 4)
  const fresh = live.filter(l => l.createdAt >= today() && !l.isSponsored).slice(0, 4)
  const recent = d.searches[me.id] || []
  const isAdmin = me.role === 'admin'
  return (
    <div className="lg:flex lg:gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <section>
          <p className="text-lg">Merhaba {me.name.split(' ')[0]},</p>
          <h1 className="h1 mb-3">Bugün ne arıyorsun?</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[['is', 'work', 'İş Bul'], ['yuk', 'box', 'Yük Bul'], ['arac', 'truck', 'Araç Bul']].map(([c, i, l], k) => (
              <button key={c} onClick={() => go('/ara?cat=' + c)} className={`flex items-center gap-3 px-4 min-h-[60px] rounded font-bold text-lg lg:text-base xl:text-lg uppercase whitespace-nowrap border-2 ${k === 1 ? 'bg-act border-act text-white' : 'bg-white border-navy text-navy'}`}><Icon n={i} s={28} />{l}</button>
            ))}
          </div>
          {isAdmin && <button className="btn-p w-full mt-2" onClick={() => go('/admin')}><Icon n="settings" />Yönetim paneline git</button>}
          <form className="flex gap-2 mt-3" onSubmit={e => { e.preventDefault(); go('/ara?q=' + encodeURIComponent(clean(text, 80))) }} role="search">
            <input className="inp flex-1" value={text} onChange={e => setText(e.target.value)} placeholder="Örn: İstanbul İzmir tır" aria-label="Arama" />
            <button className="btn-s"><Icon n="search" /><span className="sr-only sm:not-sr-only">Ara</span></button>
          </form>
          {recent.length > 0 && <div className="mt-3"><p className="font-bold mb-1">Son aramalar</p><div className="flex flex-wrap gap-2">{recent.map(r => <button key={r} className="btn-s min-h-[44px] font-normal" onClick={() => go('/ara?q=' + encodeURIComponent(r))}>{r}</button>)}</div></div>}
        </section>
        {forYou.length > 0 && <Section title={me.vehicles?.length ? 'Sana uygun ilanlar' : 'Yakınındaki ilanlar'} more="/ara?sort=fit">{forYou.map(x => <ListingCard key={x.l.id} l={x.l} me={me} score={x.score} dist={x.dist} />)}</Section>}
        {sponsored.length > 0 && <Section title="Sponsorlu ilanlar" note="Bu ilanlar ücretli olarak öne çıkarılmıştır.">{sponsored.map(l => <ListingCard key={l.id} l={l} me={me} />)}</Section>}
        {fresh.length > 0 && <Section title="Bugün yeni" more="/ara?sort=new">{fresh.map(l => <ListingCard key={l.id} l={l} me={me} />)}</Section>}
      </div>
      <aside className="lg:w-80 shrink-0 space-y-4 mt-6 lg:mt-0" aria-label="Özet"><FuelWidget /><TollWidget /></aside>
    </div>
  )
}
function Section({ title, more, note, children }) {
  return (
    <section>
      <div className="flex items-center mb-2"><h2 className="h2 flex-1">{title}</h2>{more && <a className="font-bold text-act underline min-h-[44px] flex items-center" href={'#' + more}>Tümünü gör</a>}</div>
      {note && <p className="text-slate-700 mb-2">{note}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

// ---------- Arama ----------
const EMPTY_F = { cat: '', from: '', to: '', vehicle: '', tonnage: '', cargo: '', when: '', budget: '', mode: '', src: false, psiko: false, equipment: '', trust: '' }
function Search({ me, q }) {
  const d = useDB()
  const [text, setText] = useState(q.get('q') || '')
  const parsed = useMemo(() => parseQuery(q.get('q') || ''), [q])
  const [f, setF] = useState(() => ({ ...EMPTY_F, cat: q.get('cat') || '', from: parsed.from?.city || '', fromD: parsed.from?.district || '', to: parsed.to?.city || '', vehicle: parsed.vehicle || '', tonnage: parsed.tonnage || '', mode: parsed.mode || '' }))
  const [sort, setSort] = useState(q.get('sort') || 'fit'), [open, setOpen] = useState(false)
  useEffect(() => { setText(q.get('q') || ''); setF(v => ({ ...EMPTY_F, cat: q.get('cat') || v.cat, from: parsed.from?.city || '', fromD: parsed.from?.district || '', to: parsed.to?.city || '', vehicle: parsed.vehicle || '', tonnage: parsed.tonnage || '', mode: parsed.mode || '' })) }, [q, parsed])
  const submit = e => {
    e.preventDefault(); const t = clean(text, 80)
    if (t) mutate(x => { const s = (x.searches[me.id] || []).filter(v => v !== t); x.searches[me.id] = [t, ...s].slice(0, 5) })
    go('/ara?q=' + encodeURIComponent(t) + (f.cat ? '&cat=' + f.cat : ''))
  }
  const origin = f.from ? coord(f.from, f.fromD) : null
  const results = visibleListings(d, me).map(l => {
    const m = matchScore(l, me, d, origin)
    const owner = d.users.find(u => u.id === l.ownerId)
    return { l, ...m, trust: trustProfile(owner, d).pct }
  }).filter(({ l, dist, trust }) =>
    (!f.cat || D.LISTING_TYPES[l.type].cat === f.cat) &&
    (!f.from || l.from.city === f.from || (dist != null && dist <= 60)) && (!f.to || l.to.city === f.to) &&
    (!f.vehicle || l.vehicleType === f.vehicle) && (!f.tonnage || l.tonnage >= +f.tonnage * 0.8) && (!f.cargo || l.cargo === f.cargo) &&
    (!f.mode || l.mode === f.mode) && (!f.src || l.reqs.src) && (!f.psiko || l.reqs.psiko) && (!f.equipment || l.equipment.includes(f.equipment)) &&
    (!f.budget || l.budget >= +f.budget) && (!f.trust || trust >= +f.trust) &&
    (!f.when || (f.when === 'today' ? l.date === today() : f.when === 'tomorrow' ? l.date === new Date(Date.now() + 864e5).toISOString().slice(0, 10) : Date.parse(l.date) - Date.now() < 7 * 864e5))
  ).sort((a, b) => (b.l.isSponsored - a.l.isSponsored) || (sort === 'new' ? b.l.createdAt.localeCompare(a.l.createdAt) || b.l.id - a.l.id : sort === 'budget' ? b.l.budget - a.l.budget : sort === 'date' ? a.l.date.localeCompare(b.l.date) : b.score - a.score))
  const chips = [f.from && ['from', `Çıkış: ${f.fromD || f.from}`], f.to && ['to', `Varış: ${f.to}`], f.vehicle && ['vehicle', vehLabel(f.vehicle)], f.tonnage && ['tonnage', `${f.tonnage} ton`], f.mode && ['mode', f.mode], f.cargo && ['cargo', f.cargo], f.when && ['when', { today: 'Bugün', tomorrow: 'Yarın', week: 'Bu hafta' }[f.when]], f.src && ['src', 'SRC şartı'], f.psiko && ['psiko', 'Psikoteknik'], f.equipment && ['equipment', f.equipment], f.budget && ['budget', `En az ${tl(+f.budget)}`], f.trust && ['trust', `Güven %${f.trust}+`]].filter(Boolean)
  const set = (k, v) => setF(x => ({ ...x, [k]: v, ...(k === 'from' ? { fromD: '' } : {}) }))
  return (
    <div>
      <Header title="Ara" noBack />
      <form onSubmit={submit} role="search" className="flex gap-2 mb-3">
        <input className="inp flex-1" value={text} onChange={e => setText(e.target.value)} placeholder="Örn: Arnavutköy'den İzmir'e tır" aria-label="Ne arıyorsun?" />
        <button className="btn-p"><Icon n="search" /><span className="sr-only sm:not-sr-only">Ara</span></button>
      </form>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-2" role="tablist" aria-label="Kategori">
        {[['', 'Tümü'], ...Object.entries(D.CATS)].map(([c, l]) => <button key={c} role="tab" aria-selected={f.cat === c} onClick={() => set('cat', c)} className={`btn min-h-[44px] shrink-0 ${f.cat === c ? 'bg-navy text-white border-navy' : 'bg-white border-line text-navy'}`}>{l}</button>)}
      </div>
      <div className="flex gap-2 items-center mb-2">
        <button className="btn-s" onClick={() => setOpen(true)} aria-expanded={open}><Icon n="filter" />Filtrele{chips.length > 0 && ` (${chips.length})`}</button>
        <select className="inp flex-1 sm:flex-none sm:w-56" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sıralama">
          <option value="fit">Sana en uygun</option><option value="new">En yeni</option><option value="date">Tarihi en yakın</option><option value="budget">Bütçesi en yüksek</option>
        </select>
      </div>
      {chips.length > 0 && <div className="flex flex-wrap gap-2 mb-3" aria-label="Uygulanan filtreler">{chips.map(([k, l]) => <button key={k} onClick={() => set(k, k === 'src' || k === 'psiko' ? false : '')} className="tag bg-white border-navy text-navy min-h-[40px] px-3">{l}<Icon n="x" s={16} className="ml-1" /><span className="sr-only">filtresini kaldır</span></button>)}</div>}
      <p className="mb-2 font-bold" aria-live="polite">{results.length} ilan bulundu</p>
      {results.length ? <div className="grid gap-3 sm:grid-cols-2">{results.map(x => <ListingCard key={x.l.id} l={x.l} me={me} score={x.score} dist={f.from && x.l.from.city !== f.from || f.fromD ? x.dist : null} />)}</div>
        : <Empty text="Bu bölgede şu anda uygun ilan bulunamadı."><button className="btn-p" onClick={() => setF(v => ({ ...EMPTY_F, cat: v.cat, from: v.from }))}>Aramayı genişlet</button><button className="btn-s" onClick={() => { setText(''); setF({ ...EMPTY_F }); go('/ara') }}>Başka rota ara</button></Empty>}
      {open && <Modal title="Filtrele" onClose={() => setOpen(false)}>
        <div className="grid grid-cols-2 gap-x-2">
          <Field label="Konum"><select className="inp" value={f.from} onChange={e => set('from', e.target.value)}><option value="">Hepsi</option>{cityNames.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Varış"><select className="inp" value={f.to} onChange={e => set('to', e.target.value)}><option value="">Hepsi</option>{cityNames.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Araç"><select className="inp" value={f.vehicle} onChange={e => set('vehicle', e.target.value)}><option value="">Hepsi</option>{D.VEHICLES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select></Field>
          <Field label="En az tonaj"><input className="inp" inputMode="decimal" value={f.tonnage} onChange={e => set('tonnage', e.target.value.replace(/[^\d.]/g, ''))} /></Field>
          <Field label="Yük türü"><select className="inp" value={f.cargo} onChange={e => set('cargo', e.target.value)}><option value="">Hepsi</option>{D.CARGO.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Tarih"><select className="inp" value={f.when} onChange={e => set('when', e.target.value)}><option value="">Hepsi</option><option value="today">Bugün</option><option value="tomorrow">Yarın</option><option value="week">Bu hafta</option></select></Field>
          <Field label="En az bütçe (₺)"><input className="inp" inputMode="numeric" value={f.budget} onChange={e => set('budget', e.target.value.replace(/\D/g, ''))} /></Field>
          <Field label="Özel ekipman"><select className="inp" value={f.equipment} onChange={e => set('equipment', e.target.value)}><option value="">Hepsi</option>{D.EQUIPMENT.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Doğrulama seviyesi"><select className="inp" value={f.trust} onChange={e => set('trust', e.target.value)}><option value="">Hepsi</option><option value="50">Güven %50+</option><option value="75">Güven %75+</option></select></Field>
        </div>
        <p className="lbl">Yük şekli</p>
        <Choice name="Yük şekli" value={f.mode} onChange={v => set('mode', f.mode === v ? '' : v)} options={[['komple', 'Komple'], ['parsiyel', 'Parsiyel']]} />
        <div className="mt-2"><Toggle label="SRC şartı olan ilanlar" checked={f.src} onChange={v => set('src', v)} /><Toggle label="Psikoteknik şartı olan ilanlar" checked={f.psiko} onChange={v => set('psiko', v)} /></div>
        <div className="flex gap-2 mt-4 sticky bottom-0 bg-white py-2"><button className="btn-s flex-1" onClick={() => setF(v => ({ ...EMPTY_F, cat: v.cat }))}>Temizle</button><button className="btn-p flex-1" onClick={() => setOpen(false)}>{results.length} ilanı göster</button></div>
      </Modal>}
    </div>
  )
}

// ---------- İlan detayı ----------
export function startConversation(me, l) {
  let id
  mutate(x => {
    let c = x.conversations.find(c => c.listingId === l.id && c.members.includes(me.id) && c.members.includes(l.ownerId))
    if (!c) { c = { id: uid('c'), listingId: l.id, members: [me.id, l.ownerId], messages: [], unread: {}, updatedAt: Date.now() }; x.conversations.unshift(c) }
    id = c.id
  })
  go('/mesajlar/' + id)
}
function ListingDetail({ me, id }) {
  const d = useDB()
  const l = d.listings.find(x => x.id === id)
  const [report, setReport] = useState(false), [shared, setShared] = useState('')
  useEffect(() => { if (l && l.ownerId !== me.id) mutate(x => { const t = x.listings.find(y => y.id === id); if (t) t.views = (t.views || 0) + 1 }) }, [id])
  if (!l || (!isLive(l) && l.ownerId !== me.id && me.role !== 'admin')) return <Empty text="Bu ilan artık yayında değil."><button className="btn-p" onClick={() => go('/ara')}>Başka ilan ara</button></Empty>
  const owner = d.users.find(u => u.id === l.ownerId), mine = l.ownerId === me.id, fav = (d.favorites[me.id] || []).includes(l.id)
  const tp = trustProfile(owner, d)
  const share = async () => {
    const data = { title: 'Servisteyim ilanı', text: `${l.from.city} → ${l.to.city} · ${tl(l.budget)}`, url: location.href }
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); setShared('Bağlantı kopyalandı.') } } catch { /* kullanıcı vazgeçti */ }
  }
  return (
    <div className="max-w-3xl">
      <Header title={`İlan #${l.id}`} />
      <div className="flex flex-wrap gap-1 mb-2">{l.isSponsored && <Tag tone="act">SPONSORLU</Tag>}<Tag>{D.LISTING_TYPES[l.type].label}</Tag>{l.status !== 'APPROVED' && <Tag tone="warn">{D.LISTING_STATUS[l.status]}</Tag>}</div>
      <h2 className="text-3xl font-bold text-ink">{l.from.city} <span className="text-act">→</span> {l.to.city}</h2>
      <p className="text-lg mb-3">{placeTxt(l.from)} → {placeTxt(l.to)} <span className="text-slate-600">(yaklaşık konum)</span></p>
      <div className="card p-4 mb-4 grid grid-cols-2 gap-3 text-lg">
        <p><span className="block text-base text-slate-600">Araç</span><b>{l.tollClass}. sınıf · {vehLabel(l.vehicleType)}</b></p>
        <p><span className="block text-base text-slate-600">Tonaj</span><b>{l.tonnage ? num(l.tonnage) + ' ton' : '—'}</b></p>
        <p><span className="block text-base text-slate-600">Yük</span><b>{l.cargo} · {l.mode === 'komple' ? 'Komple' : 'Parsiyel'}</b></p>
        <p><span className="block text-base text-slate-600">Tarih</span><b>{dayLabel(l.date)}{l.time && ` • ${l.time}`}</b></p>
        <p className="col-span-2"><span className="block text-base text-slate-600">Bütçe</span><b className="text-3xl text-navy">{tl(l.budget)}</b></p>
        {(l.reqs.src || l.reqs.psiko || l.equipment.length > 0) && <div className="col-span-2 flex flex-wrap gap-1">{l.reqs.src && <Tag>{l.reqs.src}</Tag>}{l.reqs.psiko && <Tag>PSİKOTEKNİK</Tag>}{l.equipment.map(e => <Tag key={e}>{e}</Tag>)}</div>}
        {l.note && <p className="col-span-2 text-base whitespace-pre-line">{l.note}</p>}
      </div>
      {l.type === 'SOFOR_ARIYOR' && <div className="mb-4"><Note tone="warn">Bu bir iş fırsatı ilanıdır. Servisteyim işe yerleştirme hizmeti vermez; çalışma koşullarını taraflar doğrudan konuşur.</Note></div>}
      <div className="mb-4"><CostBox from={l.from} to={l.to} tollClass={l.tollClass} vehicleType={l.vehicleType} /></div>
      <section className="card p-4 mb-4">
        <h2 className="h2 mb-1">İlan sahibi</h2>
        <a href={'#/kullanici/' + owner.id} className="text-lg font-bold underline">{owner.company || owner.name}</a>
        <p>{D.ROLES[owner.role]} · {owner.city} · {owner.completedJobs || 0} tamamlanan iş</p>
        <p className="mt-1"><Tag tone={tp.pct >= 75 ? 'ok' : tp.pct >= 50 ? 'warn' : 'err'} icon="shield">Güven profili %{tp.pct}</Tag></p>
        <p className="text-slate-600 mt-1">Tam adres ve iletişim bilgileri eşleşmeden sonra paylaşılır.</p>
      </section>
      <div className="flex gap-2 mb-4">
        <FavButton id={l.id} me={me} fav={fav} wide />
        <button className="btn-s flex-1" onClick={share}><Icon n="share" />Paylaş</button>
        {!mine && <button className="btn-s flex-1" onClick={() => setReport(true)}><Icon n="flag" />Şikâyet</button>}
      </div>
      {shared && <p role="status" className="mb-4 font-bold text-ok">{shared}</p>}
      {mine && <div className="flex gap-2 mb-4"><button className="btn-s flex-1" onClick={() => go('/ilan-ver?id=' + l.id)}>Düzenle</button><button className="btn-d flex-1" onClick={() => mutate(x => { const t = x.listings.find(y => y.id === l.id); audit(x, me.id, 'LISTING_CANCELLED', 'listing#' + l.id, t.status, 'CANCELLED'); t.status = 'CANCELLED' })}>İlanı kaldır</button></div>}
      {!mine && me.role !== 'admin' && <div className="fixed md:static inset-x-0 bottom-16 md:bottom-auto z-20 bg-white md:bg-transparent border-t md:border-0 border-line p-3 md:p-0">
        <button className="btn-p w-full min-h-[56px] text-lg uppercase" onClick={() => startConversation(me, l)}><Icon n="chat" />İletişime geç</button>
      </div>}
      {report && <ReportModal me={me} targetType="listing" targetId={l.id} onClose={() => setReport(false)} />}
    </div>
  )
}
export function ReportModal({ me, targetType, targetId, onClose }) {
  const [reason, setReason] = useState(''), [text, setText] = useState(''), [done, setDone] = useState(false)
  const send = () => { mutate(x => { const id = uid('k'); x.complaints.unshift({ id, targetType, targetId, reporterId: me.id, reason, text: clean(text, 500), status: 'OPEN', at: Date.now() }); audit(x, me.id, 'COMPLAINT_CREATED', `${targetType}#${targetId}`, null, reason) }); setDone(true) }
  return (
    <Modal title="Şikâyet et" onClose={onClose}>
      {done ? <><Note tone="ok" icon="check">Şikâyetiniz alındı. İnceleme sonucu size bildirilecek.</Note><button className="btn-p w-full mt-4" onClick={onClose}>Tamam</button></> : <>
        <p className="lbl">Neden?</p>
        <Choice cols={1} name="Şikâyet nedeni" value={reason} onChange={setReason} options={D.COMPLAINT_REASONS.map(r => [r, r])} />
        <Field label="Açıklama (isteğe bağlı)"><textarea className="inp min-h-[96px] py-2 mt-3" maxLength={500} value={text} onChange={e => setText(e.target.value)} /></Field>
        <button className="btn-p w-full" disabled={!reason} onClick={send}>Şikâyeti gönder</button>
      </>}
    </Modal>
  )
}

// ---------- İlan oluşturma sihirbazı ----------
const DRAFT = 'svt:draft'
const blankListing = me => ({ type: me.role === 'shipper' || me.role === 'company' ? 'ARAC_ARIYOR' : 'YUK_ARIYOR', from: { city: me.city || '', district: '' }, to: { city: '', district: '' }, vehicleType: me.vehicles?.[0]?.type || '', tollClass: me.vehicles?.[0]?.tollClass || 0, tonnage: '', cargo: '', mode: 'komple', date: today(), time: '', budget: '', reqs: { src: '', psiko: false }, equipment: [], note: '' })
function CreateListing({ me, editId }) {
  const d = useDB()
  const existing = editId && d.listings.find(l => l.id === editId && (l.ownerId === me.id || me.role === 'admin'))
  const [f, setF] = useState(() => { if (existing) return structuredClone(existing); try { return JSON.parse(localStorage.getItem(DRAFT)) || blankListing(me) } catch { return blankListing(me) } })
  const [step, setStep] = useState(existing ? 1 : 0), [err, setErr] = useState(''), [done, setDone] = useState(null), [adv, setAdv] = useState(false)
  useEffect(() => { if (!existing && !done) try { localStorage.setItem(DRAFT, JSON.stringify(f)) } catch { /* dolu */ } }, [f])
  const set = (k, v) => { setErr(''); setF(x => ({ ...x, [k]: v })) }
  const dists = c => D.PLACES.find(p => p.city === c)?.districts || []
  const validate = () => {
    if (step === 1 && !f.from.city) return 'Lütfen çıkış noktasını seçin.'
    if (step === 1 && !f.to.city) return 'Lütfen varış noktasını seçin.'
    if (step === 2 && !f.vehicleType) return 'Lütfen araç tipini seçin.'
    if (step === 2 && !f.tollClass) return 'Lütfen otoyol sınıfını seçin.'
    if (step === 2 && f.type !== 'SOFOR_ARIYOR' && !f.cargo && D.LISTING_TYPES[f.type].cat === 'yuk') return 'Lütfen ne taşınacağını seçin.'
    if (step === 3 && (!f.date || f.date < today())) return 'Lütfen bugün veya ileri bir tarih seçin.'
    if (step === 3 && f.budget && (+f.budget < 100 || +f.budget > 5e6)) return 'Bütçe 100 ₺ ile 5.000.000 ₺ arasında olmalı.'
    return ''
  }
  const next = () => { const e = validate(); if (e) return setErr(e); setStep(step + 1) }
  const publish = () => {
    let newId
    mutate(x => {
      const clean_ = { ...f, note: clean(f.note, 600), tonnage: +f.tonnage || 0, budget: +f.budget || 0 }
      if (existing) {
        const t = x.listings.find(l => l.id === existing.id)
        Object.assign(t, clean_, { status: x.settings.autoApprove || me.role === 'admin' ? 'APPROVED' : 'PENDING' })
        newId = t.id; audit(x, me.id, 'LISTING_UPDATED', 'listing#' + t.id, existing.status, t.status)
      } else {
        newId = x.nextListing++
        x.listings.unshift({ ...clean_, id: newId, ownerId: me.id, isSponsored: false, status: x.settings.autoApprove ? 'APPROVED' : 'PENDING', createdAt: today(), views: 0 })
        audit(x, me.id, 'LISTING_CREATED', 'listing#' + newId, null, x.settings.autoApprove ? 'APPROVED' : 'PENDING')
      }
      notify(x, me.id, x.settings.autoApprove ? `İlan #${newId} yayında.` : `İlan #${newId} incelemeye gönderildi. Onaylanınca haber vereceğiz.`, 'normal', '/ilan/' + newId, 'listing')
    })
    localStorage.removeItem(DRAFT); setDone(newId)
  }
  if (done) return <div className="max-w-xl"><Note tone="ok" icon="check">İlanınız kaydedildi. {d.listings.find(l => l.id === done)?.status === 'APPROVED' ? 'İlan yayında.' : 'Kısa bir kontrolden sonra yayına alınacak.'}</Note><div className="flex gap-2 mt-4"><button className="btn-p flex-1" onClick={() => go('/ilan/' + done)}>İlanı gör</button><button className="btn-s flex-1" onClick={() => go('/ilanlarim')}>İlanlarım</button></div></div>
  const steps = ['İlan türü', 'Rota', 'Yük / Araç', 'Tarih / Bütçe', 'Ek bilgiler', 'Önizleme']
  return (
    <div className="max-w-xl">
      <Header title={existing ? 'İlanı düzenle' : 'İlan ver'} right={<span className="font-bold text-lg" aria-label={`Adım ${step + 1} / 6`}>{step + 1} / 6</span>} />
      <div className="h-2 bg-line rounded mb-4" aria-hidden="true"><div className="h-2 bg-act rounded transition-all duration-150" style={{ width: `${((step + 1) / 6) * 100}%` }} /></div>
      <h2 className="h2 mb-3">{steps[step]}</h2>
      {step === 0 && <Choice cols={1} name="İlan türü" value={f.type} onChange={v => set('type', v)} options={Object.entries(D.LISTING_TYPES).map(([k, t]) => [k, `${t.label} — ${t.who}`])} />}
      {step === 1 && <>
        <Field label="Nereden?"><select className="inp" value={f.from.city} onChange={e => set('from', { city: e.target.value, district: '' })}><option value="">İl seçin</option>{cityNames.map(c => <option key={c}>{c}</option>)}</select></Field>
        {dists(f.from.city).length > 0 && <Field label="İlçe / bölge (isteğe bağlı)"><select className="inp" value={f.from.district} onChange={e => set('from', { ...f.from, district: e.target.value })}><option value="">Tüm il</option>{dists(f.from.city).map(x => <option key={x[0]} value={x[0]}>{x[0]}{x[3] && ` — ${x[3]}`}</option>)}</select></Field>}
        <Field label="Nereye?"><select className="inp" value={f.to.city} onChange={e => set('to', { city: e.target.value, district: '' })}><option value="">İl seçin</option>{cityNames.map(c => <option key={c}>{c}</option>)}</select></Field>
        {dists(f.to.city).length > 0 && <Field label="İlçe / bölge (isteğe bağlı)"><select className="inp" value={f.to.district} onChange={e => set('to', { ...f.to, district: e.target.value })}><option value="">Tüm il</option>{dists(f.to.city).map(x => <option key={x[0]} value={x[0]}>{x[0]}{x[3] && ` — ${x[3]}`}</option>)}</select></Field>}
        <p className="text-slate-600">Tam adres ilanda gösterilmez. Eşleşmeden sonra paylaşırsınız.</p>
      </>}
      {step === 2 && <>
        <p className="lbl">Hangi araç?</p>
        <Choice name="Araç" value={f.vehicleType} onChange={v => { set('vehicleType', v); set('tollClass', D.ComplianceRules.tollClassByAxles(D.VEHICLES.find(x => x.id === v).axles)) }} options={D.VEHICLES.map(v => [v.id, v.label])} />
        <p className="lbl mt-4">Otoyol sınıfı</p>
        <Choice cols={3} name="Otoyol sınıfı" value={f.tollClass} onChange={v => set('tollClass', v)} options={[1, 2, 3, 4, 5].map(c => [c, `${c}. sınıf`])} />
        <p className="text-slate-600 mt-1">{D.ComplianceRules.tollClassNote}</p>
        {f.type !== 'SOFOR_ARIYOR' && <>
          <Field label={D.LISTING_TYPES[f.type].cat === 'yuk' ? 'Ne taşınacak?' : 'Taşıyabileceğin yük (isteğe bağlı)'}><select className="inp mt-4" value={f.cargo} onChange={e => set('cargo', e.target.value)}><option value="">Seçin</option>{D.CARGO.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Tonaj (ton)"><input className="inp" inputMode="decimal" value={f.tonnage} onChange={e => set('tonnage', e.target.value.replace(/[^\d.]/g, '').slice(0, 5))} placeholder="Örn: 18" /></Field>
          <Choice name="Yük şekli" value={f.mode} onChange={v => set('mode', v)} options={[['komple', 'Komple'], ['parsiyel', 'Parsiyel']]} />
        </>}
      </>}
      {step === 3 && <>
        <Field label="Ne zaman?"><input type="date" className="inp" min={today()} value={f.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Saat (isteğe bağlı)"><input type="time" className="inp" value={f.time} onChange={e => set('time', e.target.value)} /></Field>
        <Field label="Bütçe (₺)" hint="Boş bırakırsanız “Teklif usulü” görünür."><input className="inp" inputMode="numeric" value={f.budget} onChange={e => set('budget', e.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="Örn: 32500" /></Field>
        {f.from.city && f.to.city && f.tollClass > 0 && <CostBox compact from={f.from} to={f.to} tollClass={f.tollClass} vehicleType={f.vehicleType} />}
      </>}
      {step === 4 && <>
        <button className="btn-s w-full mb-3" aria-expanded={adv} onClick={() => setAdv(!adv)}>{adv ? 'Gelişmiş bilgileri gizle' : 'Gelişmiş bilgileri göster (isteğe bağlı)'}</button>
        {adv && <>
          <Field label="SRC şartı"><select className="inp" value={f.reqs.src} onChange={e => set('reqs', { ...f.reqs, src: e.target.value })}><option value="">Yok</option>{['SRC 1', 'SRC 2', 'SRC 3', 'SRC 4', 'SRC 5'].map(s => <option key={s}>{s}</option>)}</select></Field>
          <Toggle label="Psikoteknik belgesi gerekli" checked={f.reqs.psiko} onChange={v => set('reqs', { ...f.reqs, psiko: v })} />
          <p className="lbl mt-3">Özel ekipman</p>
          <div className="grid grid-cols-2 gap-x-2">{D.EQUIPMENT.map(e => <Toggle key={e} label={e} checked={f.equipment.includes(e)} onChange={v => set('equipment', v ? [...f.equipment, e] : f.equipment.filter(x => x !== e))} />)}</div>
        </>}
        <Field label="Not (isteğe bağlı)" hint="Telefon, T.C. kimlik veya tam adres yazmayın."><textarea className="inp min-h-[100px] py-2" maxLength={600} value={f.note} onChange={e => set('note', e.target.value)} /></Field>
      </>}
      {step === 5 && <>
        <ListingCard l={{ ...f, id: existing?.id || 0, tonnage: +f.tonnage || 0, budget: +f.budget || 0, isSponsored: false, status: 'APPROVED' }} me={me} />
        {/\b0?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b|\b[1-9]\d{10}\b/.test(f.note) && <div className="mt-3"><Note tone="warn">Notunuzda telefon veya kimlik numarası olabilir. Kişisel verilerinizi korumak için silmenizi öneririz.</Note></div>}
        <p className="mt-3 text-slate-700">Yayınlamadan önce ilan kısa bir kontrolden geçebilir. Yanlış veya yanıltıcı ilanlar kaldırılır.</p>
      </>}
      {err && <p className="text-err font-bold mt-3" role="alert">{err}</p>}
      <div className="flex gap-2 mt-6">
        {step > 0 && <button className="btn-s flex-1" onClick={() => { setErr(''); setStep(step - 1) }}>Geri</button>}
        {step < 5 ? <button className="btn-p flex-[2] min-h-[56px] text-lg" onClick={next}>Devam Et</button> : <button className="btn-p flex-[2] min-h-[56px] text-lg" onClick={publish}>İlanı yayınla</button>}
      </div>
      {!existing && step > 0 && <p className="text-slate-600 mt-3 text-center">Taslağınız bu cihazda otomatik kaydedilir.</p>}
    </div>
  )
}

function MyListings({ me }) {
  const d = useDB(), mine = d.listings.filter(l => l.ownerId === me.id)
  return (
    <div>
      <Header title="İlanlarım" right={<button className="btn-p" onClick={() => go('/ilan-ver')}><Icon n="plus" />Yeni</button>} />
      {mine.length ? <div className="grid gap-3 sm:grid-cols-2">{mine.map(l => <ListingCard key={l.id} l={l} me={me} />)}</div> : <Empty text="Henüz ilanınız yok."><button className="btn-p" onClick={() => go('/ilan-ver')}>İlan ver</button></Empty>}
    </div>
  )
}
