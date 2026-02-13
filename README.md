# fap-web

Next.js frontend for FermatMind assessments.

## Prerequisites

- Node.js 20.x (see `.nvmrc`)
- pnpm 10.28.1 (via `corepack`)

## Package manager policy

This repository is **pnpm-only**.

- Use: `pnpm install --frozen-lockfile`
- Do not use: `npm install` / `yarn install`

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm release:gate
# Optional for local machines that keep .env.local:
RELEASE_GATE_ALLOW_LOCAL_ENV=1 pnpm release:gate
```

## Build and run

```bash
pnpm build
pnpm start
```

## Production deployment

Production deployment assets are in:

- `/Users/rainie/Desktop/GitHub/fap-web/deploy/systemd/fap-web.service`
- `/Users/rainie/Desktop/GitHub/fap-web/deploy/nginx/fap-web.conf`

`/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/*` are reference docs.

### Standalone run

```bash
pnpm build
node .next/standalone/server.js
```
