import { Link, useLocation } from 'react-router-dom'
import { PARTY_META } from '../mockData.js'

// ── Navigation ──────────────────────────────────────────────────────────────

export function Nav() {
  const { pathname } = useLocation()
  const links = [
    { to: '/',          label: 'Mittari' },
    { to: '/vaalikone', label: 'Vaalikone' },
  ]
  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', gap:'2rem', height:56 }}>
        <Link to="/" style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1rem', letterSpacing:'-0.02em' }}>
          Edustaja<span style={{ color:'var(--accent)' }}>mittari</span>
        </Link>
        <div style={{ display:'flex', gap:'4px', flex:1 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize:'0.875rem',
              fontWeight: pathname === l.to ? 500 : 400,
              color: pathname === l.to ? 'var(--ink)' : 'var(--ink-3)',
              padding:'4px 10px',
              borderRadius:'var(--radius-sm)',
              background: pathname === l.to ? 'var(--bg-muted)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
        </div>
        <span className="label" style={{ fontSize:'0.625rem' }}>Beta · vaalikausi 2023–2027</span>
      </div>
    </nav>
  )
}

// ── Party pill ───────────────────────────────────────────────────────────────

export function PartyPill({ party, short = false }) {
  const meta = PARTY_META[party] || { bg:'#EDEAE3', text:'#4A4845' }
  return (
    <span className="pill" style={{ background: meta.bg, color: meta.text }}>
      {short ? (meta.short || party) : party}
    </span>
  )
}

// ── MP Avatar ────────────────────────────────────────────────────────────────

export function MPAvatar({ name, party, size = 36 }) {
  const meta = PARTY_META[party] || { bg:'#EDEAE3', text:'#4A4845' }
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: meta.bg, color: meta.text,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily: 'var(--font-head)', fontSize: size * 0.35,
      fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ── Attendance bar ───────────────────────────────────────────────────────────

export function AttendanceBar({ pct, height = 6 }) {
  const color = pct >= 90 ? 'var(--accent)' : pct >= 75 ? 'var(--warn)' : 'var(--danger)'
  return (
    <div style={{ background:'var(--bg-muted)', borderRadius:3, height, flex:1, overflow:'hidden' }}>
      <div style={{ width:`${pct}%`, height, background: color, borderRadius:3, transition:'width 0.6s ease' }} />
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, accent = false }) {
  return (
    <div style={{
      background: accent ? 'var(--accent-2)' : 'var(--bg-muted)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
    }}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-head)',
        fontSize: '1.5rem', fontWeight: 700,
        color: accent ? 'var(--accent)' : 'var(--ink)',
        letterSpacing: '-0.02em',
      }}>{value}</div>
      {sub && <div className="body-sm" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Choice badge ─────────────────────────────────────────────────────────────

export function ChoiceBadge({ choice }) {
  const map = {
    jaa:    { bg:'var(--accent-2)',  text:'var(--accent)',  label:'Jaa'    },
    ei:     { bg:'var(--danger-2)',  text:'var(--danger)',  label:'Ei'     },
    tyhja:  { bg:'var(--warn-2)',    text:'var(--warn)',    label:'Tyhjää' },
    poissa: { bg:'var(--bg-muted)', text:'var(--ink-3)',   label:'Poissa' },
    skip:   { bg:'var(--bg-muted)', text:'var(--ink-3)',   label:'Ohita'  },
  }
  const s = map[choice] || map.poissa
  return (
    <span className="pill" style={{ background: s.bg, color: s.text, minWidth: 48, justifyContent:'center' }}>
      {s.label}
    </span>
  )
}

// ── Loading spinner ───────────────────────────────────────────────────────────

export function Loading() {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
      <div className="spinner" />
    </div>
  )
}
