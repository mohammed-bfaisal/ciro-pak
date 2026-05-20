import type { City, Crisis, Resource } from '../types';
import { buildRadioChatterPrompt, OPENROUTER_DISPATCH_SYSTEM_PROMPT } from './openRouterPrompts';
import { chatWithOpenRouter } from '../api/openRouter';
import { useRadioStore } from '../store/radioStore';
import { getApiClientOptionsForSettings } from '../store/settingsStore';

const MAX_CHARS = 120;
const CACHE = new Map<string, string>();

export type RadioEventType = 'dispatch' | 'en_route' | 'traffic_slowdown' | 'on_scene' | 'returning' | 'recovery';

export async function generateRadioLine(
  city: City,
  eventType: RadioEventType,
  crisis: Crisis,
  resource?: Resource,
  etaMinutes?: number,
): Promise<void> {
  if (!useRadioStore.getState().enabled) return;

  const prompt = buildRadioChatterPrompt({ city, eventType, crisis, resource, etaMinutes });
  const cacheKey = `${eventType}:${crisis.id}:${resource?.id ?? ''}`;

  let text = CACHE.get(cacheKey);
  if (!text) {
    try {
      const result = await chatWithOpenRouter(
        { prompt, systemPrompt: OPENROUTER_DISPATCH_SYSTEM_PROMPT, maxTokens: 40, temperature: 0.8 },
        getApiClientOptionsForSettings(),
      );
      text = result.content.slice(0, MAX_CHARS).trim();
      CACHE.set(cacheKey, text);
    } catch {
      text = fallbackLine(eventType, crisis, resource);
    }
  }

  useRadioStore.getState().addLine({ text, eventType, timestamp: new Date().toISOString() });
}

function fallbackLine(eventType: RadioEventType, crisis: Crisis, resource?: Resource): string {
  const unit = resource?.label ?? 'Unit';
  const loc = crisis.location.label;
  switch (eventType) {
    case 'dispatch': return `${unit} dispatched to ${loc}. Responding now.`;
    case 'en_route': return `${unit} en route to ${loc}.`;
    case 'on_scene': return `${unit} on scene at ${loc}.`;
    case 'returning': return `${unit} returning from ${loc}.`;
    case 'recovery': return `Action recovered at ${loc}. Fallback route confirmed.`;
    default: return `Update from ${loc}.`;
  }
}
