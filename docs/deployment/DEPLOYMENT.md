# 🚀 Deployment

## What this guide covers

This guide explains local setup and a generic IIS deployment using HTTPS on port 443. The hostname `signal-logger.example.com` is an example only.

## Requirements

- Node.js 18 or newer
- npm
- Windows Server with IIS
- IIS URL Rewrite
- IIS Application Request Routing (ARR)
- an HTTPS certificate for your hostname
- DNS pointing the hostname to the server

## Local setup

1. Copy the example configuration:

```powershell
Copy-Item server/config.example.json server/config.json
```

2. Install dependencies and start the server:

```powershell
Set-Location server
npm ci
npm start
```

3. Test:

```text
http://localhost:3000/
http://localhost:3000/field/
http://localhost:3000/admin/
http://localhost:3000/api/health
```

## IIS deployment

### 1. Prepare the application

1. Copy the application to its server directory.
2. Create `server/config.json` from the example.
3. Replace only the example values required for your environment.
4. Run `npm ci --omit=dev` inside `server/`.
5. Run `server.js` as a persistent Windows service.
6. Verify `http://127.0.0.1:3000/api/health`.

### 2. Configure IIS

1. Create an IIS site for the frontend files.
2. Set `index.html` as the default document.
3. Install URL Rewrite and ARR.
4. Enable ARR proxy support.
5. Adapt `deployment/web.config.example` for the site.
6. Proxy `/api/*` to `http://127.0.0.1:3000/api/*`.
7. Block direct web access to the `server` directory and runtime JSON.

### 3. Configure HTTPS

1. Add the HTTPS binding on port `443`.
2. Select the correct certificate and hostname.
3. Redirect HTTP to HTTPS.
4. Add HSTS only after HTTPS works correctly.
5. Keep Node.js port `3000` closed to public traffic.

## Verification

- Public, Field and Admin routes load through HTTPS.
- `/api/health` succeeds through IIS.
- A Public report receives a `PUB` ID.
- A Field report receives an `INC` ID.
- Both reports appear in Admin.
- GPS works from the secure origin.
- Maps and exports work.

## Important rule

Back up runtime data and the active `web.config` before deployment. Do not replace them with repository examples.

## Related guides

- [Architecture](../technical/ARCHITECTURE.md)
- [Operations](OPERATIONS.md)
- [Security Policy](../../SECURITY.md)
