import 'dotenv/config';
import express from 'express';
import path from 'path';
import _pkg from '../package.json';
const pkg = _pkg as Record<string, any>;

const app = express();
app.use(express.json());

// Allow cross-origin requests (app UI loads in Privos iframe)
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static files (icon, etc.)
app.use('/public', express.static(path.join(__dirname, '../public')));

// MCP manifest
app.get('/.well-known/mcp/manifest.json', (_req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    icon: pkg.icon,
    author: {
      name: pkg.author?.name,
      email: pkg.author?.email,
      website: pkg.author?.url,
    },
    homepage: pkg.homepage || PUBLIC_URL,
    // Requested scopes — PrivOS records these and an admin grants the subset that
    // gates the app's REST calls (app.rest()). See package.json `scopes`.
    scopes: Array.isArray(pkg.scopes) ? pkg.scopes : undefined,
  });
});

// MCP JSON-RPC endpoint
app.post('/mcp', (req, res) => {
  const { method, id, params } = req.body;

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-03-26',
        capabilities: {
          tools: {},
          extensions: {
            'io.modelcontextprotocol/ui': {
              mimeTypes: ['text/html;profile=mcp-app'],
            },
          },
        },
        serverInfo: { name: 'Demo HR Management', version: '1.0.0' },
      },
    });
  }

  if (method === 'notifications/initialized') {
    return res.status(202).end();
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'hr_management_dashboard',
            title: 'Demo HR Management',
            description: 'HR management dashboard with employee records',
            inputSchema: {
              type: 'object',
              properties: { roomId: { type: 'string' } },
            },
            _meta: {
              ui: { resourceUri: 'ui://demo-hr-management/form.html' },
            },
          },
        ],
      },
    });
  }

  if (method === 'resources/read') {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Demo HR Management</title>
  <style>html,body{margin:0}</style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${PUBLIC_URL}/ui/main.tsx"></script>
</body>
</html>`;

    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        contents: [
          {
            uri: params?.uri,
            mimeType: 'text/html;profile=mcp-app',
            text: html,
          },
        ],
      },
    });
  }

  res.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found' },
  });
});

const PORT = process.env.PORT || 10002;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Use Vite dev server as middleware — serves UI on /ui/* with HMR
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: path.join(__dirname, 'ui'),
      base: '/ui/',
      server: { middlewareMode: true, allowedHosts: [new URL(PUBLIC_URL).hostname] },
      appType: 'spa',
    });
    app.use('/ui', vite.middlewares);
  } else {
    // Serve built UI assets in production
    app.use('/ui', express.static(path.join(__dirname, '../dist/ui')));
  }

  app.listen(PORT, () =>
    console.log(`Demo HR Management MCP server running on ${PUBLIC_URL}`),
  );
}

startServer();
