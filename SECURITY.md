# Security Policy

## Public portfolio edition

This repository contains a sanitized demonstration of MBI Signal Logger. It must not be treated as a ready-to-deploy production system without an independent security review.

Do not commit:

- credentials, tokens, certificates or private keys;
- production hostnames, addresses or server configuration;
- real identities, email addresses or reporter information;
- live GPS coordinates, station parameters or incident exports;
- runtime configuration, incidents, audit logs or ID sequences.

The protected runtime files are already excluded through `.gitignore`.

## Reporting a vulnerability

Avoid placing sensitive details in a public issue. Use GitHub's private vulnerability-reporting feature when available, or contact the maintainer through the GitHub profile.

Include the affected component, reproduction steps, expected impact and a minimal proof of concept.
