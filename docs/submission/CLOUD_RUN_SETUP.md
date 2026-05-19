# Cloud Run Setup

## Backend Service

The backend lives in `backend/` and exposes proxy endpoints for weather, traffic, routing, and health checks.

Required environment variables:

```bash
PORT=8080
ALLOWED_ORIGINS=https://your-web-origin.example,http://localhost:5173
WEATHER_API_KEY=server_side_weather_key
TOMTOM_API_KEY=server_side_tomtom_key
```

## Local Backend Verification

```bash
cd backend
npm install
npm test
npm run build
npm run dev
```

Smoke checks:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/weather/karachi
curl "http://localhost:8080/api/traffic/flow?lat=24.86&lng=67.01"
curl "http://localhost:8080/api/route?fromLng=67.01&fromLat=24.86&toLng=67.04&toLat=24.88"
```

## Cloud Run Deployment Notes

- Use backend environment variables in Cloud Run service configuration.
- Do not bake provider keys into frontend build artifacts.
- Set `ALLOWED_ORIGINS` to the deployed web origin and any approved local demo origin.
- After deployment, build frontend and APK with:

```bash
$env:VITE_API_BASE_URL="https://your-cloud-run-service-url"
npm run build
npx cap sync android
```

## Health Proof For Judges

Capture:

- Cloud Run service URL.
- `/api/health` output.
- Settings page screenshot showing backend status.
- A route or traffic request proving provider-backed data or fallback state.
