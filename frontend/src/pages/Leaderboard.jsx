import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLeaderboard } from '../hooks/useApi.js'
import { PartyPill, MPAvatar, AttendanceBar, StatCard, Loading } from '../components/UI.jsx'
import { PARTY_META } from '../mockData.js'

const SORT_OPTIONS = [
  { value: 'attendance',    label: 'Läsnäolo' },
  { value: 'participation', label: 'Äänestänyt' },
  { value: 'abstain',       label: 'Tyhjää / poissa' },
]

function Medal({ rank }) {
  if (rank === 1) return <span style={{ color:'#B7680A', fontFamily:'var(--font-head)', fontWeight:800 }}>1</span>
  if (rank === 2) return <span style={{ color:'#8C8984', fontFamily:'var(--font-head)', fontWeight:800 }}>2</span>
  if (rank === 3) return <span style={{ color:'#6B4A2A', fontFamily:'var(--font-head)', fontWeight:800 }}>3</span>
  return <span style={{ color:'var(--ink-3)', fontSize:'0.8125rem' }}>{rank}</span>
}

export default function Leaderboard() {
  const [sort,  setSort]  = useState('attendance')
  const [party, setParty] = useState('')
  const [order, setOrder] = useState('desc')

  const { data, loading } = useLeaderboard({ sort, party, order })

  const [stats, setStats] = useState(null)

useEffect(() => {
  fetch(`${typeof __API_URL__ !== 'undefined' && __API_URL__ ? __API_URL__ : ''}/api/stats`)
    .then(r => r.json())
    .then(setStats)
    .catch(() => {})
}, [])

  const sortVal = (mp) => {
    if (sort === 'abstain')       return mp.abstain_pct
    if (sort === 'participation') return mp.participation_pct
    return mp.attendance_pct
  }

  return (
    <div className="page">
      <div className="container">

        {/* Hero */}
        <div style={{ marginBottom:'2.5rem' }}>
          <div className="label" style={{ marginBottom:'0.5rem' }}>Vaalikausi 2023–2027</div>
          <h1 className="h1" style={{ marginBottom:'0.5rem' }}>
            Kuka tekee töitä,<br />kuka ei?
          </h1>
          <p style={{ color:'var(--ink-2)', maxWidth:520, fontSize:'1rem', lineHeight:1.7 }}>
            Todellinen läsnäolodata ja äänestystilastot kaikista 200 kansanedustajasta.
            Ei lupauksia — pelkkiä faktoja.
          </p>
        </div>

        {/* Summary stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:8, marginBottom:'2rem' }}>
          <StatCard label="Keskim. läsnäolo"     value={data.length ? (data.reduce((s, m) => s + parseFloat(m.attendance_pct || 0), 0) / data.length).toFixed(1) + '%' : '—'} />
          <StatCard label="Täysistuntoja"         value={data.length ? Math.max(...data.map(m => m.total_sessions || 0)) : '—'} />
          <StatCard label="Äänestyksiä yhteensä"  value={stats ? stats.vote.toLocaleString('fi-FI') : '—'} />
          <StatCard label="Edustajaa seurannassa" value={data.length || '—'} />
        </div>

        {/* Controls */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', background:'var(--bg-muted)', borderRadius:'var(--radius-md)', padding:3, gap:2 }}>
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setSort(o.value)} style={{
                padding:'5px 12px', fontSize:'0.8125rem', borderRadius:'calc(var(--radius-md) - 2px)',
                fontWeight: sort === o.value ? 500 : 400,
                background: sort === o.value ? 'var(--bg-card)' : 'transparent',
                color: sort === o.value ? 'var(--ink)' : 'var(--ink-3)',
                border: sort === o.value ? '1px solid var(--border)' : '1px solid transparent',
                cursor:'pointer',
              }}>{o.label}</button>
            ))}
          </div>

         <select value={party} onChange={e => setParty(e.target.value)} style={{
  padding:'6px 10px', fontSize:'0.8125rem', borderRadius:'var(--radius-md)',
  border:'1px solid var(--border-md)', background:'var(--bg-card)', color:'var(--ink)',
}}>
  <option value="">Kaikki puolueet</option>
  {Object.entries(PARTY_META).map(([key, meta]) => (
    <option key={key} value={key}>{meta.label || key}</option>
  ))}
</select>

          <button onClick={() => setOrder(o => o === 'desc' ? 'asc' : 'desc')} style={{
            padding:'6px 12px', fontSize:'0.8125rem', borderRadius:'var(--radius-md)',
            border:'1px solid var(--border-md)', background:'var(--bg-card)', cursor:'pointer',
          }}>
            {order === 'desc' ? '↓ Paras ensin' : '↑ Heikoin ensin'}
          </button>

          <span className="label" style={{ marginLeft:'auto' }}>
            {data.length} edustajaa
          </span>
        </div>

        {/* Table */}
        {loading ? <Loading /> : (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {/* Header */}
            <div style={{
              display:'grid', gridTemplateColumns:'40px 1fr 90px 90px 90px',
              padding:'8px 16px', borderBottom:'1px solid var(--border)',
              background:'var(--bg-muted)',
            }}>
              <div className="label">#</div>
              <div className="label">Edustaja</div>
              <div className="label" style={{ textAlign:'right' }}>Läsnäolo</div>
              <div className="label" style={{ textAlign:'right' }}>Äänestänyt</div>
              <div className="label" style={{ textAlign:'right' }}>Tyhjää</div>
            </div>

            {data.map((mp, i) => (
              <div key={mp.id} style={{
                display:'grid', gridTemplateColumns:'40px 1fr 90px 90px 90px',
                alignItems:'center', padding:'10px 16px',
                borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration:'none', color:'inherit',
                transition:'background 0.1s',
                animationDelay: `${i * 0.025}s`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
              className="fade-up"
              >
                {/* Rank */}
                <div style={{ textAlign:'right', paddingRight:8, fontSize:'0.875rem' }}>
                  <Medal rank={mp.rank} />
                </div>

                {/* Name + party */}
                <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                  <MPAvatar name={mp.name} party={mp.party} size={32} id={mp.id} />
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {mp.name}
                    </div>
                    <div style={{ display:'flex', gap:5, alignItems:'center', marginTop:2 }}>
                      <PartyPill party={mp.party} short />
                      <span className="body-sm" style={{ fontSize:'0.75rem' }}>{mp.constituency}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div style={{ textAlign:'right' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <AttendanceBar pct={mp.attendance_pct} height={4} />
                    <span style={{
                      fontSize:'0.875rem', fontWeight:500, minWidth:38, textAlign:'right',
                 color: mp.attendance_pct == null ? 'var(--ink-3)' : parseFloat(mp.attendance_pct) >= 90 ? 'var(--accent)' : parseFloat(mp.attendance_pct) >= 75 ? 'var(--warn)' : 'var(--danger)',
                  }}>
                    {mp.attendance_pct != null ? parseFloat(mp.attendance_pct).toFixed(1) : '—'}%
                    </span>
                  </div>
                </div>

                {/* Participation */}
                <div style={{ textAlign:'right', fontSize:'0.875rem', color:'var(--ink-2)' }}>
                  {mp.participation_pct != null ? parseFloat(mp.participation_pct).toFixed(1) : '—'}%
                </div>

                {/* Abstain */}
                <div style={{ textAlign:'right', fontSize:'0.875rem', color: mp.abstain_pct > 8 ? 'var(--danger)' : 'var(--ink-2)' }}>
                  {mp.abstain_pct != null ? parseFloat(mp.abstain_pct).toFixed(1) : '—'}%
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="body-sm" style={{ marginTop:'1rem', textAlign:'center' }}>
          Lähde: <a href="https://avoindata.eduskunta.fi" target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>avoindata.eduskunta.fi</a>
          {' '}· päivitetty viikoittain
        </p>
      </div>
    </div>
  )
}
