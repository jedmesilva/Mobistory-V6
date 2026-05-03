# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
This is **Mobistory** — a vehicle fuel/supply tracking app with AI-powered receipt extraction.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (provisioned via Replit)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **AI**: Anthropic Claude via Replit AI Integrations (no API key needed — billed to Replit credits)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Project Structure

```
artifacts/
  api-server/      — Express API backend (port 8080)
  mobile/          — React Native / Expo mobile app
  mockup-sandbox/  — Vite + React UI prototyping environment
lib/
  api-spec/        — OpenAPI specification
  api-client-react/ — Generated React Query hooks
  api-zod/         — Generated Zod schemas
  db/              — Drizzle ORM schema + PostgreSQL client
  integrations-anthropic-ai/ — Anthropic Claude client wrapper
```

## Key Endpoints

- `GET  /api/healthz` — health check, returns `{"status":"ok"}`
- `POST /api/fuel/analyze` — AI image extraction (base64 + mediaType → structured fuel data)

## Environment Variables (Auto-configured)

- `DATABASE_URL` — PostgreSQL connection string (Replit-managed)
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Replit AI Integrations proxy URL
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Replit AI Integrations key

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Workflows

- **API Server** — runs `PORT=8080 pnpm --filter @workspace/api-server run dev` (build + start)
