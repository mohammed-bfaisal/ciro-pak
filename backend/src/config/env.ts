export interface BackendEnv {
  port: number;
  allowedOrigins: string[];
  weatherApiKey?: string;
  tomtomApiKey?: string;
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): BackendEnv {
  const port = Number.parseInt(source.PORT ?? '8080', 10);

  return {
    port: Number.isFinite(port) ? port : 8080,
    allowedOrigins: parseAllowedOrigins(source.ALLOWED_ORIGINS),
    weatherApiKey: cleanOptional(source.WEATHER_API_KEY),
    tomtomApiKey: cleanOptional(source.TOMTOM_API_KEY),
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
