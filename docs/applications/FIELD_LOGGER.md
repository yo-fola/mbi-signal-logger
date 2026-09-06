# 📡 Field Logger

## What it does

The Field Logger supports detailed signal observations by field personnel. It combines GPS, reception choices, optional measurements, history and mapping.

Route: `/field/`

## Main functions

| Function | Purpose |
|---|---|
| New Incident | Captures a Field report |
| GPS Capture | Records coordinates and location accuracy |
| RF Reference | Adds server-calculated distance and signal context |
| Recent History | Shows previous Field reports |
| Live Map | Displays mapped incidents and current location |
| Reports | Reviews or exports available Field information |
| Offline Queue | Holds submissions temporarily when connectivity is unavailable |

## How to submit a Field incident

1. Open **New Incident**.
2. Enter or confirm the engineer/operator name.
3. Capture the current GPS position and check its accuracy.
4. Select the station and channel.
5. Record signal quality, stability and service condition.
6. Add measured values or custom fields when available.
7. Add a useful observation.
8. Select priority and assignment when configured.
9. Review and submit the incident.

## What happens after submission

The server:

1. Validates the report.
2. Checks the submission key for duplicates.
3. Generates an `INC` incident ID.
4. Calculates available distance, scoring and RF references.
5. Preserves separately supplied measured values.
6. Stores the report in `incidents.json`.

## Offline behavior

The Field application includes a service worker and submission queue. When using offline functions:

1. Confirm the report is shown as queued.
2. Restore connectivity.
3. Allow synchronization to complete.
4. Verify the incident appears in recent history or Admin.

Duplicate protection reduces repeated incidents if a request is retried.

## Important notes

- Confirm GPS accuracy before submitting.
- Separate measured readings from server-estimated values.
- Do not treat the RF estimate as a terrain-aware coverage result.

## Related guides

- [Public Logger](PUBLIC_LOGGER.md)
- [Admin Control Center](ADMIN_CONTROL_CENTER.md)
- [Data and Analysis](../technical/DATA_AND_ANALYSIS.md)
