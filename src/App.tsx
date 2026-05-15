import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { SignalsPage } from './pages/SignalsPage'
import { CrisesPage } from './pages/CrisesPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { TracePage } from './pages/TracePage'
import { ComparePage } from './pages/ComparePage'
import { ReplayPage } from './pages/ReplayPage'
import { WhatIfPage } from './pages/WhatIfPage'

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/crises" element={<CrisesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/trace" element={<TracePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/replay" element={<ReplayPage />} />
        <Route path="/whatif" element={<WhatIfPage />} />
      </Routes>
    </Shell>
  )
}

export default App
