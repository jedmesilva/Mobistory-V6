# Mobistory V6

Aplicativo móvel de histórico e gestão de veículos, construído com Expo (React Native) e um servidor API em Express/Node.js.

## Estrutura do Projeto

Este é um monorepo pnpm com a seguinte estrutura:

```
artifacts/
  mobile/        - App Expo (React Native + Web)
  api-server/    - API REST em Express/TypeScript
lib/
  db/            - Schema Drizzle ORM (PostgreSQL)
  api-zod/       - Schemas de validação Zod
  api-spec/      - Especificação da API
  api-client-react/ - Cliente React para a API
  integrations-anthropic-ai/ - Integração com Anthropic AI
  integrations/  - Utilitários de integração
```

## Tecnologias

- **Mobile**: Expo ~54, React Native, Expo Router, TypeScript
- **Backend**: Express 5, Node.js 24, TypeScript, pino (logging)
- **Banco de dados**: PostgreSQL + Drizzle ORM
- **AI**: Anthropic Claude (via Replit AI Integrations)
- **Build**: pnpm workspaces, esbuild

## Workflows

- **Start application**: `PORT=5000 pnpm --filter @workspace/mobile run dev` (porta 5000, webview)
- **Start Backend**: `PORT=8080 pnpm --filter @workspace/api-server run dev` (porta 8080, console)

## Variáveis de Ambiente

- `DATABASE_URL` — URL do banco PostgreSQL (provisionado automaticamente pelo Replit)
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — URL base da integração Anthropic (auto-configurada)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Chave da integração Anthropic (auto-configurada)

## Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Push do schema para o banco
pnpm --filter @workspace/db run push

# Build do backend
pnpm --filter @workspace/api-server run build

# Rodar o app mobile em dev
PORT=5000 pnpm --filter @workspace/mobile run dev

# Rodar o backend em dev
PORT=8080 pnpm --filter @workspace/api-server run dev
```
