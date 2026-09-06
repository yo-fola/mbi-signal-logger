# 🎛️ Admin Control Center

## What it does

The Admin Control Center provides the central operational view for reports, configuration, maps, exports and system activity.

Route: `/admin/`

## Main areas

### Dashboard

- displays totals, trends and recent incidents;
- combines operational information into one overview;
- provides shortcuts to common tasks.

### Applications

- **Field App:** manages Field design, navigation, components, form fields and dashboard options;
- **Public App:** manages Public fields, choices, welcome content and interface presentation.

### Management

- **Stations:** manages station identity, coordinates and RF reference inputs;
- **Channels:** manages the channel/frequency choices shown in reporting forms.

### Operations

- **Incidents:** searches, filters and reviews Public and Field reports;
- **Incident History:** provides a historical record view;
- **Live Map:** maps combined Public and Field incidents;
- **Export Reports:** creates CSV, printable and Google Earth KML output.

### Administration

- **Users and Roles:** manages the administrative directory and role assignments;
- **Permissions:** controls the available actions for each configured role;
- **System Settings:** manages shared branding and application settings;
- **GPS Configuration:** controls GPS timeout, cache age and fallback behavior;
- **Audit Logs:** shows recorded administrative and API activity.

## Review and update an incident

1. Open **Incidents**.
2. Filter by source, status, priority, station or date.
3. Open the required incident.
4. Review GPS, observation, scoring and RF information.
5. Update its status or assignment when necessary.
6. Confirm the change appears in history and audit activity.

## Configure an application

1. Open **Field App** or **Public App**.
2. Choose the correct workspace: Design, Menu, Components, Form, Dashboard or Content.
3. Change only the settings owned by that workspace.
4. Save and publish.
5. Open the affected application and verify the change.

## Export reports

1. Open **Export Reports**.
2. Apply the required filters.
3. Confirm the matching record count.
4. Choose CSV, Print or KML.
5. Check that the output matches the filtered Admin view.

## Security note

The role and permission features demonstrate the application framework. A production deployment still requires server-side authentication, authorization and access-control review.

## Related guides

- [Configuration and Data](../technical/DATA_AND_ANALYSIS.md)
- [API](../technical/API.md)
- [Operations](../deployment/OPERATIONS.md)
