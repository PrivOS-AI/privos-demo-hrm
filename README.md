# Demo HR Management

Demo Privos MCP app that manages employee records with dynamic fields.

**Author:** T.D (t.d@privos.ai)
**URL:** https://thanh-10002.roxane.one (port 10002)

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
PUBLIC_URL=https://thanh-10002.roxane.one
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
3. Enter server URL: `https://thanh-10002.roxane.one`

### Via API
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "X-Auth-Token: $TOKEN" -H "X-User-Id: $UID" \
  -d '{"serverUrl": "https://thanh-10002.roxane.one"}' \
  http://localhost:3000/api/v1/mini-apps.connect
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

- **Auto** — follows Privos host theme in real-time via `HOST_CONTEXT_CHANGED`
- **Light/Dark** — manual override, persisted to localStorage
- CSS variables map to Privos `--rcx-color-*` tokens with hardcoded fallbacks
