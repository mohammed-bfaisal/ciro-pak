# AI Seekho #VibeKaregaPakistan 2026 — Challenge 3 & Shared Rules

> Extracted from the Challenges PDF and FAQ PDF.
> Challenge 1, 2, and 4 removed. Only Challenge 3 and shared/general sections retained.

---

## Challenge 3: Crisis Intelligence & Response Orchestrator (CIRO)

### Challenge Overview

Metropolitans, globally and in Pakistan, frequently face localized crises such as:
- Urban flooding
- Heatwaves
- Road blockages
- Accidents
- Infrastructure failures

However, response systems are:
- Fragmented
- Reactive
- Slow to coordinate

Critical signals (social media, maps, weather, reports) exist — but are not converted into actionable decisions in real time.

---

### Problem Statement

Build an Agentic AI System that:

1. Ingests multi-source signals
2. Detects emerging crisis situations
3. Generates coordinated response actions
4. Simulates execution of those actions
5. Shows impact of decisions

---

### Mandatory Requirement: Google Antigravity

Teams MUST use Google Antigravity to:
- Orchestrate multi-agent workflows
- Plan and execute decisions
- Integrate tools (Maps, Search, APIs)
- Simulate coordinated actions

---

### Example Scenario (Original PDF)

**Input Signals:**
- Social media: "Flash flood happening at George Town for past 30 mins" OR "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"
- Weather: heavy rainfall alert
- Maps: traffic congestion spike

**Expected Output:**

```
Detected Situation: Urban flooding (G-10 / George Town)
Confidence: High

Impact:
- Traffic blocked
- Vehicles stranded

Recommended Actions:
- Redirect traffic via alternate routes
- Dispatch emergency services

Simulated Execution:
- Route updated on map
- Alert sent to users
- Emergency ticket created

Outcome: Reduced congestion in simulation
```

---

### System Requirements (Original PDF)

#### 1. Multi-Source Input Processing
- Accept text inputs (complaints, posts) and simulated APIs (weather, traffic)
- Handle noisy, informal language

#### 2. Event Detection
- Identify anomalies, clusters, crisis signals

#### 3. Reasoning & Situation Analysis
- Combine signals to infer situation and estimate severity
- Provide confidence level and explanation

#### 4. Action Planning
- Generate coordinated response actions: routing, alerts, resource allocation

#### 5. Action Simulation (CRITICAL)
System must simulate:
- Traffic rerouting
- Emergency dispatch
- Alerts and notifications

Simulation examples:
- Updating mock map routes
- Generating emergency tickets
- Sending simulated alerts
- Updating system status

#### 6. Outcome Visualization
Show:
- Before vs after scenario
- Impact of actions
- System logs

#### 7. Agentic Workflow (MANDATORY)
System must demonstrate:
- Multiple agents OR structured reasoning pipeline
- Interaction between agents
- Planning → decision → execution

---

### Deliverables (Original PDF)

1. Working Prototype with Mobile App (MUST) and Web App (optional)
2. Demo Video (3–5 minutes) showing:
   - Multi-source input
   - Detected crisis
   - Action planning
   - Simulated response
   - Outcome
3. Agent Trace / Logs showing:
   - Reasoning steps
   - Agent decisions
   - Action execution
4. Documentation (README) including:
   - System architecture
   - Antigravity usage
   - Tools/APIs used
   - Assumptions

---

### Evaluation Criteria (Original PDF)

| Criterion | Weight |
|---|---|
| Use of Google Antigravity | 25% |
| Agentic Reasoning & Coordination | 20% |
| Situation Detection & Analysis | 20% |
| Action Planning & Simulation | 15% |
| Technical Implementation | 10% |
| Innovation & UX | 10% |

#### Criterion Details

**1. Use of Google Antigravity — 25%**
- Core orchestration handled via Antigravity
- Multi-agent planning and execution
- Tool integration

**2. Agentic Reasoning & Coordination — 20%**
- Multi-agent interaction
- Logical reasoning
- Decision-making quality

**3. Situation Detection & Analysis — 20%**
- Accuracy of event detection
- Quality of insights
- Clear explanations

**4. Action Planning & Simulation — 15%**
- Realistic response actions
- Effective simulation
- Clear system state change

**5. Technical Implementation — 10%**
- Clean architecture
- API integration
- Robustness

**6. Innovation & UX — 10%**
- Creativity
- Usability
- Demo clarity

---

### Important Guidelines (Original PDF)

- Use simulated datasets/APIs where needed
- Avoid real sensitive data
- Focus on decision-making, not just visualization
- Must show end-to-end workflow

---
---

## Challenge 3: CIRO — Enhanced Specification (FAQ / Enhanced PDF)

### Challenge Overview (Enhanced)

Cities frequently face localized crises such as urban flooding, heatwaves, road blockages, accidents, infrastructure failures, public disorder, disease spikes, and power outages. Signals may exist across social media, traffic maps, weather alerts, citizen complaints, emergency calls, sensors, and field reports, but response systems are often fragmented and reactive.

This challenge requires an agentic system that fuses signals, detects emerging crises, predicts severity, allocates resources, coordinates stakeholders, simulates response actions, and recovers from false alarms or missed detections.

---

### Problem Statement (Enhanced)

1. Ingest and fuse at least three signal sources (social posts, weather, traffic, emergency calls, mock sensors, field reports, historical data)
2. Detect and classify crisis type, location, severity, confidence, affected population, expected duration, and likely evolution
3. Prioritize and allocate constrained response resources across one or more simultaneous crises
4. Simulate coordinated actions such as traffic rerouting, emergency dispatch, hospital preparation, utility escalation, and public alerts
5. Predict outcomes, side effects, and unintended consequences for each response action
6. Handle false positives, false negatives, and conflicting signals through verification and escalation logic

---

### Mandatory Requirement: Google Antigravity (Enhanced)

- Use Google Antigravity to orchestrate multi-agent crisis detection, signal fusion, severity analysis, resource allocation, stakeholder communication, and action simulation
- Show Antigravity traces for signal interpretation, confidence scoring, priority ranking, resource trade-offs, action execution, and recovery from false or conflicting signals
- External APIs and mock streams are allowed, but Antigravity must coordinate planning and execution

---

### Enhanced System Requirements

#### Multi-Signal Fusion
- Use at least three sources: social media/citizen posts, weather, maps/traffic, emergency call frequency, mock sensors, public transport, or historical vulnerability maps

#### Source Credibility and Misinformation Handling
- Score source credibility, geolocation confidence, urgency language, mention velocity, and contradiction level
- Flag low-confidence or suspicious signals

#### Crisis Classification
- Classify type: flood, heatwave, accident, infrastructure, power outage, protest, or disease cluster
- Include severity level and confidence score

#### Severity and Evolution Prediction
- Estimate affected radius, population, duration, peak impact time, spread risk, and uncertainty range

#### Resource Allocation Optimization
- Model constrained resources: ambulances, police units, rescue teams, shelters, generators, water tankers, field teams, or drones
- Allocate based on impact, urgency, travel time, and resource availability

#### Multi-Crisis Coordination
- Handle at least two simultaneous incidents
- Show trade-offs in prioritization and resource assignment

#### Impact Simulation
- For each action show: before state, response action, expected after state, response time improvement, congestion impact, resource cost, and possible side effects

#### Stakeholder Notification
- Generate tailored messages for: public, emergency services, hospitals, utility companies, transport authority, and media/command center

#### False Positive / Negative Handling
- Simulate a false alarm, early low-confidence signal, or conflicting signals
- Show verification, escalation, correction, or alert retraction

#### Robustness and Degraded Mode
- Handle API downtime, stale data, missing location, duplicate incidents, and rate limits
- Use fallback sources or manual escalation

---

### Example Scenario (Enhanced)

**Input signals:** Social posts report flooding in G-10, weather API shows heavy rainfall, traffic API shows congestion spike, and one field report suggests a broken water main instead of flooding. At the same time, a heat emergency is reported in a nearby low-income neighborhood.

**Detection:** Classifies G-10 incident as probable urban flooding with confidence score and identifies conflicting water-main hypothesis.

**Prediction:** Estimates affected zones, likely duration, congestion spread, and vulnerable population risk.

**Resource allocation:** Prioritizes rescue teams and police traffic units for G-10 while assigning medical outreach to heat emergency based on severity and resource constraints.

**Simulation:** Reroutes traffic, creates emergency ticket, sends public alert, notifies hospital, updates incident dashboard, and simulates impact on response time and congestion.

**Recovery:** If field verification confirms only a water-main burst, system updates classification, retracts public flood alert, and notifies utility provider.

---

### Recommended Stress-Test Scenarios

- Two or more crises occur within 30 minutes and compete for limited emergency resources
- Social media indicates flooding but official sensor data is unavailable or contradictory
- An API fails mid-response and the system must use cached or alternate data
- Public alert causes evacuation congestion, requiring staged alerting or rerouting
- False alarm requires correction, apology/retraction, and log update

---

### Deliverables (Enhanced)

1. Working prototype with mobile app (mandatory) and web app/dashboard (optional)
2. Demo video (3–5 minutes) showing:
   - Multi-source input
   - Crisis detection
   - Severity prediction
   - Resource allocation
   - Simulated response
   - Impact visualization
   - Recovery scenario
3. Antigravity agent trace/logs showing:
   - Signal fusion
   - Confidence scoring
   - Crisis classification
   - Allocation trade-offs
   - Stakeholder messages
   - Action execution
   - Fallback behavior
4. README with:
   - Architecture
   - Data stream schemas
   - Antigravity usage
   - APIs/tools
   - Assumptions
   - Privacy/safety note
   - Cost/latency analysis
   - Baseline comparison
   - Scalability discussion
   - Limitations

---

### Evaluation Criteria (Enhanced)

| Criterion | Weight |
|---|---|
| Antigravity integration | 20% |
| Crisis detection and severity analysis | 25% |
| Resource optimization and multi-crisis coordination | 20% |
| Impact simulation and stakeholder coordination | 15% |
| Robustness, scalability, cost and latency | 10% |
| Innovation and UX | 10% |

---
---

## Shared Rules & FAQ (All Challenges)

### Eligibility & Teams

- Minimum team size: 2 members (mandatory for pitching rounds)
- Maximum team size: 5 members
- Age limit: 18–45 years
- Solo pitching is not allowed
- Team composition may be changed during development phase
- Finalized team details must be submitted with the final project

---

### Important Dates

| Date | Event |
|---|---|
| May 15, 2026 | Deadline to select and submit challenge/idea (1 challenge only) |
| May 20, 2026 | Final project submission deadline |
| May 25–26, 2026 | Virtual Regional Pitching Rounds |
| June 07, 2026 | National Finale in Islamabad |

- 10–15 teams shortlisted per region for virtual pitching
- Regional winners/runners-up qualify for National Finale
- Logistic support provided only from Lahore/Karachi to Islamabad

---

### Platform & Tools (FAQ)

**Q: Can we use tools like n8n, Google AI Studio, Vertex AI, LangGraph, CrewAI, or external services with Antigravity?**

Yes. As long as Antigravity remains the main orchestrator and development logs/reasoning traces can be submitted. You are free to build agents in any framework (Vertex AI, LangGraph, etc.) and connect them via Antigravity.

**Q: Can we use other LLMs inside Antigravity?**

Yes. As long as your solution operates within the Antigravity environment, you may integrate other LLMs.

**Q: Is Mobile app mandatory?**

Yes. Mobile app is mandatory for all challenges. Web app is optional.

---

### Credits & Costs (FAQ)

**Q: Are the provided $5 credits enough for the hackathon?**

Each team member will get $5 credit. Additional GCP credits can be facilitated for teams as required. These credits are intended for solution development on Google Cloud Platform services.

---

### Submission Rules (FAQ)

**Q: Do we have to submit the final solution on May 15?**

No. May 15 is only for challenge/idea selection. The final project submission is due May 20, 2026.

**Q: Can we use our previous Phase 1 project in the Hackathon?**

No. You will build your solution based on the explicit requirements of the selected challenge.

**Q: Can we make changes in the team composition?**

Yes, during the development phase. Finalized team details must be submitted with the final project.

**Note:** Please ask all questions within the official community channels or Discord. Queries will not be addressed via direct messages.

---

### Shared Submission Checklist

- [ ] Working prototype: Mobile app mandatory, web app/dashboard optional
- [ ] Demo video: 3–5 minutes showing agentic workflow end to end
- [ ] Demo video: 2–3 minute screen recording showing how your team used Antigravity
- [ ] Antigravity trace/logs: workplan, task plan, agent observations, reasoning, decisions, tool calls, action execution, error recovery, final outcomes
- [ ] README/documentation: architecture, data schemas, tools/APIs, Antigravity role, setup steps, assumptions, privacy note, cost/latency, scalability, baseline comparison, limitations
- [ ] Baseline comparison: show how agentic system performs better than simple heuristic or non-agentic implementation
- [ ] Robustness evidence: at least one failure, edge case, contradiction, missing data, or fallback scenario demonstrated
- [ ] Cost and scalability note: cost per operation or API call estimate; 10x/100x scaling discussion; latency or throughput estimate
