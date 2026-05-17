# 911 Operator–Style UI Implementation Plan

**Goal:** Transform CiroPak's dashboard into a 911 Operator–inspired dispatch interface. The map becomes an operational command center: units move on the map in real time, incidents pulse and demand attention, and side panels mirror the dispatcher HUD from the game.

This is purely additive. Existing components (CiroMap, CrisisPanel, SignalFeed, stores) are extended — not replaced.

---

## Reference: 911 Operator UI Summary

| Element           | Description                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Full-screen map   | Top-down city map, dark tile style                                                                       |
| Unit icons        | Vehicle icons by type, color-coded by status (pinned to actual road locations on the map)                |
| Moving units      | Vehicles animate along roads toward their assigned incident (always follow a real road path)             |
| Route lines       | Polyline from unit → target incident                                                                     |
| Incident markers  | Flashing, color-coded circles (blue=police, red=fire, white=medical)                                     |
| Bottom-left HUD   | Unit roster panel — all units with status chips                                                          |
| Bottom-right HUD  | Incident registry panel — all active crises                                                              |
| Click-to-dispatch | Click unit → select crisis → unit dispatched, line drawn, movement starts (this is done in manual mode.) |
| Status badges     | Available (green), En Route (amber), On Scene (red), Returning (gray)                                    |
| Incoming alert    | Pulsing "new incident" animation on crisis markers                                                       |

---

## Current State

- **Map:** MapLibre GL, dark style, crisis pulse markers, signal heatmap ✓  
- **Resources:** Typed (`ambulance`, `police_unit`, `fire_truck`, etc.), `resourceStore` exists ✓  
- **Resource display on map:** ✗ (resources not rendered)  
- **Movement animation:** ✗  
- **Route lines:** ✗  
- **Unit/Incident HUD panels:** ✗  
- **Click-to-dispatch UI:** ✗  
- **Simulation tick loop:** ✗  

---

## Architecture Overview

```
src/
  components/
    map/
      CiroMap.tsx              ← extend: add vehicle layer, route lines
      VehicleMarker.ts         ← new: DOM element factory for unit icons
      RouteLayer.ts            ← new: MapLibre GeoJSON source/layer for routes
    hud/
      UnitRoster.tsx           ← new: bottom-left panel (unit list)
      IncidentRegistry.tsx     ← new: bottom-right panel (crisis list)
      DispatchBadge.tsx        ← new: unit status chip used in UnitRoster
  simulation/
    movementEngine.ts          ← new: position interpolation tick loop
    dispatchEngine.ts          ← new: assign unit → crisis, start movement
  store/
    resourceStore.ts           ← extend: add position tracking, movement state
  types/
    index.ts                   ← extend: add MovementState to Resource
```

---

## Phase 1 — Vehicle Markers on Map (Static)

**Goal:** Render every resource as a map marker with an icon that reflects its type and status.

### 1.1 Extend `Resource` type

Add to `src/types/index.ts`:
```ts
export interface Resource {
  // existing fields ...
  currentPosition: GeoPoint;   // live position (starts = location)
  targetPosition?: GeoPoint;   // crisis location when dispatched
  routePath?: [number, number][]; // interpolated path points
  movementProgress: number;    // 0.0 → 1.0 along path
}
```

### 1.2 Vehicle marker DOM factory (`VehicleMarker.ts`)

Maps `Resource['type']` → emoji/SVG icon + color:

| Type             | Icon | Available color | En Route color | On Scene color |
| ---------------- | ---- | --------------- | -------------- | -------------- |
| ambulance        | 🚑   | `#22c55e`       | `#f59e0b`      | `#ef4444`      |
| police_unit      | 🚓   | `#3b82f6`       | `#f59e0b`      | `#ef4444`      |
| fire_truck       | 🚒   | `#ef4444`       | `#f59e0b`      | `#dc2626`      |
| rescue_team      | 🦺   | `#22c55e`       | `#f59e0b`      | `#ef4444`      |
| water_tanker     | 🚰   | `#06b6d4`       | `#f59e0b`      | `#ef4444`      |
| medical_outreach | ⛑️   | `#22c55e`       | `#f59e0b`      | `#ef4444`      |
| drone            | 🛸   | `#a855f7`       | `#f59e0b`      | `#ef4444`      |

Marker DOM structure:
```html
<div class="vehicle-marker" data-status="available">
  <div class="vehicle-icon">🚑</div>
  <div class="status-dot" />        <!-- colored dot below icon -->
  <div class="capacity-bar" />      <!-- small bar: currentLoad/capacity -->
</div>
```

### 1.3 Render in `CiroMap.tsx`

Add a `vehicleMarkersRef` alongside `crisisMarkersRef`. In a new `useEffect` keyed on `resources`, clear + re-add markers. Each marker gets an `onClick` that calls `onUnitClick?.(resource.id)`.

**Files changed:**
- `src/types/index.ts`
- `src/components/map/CiroMap.tsx`
- `src/components/map/VehicleMarker.ts` (new)
- `src/data/mock/karachi/resources.json` + `islamabad/resources.json` (add `movementProgress: 0`)

---

## Phase 2 — Movement Simulation Engine

**Goal:** When a resource is dispatched, animate it moving from its current position to the crisis location over `etaMinutes` of simulation time.

### 2.1 Movement engine (`movementEngine.ts`)

```ts
// Called every simulation tick (default: 1 real second = 1 simulated minute)
export function tickMovement(resources: Resource[], deltaMinutes: number): Resource[]
```

For each resource where `status === 'en_route'` or `status === 'dispatched'`:
- Increment `movementProgress` by `deltaMinutes / etaMinutes`
- Clamp to `[0, 1]`
- Interpolate `currentPosition` between `location` and `targetPosition` using linear lerp:
  ```ts
  lat = lerp(origin.lat, target.lat, progress)
  lng = lerp(origin.lng, target.lng, progress)
  ```
- When `progress >= 1`: set `status = 'on_scene'`, `movementProgress = 1`

For `status === 'returning'`:
- Animate back to `location` (home base)
- When done: set `status = 'available'`, reset progress

### 2.2 Simulation tick loop

Add to `resourceStore.ts`:
```ts
interface ResourceState {
  // existing ...
  simulationSpeed: 1 | 2 | 4;   // 1x, 2x, 4x
  isPaused: boolean;
  tick: () => void;
  setSpeed: (speed: 1 | 2 | 4) => void;
  togglePause: () => void;
}
```

In `Dashboard.tsx`, run a `useEffect` with `setInterval`:
```ts
const TICK_MS = 1000; // 1 real second per tick
useEffect(() => {
  if (isPaused) return;
  const id = setInterval(() => tick(), TICK_MS / simulationSpeed);
  return () => clearInterval(id);
}, [isPaused, simulationSpeed]);
```

Each `tick()` calls `tickMovement()` and updates store positions, which triggers the MapLibre marker re-render.

**Files changed:**
- `src/simulation/movementEngine.ts` (new)
- `src/store/resourceStore.ts`
- `src/pages/Dashboard.tsx`

---

## Phase 3 — Route Lines on Map

**Goal:** Draw a dashed polyline from each dispatched unit's current position to its target crisis location.

### 3.1 Route layer in MapLibre

Use a single GeoJSON source `'unit-routes'` with one LineString feature per dispatched unit:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[lng1,lat1],[lng2,lat2]] },
      "properties": { "color": "#f59e0b", "unitId": "khi-r3" }
    }
  ]
}
```

MapLibre layer config:
```ts
{
  id: 'unit-routes',
  type: 'line',
  source: 'unit-routes',
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 2,
    'line-dasharray': [4, 3],
    'line-opacity': 0.75,
  }
}
```

Update the GeoJSON on every tick by calling `setData()` on the source.

### 3.2 Route layer helper (`RouteLayer.ts`)

```ts
export function buildRouteFeatures(resources: Resource[]): GeoJSON.FeatureCollection
export function initRouteLayer(map: maplibregl.Map): void
export function updateRouteLayer(map: maplibregl.Map, resources: Resource[]): void
```

**Files changed:**
- `src/components/map/RouteLayer.ts` (new)
- `src/components/map/CiroMap.tsx`

---

## Phase 4 — Bottom HUD Panels

**Goal:** 911 Operator–style bottom panels. Left = unit roster. Right = incident registry.

### 4.1 Unit Roster (`UnitRoster.tsx`)

Position: `absolute bottom-20 left-3` (above bottom nav), `z-20`.

Visual:
```
┌─────────────────────────────┐
│  UNITS (8)        [collapse]│
├─────────────────────────────┤
│ 🚑 Edhi Amb KHI-07          │
│    ● En Route → Flood Zone  │
│    ETA: 4 min               │
├─────────────────────────────┤
│ 🚓 Traffic Police T-14      │
│    ● Available              │
│    [Dispatch]               │
└─────────────────────────────┘
```

- Collapsible (click header toggles height)
- Status dot: green=available, amber=en_route/dispatched, red=on_scene, gray=returning
- Click a unit row → highlight that unit on map (fly to + pulse ring)
- "Dispatch" button only shown for `available` units; clicking enters dispatch-select mode

### 4.2 Incident Registry (`IncidentRegistry.tsx`)

Position: `absolute bottom-20 right-3`, `z-20`.

Visual:
```
┌─────────────────────────────┐
│  INCIDENTS (3)   [collapse] │
├─────────────────────────────┤
│ 🔴 Lyari Flash Flood        │
│    Critical · 2 units       │
├─────────────────────────────┤
│ 🟡 KESC Power Outage        │
│    High · 0 units           │
│    [Needs Response]         │
└─────────────────────────────┘
```

- Color-coded by crisis type (flood=blue, fire=red, medical=white, etc.)
- Shows assigned unit count per crisis
- "Needs Response" badge when no units assigned and severity ≥ high
- Click row → fly map to crisis, open CrisisPanel

### 4.3 Time Controls

Small pill above bottom nav center:
```
[⏸] [1x] [2x] [4x]
```
Updates `simulationSpeed` and `isPaused` in resourceStore.

**Files changed:**
- `src/components/hud/UnitRoster.tsx` (new)
- `src/components/hud/IncidentRegistry.tsx` (new)
- `src/components/hud/DispatchBadge.tsx` (new)
- `src/components/hud/TimeControls.tsx` (new)
- `src/pages/Dashboard.tsx`

---

## Phase 5 — Click-to-Dispatch UI

**Goal:** User can manually dispatch a unit to a crisis by clicking the unit then clicking the crisis on the map or in the incident registry.

### 5.1 Dispatch state

In `resourceStore.ts`:
```ts
selectedUnitId: string | null;
selectUnit: (id: string | null) => void;
dispatchUnit: (unitId: string, crisisId: string, targetLoc: GeoPoint, etaMinutes: number) => void;
```

### 5.2 Dispatch flow

1. User clicks unit (on map marker OR in UnitRoster row) → `selectUnit(id)` called
2. Map cursor changes to crosshair, all crisis markers get a pulsing "select me" ring
3. User clicks a crisis marker OR incident registry row → `dispatchUnit()` called:
   - Sets `status = 'en_route'`
   - Sets `targetPosition = crisis.location`
   - Sets `etaMinutes` (simple estimate: `distanceKm / 0.5` capped at 30)
   - Clears `selectedUnitId`
4. Route line appears immediately, unit begins moving next tick

### 5.3 Auto-dispatch from AI

`resourceAllocator.ts` already calls `assignResource()`. Extend it to also call `dispatchUnit()` so AI-dispatched units automatically animate.

**Files changed:**
- `src/store/resourceStore.ts`
- `src/components/map/CiroMap.tsx` (cursor + click handler)
- `src/components/hud/UnitRoster.tsx`
- `src/agents/resourceAllocator.ts`
- `src/simulation/dispatchEngine.ts` (new)

---

## Phase 6 — Visual Polish

**Goal:** Make it feel alive. Incoming incidents flash. Moving units rotate to face their direction. Status changes animate.

### 6.1 Crisis marker enhancements

- New incident: fast double-pulse animation for first 10 seconds  
- Critical severity: red inner dot with faster pulse rate  
- No units assigned + high severity: rotating dashed ring added around marker

### 6.2 Unit marker rotation

Calculate bearing from `currentPosition` toward `targetPosition`:
```ts
function bearing(from: GeoPoint, to: GeoPoint): number // degrees
```
Apply as CSS `transform: rotate(${bearing}deg)` on vehicle icon.

Units facing their direction of travel: ambulances, police cars rotate.

### 6.3 On-scene animation

When a unit reaches its target (`status = 'on_scene'`), its marker plays a brief "arrival" scale-up pulse, then settles into a steady slow pulse indicating active engagement.

### 6.4 Incoming call flash

New crisis detected → brief full-screen amber border flash (150ms, 3 flashes). Matches the 911 Operator "new call received" feel.

### 6.5 CSS animations to add to `index.css`

```css
@keyframes vehicle-arrive { 0% { transform: scale(1); } 50% { transform: scale(1.6); } 100% { transform: scale(1); } }
@keyframes alert-border { 0%,100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 0 4px #f59e0b; } }
@keyframes fast-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
```

**Files changed:**
- `src/index.css`
- `src/components/map/CiroMap.tsx`
- `src/components/map/VehicleMarker.ts`
- `src/pages/Dashboard.tsx`

---

## Implementation Order

| # | Phase | Effort | Result visible |
|---|---|---|---|
| 1 | Vehicle markers (static) | ~2h | Units appear on map as icons |
| 2 | Movement engine + tick | ~2h | Units slide toward crises |
| 3 | Route polylines | ~1h | Dashed lines unit→crisis |
| 4 | HUD panels | ~3h | Bottom panels with lists |
| 5 | Click-to-dispatch | ~2h | Manual dispatch interaction |
| 6 | Visual polish | ~1h | Animations, rotation, flashes |

Total: ~11h of focused implementation.

---

## Non-Goals (Out of Scope)

- Real road routing (OSRM/Valhalla) — linear interpolation is sufficient for simulation
- Actual phone call audio/UI — this app is a crisis dashboard, not a 911 call center
- Replacing the existing CrisisPanel or SignalFeed components
- Backend changes — all movement is client-side simulation

---

## Key Design Decisions

1. **Linear interpolation over road routing:** Avoids a routing API dependency. The visual effect of units "moving" is the goal; exact road paths are secondary for a simulation dashboard.

2. **`currentPosition` lives in store, not component state:** Enables route lines and HUD panels to all read from the same source of truth without prop drilling.

3. **Tick loop in Dashboard, engine in simulation/:** Keeps UI concerns (speed, pause) in the view layer, and pure math (lerp, bearing) in testable utility functions.

4. **Additive panels, not layout change:** Unit roster and incident registry float over the map as positioned overlays — no changes to Shell or routing structure.
