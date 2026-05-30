## AI Endpoint Checker — Build Plan

A dark futuristic SaaS dashboard matching the reference screenshot, with full sidebar navigation and working endpoint-checking against real AI provider APIs (OpenAI, OpenRouter, Groq, Anthropic, Gemini, DeepSeek, Custom).

### Scope clarifications (defaults I'll use unless you say otherwise)
- **Stack**: TanStack Start + React + TypeScript + Tailwind + shadcn/ui (project template). Not Next.js — the prompt mentions Next, but this project runs on TanStack Start, which fits the same React/Tailwind/shadcn pattern.
- **Storage**: `localStorage` for API keys, history, settings (no backend account system). This avoids signup friction and keeps keys on the user's machine. Can upgrade to Lovable Cloud later.
- **Endpoint calls**: proxied through a TanStack server route (`/api/check`) to avoid browser CORS issues with provider APIs.
- **Charts**: Recharts (already idiomatic for shadcn).
- **i18n**: lightweight in-house provider (ID/EN) — no heavy i18next dep.
- **Animations**: framer-motion for card glow/hover, sidebar transitions.

### Design system (src/styles.css)
- Dark navy background `oklch(0.16 0.03 260)`, near-black cards `oklch(0.20 0.025 260)`.
- Neon blue primary `oklch(0.65 0.20 250)` with glow shadow token.
- Gradient borders per stat-card (blue / green / purple / amber) using `background-clip` + radial glow.
- Glassmorphism: `backdrop-blur` + 6% white border on elevated panels.
- Rounded-2xl, generous spacing, Inter/Geist-style typography.
- Light mode tokens mirrored for the Settings theme toggle.

### Routes (TanStack file-based, under `_app` layout with sidebar)
```
src/routes/
  __root.tsx                 → providers (Theme, i18n, Query)
  _app.tsx                   → sidebar + topbar layout (Outlet)
  _app.index.tsx             → Dashboard
  _app.checker.tsx           → Endpoint Checker
  _app.models.tsx            → Active Models
  _app.keys.tsx              → API Keys
  _app.logs.tsx              → API Logs
  _app.history.tsx           → History
  _app.analytics.tsx         → Analytics
  _app.providers.tsx         → Providers overview
  _app.docs.tsx              → Documentation
  _app.settings.tsx          → Settings
  api/check.ts               → server route: proxy + time the request
```

### Pages
1. **Dashboard** — header, 4 glowing stat cards (Status, Active Models, Response Time, Provider), inline "Cek Endpoint" mini-form, Available Models table, Response JSON viewer. Mirrors the screenshot composition.
2. **Endpoint Checker** — full form: URL, Method (GET/POST), Provider dropdown (auto-fills URL + auth header style), API Key (masked, eye toggle), Headers JSON, Body JSON. Submit → `/api/check` → render status, latency, parsed models list, raw JSON with syntax highlighting + copy/format.
3. **Active Models** — table from the last successful `/v1/models`-style response: search, provider filter, sort, pagination, copy model id.
4. **API Keys** — CRUD per provider, masked input, show/hide, stored in localStorage (encrypted-at-rest is out of scope; warning shown).
5. **API Logs** — chronological raw log of requests/responses.
6. **History** — filterable list of past checks with CSV export.
7. **Analytics** — Recharts: requests/day (area), avg response time (line), provider usage (pie), uptime (bar). Data derived from history.
8. **Providers** — cards summarizing each supported provider + default endpoint + docs link.
9. **Documentation** — how to use, provider setup notes.
10. **Settings** — theme (dark/light/system), language (ID/EN), sidebar collapse default, notifications toggle, clear-data button.

### Sidebar
- Fixed left, collapsible to icon-only (desktop), drawer on mobile (Sheet).
- Active state with neon-blue left bar + soft glow.
- Footer: "Status Sistem · Online" pulse dot.

### Components (src/components/)
- `AppSidebar.tsx`, `Topbar.tsx`
- `StatCard.tsx` (gradient border + glow variants)
- `EndpointForm.tsx`
- `ModelsTable.tsx`
- `JsonViewer.tsx` (uses `react-syntax-highlighter` or hand-rolled tokenizer + copy/format)
- `KeyManager.tsx`
- `HistoryTable.tsx`
- `AnalyticsCharts.tsx`
- `LangSwitch.tsx`, `ThemeToggle.tsx`

### Hooks / lib
- `useApiKeys`, `useHistory`, `useSettings` — localStorage-backed with Zod schemas.
- `lib/providers.ts` — provider catalog (id, name, defaultUrl, authHeader, modelListPath).
- `lib/i18n.ts` — Context + dictionaries `id`/`en`.
- `lib/parseModels.ts` — normalize OpenAI/Anthropic/Gemini/etc. model-list shapes.

### Server route `/api/check`
- Accepts `{ url, method, headers, body, apiKey, provider }`.
- Adds provider-specific auth header.
- Times the fetch, returns `{ status, latencyMs, headers, body }`.
- 10s timeout, error envelope on failure.

### Out of scope (will note in UI)
- No multi-user auth / cloud sync (localStorage only).
- No realtime ping daemon — manual re-check button + "auto-refresh every Ns" toggle on Dashboard.

### Deliverable order
1. Theme tokens + layout shell (sidebar, topbar, routing).
2. Dashboard + Endpoint Checker + `/api/check` + JSON viewer (the core flow from the screenshot).
3. Models, API Keys, History.
4. Analytics, Logs, Providers, Docs, Settings.
5. i18n wiring + light mode polish + mobile pass.

Confirm or adjust (storage choice, Next vs TanStack, scope trims) and I'll build.
