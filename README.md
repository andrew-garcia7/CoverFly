# CoverFly — Ride Booking Platform

Monorepo containing:
- `apps/web` — Rider web app (React + Tailwind + Framer Motion)
- `apps/driver` — Driver app (React)
- `apps/admin` — Admin panel (React)
- `services/*` — Node.js microservices (Express) + Socket.io realtime
- `packages/*` — Shared types, UI, config
- `infra/*` — Docker, Kubernetes, Prometheus, Grafana, CI/CD

## Quick start (Docker)

1) Copy env

```bash
copy .env.example .env
```

2) Run the full stack

```bash
npm -v
npm install
npm run docker:up
```

Then open:
- Rider: `http://localhost:3000`
- Driver: `http://localhost:3001`
- Admin: `http://localhost:3002`
- API Gateway: `http://localhost:4000/healthz`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3003` (user/pass: admin/admin)

## Dev (without Docker)

```bash
npm install
npm run dev
```

Note: the backend requires MongoDB. Either run Docker Desktop + `npm run docker:up`, or run a local Mongo instance and set `MONGODB_URI`.

