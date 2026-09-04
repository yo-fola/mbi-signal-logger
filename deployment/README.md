# Deployment Example

This directory contains a generic IIS reverse-proxy example for local study and portfolio review.

The example:

- serves the static Public, Field, Admin and shared assets;
- proxies `/api/*` to the Node.js service on `localhost:3000`;
- redirects HTTP requests to HTTPS.

Before using it, replace the example hostname and review the paths, bindings, certificates and rewrite rules for the target environment. Never copy it over an active server configuration without a backup.
