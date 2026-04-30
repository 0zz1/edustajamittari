import { Routes, Route } from 'react-router-dom'
import { Nav } from './components/UI.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import MpProfile   from './pages/MpProfile.jsx'
import Vaalikone   from './pages/Vaalikone.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"           element={<Leaderboard />} />
        <Route path="/mp/:id"     element={<MpProfile />}   />
        <Route path="/vaalikone"  element={<Vaalikone />}   />
      </Routes>
    </>
  )
}
