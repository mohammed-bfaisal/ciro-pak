# Requirements Compliance

## Core Challenge Requirements

| Area | Evidence in app | Verification |
| --- | --- | --- |
| Multi-city Pakistan coverage | `src/data/cities.ts` includes 16 Pakistan cities. | Run `npm test`; city registry tests validate metadata. |
| Incident simulation | `src/simulation/sessionEngine.ts` activates queued incidents as shift time advances. | Press `Simulate` and use speed controls. |
| Manual dispatch | `src/components/map/CiroMap.tsx` dispatches selected units to incident markers. | Use Manual mode, select unit, tap/click incident. |
| AI-assisted dispatch | `src/agents/resourceAllocator.ts` scores candidate resources. | Press `AI Dispatch` and inspect operations rail or Trace. |
| Live weather/traffic/routing path | `src/api/weather.ts`, `src/api/traffic.ts`, and `src/api/routing.ts` use backend-aware adapters. | Configure `VITE_API_BASE_URL`; verify Settings backend status. |
| Secret safety | Provider keys are read only by `backend/src/config/env.ts`. | Search frontend source and build output for provider keys before submission. |
| Mobile APK parity | Capacitor config uses `dist`; UI has mobile operations dock and safe-area shell. | Build debug APK and complete the demo script on device/emulator. |
| Traceability | Trace page and operations rail show decisions, execution, and impact snapshots. | Run simulation plus AI dispatch, then open Trace. |
| Fallback resilience | Weather, traffic, route, and backend health adapters return safe fallback state. | Disable backend preference in Settings and repeat dispatch. |

## Current Residual Risks

- GitHub Actions are not configured, so local verification output must be captured.
- The final Cloud Run URL and APK download link must be filled in after deployment/build.
- Native Android verification depends on local JDK and Android SDK availability.

## Required Final Verification Commands

```bash
npm test
npm run build
npm run lint
cd backend
npm test
```
