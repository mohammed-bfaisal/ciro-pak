import { useRef, useState, useEffect } from 'react';
import { CiroMap } from '../components/map/CiroMap';
import { SignalFeed } from '../components/panels/SignalFeed';
import { CrisisPanel } from '../components/panels/CrisisPanel';
import { DesktopOperationsRail } from '../components/hud/DesktopOperationsRail';
import { MobileOperationsDock } from '../components/hud/MobileOperationsDock';
import { useCrisisStore } from '../store/crisisStore';
import { useSignalStore } from '../store/signalStore';
import { useCityStore } from '../store/cityStore';
import { useResourceStore } from '../store/resourceStore';
import { useSessionStore } from '../store/sessionStore';
import { useLiveDataStore } from '../store/liveDataStore';
import { getApiClientOptionsForSettings, useSettingsStore } from '../store/settingsStore';
import { colors } from '../constants/colors';
import { Radio, X } from 'lucide-react';
import { fetchRoute } from '../api/routing';
import { fetchTrafficFlow } from '../api/traffic';
import { fetchWeather } from '../api/weather';
import { getTrafficRefreshScopes } from '../utils/trafficScopes';
import { ensureDashboardCityState } from '../utils/dashboardRunState';

const MOVEMENT_TICK_MS = 250;
const ROUTE_REFRESH_MS = 30_000;
const WEATHER_REFRESH_MS = 120_000;
const TRAFFIC_REFRESH_MS = 30_000;
const MAX_TRAFFIC_SCOPES = 8;

export function Dashboard() {
  const city              = useCityStore((s) => s.city);
  const previousCityRef   = useRef<typeof city | null>(null);
  const [showSignals, setShowSignals] = useState(false);
  const selectedCrisisId  = useCrisisStore((s) => s.selectedCrisisId);
  const selectCrisis      = useCrisisStore((s) => s.selectCrisis);
  const crises            = useCrisisStore((s) => s.crises);
  const signalCount       = useSignalStore((s) => s.signals.length);
  const crisisCount       = crises.length;

  const isPaused          = useResourceStore((s) => s.isPaused);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const simulationSpeed   = useResourceStore((s) => s.simulationSpeed);
  const tick              = useResourceStore((s) => s.tick);
  const resources         = useResourceStore((s) => s.resources);
  const sessionTick       = useSessionStore((s) => s.tick);
  const resolveSession    = useSessionStore((s) => s.resolve);
  const enableWeatherUpdates = useSettingsStore((s) => s.enableWeatherUpdates);
  const enableTrafficUpdates = useSettingsStore((s) => s.enableTrafficUpdates);
  const preferBackendData = useSettingsStore((s) => s.preferBackendData);
  const trafficSignalCount = useSignalStore((s) => s.signals.filter((signal) => signal.source === 'traffic').length);

  // Close local panels when city changes, and reload resources only when the city really changes.
  useEffect(() => {
    const previousCity = previousCityRef.current;
    previousCityRef.current = city;
    selectCrisis(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowSignals(false);
    ensureDashboardCityState(city, previousCity);
  }, [city, selectCrisis]);

  useEffect(() => {
    if (!enableWeatherUpdates) {
      useLiveDataStore.getState().setWeatherDisabled();
      return;
    }

    let cancelled = false;

    const refreshWeather = () => {
      void fetchWeather(city, getApiClientOptionsForSettings()).then((signal) => {
        if (cancelled) return;
        useLiveDataStore.getState().setWeatherSignal(city, signal);
        useSignalStore.getState().upsertSignal(signal);
      });
    };

    refreshWeather();
    const id = window.setInterval(refreshWeather, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [city, simulationRunning, enableWeatherUpdates, preferBackendData]);

  // Movement tick: at 1x, one real second advances one route second.
  useEffect(() => {
    if (!simulationRunning || isPaused) return;
    const id = setInterval(() => {
      const deltaSeconds = simulationSpeed * (MOVEMENT_TICK_MS / 1000);
      tick(deltaSeconds);
      sessionTick(deltaSeconds / 60);
    }, MOVEMENT_TICK_MS);
    return () => clearInterval(id);
  }, [simulationRunning, isPaused, simulationSpeed, tick, sessionTick]);

  useEffect(() => {
    if (!simulationRunning || isPaused) return;

    const refreshActiveRoutes = () => {
      const store = useResourceStore.getState();
      store.resources
        .filter((resource) => resource.status === 'en_route' && resource.targetPosition)
        .forEach((resource) => {
          const target = resource.targetPosition!;
          void fetchRoute(
            resource.currentPosition.lng,
            resource.currentPosition.lat,
            target.lng,
            target.lat,
            getApiClientOptionsForSettings(),
          ).then((route) => {
            if (!route) return;
            useResourceStore.getState().updateRoute(resource.id, route, new Date().toISOString());
          });
        });
    };

    refreshActiveRoutes();
    const id = setInterval(refreshActiveRoutes, ROUTE_REFRESH_MS);
    return () => clearInterval(id);
  }, [simulationRunning, isPaused, trafficSignalCount, preferBackendData]);

  useEffect(() => {
    if (!enableTrafficUpdates) {
      useLiveDataStore.getState().setTrafficDisabled();
      return;
    }
    if (!simulationRunning || isPaused) return;
    let cancelled = false;

    const refreshTraffic = () => {
      const trafficScopes = getTrafficRefreshScopes(city).slice(0, MAX_TRAFFIC_SCOPES);
      trafficScopes.forEach((scope) => {
        void fetchTrafficFlow(scope.lat, scope.lng, getApiClientOptionsForSettings()).then((flow) => {
          if (cancelled) return;
          useLiveDataStore.getState().setTrafficFlow(scope.key, flow);
        });
      });
    };

    refreshTraffic();
    const id = window.setInterval(refreshTraffic, TRAFFIC_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [city, simulationRunning, isPaused, trafficSignalCount, crisisCount, enableTrafficUpdates, preferBackendData]);

  useEffect(() => {
    crises.forEach((crisis) => {
      if (crisis.status !== 'responding') return;
      const assigned = resources.filter((resource) => resource.assignedCrisisId === crisis.id);
      if (assigned.length === 0) return;
      const onScene = assigned.filter((resource) => resource.status === 'on_scene' || resource.status === 'returning');
      const enoughUnitsArrived = onScene.length >= Math.min(2, assigned.length);
      if (!enoughUnitsArrived) return;

      const responseMinutes = Math.max(
        1,
        ...assigned.map((resource) => resource.lastEtaMinutes ?? resource.etaMinutes ?? 1),
      );
      resolveSession(crisis.id, responseMinutes);
    });
  }, [crises, resources, resolveSession]);

  return (
    <div className="absolute inset-0">
      {/* Map fills entire viewport */}
      <CiroMap city={city} onCrisisClick={(id) => selectCrisis(id)} />

      {/* 3-button control bar — top center */}

      {/* Signal feed toggle — top left */}
      <div className="hidden desktop:block absolute top-3 left-3 z-20">
        <button
          onClick={() => setShowSignals(!showSignals)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: showSignals ? colors.amber : 'rgba(17,17,17,0.85)',
            color: showSignals ? colors.void : colors.amber,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colors.borderAmber}`,
          }}
        >
          <Radio size={16} />
          <span className="hidden tablet:inline">Signals</span>
          {signalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{
              background: showSignals ? 'rgba(0,0,0,0.2)' : colors.amberMuted,
              color: showSignals ? colors.void : colors.amber,
            }}>
              {signalCount}
            </span>
          )}
        </button>
      </div>

      {/* Active crises badge — top right */}
      {/* Signal feed panel */}
      {showSignals && (
        <div className="absolute top-0 left-0 bottom-0 z-20 w-[320px] mobile:w-full border-r" style={{
          background: 'rgba(17,17,17,0.92)',
          backdropFilter: 'blur(20px)',
          borderColor: colors.borderDefault,
        }}>
          <div className="absolute top-3 right-3 z-10">
            <button onClick={() => setShowSignals(false)} style={{ color: colors.textDim }}>
              <X size={18} />
            </button>
          </div>
          <SignalFeed />
        </div>
      )}

      {/* Crisis detail panel */}
      {selectedCrisisId && (
        <CrisisPanel crisisId={selectedCrisisId} onClose={() => selectCrisis(null)} />
      )}

      {!selectedCrisisId && (
        <DesktopOperationsRail onSelectCrisis={(id) => selectCrisis(id)} />
      )}

      {!selectedCrisisId && !showSignals && (
        <MobileOperationsDock
          showSignals={showSignals}
          onToggleSignals={() => setShowSignals((value) => !value)}
          onSelectCrisis={(id) => selectCrisis(id)}
        />
      )}
    </div>
  );
}
