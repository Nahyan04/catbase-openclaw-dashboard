# CATBASE / Mission Control

A locally-hosted Next.js dashboard that visualises the live state of an OpenClaw-managed AI agent crew. It runs on a Linux VPS alongside the OpenClaw instance and connects to the gateway over a local WebSocket.

---

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **OpenClaw** running on the deployment host, with `~/.openclaw/openclaw.json` present and the gateway listening on `ws://127.0.0.1:18789`
- For local development without a live OpenClaw instance, use **stub mode** (see below)

---

## Quick Start (stub / offline mode)

Use this when you do not have OpenClaw running on your local machine.

```bash
git clone <repo-url>
cd catbase-openclaw-dashboard
cp .env.example .env.local
# Open .env.local and set OPENCLAW_STUB=1
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard will display placeholder data in all panels that normally require a live gateway connection.

---

## Connecting to a Real OpenClaw Instance

1. On the host running OpenClaw, open `~/.openclaw/openclaw.json` and copy the value at `gateway.auth.token`.
2. In your `.env.local`, set:
   ```env
   OPENCLAW_GATEWAY_TOKEN=<token-from-above>
   OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
   OPENCLAW_WORKSPACE=/root/.openclaw/workspace   # adjust to your actual path
   OPENCLAW_STUB=   # leave blank (or remove) to disable stub mode
   ```
3. Restart the dev server with `npm run dev`.

The dashboard will connect to the gateway and stream live agent state, runs, and workspace files.

---

## Environment Variables

All gateway credentials are **server-side only**. Never prefix them with `NEXT_PUBLIC_` — doing so will cause the application to throw at startup.

| Variable | Required | Default (dev) | Description |
|---|---|---|---|
| `OPENCLAW_GATEWAY_URL` | Yes | `ws://127.0.0.1:18789` | WebSocket URL of the OpenClaw gateway |
| `OPENCLAW_GATEWAY_TOKEN` | No | — | Auth token from `~/.openclaw/openclaw.json → gateway.auth.token` |
| `OPENCLAW_WORKSPACE` | Yes | `""` (empty = not configured) | Absolute path to the OpenClaw workspace directory |
| `OPENCLAW_STUB` | No | — | Set to `1` to enable stub/offline mode |
| `DISCORD_WEBHOOK_URL` | No | — | Discord incoming webhook for notifications |
| `GOOGLE_CALENDAR_CREDENTIALS` | No | — | JSON credentials for Google Calendar integration |
| `GITHUB_TOKEN` | No | — | GitHub personal access token |
| `TWITTER_API_KEY` | No | — | Twitter/X API key (read-only) |

Copy `.env.example` to `.env.local` and fill in the values that apply to your setup. The app degrades gracefully when optional integrations are absent, showing a "Connect" prompt in the relevant UI panel.

---

## Integrations

### Discord

Set `DISCORD_WEBHOOK_URL` to a Discord incoming webhook. A long-running subscriber starts at server boot (via `instrumentation.ts`) and posts an embed whenever an `agent:run-end` event arrives with status `failed`.

To verify your webhook from a running server:

```bash
curl -X POST http://localhost:3000/api/integrations/discord/test
```

A "Mission Control connected" embed should appear in the channel.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on `localhost:3000` with hot reload |
| `npm run build` | Compile an optimised production build |
| `npm start` | Start the production server (run `build` first) |
| `npm run lint` | Run ESLint across the codebase |
| `npm test` | Run the vitest test suite once |
| `npm run test:watch` | Run vitest in watch mode |

---

## Deployment (Linux VPS)

The dashboard is designed to run on the same host as OpenClaw, where the gateway is reachable on loopback and the workspace is a local path.

1. Copy the repository to the server and install dependencies:
   ```bash
   npm install --omit=dev
   ```
2. Create `/etc/catbase/.env` (or equivalent) with production values and symlink / source it as `.env.local` in the project root.
3. Build and start:
   ```bash
   npm run build && npm start
   ```
4. For process management, wrap `npm start` with `pm2`, `systemd`, or your preferred supervisor. Example systemd unit:
   ```ini
   [Service]
   WorkingDirectory=/opt/catbase-openclaw-dashboard
   ExecStart=/usr/bin/npm start
   Restart=always
   EnvironmentFile=/etc/catbase/env
   ```

The server binds to `0.0.0.0:3000` by default. Proxy through nginx with TLS for external access.
