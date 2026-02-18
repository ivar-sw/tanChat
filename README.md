# TanChat

<p align="center">
  <img src="public/palm.png" alt="TanChat" width="128" />
</p>

A real-time chat application built with TanStack Start, React, WebSockets, and JWT authentication.

## Prerequisites

- **Node.js ≥ 20.6** (required for `--env-file` flag)
- **pnpm**

## Tech Stack

- **Frontend:** React 19, TypeScript, Material UI, Zustand
- **Backend:** TanStack Start, TanStack RPC, WebSockets (ws)
- **Database:** SQLite via Drizzle ORM
- **Auth:** JWT with httpOnly cookies, bcryptjs
- **Testing:** Vitest, React Testing Library, Playwright

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env and set a random JWT_SECRET, e.g.:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# WS_PORT and VITE_WS_PORT default to 3002 if not set.
# Set VITE_WS_URL only if you need an explicit URL (e.g. wss://chat.example.com/ws).

# Set up database
pnpm db:generate
pnpm db:migrate

# Start development servers (web + websocket)
pnpm dev
```

The app runs at `http://localhost:3000` with hot reload for both client and server.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + WebSocket servers |
| `pnpm dev:web` | Start web server only |
| `pnpm dev:ws` | Start WebSocket server only |
| `pnpm build` | Production build |
| `pnpm start` | Start production web server |
| `pnpm start:ws` | Start WebSocket server |
| `pnpm start:all` | Start web + WebSocket servers |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:cleanup:e2e` | Remove local E2E-created users/channels/messages |

## License

MIT
