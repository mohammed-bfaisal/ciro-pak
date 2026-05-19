# APK Checklist

## Build

```bash
npm install
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

Java requirement: Java 11 or newer must be active in `JAVA_HOME` and `PATH`.

Expected debug APK path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Manual APK Smoke Test

- Launches on Android without a localhost server.
- Dashboard fits a narrow phone viewport without overlapping bottom navigation.
- City selector opens and changes city.
- Settings opens from the top bar.
- Settings toggles can be tapped.
- Simulate starts the shift.
- Pause/resume and speed controls work.
- Manual dispatch works by selecting a unit and tapping an incident marker.
- AI Dispatch assigns units and produces trace events.
- Crisis detail panel opens and closes cleanly.
- Signal panel opens and closes cleanly.
- Map overlays can be toggled from Settings.
- Offline or backend-disabled mode still runs with fallback data.

## Secret Check

Before sharing the APK, inspect source and build artifacts for real provider keys. No key should appear in:

- `src/`
- `dist/`
- `android/app/src/main/assets/`
- APK contents after unzip

Only `VITE_API_BASE_URL` is allowed in frontend build configuration.
