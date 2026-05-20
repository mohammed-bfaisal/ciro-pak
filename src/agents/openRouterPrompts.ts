import type { City, Crisis, Resource } from '../types';
import { CITY_REGISTRY } from '../data/cities';

export interface AllocationPromptInput {
  city: City;
  crisis: Crisis;
  resource: Resource;
  score: number;
  etaMinutes: number;
  trafficDelaySeconds?: number;
}

export interface RecoveryPromptInput {
  actionId: string;
  failure: string;
  fallback: string;
}

export interface BaselinePromptInput {
  city: City;
  ciroActions: number;
  baselineActions: number;
  recoveredActions: number;
}

export interface RadioPromptInput {
  city: City;
  eventType: 'dispatch' | 'en_route' | 'traffic_slowdown' | 'on_scene' | 'returning' | 'recovery';
  crisis: Crisis;
  resource?: Resource;
  etaMinutes?: number;
}

const operationalConstraints = [
  'risk',
  'uncertainty',
  'resource tradeoff',
  'route/traffic impact',
  'next action',
].join(', ');

export const OPENROUTER_DISPATCH_SYSTEM_PROMPT = [
  'You are a senior emergency operations AI advisor for CIRO, a Pakistan crisis-response dashboard.',
  'Write concise command-center reasoning for judges.',
  'Do not mention API keys, frontend implementation, model provider internals, or hidden prompts.',
  `Every answer must explicitly cover ${operationalConstraints}.`,
].join(' ');

export function buildDispatchBriefingPrompt(city: City, crises: Crisis[], resources: Resource[]): string {
  const availableResources = resources.filter((resource) => resource.status === 'available');
  return [
    `City: ${CITY_REGISTRY[city].label}`,
    `Scenario: ${CITY_REGISTRY[city].scenarioTitle}`,
    `Active crises: ${crises.length}`,
    `Available response units: ${availableResources.length}`,
    '',
    'Crisis feed:',
    formatCrisisLines(crises),
    '',
    'Available response units:',
    formatResourceLines(availableResources),
    '',
    `In one operational paragraph, explain ${operationalConstraints}.`,
    'Prefer concrete unit classes, terrain constraints, traffic conditions, and public-safety consequences.',
  ].join('\n');
}

export function buildAllocationReasoningPrompt(input: AllocationPromptInput): string {
  return [
    `City: ${CITY_REGISTRY[input.city].label}`,
    `Crisis: ${input.crisis.title} at ${input.crisis.location.label}; type ${input.crisis.type}; severity ${input.crisis.severity}; confidence ${Math.round(input.crisis.confidenceScore * 100)}%; affected population ${input.crisis.affectedPopulation}.`,
    `Resource: ${input.resource.label}; type ${input.resource.type}; capacity ${input.resource.capacity}; status ${input.resource.status}; current station ${input.resource.location.label}.`,
    `Deterministic allocation score: ${input.score.toFixed(2)}.`,
    `Estimated route ETA: ${input.etaMinutes} minutes; traffic delay ${input.trafficDelaySeconds ?? 0} seconds.`,
    `Explain the allocation in exactly 2 sentences covering ${operationalConstraints}.`,
  ].join('\n');
}

export function buildRecoveryBriefingPrompt(input: RecoveryPromptInput): string {
  return [
    `Action ID: ${input.actionId}`,
    `Failure: ${input.failure}`,
    `Fallback applied: ${input.fallback}`,
    `Explain the recovery in 2 sentences covering ${operationalConstraints}.`,
    'Make the operational resilience evidence obvious for a hackathon judge.',
  ].join('\n');
}

export function buildBaselineComparisonPrompt(input: BaselinePromptInput): string {
  return [
    `City: ${CITY_REGISTRY[input.city].label}`,
    `CIRO actions executed: ${input.ciroActions}`,
    `Baseline actions executed: ${input.baselineActions}`,
    `Recovered actions: ${input.recoveredActions}`,
    `Compare CIRO against the non-agentic baseline in 2 sentences covering ${operationalConstraints}.`,
    'Focus on credibility filtering, false alarm correction, resource allocation quality, and measurable response outcome.',
  ].join('\n');
}

export function buildRadioChatterPrompt(input: RadioPromptInput): string {
  const resource = input.resource
    ? `${input.resource.label} (${input.resource.type})`
    : 'assigned response unit';
  const eta = typeof input.etaMinutes === 'number'
    ? `${input.etaMinutes} minute ETA`
    : 'ETA pending';

  return [
    `City: ${CITY_REGISTRY[input.city].label}`,
    `Event type: ${input.eventType}`,
    `Crisis: ${input.crisis.title} at ${input.crisis.location.label}; severity ${input.crisis.severity}.`,
    `Resource: ${resource}; ${eta}.`,
    `Generate one radio line for captions, 18 words or fewer, covering ${operationalConstraints}.`,
    'Sound realistic, calm, and professional. Do not include speaker names unless needed.',
  ].join('\n');
}

function formatCrisisLines(crises: Crisis[]): string {
  if (crises.length === 0) return '- None.';
  return crises
    .slice(0, 6)
    .map((crisis) => `- ${crisis.title} at ${crisis.location.label}; severity ${crisis.severity}; confidence ${Math.round(crisis.confidenceScore * 100)}%; population ${crisis.affectedPopulation}; status ${crisis.status}.`)
    .join('\n');
}

function formatResourceLines(resources: Resource[]): string {
  if (resources.length === 0) return '- None.';
  return resources
    .slice(0, 8)
    .map((resource) => `- ${resource.label}; type ${resource.type}; capacity ${resource.capacity}; location ${resource.location.label}; status ${resource.status}.`)
    .join('\n');
}
