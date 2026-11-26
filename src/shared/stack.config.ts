/**
 * Interruptor único del stack FOLL (local vs deploy).
 * USE_LOCAL_STACK = false → KrakenD Cloud Run + backend Azure (prod).
 */
export const USE_LOCAL_STACK = true;

const LOCAL = {
  API_BASE_URL: 'http://localhost:5237', // Directo al backend .NET
  HUB_BASE_URL: 'http://localhost:5237', // SignalR
} as const;

const DEPLOY = {
  API_BASE_URL:
    'https://krakend-api-gateway-o4chdtzxla-rj.a.run.app/api/monolito',
  HUB_BASE_URL: 'https://foll-backend-upc.azurewebsites.net',
} as const;

export const STACK_ENDPOINTS = USE_LOCAL_STACK ? LOCAL : DEPLOY;

/** Archivo nginx del load-balancer (local Docker vs prod Cloud/GCP) */
export const NGINX_LOAD_BALANCER_FILE = USE_LOCAL_STACK
  ? 'nginx/nginx.local.conf'
  : 'nginx/nginx.prod.conf';
