/**
 * Interruptor único del stack FOLL (local vs deploy).
 * Cambia USE_LOCAL_STACK a false antes de build/deploy en producción.
 *
 * Si cambias este valor y usas Docker load-balancer, actualiza también
 * docker-compose.yml → volume de nginx (nginx.local.conf vs nginx.prod.conf).
 */
export const USE_LOCAL_STACK = true;

const LOCAL = {
  API_BASE_URL: 'http://localhost:8080/api/monolito',
  HUB_BASE_URL: 'http://localhost:5237',
} as const;

const DEPLOY = {
  API_BASE_URL:
    'https://krakend-api-gateway-54345958397.southamerica-east1.run.app/api/monolito',
  HUB_BASE_URL:
    'https://foll-backend-iot-h5hkb3czhwedhph0.brazilsouth-01.azurewebsites.net',
} as const;

export const STACK_ENDPOINTS = USE_LOCAL_STACK ? LOCAL : DEPLOY;

/** Archivo nginx del load-balancer que debe coincidir con USE_LOCAL_STACK */
export const NGINX_LOAD_BALANCER_FILE = USE_LOCAL_STACK
  ? 'nginx/nginx.local.conf'
  : 'nginx/nginx.prod.conf';
