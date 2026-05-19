export interface BackendEnv {
  port: number;
  allowedOrigins: string[];
  weatherApiKey?: string;
  tomtomApiKey?: string;
  openrouterApiKey?: string;
  openrouterModel: string;
  openrouterAllowedModels: string[];
  openrouterMaxTokens: number;
  openrouterSiteUrl?: string;
  openrouterAppTitle: string;
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): BackendEnv {
  const port = Number.parseInt(source.PORT ?? '8080', 10);
  const openrouterModel = cleanOptional(source.OPENROUTER_MODEL) ?? 'google/gemini-2.0-flash-exp:free';

  return {
    port: Number.isFinite(port) ? port : 8080,
    allowedOrigins: parseAllowedOrigins(source.ALLOWED_ORIGINS),
    weatherApiKey: cleanOptional(source.WEATHER_API_KEY),
    tomtomApiKey: cleanOptional(source.TOMTOM_API_KEY),
    openrouterApiKey: cleanOptional(source.OPENROUTER_API_KEY),
    openrouterModel,
    openrouterAllowedModels: parseAllowedModels(source.OPENROUTER_ALLOWED_MODELS, openrouterModel),
    openrouterMaxTokens: parsePositiveInt(source.OPENROUTER_MAX_TOKENS, 240, 1000),
    openrouterSiteUrl: cleanOptional(source.OPENROUTER_SITE_URL),
    openrouterAppTitle: cleanOptional(source.OPENROUTER_APP_TITLE) ?? 'CIRO',
  };
}

export function parseAllowedOrigins(value: string | undefined): string[] {
  return (value ?? 'http://localhost:5173,capacitor://localhost')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function cleanOptional(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function parseAllowedModels(value: string | undefined, fallbackModel: string): string[] {
  const models = (value ?? fallbackModel)
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  return models.length ? Array.from(new Set(models)) : [fallbackModel];
}

function parsePositiveInt(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}
