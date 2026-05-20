import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { SignalsPage } from './pages/SignalsPage'
import { CrisesPage } from './pages/CrisesPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { TracePage } from './pages/TracePage'
import { ComparePage } from './pages/ComparePage'
import { SettingsPage } from './pages/SettingsPage'
import { SessionCompleteBanner } from './components/hud/SessionCompleteBanner'
import { useResourceStore } from './store/resourceStore'
import { useSessionStore } from './store/sessionStore'
import { useCityStore } from './store/cityStore'
import { useCrisisStore } from './store/crisisStore'
import { runAIDispatch } from './agents/orchestrator'

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 's' || e.key === 'S') {
        const rs = useResourceStore.getState();
        const ss = useSessionStore.getState();
        const city = useCityStore.getState().city;
        if (!ss.live || ss.live.session.city !== city) {
          ss.start(city);
          useResourceStore.setState({ simulationRunning: true, isPaused: false });
        } else {
          rs.toggleSimulation();
        }
      }

      if (e.key === 'd' || e.key === 'D') {
        const ss = useSessionStore.getState();
        const city = useCityStore.getState().city;
        if (!ss.live || ss.live.session.city !== city) {
          ss.start(city);
          useResourceStore.setState({ simulationRunning: true, isPaused: false });
        }
        if (useCrisisStore.getState().crises.length === 0) ss.tick(6);
        useResourceStore.getState().setDispatchMode('off');
        void runAIDispatch(city);
      }

      if (e.key === 'Escape') {
        useCrisisStore.getState().selectCrisis(null);
        useResourceStore.getState().selectUnit(null);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function App() {
  useKeyboardShortcuts();

  return (
    <Shell>
      <SessionCompleteBanner />
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
