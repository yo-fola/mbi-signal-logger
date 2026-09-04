# Operations, Backup & Troubleshooting

## Backup before deployment

Back up at minimum:

```text
server/server.js
server/config.json
server/incidents.json
server/public_incidents.json
server/audit.json
server/id_sequences.json
index.html
field/index.html
field/sw.js
admin/index.html
shared/
web.config
```

A proper IIS backup should use the actual deployed files. Do not invent or reconstruct `web.config`.

## Health check

Primary check:

```text
GET https://signal-logger.example.com/api/health
```

Verify the API is running and sequence state is healthy after backend changes.

## Browser cache

Firefox hard refresh:

```text
Ctrl + Shift + R
```

or:

```text
Ctrl + F5
```

If the Field UI remains stale:

1. clear site data,
2. reload,
3. only if needed, unregister the service worker.

## Safe upgrade principles

- Change the smallest possible scope.
- Preserve runtime JSON.
- Preserve IIS configuration.
- Deploy server first when the frontend depends on a server change.
- Do not restart unrelated services.
- Validate syntax before deployment.
- Confirm new incidents still persist.
- Confirm historical incidents remain readable.

## V6.5.13 radius migration behavior

Historical incidents are not rewritten. The backend refreshes the current `idealCarReception` dashboard view from station configuration so legacy records stop showing the obsolete enormous free-space radius.

## Recovery

If a release fails:

1. restore the changed code file(s),
2. restart Node only if `server.js` was restored,
3. verify `/api/health`,
4. confirm runtime JSON files were not changed,
5. hard-refresh affected clients.
