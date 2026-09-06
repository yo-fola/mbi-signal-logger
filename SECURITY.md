# 🔐 Security Policy

## Repository boundary

This repository demonstrates the project without exposing production information.

Do not commit:

- credentials, tokens, certificates or private keys;
- actual deployment hostnames, addresses or server configuration;
- real identities, email addresses or reporter information;
- live GPS coordinates, station parameters or incident exports;
- runtime configuration, incidents, audit logs or ID sequences.

The protected runtime files are excluded through `.gitignore`.

## Production requirements

Before production use:

1. Add server-side authentication and authorization.
2. Restrict Admin and write operations.
3. Review IIS and filesystem permissions.
4. Protect runtime files from direct web access.
5. Configure monitoring, backups and recovery tests.
6. Complete an independent security review.

## Reporting a vulnerability

Do not place sensitive details in a public issue. Use GitHub private vulnerability reporting when available, or contact the maintainer through the GitHub profile.

Include the affected component, reproduction steps, expected impact and a minimal proof of concept.
