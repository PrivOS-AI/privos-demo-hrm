# Contact Collector Mini App

Demo Privos MCP mini app that collects contact information and adds it to Privos lists.

**Author:** T.D (t.d@privos.ai)
**URL:** https://thanh-10002.roxane.one (port 10002)

## What It Is

A simple contact form mini app that:
- Lets users select a Privos list from the current room
- Displays a dynamic form based on the list's custom field definitions
- Allows users to fill in contact information and submit it as a list item
- Supports adding new fields to the list on the fly via "+ Add Field" button

Renders as an interactive tab in any Privos room after installation.

## Architecture

```
src/
├── server.ts                      # Express MCP server
│   ├── MCP manifest endpoint
│   ├── MCP JSON-RPC handler (/mcp)
│   └── Vite dev middleware
│
└── ui/
    ├── index.html                 # Vite entry HTML
    ├── main.tsx                   # React entry point
    ├── App.tsx                    # PrivosAppProvider wrapper
    ├── contact-collector-form.tsx # Form logic + dynamic fields
    └── contact-form-styles.css    # Minimal styling
```

### Server (Node.js)

Runs on port 10002. Provides:

1. **MCP Manifest** — `GET /.well-known/mcp/manifest.json`
   - App metadata: name, version, title, description, icon, author

2. **MCP JSON-RPC Endpoint** — `POST /mcp`
   - `initialize` — server capabilities (UI extension support)
   - `tools/list` — exposes `contact_collector_form` tool with UI resource
   - `resources/read` — serves HTML for UI resource `ui://contact-collector/form.html`

3. **Vite Dev Middleware** — `/ui/*`
   - Serves React components with HMR (dev mode)
   - Serves built assets (production mode)

### UI (React)

- **PrivosAppProvider**: Initializes context (userId, roomId, theme, roles)
- **contactCollectorForm**: Renders list selector + dynamic form based on `fieldDefinitions`
  - Fetches available lists via `useLists(roomId)`
  - Fetches list details via `app.callServerTool('privos.lists.get', { listId })`
  - Dynamically renders inputs: TEXT, TEXTAREA, NUMBER, DATE, CHECKBOX, URL, SELECT fields
  - Submits items via `app.callServerTool('privos.lists.createItem', { listId, title, customFields })`
  - Adds new fields via `app.callServerTool('privos.lists.addField', { listId, name, type, options })`

## How It Works

1. **Registration** (admin)
   - Admin navigates to Admin → Mini Apps → Connect
   - Enters server URL: `https://thanh-10002.roxane.one`
   - Privos fetches manifest and discovers the app

2. **Installation** (user/owner)
   - In a room, click the "+" (layers icon) in the tab bar
   - Select "Install an App" and find Contact Collector
   - Click Install — app is now available in the room

3. **Usage**
   - Click the Contact Collector tab in the room
   - Select a list from the dropdown
   - Form dynamically renders fields from the list's `fieldDefinitions`
   - Fill in contact info and click Submit
   - Item is created in the list with custom field values
   - (Optional) Add new fields to the list via "+ Add Field"

## Configuration

Create `.env` file in project root:

```env
PORT=10002
PUBLIC_URL=https://thanh-10002.roxane.one
NODE_ENV=development
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 10002 | Server port |
| `PUBLIC_URL` | http://localhost:10002 | Public URL of the app (used in manifest) |
| `NODE_ENV` | development | dev = Vite middleware, production = static assets |

## Installation & Running

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

- MCP server: `http://localhost:10002`
- Manifest: `http://localhost:10002/.well-known/mcp/manifest.json`
- Vite UI dev: `http://localhost:10002/ui` (with HMR)

### Production

```bash
npm run build
npm start
```

- Serves built assets from `dist/ui`
- MCP server same as dev

## Registering in Privos

### Via Admin Portal

1. Log in as a system admin
2. Navigate to **Admin → Mini Apps**
3. Click **Connect App**
4. Enter server URL: `https://thanh-10002.roxane.one`
5. Save client credentials (shown once)

### Via API

```bash
curl -X POST -H "Content-Type: application/json" \
  -H "X-Auth-Token: $TOKEN" -H "X-User-Id: $UID" \
  -d '{"serverUrl": "https://thanh-10002.roxane.one"}' \
  http://localhost:3000/api/v1/mini-apps.connect
```

## Scopes Required

The app requires the following OAuth scopes:

| Scope | Used For |
|-------|----------|
| `lists:read` | Fetch room lists and field definitions |
| `lists:write` | Create items and add custom fields |

Both are automatically requested during app registration.

## MCP Tools Used

The app calls the following Privos MCP tools:

| Tool | Scope | Purpose |
|------|-------|---------|
| `privos.lists.getAll` | lists:read | Fetch all lists in the room |
| `privos.lists.get` | lists:read | Fetch list details + field definitions |
| `privos.lists.createItem` | lists:write | Create item with custom field values |
| `privos.lists.addField` | lists:write | Add new field definition to list |

## Field Types Supported

The app supports these custom field types:

- `TEXT` — Single-line text
- `TEXTAREA` — Multi-line text
- `NUMBER` — Numeric value
- `DATE` — Date picker
- `CHECKBOX` — Boolean toggle
- `URL` — URL input with validation
- `SELECT` — Dropdown (single selection)

Note: `DATE_TIME`, `MULTI_SELECT` are supported by Privos but not yet rendered in the form UI.

## File Structure Details

### server.ts

- Initializes Express app
- Registers MCP endpoints (manifest, JSON-RPC)
- Integrates Vite dev server (dev mode) or serves static assets (production)
- Listens on `PORT`

### contact-collector-form.tsx

Core component logic:

1. **List Selection**: `useLists(roomId)` fetches available lists
2. **List Details**: On selection, `privos.lists.get` fetches field definitions
3. **Form Rendering**: Dynamically renders inputs based on `fieldDefinitions`
4. **Submission**: `privos.lists.createItem` with custom field values
5. **Add Field**: `privos.lists.addField` modal to add new fields on the fly

State management:
- `selectedListId` — selected list
- `selectedList` — full list data (with field definitions)
- `fieldValues` — form field values (key = fieldId, value = user input)
- `showAddField` — toggle "+ Add Field" form
- `submitting`, `success`, `error` — UI feedback

## Development Notes

- **HMR**: Changes to React files hot-reload in dev mode
- **Type Safety**: Full TypeScript support for MCP tool arguments/responses
- **Error Handling**: Form validates required fields before submission
- **Styling**: Minimal CSS — relies on Privos design system (inherited via iframe)

## Testing in Privos

1. Start server: `npm run dev`
2. Register app in Admin panel with `http://localhost:10002` (or use ngrok for https)
3. Install in a test room
4. Click Contact Collector tab
5. Select a list and submit a contact
6. Verify item appears in the list with custom field values

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank iframe | Check server is running, URL is correct, CORS allows framing |
| Form won't load | Check browser console for errors, verify `privos.lists.getAll` succeeds |
| Submit fails | Check user has `lists:write` scope, list has at least one stage |
| Field not added | Verify `type` is valid enum, list exists, user has `lists:write` |

## References

- [Privos MCP Mini App Platform Docs](../../docs/MCP_MINI_APP_PLATFORM.md)
- [@privos/mini-app-react](../mini-app-react/)
- [create-privos-mcp-app](../create-privos-mcp-app/)
