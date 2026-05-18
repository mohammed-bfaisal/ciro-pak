# Demo And Acceptance Checklist

## Operator Demo

1. Run `npm run dev`.
2. Open the Vite URL in a desktop browser.
3. Select Karachi, Islamabad, Peshawar, Lahore, Quetta, or Gwadar to show that scenarios are city-driven.
4. Press `Simulate`.
5. Confirm the signal counter increases and incident markers pulse onto the map.
6. Use `2x` and `4x`; signals, incident activation, and vehicle movement should speed up.
7. Select `Manual`, choose an available unit, and click an incident marker.
8. Confirm the unit moves on a visible path and the incident registry shows assigned units.
9. Press `AI Dispatch`.
10. Confirm scored allocations appear in the agent trace before or during dispatch movement.
11. Review the before/after impact panel for action state changes.
12. Open a crisis detail panel and inspect signals, resources, actions, and messages.
13. Wait for units to reach the incident and confirm the score HUD changes.
14. Confirm units transition through `on_scene`, `returning`, and `available`.

## Challenge 3 Evidence To Show

- Source credibility and conflicting signals in crisis detail.
- Agent trace with observation, inference, decision, and execution.
- Before/after impact snapshots.
- Stakeholder messages for public, hospitals, utilities, emergency services, transport, and media.
- False-alert correction or retraction entries.
- API failure fallback/recovery in action traces.
- Manual dispatch versus AI dispatch behavior.
- Time speed controls and visible route movement.

## Verification Commands

```bash
npm test
npm run lint
npm run build
```

## Mobile Smoke Check

Use a 375 px wide viewport and confirm:

- The map loads.
- Top controls are reachable.
- City selector remains usable.
- Unit and incident panels fit at the bottom.
- No critical controls require horizontal scrolling.

## Submission Notes

- Antigravity is documented as a development/orchestration tool only.
- The app does not connect to real emergency dispatch systems.
- All sensitive civic/emergency data is mocked.
- OSRM routing is optional at runtime because fallback paths keep the demo functional.
