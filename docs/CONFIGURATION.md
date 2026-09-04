# Configuration

Runtime configuration: `server/config.json` (excluded from Git)

## Shared authorities

- Stations
- Channels
- GPS technical policy
- Application settings
- Field/Public choice definitions
- Admin-controlled UI definitions

## Choice-set ownership

```text
choiceSets.public
choiceSets.field
```

Field and Public can be configured independently.

## Current scoring authorities

### Quality
- Excellent — 5
- Good — 4
- Fair — 3
- Poor — 2
- No Signal — 0

### Stability
- Stable — 4
- Fluctuating — 3
- Intermittent — 2
- Interference — 2
- Unstable — 1

### Service
- Normal — 5
- Distortion — 3
- Audio Dropout — 2
- Weak Reception — 2
- No Service / No Signal — 0

## Admin ownership boundaries

- **Design:** appearance only.
- **Menu Management:** navigation only.
- **Component Management:** sections/options/choice definitions.
- **Form Builder:** visibility, required state, order, labels, help, defaults and custom fields.
- **Dashboard Layout:** widgets.
- **Public Welcome & Content:** public copy/workflow.
- **Stations / Channels:** shared reference authorities.
- **GPS Configuration:** technical GPS policy.

## Station RF inputs

Station configuration may include:

- station ID/name,
- latitude/longitude,
- RF transmitter power,
- power unit,
- tower height,
- antenna gain,
- broadcast frequency,
- ideal car receiver sensitivity.

These feed RF reference and terrestrial reception-radius calculations.

## Deployment rule

Do not overwrite an active `config.json` with the example configuration during deployment.
