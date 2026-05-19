import express from 'express';
import cors from 'cors';
import { readEnv } from './config/env.js';
import { createHealthRouter } from './routes/health.js';
import { createWeatherRouter } from './routes/weather.js';
import { createTrafficRouter } from './routes/traffic.js';
import { createRouteRouter } from './routes/route.js';
import { createOpenRouterRouter } from './routes/openrouter.js';

const env = readEnv();
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed: ${origin}`));
  },
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', createHealthRouter(env));
app.use('/api/weather', createWeatherRouter(env));
app.use('/api/traffic', createTrafficRouter(env));
app.use('/api/route', createRouteRouter(env));
app.use('/api/openrouter', createOpenRouterRouter(env));

app.listen(env.port, '0.0.0.0', () => {
  console.log(`CIRO backend listening on ${env.port}`);
});
