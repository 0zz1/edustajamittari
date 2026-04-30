import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import { useMp, useMpVotes } from '../hooks/useApi.js'
import { PartyPill, MPAvatar, StatCard, ChoiceBadge, Loading, AttendanceBar } from '../components/UI.jsx'

const TOPIC_LABELS = {
  sosiaali:'Sosiaali & terveys', talous:'Talous & budjetti',
  ympäristö:'Ympäristö', koulutus:'Koulutus', turvallisuus:'Turvallisuus',
  maahanmuutto:'Maahanmuutto', asuminen:'Asuminen', demokratia:'Demokratia', muu:'Muu',
}

const MONTH_LABELS = { '01':'Tam','02':'Hel','03':'Maa','04':'Huh','05':'Tou','06':'Kes','07':'Hei','08':'Elo','09':'Syy','10':'Lok','11':'Mar','12':'Jou' }

function MonthBar({ month, present, total }) {
  const pct = total ? Math.round((present / total) * 100) : 0
  const color = pct >= 90 ? 'var(--accent)' : pct >= 70 ? 'var(--warn)' : 'var(--danger)'
  const [hovered, setHovered] = useState(false)
  const mo = MONTH_LABELS[month?.slice(5, 7)] || ''
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative' }}>
      {hovered && (
        <div style={{
          position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)',
          background:'var(--ink)', color:'#fff', fontSize:'0.6875rem', padding:'3px 7px',
          borderRadius:'var(--radius-sm)', whiteSpace:'nowrap', marginBottom:4, pointerEvents:'none',
        }}>
          {pct}% ({present}/{total})
        </div>
      )}
      <div
        style={{ width:'100%', height:64, display:'flex', alignItems:'flex-end', cursor:'default' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ width:'100%', height:`${pct}%`, background: color, borderRadius:'3px 3px 0 0', minHeight:2 }} />
      </div>
      <div style={{ fontSize:'0.6875rem', color:'var(--ink-3)' }}>{mo}</div>
    </div>
  )
}

function DonutStat({ jaa, ei, tyhja, poissa }) {
  const total = jaa + ei + tyhja + poissa || 1
  const pctJaa   = Math.round(jaa   / total * 100)
  const pctEi    = Math.round(ei    / total * 100)
  const pctTyhja = Math.round(tyhja / total * 100)

  // Simple CSS conic-gradient donut
  const jaaDeg   = pctJaa   * 3.6
  const eiDeg    = pctEi    * 3.6
  const tyhjaDeg = pctTyhja * 3.6
  const poisDeg  = 360 - jaaDeg - eiDeg - tyhjaDeg

  const gradient = `conic-gradient(
    #1A5C3A 0deg ${jaaDeg}deg,
    #C0392B ${jaaDeg}deg ${jaaDeg + eiDeg}deg,
    #B7680A ${jaaDeg + eiDeg}deg ${jaaDeg + eiDeg + tyhjaDeg}deg,
    #EDEAE3 ${jaaDeg + eiDeg + tyhjaDeg}deg 360deg
  )`

  const rows = [
    { color:'#1A5C3A', label:'Jaa',    pct: pctJaa,   count: jaa   },
    { color:'#C0392B', label:'Ei',     pct: pctEi,    count: ei    },
    { color:'#B7680A', label:'Tyhjää', pct: pctTyhja, count: tyhja },
    { color:'#EDEAE3', label:'Poissa', pct: Math.round(poissa/total*100), count: poissa },
  ]

  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <div style={{ position:'relative', width:88, height:88, flexShrink:0 }}>
        <div style={{ width:88, height:88, borderRadius:'50%', background: gradient }} />
        <div style={{
          position:'absolute', inset:14, borderRadius:'50%',
          background:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1rem',
        }}>
          {pctJaa}%
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {rows.map(r => (
          <div key={r.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: r.color, flexShrink:0 }} />
            <span className="body-sm" style={{ minWidth:46 }}>{r.label}</span>
            <span style={{ fontSize:'0.8125rem', fontWeight:500, marginLeft:'auto', paddingLeft:8 }}>{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MpProfile() {
  const { id } = useParams()
  const { data: mp, loading: mpLoading } = useMp(id)
  const [topicFilter, setTopicFilter] = useState('')
  const [choiceFilter, setChoiceFilter] = useState('')
  const { data: votes, loading: votesLoading } = useMpVotes(id, { topic: topicFilter, choice: choiceFilter })

  if (mpLoading) return <div className="page"><div className="container"><Loading /></div></div>
  if (!mp) return <div className="page"><div className="container"><p>Edustajaa ei löydy.</p></div></div>

  return (
    <div className="page">
      <div className="container">

        {/* Back */}
        <Link to="/" className="btn" style={{ marginBottom:'1.5rem', display:'inline-flex' }}>
          ← Takaisin listaan
        </Link>

        {/* Header */}
        <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:'1.75rem', flexWrap:'wrap' }}>
          <MPAvatar name={mp.name} party={mp.party} size={72} />
          <div style={{ flex:1, minWidth:200 }}>
            <h1 className="h1" style={{ marginBottom:8 }}>{mp.name}</h1>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:6 }}>
              <PartyPill party={mp.party} />
              <span className="body-sm">{mp.constituency}</span>
              <span style={{ color:'var(--border-md)' }}>·</span>
              <span className="body-sm">Edustaja 2011–</span>
            </div>
            <div className="body-sm">Sosiaali- ja terveysvaliokunta · Suuri valiokunta</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{
              fontFamily:'var(--font-head)', fontWeight:800, fontSize:'2.5rem',
              letterSpacing:'-0.03em',
              color: mp.attendance_pct >= 90 ? 'var(--accent)' : mp.attendance_pct >= 75 ? 'var(--warn)' : 'var(--danger)',
            }}>
              {mp.attendance_pct?.toFixed(1)}%
            </div>
            <div className="label">läsnäolo · sija #{mp.rank}</div>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:8, marginBottom:'1.5rem' }}>
          <StatCard label="Äänestyksiä"         value={mp.total_votes?.toLocaleString('fi')} sub="tällä kaudella" />
          <StatCard label="Äänestänyt"           value={`${mp.participation_pct?.toFixed(1)}%`} sub="paikalla ollessaan" accent />
          <StatCard label="Poissa äänestyksiä"   value={mp.voted_poissa?.toLocaleString('fi')} />
          <StatCard label="Puolueen linja"       value="94%" sub="yhteneväinen" />
        </div>

        {/* Two-column: donut + monthly bars */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1.25rem' }}>
          <div className="card">
            <div className="h3" style={{ marginBottom:14 }}>Äänestysjakauma</div>
            <DonutStat
              jaa={mp.voted_jaa} ei={mp.voted_ei}
              tyhja={mp.voted_tyhja} poissa={mp.voted_poissa}
            />
          </div>

          <div className="card">
            <div className="h3" style={{ marginBottom:14 }}>Läsnäolo kuukausittain</div>
            <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:84 }}>
              {[...(mp.monthly_attendance || [])].reverse().map(m => (
                <MonthBar key={m.month} month={m.month} present={m.present} total={m.total} />
              ))}
            </div>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="card" style={{ marginBottom:'1.25rem' }}>
          <div className="h3" style={{ marginBottom:14 }}>Äänestykset aihealueittain</div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {(mp.by_topic || []).map((t, i) => (
              <div key={t.topic} style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 0',
                borderBottom: i < mp.by_topic.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width:160, fontSize:'0.875rem', flexShrink:0 }}>{TOPIC_LABELS[t.topic] || t.topic}</div>
                <AttendanceBar pct={t.participation_pct} height={5} />
                <div style={{
                  fontSize:'0.875rem', fontWeight:500, width:36, textAlign:'right', flexShrink:0,
                  color: t.participation_pct >= 90 ? 'var(--accent)' : 'var(--warn)',
                }}>
                  {t.participation_pct}%
                </div>
                <div className="body-sm" style={{ width:60, textAlign:'right', flexShrink:0 }}>
                  {t.total} ään.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote history */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <div className="h3">Viimeisimmät äänestykset</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['', 'jaa', 'ei', 'tyhja', 'poissa'].map(c => (
                <button key={c} onClick={() => setChoiceFilter(c)} style={{
                  padding:'4px 10px', fontSize:'0.75rem', borderRadius:99,
                  border:'1px solid var(--border-md)',
                  background: choiceFilter === c ? 'var(--ink)' : 'transparent',
                  color:  choiceFilter === c ? '#fff' : 'var(--ink-2)',
                  cursor:'pointer',
                }}>
                  {c === '' ? 'Kaikki' : c === 'jaa' ? 'Jaa' : c === 'ei' ? 'Ei' : c === 'tyhja' ? 'Tyhjää' : 'Poissa'}
                </button>
              ))}
            </div>
          </div>

          {votesLoading ? <Loading /> : (
            <div>
              {votes.map((v, i) => (
                <div key={v.vote_id} style={{
                  display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0',
                  borderBottom: i < votes.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <ChoiceBadge choice={v.choice} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:500, lineHeight:1.4, marginBottom:3 }}>
                      {v.title}
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <span className="body-sm">{v.date}</span>
                      <span className="body-sm" style={{ color:'var(--ink-3)' }}>·</span>
                      <span className="body-sm">{v.result} {v.yeas}–{v.nays}</span>
                    </div>
                  </div>
                  <div style={{
                    padding:'2px 8px', borderRadius:'var(--radius-sm)',
                    background:'var(--bg-muted)', fontSize:'0.6875rem',
                    color:'var(--ink-3)', flexShrink:0,
                  }}>
                    {TOPIC_LABELS[v.topic] || v.topic}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="body-sm" style={{ marginTop:'1rem', textAlign:'center' }}>
          Lähde: <a href="https://avoindata.eduskunta.fi" target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>avoindata.eduskunta.fi</a>
        </p>
      </div>
    </div>
  )
}
