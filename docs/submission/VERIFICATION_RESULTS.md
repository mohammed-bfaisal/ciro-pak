# Verification Results

Date: 2026-05-19

## Local Verification Passed

Frontend tests:

```bash
npm test
```

Result: passed, 17 test files and 42 tests.

Frontend production build:

```bash
npm run build
```

Result: passed. Vite reported the existing large-chunk warning.

Frontend lint:

```bash
npm run lint
```

Result: passed with 5 existing React hook warnings in `src/components/map/CiroMap.tsx`.

Backend tests:

```bash
cd backend
npm test
```

Result: passed, 7 backend provider tests.

Capacitor sync:

```bash
npm run build
npx cap sync android
```

Result: passed.

## APK Build Attempt

Command:

```bash
cd android
.\gradlew.bat assembleDebug
```

Result: blocked by local Java version.

Exact blocker:

```text
Dependency requires at least JVM runtime version 11. This build uses a Java 8 JVM.
```

Current local JVM:

```text
java version "1.8.0_491"
```

Required next step: run the same Gradle command with Java 11 or newer selected in `JAVA_HOME` and `PATH`.

## Cloud Run Deployment Attempt

Command:

```bash
gcloud --version
```

Result: blocked because Google Cloud CLI is not installed in this shell.

Exact blocker:

```text
gcloud : The term 'gcloud' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

Required next step: deploy `backend/` from an environment with Google Cloud CLI configured for the target project, then set `VITE_API_BASE_URL` to the deployed Cloud Run URL before the final web/APK build.

## Cloud Run Google Traffic Verification

Date: 2026-05-20

Cloud Run service:

```text
https://ciro-backend-nx552zjyba-el.a.run.app
```

Deployment revision:

```text
ciro-backend-00006-7xq
```

Server-side secret wiring:

- `GOOGLE_MAPS_API_KEY` is mounted from Secret Manager secret `ciro-google-maps-api-key`.
- `WEATHER_API_KEY` is mounted from Secret Manager secret `ciro-weather-api-key`.
- `OPENROUTER_API_KEY` is mounted from Secret Manager secret `ciro-openrouter-api-key`.
- No Google Maps key is stored in frontend source, local storage, or Android APK assets.

Smoke command:

```powershell
$base='https://ciro-backend-nx552zjyba-el.a.run.app'
$health=Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 30
$traffic=Invoke-RestMethod -Uri "$base/api/traffic/flow?lat=24.8607&lng=67.0011" -TimeoutSec 30
$route=Invoke-RestMethod -Uri "$base/api/route?fromLng=67.0011&fromLat=24.8607&toLng=67.0708&toLat=24.8790" -TimeoutSec 30
```

Verified result:

```json
{
  "HealthVersion": "b000280",
  "TrafficProvider": "google_routes",
  "RoutingProvider": "google_routes",
  "TrafficResponseProvider": "google",
  "TrafficSegments": 3,
  "RouteProvider": "google",
  "RouteTrafficSegments": 8,
  "RouteDistanceMeters": 11177,
  "RouteEtaSeconds": 2002,
  "Speech": "disabled"
}
```

Interpretation:

- `/api/health` confirms the deployed backend revision exposes the current provider contract.
- `/api/traffic/flow` confirms Google Routes-backed road traffic segments are available for Karachi.
- `/api/route` confirms vehicle routes now include Google traffic-aware route geometry and traffic segments.
- Speech remains intentionally disabled until an OpenRouter speech model is configured.

## Cloud Run Google Map Tiles Verification

Date: 2026-05-20

Deployment revision:

```text
ciro-backend-00007-dzw
```

Smoke result:

```json
{
  "Version": "ea9d720",
  "TrafficProvider": "google_routes",
  "RoutingProvider": "google_routes",
  "MapTilesProvider": "google_map_tiles",
  "TrafficResponse": "google",
  "TrafficSegments": 3,
  "RouteProvider": "google",
  "RouteTrafficSegments": 12,
  "TileSessionProvider": "google",
  "TileMode": "satellite",
  "TileUrl": "/api/map-tiles/tiles/satellite/{z}/{x}/{y}",
  "TileUrlLeaksKey": false
}
```

Tile byte check:

```json
{
  "Status": 200,
  "ContentType": "image/png",
  "Bytes": 12744
}
```

Interpretation:

- `/api/map-tiles/session` creates a backend-managed Google Map Tiles session.
- Frontend receives only a proxied tile template, never the Google Maps API key.
- `/api/map-tiles/tiles/dark/8/179/105` returns PNG tile bytes through Cloud Run.

## Final Submission Fields Still Needed

- Cloud Run service URL.
- APK download link.
- Recorded demo video link.
- Development usage video link.
- Compressed implementation trace/logs package link.

## Current Confidence

The repository is ready for final environment-dependent packaging. Local web build, frontend tests, backend tests, docs, settings, live adapters, map overlays, route indicators, and fallback paths have been verified. Native APK assembly and Cloud Run deployment require environment setup that is not present in this shell.
