# Audit log

> **Admin only.** The **Audits** entry is not part of the seller workspace.

The audit log records changes made across the system. Open **Audits** from the admin menu.

## Filters

- **Model** — all models or one of: contract, lot, user, project, payment, project photo, lot photo, project drawing, payment instruction, general settings, branding, or notification.
- **Action** — all actions or one of the actions present in the current page: create, update, delete, approve, reject, cancel, close, login, capital repayment, force password change, update picture, or toggle status.
- **Search** by user or record.
- **Refresh** reloads the current page.

## Timeline

Events are grouped by day with a date heading. Each event shows:

- The actor and the action in the past tense (for example, "approved the contract").
- The affected record and model.
- The date and time.
- **Show details** for the changed values, including the previous and new values, or the IP address and user agent when available.

The list is paginated in pages of 20 events. If filtering leaves no results, the page says whether the log is empty or the filters are too narrow.

## Why it matters

Use the log to answer who approved a payment, changed a commission, edited a project, or deactivated a user. System-generated events show **System** instead of a person.

## Related

- [Users and roles](/docs/users-management)
- [Contract list, detail, and actions](/docs/contract-detail-and-actions)
- [Commissions and payouts](/docs/commissions-and-payouts)
