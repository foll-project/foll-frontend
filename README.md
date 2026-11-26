# FOLL Frontend — React + Vite

## Stack prod (actual)

| Servicio | URL |
|----------|-----|
| REST (KrakenD) | `https://krakend-api-gateway-o4chdtzxla-rj.a.run.app/api/monolito` |
| SignalR | `https://foll-backend-upc.azurewebsites.net` |

Config: `src/shared/stack.config.ts` → `USE_LOCAL_STACK = false`

## Local con 3 instancias + load balancer

```powershell
cd foll-frontend
docker compose up --build
```

KrakenD local en `:8080` → `nginx/nginx.local.conf`

## Local prod (KrakenD Cloud Run)

```powershell
docker compose -f docker-compose.prod.yml up --build
```

Abre `http://localhost` → LB reparte entre 3 frontends; `/api/` → KrakenD Cloud Run.

## Deploy GCP (3 Cloud Run + LB nginx)

Proyecto: `foll-krakend-upc` (mismo que api-gateway).

```powershell
cd foll-frontend

# Requisito: setup-gcp-project.ps1 ya ejecutado en api-gateway
.\scripts\deploy-gcp.ps1 env/deploy.env
```

Despliega:
1. `foll-frontend-1/2/3` (misma imagen, 3 servicios)
2. `foll-frontend-lb` (nginx round-robin + proxy `/api/` → KrakenD)

Tras el deploy, **actualiza CORS del backend Azure** con la URL del LB (el script imprime el comando `az`).

## Dev sin Docker

```powershell
npm install
npm run dev
```

Con `USE_LOCAL_STACK = true` en `stack.config.ts` para stack local.
