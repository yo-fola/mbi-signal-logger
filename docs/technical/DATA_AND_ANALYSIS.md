# 📊 Data and Analysis

## Runtime files

| File | Purpose |
|---|---|
| `server/config.json` | Active application configuration |
| `server/incidents.json` | Field incidents |
| `server/public_incidents.json` | Public incidents |
| `server/audit.json` | Administrative and API activity |
| `server/id_sequences.json` | Persistent `PUB` and `INC` counters |

These files are created or updated at runtime and are excluded from Git.

## Incident identity

New IDs use:

```text
PREFIX + REVERSED FULL DATE + HHMMSS + CONTINUOUS SEQUENCE
```

- `PUB` identifies a Public report.
- `INC` identifies a Field report.
- Each stream has an independent sequence.
- Submission keys reduce duplicates caused by retries.

## Observation scoring

| Category | Values |
|---|---|
| Quality | Excellent 5, Good 4, Fair 3, Poor 2, No Signal 0 |
| Stability | Stable 4, Fluctuating 3, Intermittent 2, Interference 2, Unstable 1 |
| Service | Normal 5, Distortion 3, Audio Dropout 2, Weak Reception 2, No Service 0 |

The system combines available scores into a Reception Experience Index. Historical values remain readable even when the current choices change.

## GPS and distance

Reports can include latitude, longitude and accuracy. When a configured station also has coordinates, the backend calculates the Haversine distance between the station and report location.

## RF reference

Station configuration can include:

- transmitter power and unit;
- antenna gain;
- tower height;
- broadcast frequency;
- receiver sensitivity;
- station coordinates.

The server can calculate nominal EIRP, reference field strength and an Ideal Car Reception Radius.

Current radius model:

```text
terrestrial-horizon-limited-v2
```

The radius uses the smaller of the free-space sensitivity ceiling and the standard `4/3`-Earth radio horizon.

## Limitations

The RF output is an analytical reference. It does not model terrain, buildings, vegetation, interference, diffraction, directional antenna patterns, feeder loss, fading or measured propagation.

## Upgrade rule

Never replace runtime files with example templates during an upgrade. Back them up before changing the application.

## Related guides

- [Admin Control Center](../applications/ADMIN_CONTROL_CENTER.md)
- [API](API.md)
- [Operations](../deployment/OPERATIONS.md)
