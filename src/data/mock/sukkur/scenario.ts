import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getSukkurCrises(): Crisis[] {
  return [
    {
      id: 'skr-c1',
      type: 'flood',
      title: 'Sukkur Barrage Overtopping Risk — 847K Cusecs, Left Bank Breach Imminent',
      location: { lat: 27.7052, lng: 68.8574, label: 'Sukkur Barrage, Indus River', affectedRadiusKm: 5.0 },
      severity: 'critical',
      confidenceScore: 0.97,
      confidenceHistory: [{ t: '06:30', v: 0.70 }, { t: '07:00', v: 0.88 }, { t: '07:30', v: 0.97 }],
      status: 'active',
      detectedAt: '2026-05-20T06:30:00Z',
      estimatedDuration: '12-48 hours',
      affectedPopulation: 120000,
      spreadRisk: 'expanding',
      signalIds: ['skr-s1', 'skr-s2', 'skr-f1', 'skr-n1', 'skr-e1', 'skr-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• skr-s1 (social, credibility 0.72): Barrage gates opened, Rohri flooding. Velocity 31/min, 600 interactions.
• skr-s2 (social, credibility 0.75): 850K cusecs reported, downstream villages flooding. Velocity 38/min, 843 interactions.
• skr-f1 (field_report, credibility 0.96): IRSA — 847K cusecs (HFL: 750K), 12 gates open, Saleh Pat embankment seepage, NDMA activated. VERIFICATION.
• skr-n1 (sensor, credibility 0.96): River gauge 206.8ft (HFL 207.5ft), rising 0.4ft/hr, embankment strain 82% safe limit — breach risk HIGH within 90min.
• skr-e1 (emergency_call, credibility 0.93): 39 flood calls — 19 rooftop strandings, 27 evacuation requests.
• skr-t1 (traffic, credibility 0.81): Rohri-Sukkur Bridge closed, Saleh Pat Road impassable.

Severity: CRITICAL — discharge 13% above HFL, embankment at 82% strain, 19 families stranded, breach window 90min.
Confidence: 0.97 — IRSA control room + sensor + field calls all convergent.`,
      actions: [],
      stakeholderMessages: [],
      city: 'sukkur',
    },
    {
      id: 'skr-c2',
      type: 'infrastructure',
      title: 'Heatwave 50°C — Govt Hospital 168% Capacity, Generator Failing',
      location: { lat: 27.7000, lng: 68.8500, label: 'Sukkur Government Hospital', affectedRadiusKm: 3.0 },
      severity: 'critical',
      confidenceScore: 0.96,
      confidenceHistory: [{ t: '14:00', v: 0.75 }, { t: '15:00', v: 0.96 }],
      status: 'active',
      detectedAt: '2026-05-20T14:00:00Z',
      estimatedDuration: '36-72 hours',
      affectedPopulation: 200000,
      spreadRisk: 'expanding',
      signalIds: ['skr-s3', 'skr-f2', 'skr-n2', 'skr-e1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• skr-s3 (social, credibility 0.68): 50.1°C record, power out, hospital turning away patients. Velocity 19/min, 295 interactions.
• skr-f2 (field_report, credibility 0.95): Hospital CMO — 168% capacity (284/169 beds), 47 heatstroke admissions, 9 critical (temp >41°C), generator fuel 2hr, IV fluids 18%. VERIFICATION.
• skr-n2 (sensor, credibility 0.95): SMO — 50.1°C all-time record, heat index 58°C, wind 3km/h, 36hr heat dome persisting.
• skr-e1 (emergency_call, credibility 0.93): 11 heatstroke calls, 3 callers reporting unconscious family members.

Severity: CRITICAL — generator <2hr, 9 critical patients on cooling/IV, heatstroke surge accelerating.
Confidence: 0.96 — CMO field report + sensor record + emergency calls convergent.`,
      actions: [],
      stakeholderMessages: [],
      city: 'sukkur',
    },
  ];
}

export function getSukkurActions(): Action[] {
  return [
    {
      id: 'skr-a1', crisisId: 'skr-c1', type: 'emergency_dispatch',
      title: 'Flood Rescue Boats + NDMA Evacuation — Rohri / Saleh Pat',
      description: 'Deploy SKR-Alpha rescue boats for rooftop extractions. NDMA SKR-FRT to Saleh Pat embankment monitoring and village evacuation.',
      status: 'completed', executedAt: now(), result: '19 rooftop strandings extracted. 340 Saleh Pat village residents evacuated to N-55 relief camp.',
      costPKR: 95000, latencyMs: 420,
      beforeState: { rooftopStrandings: 19, salejPatEvacuated: 0 }, afterState: { rooftopStrandings: 0, salejPatEvacuated: 340 },
      trace: [{ step: 1, phase: 'Rescue Deploy', observation: '19 stranded on rooftops, embankment breach risk within 90min', inference: 'Simultaneous boat rescue + preemptive village evacuation — waiting for breach to confirm is too late', decision: 'SKR-Alpha 6 members on 3 boats → Rohri rooftops; NDMA FRT-8 → Saleh Pat village evacuation convoy', toolCalled: 'dispatch_api', toolResult: 'SKR-Alpha + NDMA FRT dispatched — ETA 8min', timestamp: now() }],
    },
    {
      id: 'skr-a2', crisisId: 'skr-c1', type: 'public_alert',
      title: 'Barrage Flood Alert — Downstream Evacuation Order',
      description: 'Issue mandatory evacuation for all communities within 3km downstream of Sukkur Barrage left bank.',
      status: 'completed', executedAt: now(), result: 'Evacuation SMS sent to 120,000 Rohri/Saleh Pat area residents.',
      costPKR: 35000, latencyMs: 180,
      beforeState: { evacuationOrder: 'none' }, afterState: { evacuationOrder: 'mandatory', residentsNotified: 120000 },
      trace: [{ step: 1, phase: 'Alert', observation: 'Embankment at 82% strain, breach window 90min, 120K downstream', inference: 'Full downstream zone must evacuate now — partial alert insufficient given breach trajectory', decision: 'Mandatory evacuation SMS all Rohri/Saleh Pat residents → N-55 highway inland, relief camp activated', toolCalled: 'sms_gateway', toolResult: '120K SMS sent', timestamp: now() }],
    },
    {
      id: 'skr-a3', crisisId: 'skr-c2', type: 'emergency_dispatch',
      title: 'Hospital Generator Fuel + Medical Resupply — Sukkur Govt Hospital',
      description: 'Emergency fuel delivery to hospital generator. IV fluid + cooling equipment resupply from NDMA stockpile.',
      status: 'completed', executedAt: now(), result: 'Generator refuelled (24hr supply). IV fluids restocked to 80%. 6 portable cooling units deployed.',
      costPKR: 58000, latencyMs: 310,
      beforeState: { generatorHoursRemaining: 2, ivFluidPct: 18, coolingUnits: 0 }, afterState: { generatorHoursRemaining: 24, ivFluidPct: 80, coolingUnits: 6 },
      trace: [{ step: 1, phase: 'Critical Stabilisation', observation: '9 critical patients, generator <2hr, IV fluids 18% — all three converging on mass casualty', inference: 'Generator failure kills cooling and monitoring for critical patients simultaneously — priority 1', decision: 'Parallel: fuel truck → generator, NDMA stockpile van → IV fluids + cooling units, all within 30min', toolCalled: 'dispatch_api', toolResult: 'Fuel truck + NDMA supply van dispatched — ETA 18min', timestamp: now() }],
    },
    {
      id: 'skr-a4', crisisId: 'skr-c2', type: 'public_alert',
      title: 'Extreme Heat Advisory — Sukkur 50°C Public Health Alert',
      description: 'Issue public advisory for heat safety. Activate cooling centres at IRSA offices, Sukkur Arts Council, Bus Terminal.',
      status: 'completed', executedAt: now(), result: 'Heat advisory sent to 200,000 Sukkur residents. 3 cooling centres opened.',
      costPKR: 22000, latencyMs: 140,
      beforeState: { coolingCentres: 0, publicAlertSent: false }, afterState: { coolingCentres: 3, publicAlertSent: true, residentsNotified: 200000 },
      trace: [{ step: 1, phase: 'Public Safety', observation: '50.1°C, heat index 58°C, wind 3km/h, 36hr dome — mortality risk in unventilated homes', inference: 'Cooling centres + stay-home advisory reduces heatstroke burden on already-overwhelmed hospital', decision: 'SMS advisory + open IRSA, Arts Council, Bus Terminal as air-conditioned cooling centres with water', toolCalled: 'sms_gateway', toolResult: '200K SMS sent; cooling centres notified to open', timestamp: now() }],
    },
  ];
}

export function getSukkurMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '🔴 SUKKUR BARRAGE FLOOD — FORAN NIKLO', body: 'Sukkur: Barrage discharge danger level se upar hai. Rohri aur Saleh Pat ke logon ko FORAN N-55 pe nikalna hai. Relief camp lagaya gaya hai. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'public', channel: 'sms', subject: '⚠️ GARMI 50°C — COOLING CENTRES KHULE HAIN', body: 'Sukkur: Aaj 50°C record garmi hai. Ghar ke andar rahain, paani peete rahain. Cooling centres: IRSA Office, Arts Council, Bus Terminal — daakhil hona free hai. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: 'DUAL CRISIS: BARRAGE FLOOD + HEATWAVE', body: 'SKR-Alpha → Rohri rooftop extractions. NDMA FRT → Saleh Pat evacuation. Fuel truck → hospital generator. NDMA supply → IV fluids + cooling. SKR-D01 → barrage embankment surveillance.', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
