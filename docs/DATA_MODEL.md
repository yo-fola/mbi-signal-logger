# Data Model & Persistence

MBI Signal Logger currently uses server-side JSON persistence.

## Authoritative runtime files

### `server/incidents.json`
Field / Engineer incidents.

### `server/public_incidents.json`
Public / Volunteer incidents.

### `server/config.json`
Authoritative application configuration.

### `server/audit.json`
Administrative/API activity records.

### `server/id_sequences.json`
Persistent ID sequence state for the separate `INC` and `PUB` streams.

## Incident identity

New IDs:

```text
PREFIX + REVERSED FULL DATE + HHMMSS + CONTINUOUS SEQUENCE
```

Examples:

```text
INC010120261200001
PUB010120261200001
```

Field and Public counters are independent and continuous.

## Duplicate submission safety

Clients use a submission key. The server checks for an existing matching submission before creating a new incident, reducing duplicates caused by retries.

## Read-time derived data

Some dashboard values are recalculated from current station configuration instead of rewriting historical JSON. In V6.5.13, `idealCarReception` is refreshed this way so older incidents do not continue showing the obsolete unlimited free-space radius.

## Historical compatibility

Historical records may contain values from older choice sets or earlier model versions. The application should continue to read them rather than destructively normalizing stored history.

## Upgrade rule

Runtime JSON is data, not deployment content. Do not replace these files with package defaults during application upgrades.
