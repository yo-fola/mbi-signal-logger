# 👥 Public Logger

## What it does

The Public Logger allows radio listeners and fans to submit a simple reception report from a phone or computer. It is designed for quick, one-handed use.

Route: `/`

## Main fields

| Field | Purpose |
|---|---|
| Name | Optional reporter name when enabled |
| Station | Broadcast station being reported |
| Channel / Frequency | Optional channel information |
| Signal Quality | Excellent, Good, Fair, Poor or No Signal |
| Signal Stability | Stable, Fluctuating, Intermittent, Interference or Unstable |
| Service Condition | Normal, Distortion, Audio Dropout, Weak Reception or No Service |
| Comments | Optional description of the issue |
| GPS | Current coordinates and accuracy |

The Admin interface can change which optional fields are visible or required.

## How to submit a report

1. Open the Public Logger.
2. Read and close the welcome message.
3. Allow location access.
4. Select the station and optional channel.
5. Choose the quality, stability and service condition.
6. Add a comment if it helps explain the issue.
7. Review the summary and submit.

## What happens after submission

The server:

1. Validates the required fields.
2. Checks for a duplicate submission.
3. Generates a `PUB` incident ID.
4. Adds available GPS, distance, scoring and RF information.
5. Stores the report in `public_incidents.json`.

Administrators can review Public reports together with Field reports through the combined analysis view.

## Important notes

- Location access works best over HTTPS.
- RF values are reference calculations, not guaranteed coverage predictions.
- Do not enter private information in the comments field.

## Related guides

- [Admin Control Center](ADMIN_CONTROL_CENTER.md)
- [Data and Analysis](../technical/DATA_AND_ANALYSIS.md)
- [API](../technical/API.md)
