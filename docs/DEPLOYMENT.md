# Deployment

## Example deployment topology

```text
https://signal-logger.example.com/          → Public
https://signal-logger.example.com/field/    → Field
https://signal-logger.example.com/admin/    → Admin
https://signal-logger.example.com/api/*     → IIS ARR → localhost:3000
```

Node should remain bound to localhost.

## IIS responsibilities

- HTTPS/TLS termination
- static frontend delivery
- ARR reverse proxy for `/api/*`
- URL Rewrite
- HTTP → HTTPS redirect
- HSTS once HTTPS is verified

The deployed `web.config` is authoritative and must not be replaced blindly.

## Recommended deployment order

When a client release depends on a new server capability:

1. Back up the active deployment.
2. Replace `server/server.js`.
3. Restart the Node process.
4. Confirm `/api/health`.
5. Deploy affected frontend file(s).
6. Hard-refresh the browser.
7. Verify reports, maps and data persistence.

If only a frontend file changed, do not restart Node unnecessarily.

## Runtime data preservation

Never blindly replace or delete:

```text
server/config.json
server/incidents.json
server/public_incidents.json
server/audit.json
server/id_sequences.json
web.config
```

## Shared assets

The shared asset directory is:

```text
shared/
├── v65.css
├── v65.js
└── fonts/Inter-Variable.woff2
```

Do not modify shared assets as part of an unrelated release.
