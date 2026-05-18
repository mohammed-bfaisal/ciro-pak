import type { City, Resource } from '../types';

type ResourceSeed = Omit<Resource, 'currentPosition' | 'movementProgress'>;

export const STATION_RESOURCE_SNAPSHOT: Record<City, ResourceSeed[]> = {
  "karachi": [
    {
      "id": "karachi-rescue-team",
      "type": "rescue_team",
      "label": "Karachi Rescue Team - Civil hospital, Karachi",
      "status": "available",
      "location": {
        "lat": 24.859445,
        "lng": 67.011678,
        "label": "Civil hospital, Karachi (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4610363491",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "karachi-police-unit",
      "type": "police_unit",
      "label": "Karachi Police Unit - Police Station Clifton",
      "status": "available",
      "location": {
        "lat": 24.81363,
        "lng": 67.029032,
        "label": "Police Station Clifton"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/3813611062",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "karachi-ambulance",
      "type": "ambulance",
      "label": "Karachi Ambulance - Hashmanis Hospital",
      "status": "available",
      "location": {
        "lat": 24.869719,
        "lng": 67.034665,
        "label": "Hashmanis Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4769325040",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "karachi-fire-truck",
      "type": "fire_truck",
      "label": "Karachi Fire Unit - Gulshan-e-Iqbal Fire Station",
      "status": "available",
      "location": {
        "lat": 24.913734,
        "lng": 67.091135,
        "label": "Gulshan-e-Iqbal Fire Station"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4762522310",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "karachi-medical-outreach",
      "type": "medical_outreach",
      "label": "Karachi Medical Outreach - Wazeer Patti Wala",
      "status": "available",
      "location": {
        "lat": 24.892719,
        "lng": 67.030985,
        "label": "Wazeer Patti Wala"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4734023579",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "karachi-water-tanker",
      "type": "water_tanker",
      "label": "Karachi Water Support - Karachi public facility",
      "status": "available",
      "location": {
        "lat": 24.825926,
        "lng": 67.069402,
        "label": "Karachi public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4759811680",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "karachi-drone",
      "type": "drone",
      "label": "Karachi Recon Drone - New Town Police Station",
      "status": "available",
      "location": {
        "lat": 24.888812,
        "lng": 67.060474,
        "label": "New Town Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4734266941",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "islamabad": [
    {
      "id": "islamabad-rescue-team",
      "type": "rescue_team",
      "label": "Islamabad Rescue Team - Rescue 15",
      "status": "available",
      "location": {
        "lat": 33.699499,
        "lng": 73.059737,
        "label": "Rescue 15"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/255913888",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "islamabad-police-unit",
      "type": "police_unit",
      "label": "Islamabad Police Unit - Post Office",
      "status": "available",
      "location": {
        "lat": 33.685099,
        "lng": 73.038457,
        "label": "Post Office"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4889712223",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "islamabad-ambulance",
      "type": "ambulance",
      "label": "Islamabad Ambulance - Dr. Taliya's Clinic",
      "status": "available",
      "location": {
        "lat": 33.689503,
        "lng": 73.040088,
        "label": "Dr. Taliya's Clinic"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4889744126",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "islamabad-fire-truck",
      "type": "fire_truck",
      "label": "Islamabad Fire Unit - Islamabad Fire Department",
      "status": "available",
      "location": {
        "lat": 33.699597,
        "lng": 73.073139,
        "label": "Islamabad Fire Department"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/297647905",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "islamabad-medical-outreach",
      "type": "medical_outreach",
      "label": "Islamabad Medical Outreach - National Institute for Handicapped",
      "status": "available",
      "location": {
        "lat": 33.696041,
        "lng": 73.041279,
        "label": "National Institute for Handicapped"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4899052823",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "islamabad-water-tanker",
      "type": "water_tanker",
      "label": "Islamabad Water Support - Islamabad public facility",
      "status": "available",
      "location": {
        "lat": 33.647704,
        "lng": 73.07567,
        "label": "Islamabad public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4902683173",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "islamabad-drone",
      "type": "drone",
      "label": "Islamabad Recon Drone - موٹروے ڈرائیونگ لائسنس",
      "status": "available",
      "location": {
        "lat": 33.684734,
        "lng": 73.059622,
        "label": "موٹروے ڈرائیونگ لائسنس"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4515618489",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "lahore": [
    {
      "id": "lahore-rescue-team",
      "type": "rescue_team",
      "label": "Lahore Rescue Team - Rescue 1122",
      "status": "available",
      "location": {
        "lat": 31.519365,
        "lng": 74.32744,
        "label": "Rescue 1122"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4238855991",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "lahore-police-unit",
      "type": "police_unit",
      "label": "Lahore Police Unit - آفس قربان لائن",
      "status": "available",
      "location": {
        "lat": 31.533256,
        "lng": 74.357377,
        "label": "آفس قربان لائن"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4109174594",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "lahore-ambulance",
      "type": "ambulance",
      "label": "Lahore Ambulance - Hearing Clinic",
      "status": "available",
      "location": {
        "lat": 31.506367,
        "lng": 74.350388,
        "label": "Hearing Clinic"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4648941790",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "lahore-fire-truck",
      "type": "fire_truck",
      "label": "Lahore Fire Unit - Fire Brigade Shahdara",
      "status": "available",
      "location": {
        "lat": 31.624033,
        "lng": 74.289335,
        "label": "Fire Brigade Shahdara"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4910219512",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "lahore-medical-outreach",
      "type": "medical_outreach",
      "label": "Lahore Medical Outreach - متحده مسیحي روغتون.",
      "status": "available",
      "location": {
        "lat": 31.508682,
        "lng": 74.340491,
        "label": "متحده مسیحي روغتون."
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/563684371",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "lahore-water-tanker",
      "type": "water_tanker",
      "label": "Lahore Water Support - Lahore public facility",
      "status": "available",
      "location": {
        "lat": 31.483729,
        "lng": 74.372787,
        "label": "Lahore public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/1758620491",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "lahore-drone",
      "type": "drone",
      "label": "Lahore Recon Drone - Dharampura Police Station",
      "status": "available",
      "location": {
        "lat": 31.551394,
        "lng": 74.368132,
        "label": "Dharampura Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5103892721",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "rawalpindi": [
    {
      "id": "rawalpindi-rescue-team",
      "type": "rescue_team",
      "label": "Rawalpindi Rescue Team - Rescue 15",
      "status": "available",
      "location": {
        "lat": 33.699499,
        "lng": 73.059737,
        "label": "Rescue 15"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/255913888",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "rawalpindi-police-unit",
      "type": "police_unit",
      "label": "Rawalpindi Police Unit - Police Chowki",
      "status": "available",
      "location": {
        "lat": 33.599789,
        "lng": 73.063536,
        "label": "Police Chowki"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2640862164",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "rawalpindi-ambulance",
      "type": "ambulance",
      "label": "Rawalpindi Ambulance - Humdard Dawakhana",
      "status": "available",
      "location": {
        "lat": 33.598525,
        "lng": 73.060637,
        "label": "Humdard Dawakhana"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4273581690",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "rawalpindi-fire-truck",
      "type": "fire_truck",
      "label": "Rawalpindi Fire Unit - Cantonment Board Fire Station",
      "status": "available",
      "location": {
        "lat": 33.603868,
        "lng": 73.057927,
        "label": "Cantonment Board Fire Station"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2640848987",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "rawalpindi-medical-outreach",
      "type": "medical_outreach",
      "label": "Rawalpindi Medical Outreach - Dr. Shafiq",
      "status": "available",
      "location": {
        "lat": 33.605583,
        "lng": 73.058372,
        "label": "Dr. Shafiq"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2640851716",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "rawalpindi-water-tanker",
      "type": "water_tanker",
      "label": "Rawalpindi Water Support - Water Storage Tank",
      "status": "available",
      "location": {
        "lat": 33.604547,
        "lng": 73.057686,
        "label": "Water Storage Tank"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2640851715",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "rawalpindi-drone",
      "type": "drone",
      "label": "Rawalpindi Recon Drone - Gawalmandi Police Chowki",
      "status": "available",
      "location": {
        "lat": 33.603561,
        "lng": 73.057581,
        "label": "Gawalmandi Police Chowki"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2640808579",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "faisalabad": [
    {
      "id": "faisalabad-rescue-team",
      "type": "rescue_team",
      "label": "Faisalabad Rescue Team - Rescue 15",
      "status": "available",
      "location": {
        "lat": 31.40686,
        "lng": 73.112175,
        "label": "Rescue 15"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5259596723",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "faisalabad-police-unit",
      "type": "police_unit",
      "label": "Faisalabad Police Unit - Police Station Sargodha Road, Faisalabad",
      "status": "available",
      "location": {
        "lat": 31.438508,
        "lng": 73.091588,
        "label": "Police Station Sargodha Road, Faisalabad"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5273603406",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "faisalabad-ambulance",
      "type": "ambulance",
      "label": "Faisalabad Ambulance - Dr. Saadia Khan Clinic",
      "status": "available",
      "location": {
        "lat": 31.445464,
        "lng": 73.141706,
        "label": "Dr. Saadia Khan Clinic"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5287521834",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "faisalabad-fire-truck",
      "type": "fire_truck",
      "label": "Faisalabad Fire Unit - Fire Brigade Faisalabad",
      "status": "available",
      "location": {
        "lat": 31.446056,
        "lng": 73.090441,
        "label": "Fire Brigade Faisalabad"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5259596756",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "faisalabad-medical-outreach",
      "type": "medical_outreach",
      "label": "Faisalabad Medical Outreach - United Hospital",
      "status": "available",
      "location": {
        "lat": 31.438768,
        "lng": 73.137636,
        "label": "United Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5267889391",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "faisalabad-water-tanker",
      "type": "water_tanker",
      "label": "Faisalabad Water Support - Faisalabad public facility",
      "status": "available",
      "location": {
        "lat": 31.412265,
        "lng": 73.104916,
        "label": "Faisalabad public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2912531199",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "faisalabad-drone",
      "type": "drone",
      "label": "Faisalabad Recon Drone - Traffic Police Testing Site",
      "status": "available",
      "location": {
        "lat": 31.417572,
        "lng": 73.109788,
        "label": "Traffic Police Testing Site"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/2913718201",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "multan": [
    {
      "id": "multan-rescue-team",
      "type": "rescue_team",
      "label": "Multan Rescue Team - Rescu 1122",
      "status": "available",
      "location": {
        "lat": 30.03509,
        "lng": 71.824052,
        "label": "Rescu 1122"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/8515382882",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "multan-police-unit",
      "type": "police_unit",
      "label": "Multan Police Unit - Mumtazabad Police",
      "status": "available",
      "location": {
        "lat": 30.162213,
        "lng": 71.494625,
        "label": "Mumtazabad Police"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/1921954028",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "multan-ambulance",
      "type": "ambulance",
      "label": "Multan Ambulance - Faiz hospital",
      "status": "available",
      "location": {
        "lat": 30.159702,
        "lng": 71.49559,
        "label": "Faiz hospital"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/1921952877",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "multan-fire-truck",
      "type": "fire_truck",
      "label": "Multan Fire Unit - YCDO Hospital",
      "status": "available",
      "location": {
        "lat": 30.162064,
        "lng": 71.495518,
        "label": "YCDO Hospital (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4936415685",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "multan-medical-outreach",
      "type": "medical_outreach",
      "label": "Multan Medical Outreach - Khaja Farid Hospital",
      "status": "available",
      "location": {
        "lat": 30.173028,
        "lng": 71.499131,
        "label": "Khaja Farid Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/1921953746",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "multan-water-tanker",
      "type": "water_tanker",
      "label": "Multan Water Support - Multan public facility",
      "status": "available",
      "location": {
        "lat": 30.202068,
        "lng": 71.520184,
        "label": "Multan public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/1193228988",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "multan-drone",
      "type": "drone",
      "label": "Multan Recon Drone - تھانہ",
      "status": "available",
      "location": {
        "lat": 30.189529,
        "lng": 71.469476,
        "label": "تھانہ"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/182024772",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "gujranwala": [
    {
      "id": "gujranwala-rescue-team",
      "type": "rescue_team",
      "label": "Gujranwala Rescue Team - Rescue 1122",
      "status": "available",
      "location": {
        "lat": 32.163287,
        "lng": 74.187453,
        "label": "Rescue 1122"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/7507202850",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gujranwala-police-unit",
      "type": "police_unit",
      "label": "Gujranwala Police Unit - Model Town Police Station",
      "status": "available",
      "location": {
        "lat": 32.17519,
        "lng": 74.183043,
        "label": "Model Town Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/499024180",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gujranwala-ambulance",
      "type": "ambulance",
      "label": "Gujranwala Ambulance - City Hospital",
      "status": "available",
      "location": {
        "lat": 32.188938,
        "lng": 74.201522,
        "label": "City Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4905664921",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gujranwala-fire-truck",
      "type": "fire_truck",
      "label": "Gujranwala Fire Unit - Gujranwala public facility",
      "status": "available",
      "location": {
        "lat": 32.338199,
        "lng": 74.337528,
        "label": "Gujranwala public facility"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/13606980567",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gujranwala-medical-outreach",
      "type": "medical_outreach",
      "label": "Gujranwala Medical Outreach - Niaz Memorial Hospital",
      "status": "available",
      "location": {
        "lat": 32.180219,
        "lng": 74.193555,
        "label": "Niaz Memorial Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6176439786",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gujranwala-water-tanker",
      "type": "water_tanker",
      "label": "Gujranwala Water Support - WASA Water Tank",
      "status": "available",
      "location": {
        "lat": 32.155048,
        "lng": 74.189508,
        "label": "WASA Water Tank"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/499270920",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gujranwala-drone",
      "type": "drone",
      "label": "Gujranwala Recon Drone - Aroop Police Station",
      "status": "available",
      "location": {
        "lat": 32.196433,
        "lng": 74.214798,
        "label": "Aroop Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/499270917",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "sialkot": [
    {
      "id": "sialkot-rescue-team",
      "type": "rescue_team",
      "label": "Sialkot Rescue Team - Sardar Begum Hospital",
      "status": "available",
      "location": {
        "lat": 32.492697,
        "lng": 74.532891,
        "label": "Sardar Begum Hospital (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/365523000",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sialkot-police-unit",
      "type": "police_unit",
      "label": "Sialkot Police Unit - تھانہ",
      "status": "available",
      "location": {
        "lat": 32.488806,
        "lng": 74.536067,
        "label": "تھانہ"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/365523027",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sialkot-ambulance",
      "type": "ambulance",
      "label": "Sialkot Ambulance - DOCTORS HEART & MEDICAL CENTER SIALKOT",
      "status": "available",
      "location": {
        "lat": 32.485262,
        "lng": 74.530275,
        "label": "DOCTORS HEART & MEDICAL CENTER SIALKOT"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/8474807514",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sialkot-fire-truck",
      "type": "fire_truck",
      "label": "Sialkot Fire Unit - Sialkot public facility",
      "status": "available",
      "location": {
        "lat": 32.531593,
        "lng": 74.366145,
        "label": "Sialkot public facility"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/7211963738",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sialkot-medical-outreach",
      "type": "medical_outreach",
      "label": "Sialkot Medical Outreach - Homeopathic Clinic Rana Arif Luqmani",
      "status": "available",
      "location": {
        "lat": 32.48779,
        "lng": 74.509008,
        "label": "Homeopathic Clinic Rana Arif Luqmani"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4901725854",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sialkot-water-tanker",
      "type": "water_tanker",
      "label": "Sialkot Water Support - Sialkot public facility",
      "status": "available",
      "location": {
        "lat": 32.530674,
        "lng": 74.367266,
        "label": "Sialkot public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/8017512163",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sialkot-drone",
      "type": "drone",
      "label": "Sialkot Recon Drone - District Jail Sialkot",
      "status": "available",
      "location": {
        "lat": 32.505983,
        "lng": 74.530656,
        "label": "District Jail Sialkot"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/366112649",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "bahawalpur": [
    {
      "id": "bahawalpur-rescue-team",
      "type": "rescue_team",
      "label": "Bahawalpur Rescue Team - Rescue 1122",
      "status": "available",
      "location": {
        "lat": 29.541368,
        "lng": 71.630376,
        "label": "Rescue 1122"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/13301457614",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "bahawalpur-police-unit",
      "type": "police_unit",
      "label": "Bahawalpur Police Unit - Police Club",
      "status": "available",
      "location": {
        "lat": 29.400992,
        "lng": 71.684174,
        "label": "Police Club"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4971454326",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "bahawalpur-ambulance",
      "type": "ambulance",
      "label": "Bahawalpur Ambulance - Bahawal Victoria Hospital",
      "status": "available",
      "location": {
        "lat": 29.390112,
        "lng": 71.682,
        "label": "Bahawal Victoria Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/501641347",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "bahawalpur-fire-truck",
      "type": "fire_truck",
      "label": "Bahawalpur Fire Unit - Women Hospital",
      "status": "available",
      "location": {
        "lat": 29.394221,
        "lng": 71.677251,
        "label": "Women Hospital (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/1925508155",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "bahawalpur-medical-outreach",
      "type": "medical_outreach",
      "label": "Bahawalpur Medical Outreach - Gyane ward 1",
      "status": "available",
      "location": {
        "lat": 29.389555,
        "lng": 71.684753,
        "label": "Gyane ward 1"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/7161825285",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "bahawalpur-water-tanker",
      "type": "water_tanker",
      "label": "Bahawalpur Water Support - Bahawalpur public facility",
      "status": "available",
      "location": {
        "lat": 29.374103,
        "lng": 71.665455,
        "label": "Bahawalpur public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/7062886983",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "bahawalpur-drone",
      "type": "drone",
      "label": "Bahawalpur Recon Drone - Kotwali Police Station",
      "status": "available",
      "location": {
        "lat": 29.401277,
        "lng": 71.675586,
        "label": "Kotwali Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4923902178",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "sargodha": [
    {
      "id": "sargodha-rescue-team",
      "type": "rescue_team",
      "label": "Sargodha Rescue Team - Cheema Heart Centre",
      "status": "available",
      "location": {
        "lat": 32.080269,
        "lng": 72.681791,
        "label": "Cheema Heart Centre (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/229702690",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sargodha-police-unit",
      "type": "police_unit",
      "label": "Sargodha Police Unit - Patrolling Police Check Post",
      "status": "available",
      "location": {
        "lat": 32.111239,
        "lng": 72.72989,
        "label": "Patrolling Police Check Post"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/229702482",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sargodha-ambulance",
      "type": "ambulance",
      "label": "Sargodha Ambulance - Dr Fazal Laser Eye Center",
      "status": "available",
      "location": {
        "lat": 32.090534,
        "lng": 72.669097,
        "label": "Dr Fazal Laser Eye Center"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/8598317609",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sargodha-fire-truck",
      "type": "fire_truck",
      "label": "Sargodha Fire Unit - Sargodha public facility",
      "status": "available",
      "location": {
        "lat": 32.071134,
        "lng": 72.682852,
        "label": "Sargodha public facility"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6039040586",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sargodha-medical-outreach",
      "type": "medical_outreach",
      "label": "Sargodha Medical Outreach - Emergency unit of hosp.",
      "status": "available",
      "location": {
        "lat": 32.080195,
        "lng": 72.663797,
        "label": "Emergency unit of hosp."
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6873691485",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sargodha-water-tanker",
      "type": "water_tanker",
      "label": "Sargodha Water Support - DHQ SARGODAH",
      "status": "available",
      "location": {
        "lat": 32.081788,
        "lng": 72.662912,
        "label": "DHQ SARGODAH (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6872788686",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sargodha-drone",
      "type": "drone",
      "label": "Sargodha Recon Drone - Ali clinic",
      "status": "available",
      "location": {
        "lat": 32.088505,
        "lng": 72.658718,
        "label": "Ali clinic (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/13200231728",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "peshawar": [
    {
      "id": "peshawar-rescue-team",
      "type": "rescue_team",
      "label": "Peshawar Rescue Team - Mercy Teaching Hospital",
      "status": "available",
      "location": {
        "lat": 34.007352,
        "lng": 71.52345,
        "label": "Mercy Teaching Hospital (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5302612921",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "peshawar-police-unit",
      "type": "police_unit",
      "label": "Peshawar Police Unit - Army Check Point",
      "status": "available",
      "location": {
        "lat": 34.006639,
        "lng": 71.530406,
        "label": "Army Check Point"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4481034702",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "peshawar-ambulance",
      "type": "ambulance",
      "label": "Peshawar Ambulance - CMH Peshawar - Combined Military Hospital",
      "status": "available",
      "location": {
        "lat": 34.003408,
        "lng": 71.542702,
        "label": "CMH Peshawar - Combined Military Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/854341089",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "peshawar-fire-truck",
      "type": "fire_truck",
      "label": "Peshawar Fire Unit - Fire Brigade",
      "status": "available",
      "location": {
        "lat": 34.027995,
        "lng": 71.575393,
        "label": "Fire Brigade"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4496776893",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "peshawar-medical-outreach",
      "type": "medical_outreach",
      "label": "Peshawar Medical Outreach - Base MI Room",
      "status": "available",
      "location": {
        "lat": 33.993523,
        "lng": 71.523252,
        "label": "Base MI Room"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6260489785",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "peshawar-water-tanker",
      "type": "water_tanker",
      "label": "Peshawar Water Support - Peshawar public facility",
      "status": "available",
      "location": {
        "lat": 34.014448,
        "lng": 71.490423,
        "label": "Peshawar public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4917017362",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "peshawar-drone",
      "type": "drone",
      "label": "Peshawar Recon Drone - Army Check Point",
      "status": "available",
      "location": {
        "lat": 34.014607,
        "lng": 71.552821,
        "label": "Army Check Point"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4481034701",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "abbottabad": [
    {
      "id": "abbottabad-rescue-team",
      "type": "rescue_team",
      "label": "Abbottabad Rescue Team - Sikanderabad Police Station",
      "status": "available",
      "location": {
        "lat": 34.167622,
        "lng": 73.223913,
        "label": "Sikanderabad Police Station (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/3097611097",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "abbottabad-police-unit",
      "type": "police_unit",
      "label": "Abbottabad Police Unit - Army Topo School Engrs",
      "status": "available",
      "location": {
        "lat": 34.162094,
        "lng": 73.223411,
        "label": "Army Topo School Engrs"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4149886312",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "abbottabad-ambulance",
      "type": "ambulance",
      "label": "Abbottabad Ambulance - Rehmat Memorial Hospital",
      "status": "available",
      "location": {
        "lat": 34.170149,
        "lng": 73.225068,
        "label": "Rehmat Memorial Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/306452307",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "abbottabad-fire-truck",
      "type": "fire_truck",
      "label": "Abbottabad Fire Unit - Combined Millitary Hospital",
      "status": "available",
      "location": {
        "lat": 34.15934,
        "lng": 73.22244,
        "label": "Combined Millitary Hospital (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/303967620",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "abbottabad-medical-outreach",
      "type": "medical_outreach",
      "label": "Abbottabad Medical Outreach - C.M.H. (Gyane Wing)",
      "status": "available",
      "location": {
        "lat": 34.158397,
        "lng": 73.219575,
        "label": "C.M.H. (Gyane Wing)"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/304559689",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "abbottabad-water-tanker",
      "type": "water_tanker",
      "label": "Abbottabad Water Support - Abbottabad public facility",
      "status": "available",
      "location": {
        "lat": 34.192139,
        "lng": 73.242354,
        "label": "Abbottabad public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/3124217271",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "abbottabad-drone",
      "type": "drone",
      "label": "Abbottabad Recon Drone - Baloch centre ARMY",
      "status": "available",
      "location": {
        "lat": 34.155982,
        "lng": 73.219191,
        "label": "Baloch centre ARMY"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4149870156",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "quetta": [
    {
      "id": "quetta-rescue-team",
      "type": "rescue_team",
      "label": "Quetta Rescue Team - Doctor clinic",
      "status": "available",
      "location": {
        "lat": 30.183233,
        "lng": 66.969331,
        "label": "Doctor clinic (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4745031128",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "quetta-police-unit",
      "type": "police_unit",
      "label": "Quetta Police Unit - police post",
      "status": "available",
      "location": {
        "lat": 30.174139,
        "lng": 66.968045,
        "label": "police post"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4745038422",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "quetta-ambulance",
      "type": "ambulance",
      "label": "Quetta Ambulance - Mombara homani",
      "status": "available",
      "location": {
        "lat": 30.181916,
        "lng": 66.967241,
        "label": "Mombara homani"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/4744824825",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "quetta-fire-truck",
      "type": "fire_truck",
      "label": "Quetta Fire Unit - Fire Brigade Office",
      "status": "available",
      "location": {
        "lat": 30.194744,
        "lng": 67.017069,
        "label": "Fire Brigade Office"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6126907734",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "quetta-medical-outreach",
      "type": "medical_outreach",
      "label": "Quetta Medical Outreach - Helpers Eye Hospital",
      "status": "available",
      "location": {
        "lat": 30.174881,
        "lng": 66.994128,
        "label": "Helpers Eye Hospital"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/6124652300",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "quetta-water-tanker",
      "type": "water_tanker",
      "label": "Quetta Water Support - Quetta public facility",
      "status": "available",
      "location": {
        "lat": 30.162991,
        "lng": 67.001159,
        "label": "Quetta public facility"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5799515056",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "quetta-drone",
      "type": "drone",
      "label": "Quetta Recon Drone - Brewery Police Station",
      "status": "available",
      "location": {
        "lat": 30.189928,
        "lng": 66.97542,
        "label": "Brewery Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/1409604351",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "gwadar": [
    {
      "id": "gwadar-rescue-team",
      "type": "rescue_team",
      "label": "Gwadar Rescue Team - سول ہسپتال گوادر",
      "status": "available",
      "location": {
        "lat": 25.134696,
        "lng": 62.321995,
        "label": "سول ہسپتال گوادر (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5693025023",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gwadar-police-unit",
      "type": "police_unit",
      "label": "Gwadar Police Unit - Gwadar Police Station",
      "status": "available",
      "location": {
        "lat": 25.187509,
        "lng": 62.33803,
        "label": "Gwadar Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/10752176097",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gwadar-ambulance",
      "type": "ambulance",
      "label": "Gwadar Ambulance - Gwadar public facility",
      "status": "available",
      "location": {
        "lat": 25.290469,
        "lng": 62.508274,
        "label": "Gwadar public facility (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/12138564239",
      "sourceConfidence": 0.62,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gwadar-fire-truck",
      "type": "fire_truck",
      "label": "Gwadar Fire Unit - Gwadar public facility",
      "status": "available",
      "location": {
        "lat": 25.292775,
        "lng": 62.506681,
        "label": "Gwadar public facility"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/1311352118",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gwadar-medical-outreach",
      "type": "medical_outreach",
      "label": "Gwadar Medical Outreach - سول ہسپتال گوادر",
      "status": "available",
      "location": {
        "lat": 25.134696,
        "lng": 62.321995,
        "label": "سول ہسپتال گوادر (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5693025023",
      "sourceConfidence": 0.6,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gwadar-water-tanker",
      "type": "water_tanker",
      "label": "Gwadar Water Support - سول ہسپتال گوادر",
      "status": "available",
      "location": {
        "lat": 25.134696,
        "lng": 62.321995,
        "label": "سول ہسپتال گوادر (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5693025023",
      "sourceConfidence": 0.6,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "gwadar-drone",
      "type": "drone",
      "label": "Gwadar Recon Drone - سول ہسپتال گوادر",
      "status": "available",
      "location": {
        "lat": 25.134696,
        "lng": 62.321995,
        "label": "سول ہسپتال گوادر (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5693025023",
      "sourceConfidence": 0.6,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "hyderabad": [
    {
      "id": "hyderabad-rescue-team",
      "type": "rescue_team",
      "label": "Hyderabad Rescue Team - Quaid e Azam Complex",
      "status": "available",
      "location": {
        "lat": 25.396259,
        "lng": 68.362258,
        "label": "Quaid e Azam Complex (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5251853017",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "hyderabad-police-unit",
      "type": "police_unit",
      "label": "Hyderabad Police Unit - Police Headquater",
      "status": "available",
      "location": {
        "lat": 25.396615,
        "lng": 68.362365,
        "label": "Police Headquater"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5253791420",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "hyderabad-ambulance",
      "type": "ambulance",
      "label": "Hyderabad Ambulance - Saddar Medical Center",
      "status": "available",
      "location": {
        "lat": 25.395795,
        "lng": 68.362834,
        "label": "Saddar Medical Center"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5253791418",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "hyderabad-fire-truck",
      "type": "fire_truck",
      "label": "Hyderabad Fire Unit - Fire Brigade",
      "status": "available",
      "location": {
        "lat": 25.373077,
        "lng": 68.363795,
        "label": "Fire Brigade"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/1081588354",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "hyderabad-medical-outreach",
      "type": "medical_outreach",
      "label": "Hyderabad Medical Outreach - Isra University Hospital Laboratory",
      "status": "available",
      "location": {
        "lat": 25.396011,
        "lng": 68.362908,
        "label": "Isra University Hospital Laboratory"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5253791417",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "hyderabad-water-tanker",
      "type": "water_tanker",
      "label": "Hyderabad Water Support - HDA water works",
      "status": "available",
      "location": {
        "lat": 25.412086,
        "lng": 68.362705,
        "label": "HDA water works"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/96682869",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "hyderabad-drone",
      "type": "drone",
      "label": "Hyderabad Recon Drone - Cantt Police Station",
      "status": "available",
      "location": {
        "lat": 25.392518,
        "lng": 68.363547,
        "label": "Cantt Police Station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5253791412",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ],
  "sukkur": [
    {
      "id": "sukkur-rescue-team",
      "type": "rescue_team",
      "label": "Sukkur Rescue Team - Police Station New Pind",
      "status": "available",
      "location": {
        "lat": 27.705132,
        "lng": 68.85741,
        "label": "Police Station New Pind (sourced fallback)"
      },
      "assignedCrisisId": null,
      "capacity": 12,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/954015975",
      "sourceConfidence": 0.75,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sukkur-police-unit",
      "type": "police_unit",
      "label": "Sukkur Police Unit - Sukkur High Court",
      "status": "available",
      "location": {
        "lat": 27.694947,
        "lng": 68.849805,
        "label": "Sukkur High Court"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/72502508",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sukkur-ambulance",
      "type": "ambulance",
      "label": "Sukkur Ambulance - BHU New Pind",
      "status": "available",
      "location": {
        "lat": 27.704477,
        "lng": 68.858171,
        "label": "BHU New Pind"
      },
      "assignedCrisisId": null,
      "capacity": 4,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/366034803",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sukkur-fire-truck",
      "type": "fire_truck",
      "label": "Sukkur Fire Unit - Sukkur public facility",
      "status": "available",
      "location": {
        "lat": 27.692821,
        "lng": 68.872992,
        "label": "Sukkur public facility"
      },
      "assignedCrisisId": null,
      "capacity": 6,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "way/72008538",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sukkur-medical-outreach",
      "type": "medical_outreach",
      "label": "Sukkur Medical Outreach - Al khair General Hospital Sukkur",
      "status": "available",
      "location": {
        "lat": 27.7076,
        "lng": 68.845703,
        "label": "Al khair General Hospital Sukkur"
      },
      "assignedCrisisId": null,
      "capacity": 8,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5251864410",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sukkur-water-tanker",
      "type": "water_tanker",
      "label": "Sukkur Water Support - Tanki",
      "status": "available",
      "location": {
        "lat": 27.596668,
        "lng": 68.619798,
        "label": "Tanki"
      },
      "assignedCrisisId": null,
      "capacity": 1,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/5339647793",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    },
    {
      "id": "sukkur-drone",
      "type": "drone",
      "label": "Sukkur Recon Drone - A Section Police station",
      "status": "available",
      "location": {
        "lat": 27.693695,
        "lng": 68.862793,
        "label": "A Section Police station"
      },
      "assignedCrisisId": null,
      "capacity": 0,
      "currentLoad": 0,
      "source": "OpenStreetMap/Overpass snapshot",
      "sourceId": "node/9278399353",
      "sourceConfidence": 0.95,
      "sourceUpdatedAt": "2026-05-18T00:00:00.000Z"
    }
  ]
};

export function getStationResources(city: City): Resource[] {
  return STATION_RESOURCE_SNAPSHOT[city].map((resource) => ({
    ...resource,
    currentPosition: resource.location,
    movementProgress: 0,
  }));
}
