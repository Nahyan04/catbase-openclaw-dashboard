# CATBASE / Mission Control

A locally-hosted Next.js dashboard that visualises the live state of an OpenClaw-managed agent crew. It runs on a Linux VPS alongside the OpenClaw instance and connects to the gateway over a local WebSocket.

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
| `DISCORD_WEBHOOK_URL` | No | — | Discord incoming webhook for failed-run alerts |
| `GOOGLE_CALENDAR_CREDENTIALS` | No | — | Service-account JSON (string) for Google Calendar |
| `GOOGLE_CALENDAR_ID` | No | `primary` | Calendar to read/write |
| `GITHUB_TOKEN` | No | — | GitHub personal access token (repo:read scope) |
| `TWITTER_API_KEY` | No | — | Twitter/X v2 bearer token (read-only) |
| `TWITTER_LIST_ID` | No | — | List ID to pull the daily digest from |
| `SPEND_ALERT_USD_PER_WEEK` | No | `50` | Trailing-7-day spend that trips the Finance alert banner |

Copy `.env.example` to `.env.local` and fill in the values that apply to your setup. The app degrades gracefully when optional integrations are absent, showing a "Connect" prompt in the relevant UI panel.

---

## Integrations

### Twitter / X

Set `TWITTER_API_KEY` (a v2 bearer token) and `TWITTER_LIST_ID` (the list to read). The adapter is **read-only** and exposes a digest endpoint at `GET /api/integrations/twitter/digest` ranked by like + 2× retweet count.

**Divide of responsibilities:** when Sonic is running on the same host, it writes its SCAN-mode digest directly to `<workspace>/docs/sonic/scan-YYYY-MM-DD.md` and the dashboard reads the markdown. This adapter exists only as a fallback for hosts where Sonic is not running, so the same digest is not fetched twice.

### Discord

Set `DISCORD_WEBHOOK_URL` to a Discord incoming webhook. A long-running subscriber starts at server boot (via `instrumentation.ts`) and posts an embed whenever an `agent:run-end` event arrives with status `failed`.

To verify your webhook from a running server:

```bash
curl -X POST http://localhost:3000/api/integrations/discord/test
```

A "Mission Control connected" embed should appear in the channel.

### Google Calendar

Set `GOOGLE_CALENDAR_CREDENTIALS` to a service-account JSON (the entire file contents as a single string) and optionally `GOOGLE_CALENDAR_ID` to point at a calendar other than `primary`. The calendar must be shared with the service account's email.

GCal events are merged into the Work calendar via `lib/schedule/source.ts`. The same module exposes `createEvent()` for write-back from scheduled runs.

### GitHub

Set `GITHUB_TOKEN` (a personal access token with `repo:read`). Project front-matter can declare `github: "owner/repo"` and the project card will surface recent commit and open-issue counts. Activity is cached server-side for five minutes per repo.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on `localhost:3000` with hot reload |
| `npm run build` | Compile an optimised production build |
| `npm start` | Start the production server (run `build` first) |
| `npm run lint` | Run ESLint across the codebase |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm test` | Run the vitest test suite once |
| `npm run test:watch` | Run vitest in watch mode |
| `npm run test:security` | Run the boundary tests that assert no gateway token leaks into the client bundle (run `npm run build` first) |

---

## Project Layout

```
app/
  (dashboard)/        — five top-level screens (home, work, projects, knowledge, finance)
  api/                — server-only route handlers (gateway, workspace, integrations)
components/
  finance/            — spend chart, table, alert banner, ledger
  home/               — visual office floor plan + agent sprites
  knowledge/          — memory timeline, doc viewer, search
  pixel/              — shared pixel-art primitives (frame, badge, page header)
  projects/           — project cards (incl. GitHub activity badge)
  work/               — kanban board + calendar
lib/
  finance/            — token spend aggregation + ledger reader
  integrations/       — discord, gcal, github, twitter adapters (all degrade when env unset)
  openclaw/           — SDK client wrapper, event multiplexer, stub
  workspace/          — path resolver + safe filesystem helpers
  agents/             — agent registry (id, breed, accent, default model)
fixtures/             — synthetic data used by stub mode
instrumentation.ts    — boots the failed-run → Discord subscriber
```

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
