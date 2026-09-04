# Project Case Study

## Overview

MBI Signal Logger is a multi-interface incident-reporting platform for broadcast signal operations. The portfolio edition demonstrates how public contributors, field engineers and administrators can share one API while retaining workflows suited to each role.

All organization-specific and production data has been replaced with synthetic examples.

## Problem

Signal complaints and field observations can arrive through different channels, with inconsistent context and no shared incident identity. Operations teams need a way to:

- capture reports with time and GPS context;
- distinguish public observations from engineer measurements;
- compare reports with station reference data;
- maintain incident status and history;
- export data for analysis and mapping;
- preserve configuration and records during upgrades.

## Solution

The project uses three responsive browser interfaces backed by a Node.js and Express API:

1. The Public Logger reduces reporting to a guided workflow.
2. The Field Logger adds technical observations, GPS tools, history and offline support.
3. The Admin Center manages configuration, incidents, maps, scoring and exports.
4. The server validates requests, generates IDs, calculates reference values and persists JSON data.

## Important engineering decisions

### Server-authoritative enrichment

RF reference values, incident identities and derived scoring are produced by the server. This reduces disagreement between browser clients and centralizes validation.

### Separate storage streams

Public and Field incidents are stored separately while combined analytical endpoints expose a unified operational view.

### Retry protection

Clients provide a submission key. The API checks that key before creating a new record, reducing duplicate incidents caused by retries.

### Configuration ownership

Stations, channels, GPS policy, choice sets, UI behavior and permissions are managed through explicit configuration boundaries.

### Upgrade safety

Mutable runtime JSON is excluded from source control. Deployment guidance separates code replacement from data preservation and recommends the smallest possible change scope.

## RF and location processing

The backend supports:

- Haversine distance between a report and configured station;
- normalized RF transmitter power;
- nominal EIRP;
- reference field-strength estimation;
- observation scoring;
- a terrestrial horizon-limited reception-radius reference.

These outputs support operational comparison but do not replace terrain-aware propagation studies.

## Reporting

Administrators can review combined incidents, filter operational data, export CSV reports and generate KML suitable for Google Earth visualization.

## Security and privacy approach

The public edition excludes private manuals, live routing, real people, production coordinates, operational data and secrets. The example configuration uses reserved domains and synthetic identities.

## Skills demonstrated

- HTML5, CSS3 and responsive JavaScript interfaces
- Node.js and Express API development
- API validation and file-backed persistence
- geolocation and mapping integration
- RF calculation implementation
- IIS/ARR reverse-proxy design
- operational documentation and release hygiene
- privacy-aware public portfolio publishing

## Future improvements

- authenticated sessions and stronger authorization enforcement;
- database-backed persistence and concurrency controls;
- automated API and browser tests;
- terrain-aware RF propagation inputs;
- containerized local development;
- continuous integration for syntax, security and regression checks.
