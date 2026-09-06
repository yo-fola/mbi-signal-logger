# 🛠️ Operations

## Backup

Back up these files before an upgrade:

```text
server/config.json
server/incidents.json
server/public_incidents.json
server/audit.json
server/id_sequences.json
web.config
```

Also back up any application file you are about to replace.

## Safe upgrade

1. Identify the files that changed.
2. Back up the current files and runtime data.
3. Deploy the smallest required change.
4. Deploy backend changes before frontend changes that depend on them.
5. Restart Node.js only if backend code changed.
6. Check `/api/health`.
7. Hard-refresh the affected page.
8. Submit test reports and confirm existing data remains available.

## Health check

Primary check:

```text
GET /api/health
```

The response should show that the API and required runtime stores are healthy.

## Common problems

| Problem | Check |
|---|---|
| Frontend loads but API fails | Node.js service, ARR proxy and rewrite rule |
| GPS does not work | HTTPS, browser permission and device location |
| Old interface remains visible | Hard refresh, site data and Field service worker |
| Reports do not save | JSON validity, filesystem permissions and storage |
| HTTPS warning appears | Certificate hostname, binding, chain and system time |
| Duplicate report appears | Submission key and retry behavior |

For cache problems, try `Ctrl + Shift + R` or `Ctrl + F5`. If the Field application remains stale, clear site data before unregistering the service worker.

## Recovery

1. Stop the affected service if data could continue changing.
2. Restore only the files changed by the failed release.
3. Restore runtime data only from a verified backup.
4. Restart Node.js if backend code was restored.
5. Check `/api/health`.
6. Submit Public and Field test reports.
7. Confirm historical reports, maps and exports still work.

## Related guides

- [Deployment](DEPLOYMENT.md)
- [Data and Analysis](../technical/DATA_AND_ANALYSIS.md)
- [Security Policy](../../SECURITY.md)
