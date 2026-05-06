import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useVaalikoneQuestions, fetchVaalikoneMatch } from '../hooks/useApi.js'
import { MPAvatar, PartyPill, AttendanceBar, Loading } from '../components/UI.jsx'
import { PARTY_META } from '../mockData.js'

const TOPIC_LABELS = {
  sosiaali:'Sosiaali & terveys', talous:'Talous & budjetti',
  ympäristö:'Ympäristö', koulutus:'Koulutus', turvallisuus:'Turvallisuus',
  maahanmuutto:'Maahanmuutto', asuminen:'Asuminen', demokratia:'Demokratia',
}

function ProgressDots({ total, current, answers }) {
  return (
    <div style={{ display:'flex', gap:4, alignItems:'center', marginBottom:'1.25rem' }}>
      {Array.from({ length: total }).map((_, i) => {
        const answered = answers[i] !== undefined && answers[i] !== null
        const active = i === current
        return (
          <div key={i} style={{
            width: active ? 20 : 7, height:7,
            borderRadius:99,
            background: active ? 'var(--ink)' : answered ? 'var(--accent)' : 'var(--bg-muted)',
            border: '1px solid var(--border-md)',
            transition:'all 0.2s ease',
          }} />
        )
      })}
      <span className="label" style={{ marginLeft:'auto' }}>
        {Object.values(answers).filter(Boolean).length} / {total}
      </span>
    </div>
  )
}

function VoteButton({ choice, selected, onClick }) {
  const styles = {
    jaa:  { bg: selected ? 'var(--accent)'  : 'var(--bg-card)', text: selected ? '#fff' : 'var(--ink)', border: selected ? 'var(--accent)' : 'var(--border-md)' },
    ei:   { bg: selected ? 'var(--danger)'  : 'var(--bg-card)', text: selected ? '#fff' : 'var(--ink)', border: selected ? 'var(--danger)' : 'var(--border-md)' },
    skip: { bg: selected ? 'var(--bg-muted)': 'var(--bg-card)', text: 'var(--ink-3)',                   border: 'var(--border-md)' },
  }
  const s = styles[choice]
  const labels = { jaa:'Kannatan — Jaa', ei:'Vastustаn — Ei', skip:'Ohita' }

  return (
    <button onClick={onClick} style={{
      flex: choice === 'skip' ? 0.5 : 1,
      padding:'11px 8px', fontSize:'0.875rem', fontWeight: selected ? 500 : 400,
      borderRadius:'var(--radius-md)', border:`1px solid ${s.border}`,
      background: s.bg, color: s.text, cursor:'pointer',
      transition:'all 0.15s',
    }}>
      {labels[choice]}
    </button>
  )
}

function QuizScreen({ questions, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers]  = useState({})
  const q = questions[current]

  function vote(choice) {
    const next = { ...answers, [q.id]: choice }
    setAnswers(next)
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), choice === 'skip' ? 0 : 200)
    } else {
      setTimeout(() => onComplete(next), 300)
    }
  }

  return (
    <div style={{ maxWidth:620, margin:'0 auto' }}>
      <ProgressDots total={questions.length} current={current} answers={answers} />

      <div className="card fade-up" key={current}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{
            fontSize:'0.6875rem', fontWeight:500, letterSpacing:'0.07em',
            textTransform:'uppercase', color:'var(--accent)',
          }}>
            {TOPIC_LABELS[q.topic] || q.topic}
          </span>
          <span className="label">{q.date}</span>
        </div>

        <h2 style={{
          fontFamily:'var(--font-head)', fontSize:'1.25rem', fontWeight:700,
          letterSpacing:'-0.01em', lineHeight:1.3, marginBottom:10,
        }}>
          {q.title}
        </h2>

        <p style={{ color:'var(--ink-2)', fontSize:'0.9375rem', lineHeight:1.7, marginBottom:14 }}>
          {q.description}
        </p>

        <div style={{
          background:'var(--bg-muted)', borderRadius:'var(--radius-md)',
          padding:'10px 12px', marginBottom:16,
        }}>
          <div className="label" style={{ marginBottom:4 }}>Tulos eduskunnassa</div>
          <div className="body-sm">{q.result}</div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <VoteButton choice="jaa"  selected={answers[q.id] === 'jaa'}  onClick={() => vote('jaa')}  />
          <VoteButton choice="ei"   selected={answers[q.id] === 'ei'}   onClick={() => vote('ei')}   />
          <VoteButton choice="skip" selected={answers[q.id] === 'skip'} onClick={() => vote('skip')} />
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn" style={{ opacity: current === 0 ? 0.3 : 1 }}
        >
          ← Edellinen
        </button>
        <button
          onClick={() => {
            if (current < questions.length - 1) setCurrent(c => c + 1)
            else onComplete(answers)
          }}
          className="btn"
        >
          {current < questions.length - 1 ? 'Seuraava →' : 'Näytä tulokset →'}
        </button>
      </div>
    </div>
  )
}

function ResultsScreen({ results, answers, questions, onReset }) {
  const [partyFilter, setPartyFilter] = useState('')
  const parties = [...new Set(results.map(r => r.party))]

  const filtered = partyFilter ? results.filter(r => r.party === partyFilter) : results

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 className="h1">Sinulle sopivimmat<br />edustajat</h2>
          <p className="body-sm" style={{ marginTop:4 }}>Perustuu todellisiin äänestyksiin — ei kampanjapuheisiin</p>
        </div>
        <button className="btn" onClick={onReset}>Aloita uudelleen</button>
      </div>

      {/* Party filter */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1.25rem' }}>
        <button
          onClick={() => setPartyFilter('')}
          className="pill"
          style={{ background: !partyFilter ? 'var(--ink)' : 'var(--bg-muted)', color: !partyFilter ? '#fff' : 'var(--ink-2)', border:'none', cursor:'pointer' }}
        >
          Kaikki
        </button>
        {parties.map(p => {
          const meta = PARTY_META[p] || {}
          const active = partyFilter === p
          return (
            <button key={p} onClick={() => setPartyFilter(p)} className="pill" style={{
              background: active ? meta.bg : 'transparent',
              color: active ? meta.text : 'var(--ink-2)',
              border: `1px solid ${active ? meta.text : 'var(--border-md)'}`,
              cursor:'pointer',
            }}>
              {p}
            </button>
          )
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1.5rem' }}>
        {filtered.slice(0, 6).map((mp, i) => (
          <Link to={`/mp/${mp.id}`} key={mp.id} className="card fade-up" style={{
            display:'flex', gap:12, alignItems:'center',
            textDecoration:'none', color:'inherit',
            border: i === 0 && !partyFilter ? '2px solid var(--accent)' : '1px solid var(--border)',
            animationDelay:`${i * 0.05}s`,
          }}>
            <MPAvatar name={mp.name} party={mp.party} size={44} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:500, fontSize:'0.875rem', marginBottom:4 }}>{mp.name}</div>
              <PartyPill party={mp.party} short />
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{
                fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.5rem',
                letterSpacing:'-0.02em',
                color: mp.match_pct >= 70 ? 'var(--accent)' : mp.match_pct >= 40 ? 'var(--warn)' : 'var(--danger)',
              }}>
                {mp.match_pct}%
              </div>
              <div className="label" style={{ fontSize:'0.5625rem' }}>vastaavuus</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Full ranked list */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div className="h3" style={{ marginBottom:12 }}>Kaikki edustajat {partyFilter && `— ${partyFilter}`}</div>
        {filtered.map((mp, i) => (
          <Link to={`/mp/${mp.id}`} key={mp.id} style={{
            display:'flex', alignItems:'center', gap:10, padding:'8px 0',
            borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            textDecoration:'none', color:'inherit',
          }}>
            <span style={{ color:'var(--ink-3)', fontSize:'0.8125rem', width:22, textAlign:'right', flexShrink:0 }}>{i+1}</span>
            <MPAvatar name={mp.name} party={mp.party} size={28} />
            <div style={{ flex:1, minWidth:0 }}>
              <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{mp.name}</span>
              <span style={{ marginLeft:6 }}><PartyPill party={mp.party} short /></span>
            </div>
            <div style={{ width:100, display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ flex:1, height:5, background:'var(--bg-muted)', borderRadius:3, overflow:'hidden' }}>
                <div style={{
                  height:5, borderRadius:3,
                  width:`${mp.match_pct}%`,
                  background: mp.match_pct >= 70 ? 'var(--accent)' : mp.match_pct >= 40 ? 'var(--warn)' : 'var(--danger)',
                }} />
              </div>
              <span style={{
                fontSize:'0.875rem', fontWeight:500, width:38, textAlign:'right', flexShrink:0,
                color: mp.match_pct >= 70 ? 'var(--accent)' : mp.match_pct >= 40 ? 'var(--warn)' : 'var(--danger)',
              }}>
                {mp.match_pct}%
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Answers recap */}
      <div className="card">
        <div className="h3" style={{ marginBottom:12 }}>Vastauksesi</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {questions.map(q => {
            const a = answers[q.id]
            if (!a) return null
            const colors = { jaa:['var(--accent-2)','var(--accent)'], ei:['var(--danger-2)','var(--danger)'], skip:['var(--bg-muted)','var(--ink-3)'] }
            const [bg, text] = colors[a] || colors.skip
            const label = a === 'jaa' ? 'Jaa' : a === 'ei' ? 'Ei' : 'Ohita'
            return (
              <div key={q.id} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                <span className="pill" style={{ background:bg, color:text, minWidth:48, justifyContent:'center', flexShrink:0 }}>{label}</span>
                <span className="body-sm" style={{ paddingTop:2 }}>{q.title}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Vaalikone() {
  const questions = []
  const [screen, setScreen] = useState('intro')  // intro | quiz | loading | results
  const [answers, setAnswers]  = useState({})
  const [results, setResults]  = useState([])

  async function handleComplete(ans) {
    setAnswers(ans)
    setScreen('loading')
    const res = await fetchVaalikoneMatch(ans)
    setResults(res)
    setScreen('results')
  }

  function reset() {
    setAnswers({})
    setResults([])
    setScreen('intro')
  }

  return (
    <div className="page">
      <div className="container">

        {screen === 'intro' && (
          <div style={{ maxWidth:620, margin:'0 auto' }}>
            <div className="label" style={{ marginBottom:'0.75rem' }}>Vaalikone</div>
            <h1 className="h1" style={{ marginBottom:'0.75rem' }}>
              Ei lupauksia.<br />Oikeat teot.
            </h1>
            <p style={{ color:'var(--ink-2)', fontSize:'1rem', lineHeight:1.75, marginBottom:'2rem', maxWidth:480 }}>
              Perinteiset vaalikoneет vertaavat sinua siihen, mitä edustajat <em>sanovat</em>.
              Tämä vertaa sinua siihen, miten he ovat <em>oikeasti äänestäneet</em> eduskunnassa.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'2rem' }}>
              {[
                'Kerro kantasi todellisiin eduskuntaäänestyksiin',
                'Ohita kysymykset, jotka eivät kiinnosta sinua',
                'Näe ketkä edustajat ovat toimineet arvojesi mukaan',
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{
                    width:24, height:24, borderRadius:'50%', flexShrink:0,
                    background:'var(--accent-2)', color:'var(--accent)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-head)', fontWeight:800, fontSize:'0.75rem',
                  }}>{i+1}</div>
                  <p className="body-sm" style={{ paddingTop:4 }}>{step}</p>
                </div>
              ))}
            </div>

           <button className="btn" style={{ width:'100%', padding:'13px', fontSize:'1rem', borderRadius:'var(--radius-md)', opacity:0.5, cursor:'not-allowed' }}
            disabled>
            Tulossa myöhemmin
          </button>
          </div>
        )}

        {screen === 'quiz' && (
          <QuizScreen questions={questions} onComplete={handleComplete} />
        )}

        {screen === 'loading' && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div className="spinner" style={{ margin:'0 auto 1rem' }} />
            <p className="body-sm">Lasketaan vastaavuuksia 200 edustajalle...</p>
          </div>
        )}

        {screen === 'results' && (
          <ResultsScreen
            results={results}
            answers={answers}
            questions={questions}
            onReset={reset}
          />
        )}
      </div>
    </div>
  )
}
