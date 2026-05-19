import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { SignalsPage } from './pages/SignalsPage'
import { CrisesPage } from './pages/CrisesPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { TracePage } from './pages/TracePage'
import { ComparePage } from './pages/ComparePage'
import { SettingsPage } from './pages/SettingsPage'

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
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Shell>
  )
}

export default App
