# Release History

This file captures the major project milestones represented by this sanitized portfolio edition.

## V6.5.2 — Field real-time RF / selection restore
- Restored server-authoritative estimated Field signal strength.
- Preserved measured engineer readings separately.
- Restored neutral-until-selected choice behavior.

## V6.5.4 — Public + Admin control center
- Public logger aligned with Field-family design.
- Immediate GPS request before welcome.
- Public persistence/reset behavior.
- Expanded Admin control-center navigation and app workspaces.

## V6.5.5 — Live Map
- Added Field Live Map.
- Added Admin combined Field/Public Live Map.
- Preserved incident focus and GPS/map interactions.

## V6.5.6 — Scores, KML, server IDs
- Field configurable scoring.
- Admin KML export from filtered reports.
- Server-generated `INC` / `PUB` IDs.
- Persistent sequence state and retry protection.

## V6.5.7 — KML compatibility
- Removed unsupported `TimeStamp` / `when` output.

## V6.5.8 — Admin Live Map navigation
- Exposed Live Map in Operations navigation.

## V6.5.9 — Enhanced KML
- Dynamic station folders.
- Station + incident placemarks.
- Expanded metadata.

## V6.5.10 — KML refinement
- Simplified metadata.
- Distances include units.
- RF power normalized to watts.

## V6.5.11 — Public name input fix
- Corrected left padding so text no longer starts beneath the icon.

## V6.5.12 — Field default view
- New Incident became the default opening view.

## V6.5.13 — Terrestrial car-radius correction
- Replaced unlimited free-space reception-radius display with a horizon-limited terrestrial reference.
- Model: `terrestrial-horizon-limited-v2`.
- Historical dashboard views refresh the radius at read time without rewriting production incidents.
- KML uses the corrected radius model.

## Current component baseline

| Component | Version |
|---|---:|
| Public Logger | V6.5.11 |
| Field Logger | V6.5.12 |
| Admin | V6.5.13 |
| Server | V6.5.13 |
