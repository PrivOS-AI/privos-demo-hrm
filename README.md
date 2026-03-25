# Demo HR Management

Demo Privos MCP app that manages employee records with dynamic fields.

**Author:** T.D (t.d@privos.ai)
**Port:** 10002

## What It Is

A demo app for the Privos Apps platform that:
- Lets users select a Privos list from the current room
- Displays all items in a table with custom field columns
- Supports inline edit and delete (with modal confirmation)
- Allows adding new records with dynamic form fields
- Supports adding new field definitions on the fly
- Syncs theme with Privos (Auto/Light/Dark)

Renders as an interactive tab in any Privos room after installation.

## Architecture

```
src/
├── server.ts                      # Express MCP server (manifest + JSON-RPC + Vite middleware)
└── ui/
    ├── index.html                 # Vite entry HTML
    ├── main.tsx                   # React entry
    ├── App.tsx                    # PrivosAppProvider + ThemeProvider wrapper
    ├── contact-collector-form.tsx  # Dashboard: list selector + add record form
    ├── list-items-table.tsx        # Items table with inline edit/delete
    ├── theme-provider.tsx          # Auto/Light/Dark theme sync with Privos
    └── contact-form-styles.css     # Theme-aware CSS variables
```

## How It Works

1. **Registration** — Admin → Apps → Connect → enter server URL
2. **Installation** — In a room, click "+" → "Install an App" → select Demo HR Management
3. **Usage** — Select list → view items table → add/edit/delete records

## Configuration

`.env`:
```
PORT=10002
PUBLIC_URL=https://your-tunnel-url.example.com
```

## Run

```bash
npm install
npm run dev
```

## Register in Privos

### Admin Portal
1. Navigate to **Admin → Apps**
2. Click **Connect App**
3. Enter server URL: `https://your-app-url.example.com`

### Via API
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "X-Auth-Token: $TOKEN" -H "X-User-Id: $UID" \
  -d '{"serverUrl": "https://your-app-url.example.com"}' \
  http://localhost:3000/api/v1/mcp-apps.connect
```

## MCP Tools Used

| Tool | Scope | Purpose |
|------|-------|---------|
| `privos.lists.getAll` | lists:read | Fetch room lists |
| `privos.lists.get` | lists:read | Fetch list + field definitions |
| `privos.lists.getItems` | lists:read | Fetch items for table |
| `privos.lists.createItem` | lists:write | Create record with custom fields |
| `privos.lists.updateItem` | lists:write | Inline edit record |
| `privos.lists.deleteItem` | lists:write | Delete record |
| `privos.lists.addField` | lists:write | Add field definition to list |

## Scopes Required

`lists:read`, `lists:write`

## Theme Support

Three modes via toggle in top-right corner:

| Mode | Behavior |
|------|----------|
| **Auto** | Follows Privos host theme in real-time via `HOST_CONTEXT_CHANGED` |
| **Light** | Forces light theme |
| **Dark** | Forces dark theme |

Mode persisted to `localStorage`. Toggle in `theme-provider.tsx`.

### How It Works

1. Privos pushes `{ method: 'HOST_CONTEXT_CHANGED', params: { theme: 'light' | 'dark' } }` to iframe
2. `usePrivosContext().theme` updates → `ThemeProvider` resolves mode → sets `data-theme` on `<html>`
3. CSS variables switch between light/dark palettes

### CSS Variables & Privos Token Mapping

All styles use CSS variables that inherit from Privos `--rcx-color-*` inside iframe, with fallbacks for standalone:

| Variable | Privos Token | Light | Dark |
|----------|-------------|-------|------|
| `--bg` | `surface-room` | #F7F8FA | #1F2329 |
| `--bg-card` | `surface-light` | #FFFFFF | #262931 |
| `--bg-hover` | `surface-hover` | #F2F3F5 | #2F343D |
| `--bg-input` | `surface-neutral` | #FFFFFF | #353B45 |
| `--text` | `font-titles-labels` | #1F2329 | #E4E7EA |
| `--text-muted` | `font-hint` | #6C737A | #9EA2A8 |
| `--border` | `stroke-light` | #E4E7EA | #353B45 |
| `--accent` | `button-background-primary-default` | #156FF5 | #095AD2 |
| `--danger` | `button-background-danger-default` | #EC0D2A | #BB0B21 |
