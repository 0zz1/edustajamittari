import { useState, useEffect } from 'react'
import {
  MOCK_LEADERBOARD, MOCK_MP, MOCK_MP_VOTES, MOCK_QUESTIONS
} from '../mockData.js'

const USE_MOCK = true   // flip to false when backend is running

async function apiFetch(path) {
  const res = await fetch(`/api${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

export function useLeaderboard({ sort = 'attendance', party = '', order = 'desc' } = {}) {
  const [data, setData]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    if (USE_MOCK) {
      setTimeout(() => {
        let d = [...MOCK_LEADERBOARD]
        if (party) d = d.filter(m => m.party === party)
        if (sort === 'abstain') d.sort((a, b) => b.abstain_pct - a.abstain_pct)
        else if (sort === 'participation') d.sort((a, b) => b.participation_pct - a.participation_pct)
        else d.sort((a, b) => b.attendance_pct - a.attendance_pct)
        if (order === 'asc') d.reverse()
        d = d.map((m, i) => ({ ...m, rank: i + 1 }))
        setData(d)
        setLoading(false)
      }, 400)
      return
    }

    apiFetch(`/leaderboard?sort=${sort}&party=${encodeURIComponent(party)}&order=${order}`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [sort, party, order])

  return { data, loading, error }
}

export function useMp(id) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    if (USE_MOCK) {
      setTimeout(() => { setData(MOCK_MP); setLoading(false) }, 300)
      return
    }

    apiFetch(`/mp/${id}`)
      .then(r => { setData(r); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  return { data, loading, error }
}

export function useMpVotes(id, { topic = '', choice = '' } = {}) {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    if (USE_MOCK) {
      setTimeout(() => {
        let d = [...MOCK_MP_VOTES]
        if (topic)  d = d.filter(v => v.topic  === topic)
        if (choice) d = d.filter(v => v.choice === choice)
        setData(d)
        setLoading(false)
      }, 200)
      return
    }

    const params = new URLSearchParams({ topic, choice, limit: 50 }).toString()
    apiFetch(`/mp/${id}/votes?${params}`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id, topic, choice])

  return { data, loading }
}

export function useVaalikoneQuestions() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => { setData(MOCK_QUESTIONS); setLoading(false) }, 300)
      return
    }
    apiFetch('/vaalikone/questions?limit=8')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { data, loading }
}

export async function fetchVaalikoneMatch(votes) {
  if (USE_MOCK) {
    // Simulate matching against mock leaderboard
    const { MOCK_MP_VOTES: mpVotes, MOCK_LEADERBOARD: mps } = await import('../mockData.js')
    const MP_VOTE_MAP = {
      '1':  { v4:'ei', v2:'ei', v3:'jaa', v5:'jaa', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa' },
      '2':  { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '3':  { v4:'ei', v2:'ei', v3:'jaa', v5:'jaa', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa' },
      '4':  { v4:'ei', v2:'ei', v3:'jaa', v5:'jaa', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa' },
      '5':  { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '6':  { v4:'ei', v2:'ei', v3:'jaa', v5:'jaa', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa' },
      '7':  { v4:'ei', v2:'jaa',v3:'jaa', v5:'ei', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa'  },
      '8':  { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'jaa', v8:'ei' },
      '9':  { v4:'ei', v2:'ei', v3:'jaa', v5:'jaa', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa' },
      '10': { v4:'ei', v2:'jaa',v3:'jaa', v5:'ei', v7:'ei', v1:'ei', v6:'jaa', v8:'jaa'  },
      '11': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '12': { v4:'jaa',v2:'jaa',v3:'ei',  v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '13': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '14': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'jaa', v8:'ei' },
      '15': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '16': { v4:'jaa',v2:'jaa',v3:'ei',  v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '17': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '18': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '19': { v4:'jaa',v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
      '20': { v4:'ei', v2:'jaa',v3:'jaa', v5:'ei', v7:'jaa', v1:'jaa', v6:'ei', v8:'ei'  },
    }
    const results = mps.map(mp => {
      const mpVoteMap = MP_VOTE_MAP[mp.id] || {}
      let match = 0, total = 0
      Object.entries(votes).forEach(([vid, userChoice]) => {
        if (userChoice === 'skip') return
        const mpChoice = mpVoteMap[vid]
        if (!mpChoice || mpChoice === 'poissa') return
        total++
        if (userChoice === mpChoice) match++
      })
      return { ...mp, match_pct: total ? Math.round((match / total) * 100) : 0, matched: match, total }
    })
    results.sort((a, b) => b.match_pct - a.match_pct)
    return results.map((r, i) => ({ ...r, rank: i + 1 }))
  }

  const voteStr = Object.entries(votes)
    .filter(([, c]) => c !== 'skip')
    .map(([id, c]) => `${id}:${c}`)
    .join(',')
  const res = await fetch(`/api/vaalikone/match?votes=${encodeURIComponent(voteStr)}`)
  const json = await res.json()
  return json.data
}
