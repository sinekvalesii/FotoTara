import React, { useEffect, useState } from 'react'

// Basit hash yönlendirici (statik barındırmada sorunsuz çalışır)
const parse = () => { const h = location.hash.slice(1) || '/'; const [p, q = ''] = h.split('?'); return { path: p, q: new URLSearchParams(q) } }
export function useRoute() {
  const [r, setR] = useState(parse)
  useEffect(() => { const f = () => { setR(parse()); scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return r
}
export const go = p => { location.hash = p }
export const back = () => (history.length > 1 ? history.back() : go('/'))

// SVG ikonlar (stroke tabanlı, 24px)
const P = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16l-4.3-4.3',
  plus: 'M12 5v14M5 12h14', chat: 'M4 5h16v11H8l-4 4z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c0-4 4-6 8-6s8 2 8 6',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zm4 4h4', back: 'M15 5l-7 7 7 7', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  share: 'M4 12v7h16v-7M12 3v13M7 8l5-5 5 5', truck: 'M2 6h12v10H2zM14 10h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10', work: 'M4 8h16v11H4zM9 8V5h6v3', filter: 'M3 5h18l-7 8v6l-4-2v-4z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', doc: 'M6 3h9l4 4v14H6zM14 3v5h5', check: 'M5 12l5 5 9-10', x: 'M6 6l12 12M18 6L6 18',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.5', route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',
  fuel: 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M14 9h2a2 2 0 0 1 2 2v5a1 1 0 0 0 2 0V8l-3-3M6 8h6',
  car: 'M3 13l2-6h14l2 6v5H3zM7 18v2M17 18v2M6 13h12', flag: 'M5 21V4h12l-2 4 2 4H5', lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.5 4 8l-1 3 2 1v0l-2 1 1 3 2-.5 1.5 1.5-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', log: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h4', send: 'M4 12l16-8-6 16-3-7z',
  wheel: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 10h5.6M14.9 10h5.6M12 15v6', out: 'M15 4h4v16h-4M10 17l5-5-5-5M15 12H3',
  money: 'M3 6h18v12H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', pin: 'M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
}
export const Icon = ({ n, s = 24, className = '' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><path d={P[n]} /></svg>
)

const tones = { ok: 'bg-green-50 border-ok text-green-800', warn: 'bg-amber-50 border-warn text-amber-900', err: 'bg-red-50 border-err text-red-800', info: 'bg-slate-100 border-line text-navy', act: 'bg-orange-50 border-act text-orange-800' }
export const Tag = ({ tone = 'info', children, icon }) => <span className={`tag ${tones[tone]}`}>{icon && <Icon n={icon} s={14} className="mr-1" />}{children}</span>
export const Note = ({ tone = 'info', children, icon = 'alert' }) => (
  <div className={`flex gap-2 p-3 border rounded text-base ${tones[tone]}`} role={tone === 'err' ? 'alert' : 'note'}><Icon n={icon} s={20} className="shrink-0 mt-0.5" /><div>{children}</div></div>
)
export function Header({ title, right, noBack }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {!noBack && <button className="btn-s px-3" onClick={back} aria-label="Geri dön"><Icon n="back" /><span className="hidden sm:inline">Geri</span></button>}
      <h1 className="h1 flex-1 min-w-0 truncate">{title}</h1>{right}
    </div>
  )
}
export function Choice({ options, value, onChange, cols = 2, name }) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : cols === 1 ? 'grid-cols-1' : 'grid-cols-2'}`} role="radiogroup" aria-label={name}>
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`min-h-[56px] px-3 rounded border-2 text-left font-bold text-base ${value === v ? 'border-act bg-orange-50 text-ink' : 'border-line bg-white text-navy'}`}>
          {value === v && <Icon n="check" s={18} className="inline mr-1 text-act" />}{l}
        </button>
      ))}
    </div>
  )
}
export function Field({ label, error, children, hint }) {
  return <label className="block mb-4"><span className="lbl">{label}</span>{children}{hint && <span className="block text-slate-600 mt-1">{hint}</span>}{error && <span className="block text-err font-bold mt-1" role="alert">{error}</span>}</label>
}
export function Modal({ title, children, onClose }) {
  useEffect(() => { const f = e => e.key === 'Escape' && onClose(); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-auto rounded-t sm:rounded p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center mb-3"><h2 className="h2 flex-1">{title}</h2><button className="btn-s px-3" onClick={onClose} aria-label="Kapat"><Icon n="x" /></button></div>
        {children}
      </div>
    </div>
  )
}
export function Empty({ text, children }) {
  return <div className="card p-6 text-center"><p className="text-lg mb-4">{text}</p><div className="flex flex-col sm:flex-row gap-2 justify-center">{children}</div></div>
}
export function Toggle({ label, checked, onChange, desc, disabled }) {
  return (
    <label className={`flex items-start gap-3 py-3 border-b border-line last:border-0 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <input type="checkbox" className="w-6 h-6 mt-0.5 accent-act shrink-0" checked={!!checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
      <span><span className="font-bold block">{label}</span>{desc && <span className="text-slate-600">{desc}</span>}</span>
    </label>
  )
}
