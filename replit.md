# Mobistory V6

Vehicle history and management mobile app — lets users track vehicles, fuel logs, and inspections with AI-powered data extraction from images.

## Run & Operate

```bash
pnpm install                          # Install all workspace dependencies
pnpm --filter @workspace/db run push  # Push schema to PostgreSQL
PORT=8080 pnpm --filter @workspace/api-server run dev  # Start backend
PORT=5000 pnpm --filter @workspace/mobile run dev      # Start mobile app
```

Required env vars (all auto-provisioned by Replit):
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Replit AI Integrations base URL
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Replit AI Integrations key

## Stack

- **Mobile**: Expo ~54, React Native 0.81, Expo Router, TypeScript, React Query
- **Backend**: Express 5, Node.js 24, TypeScript, Pino logging
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Anthropic Claude via Replit AI Integrations (no own API key needed)
- **Build**: pnpm workspaces, esbuild

## Where things live

```
artifacts/
  mobile/        — Expo app (Expo Router, React Native Web for web preview)
  api-server/    — Express REST API (src/routes/)
lib/
  db/            — Drizzle schema + client (src/schema/)
  api-spec/      — OpenAPI spec (source of truth for API contract)
  api-zod/       — Zod schemas generated from API spec
  api-client-react/ — React Query hooks generated from API spec
  integrations-anthropic-ai/ — Anthropic client wrapper
```

## Architecture decisions

- **pnpm monorepo**: All packages share a single lockfile; workspace catalog pins shared dep versions
- **Orval codegen**: API client and Zod schemas are generated from the OpenAPI spec — run codegen after API changes
- **Replit AI Integrations**: Anthropic is accessed via Replit's proxy (no own key required), configured in `lib/integrations-anthropic-ai/src/client.ts`
- **Web proxy**: Metro runs on 8081; a Node.js proxy in `artifacts/mobile/scripts/web-proxy.js` forwards port 5000 → 8081 so the Replit webview works
- **esbuild overrides**: Platform-specific esbuild binaries excluded in `pnpm-workspace.yaml` to keep installs lean on Linux x64

## Product

- Vehicle CRUD with AI-assisted data extraction (brand, model, year, plate, color from images)
- Fuel log with AI extraction from pump photos/receipts
- Inspection tracking
- Mobile-first UI (iOS/Android native + web via React Native Web)

## User preferences

_Populate as you build_

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes before starting the backend
- The mobile `dev` script starts both the web proxy (port 5000) AND Metro (port 8081) — don't use `expo start --tunnel` in Replit
- `minimumReleaseAge: 1440` in `pnpm-workspace.yaml` blocks packages published < 1 day ago (supply-chain protection)

## Pointers

- DB schema: `lib/db/src/schema/`
- API contract: `lib/api-spec/`
- AI routes: `artifacts/api-server/src/routes/vehicle.ts`, `fuel.ts`
