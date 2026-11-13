# Users and roles

> **Admin only.** The **Users** entry is not part of the seller workspace.

## User list

The Users page lists the people who can sign in. It shows:

- A summary line with total users, admins, sellers, and clients.
- **Search** by name, email, or identity.
- Role chips with counts for **All**, **Admins**, **Sellers**, and **Clients**.
- A **Show all / Show active only** toggle.
- A table with user, role, client count, status, and actions.
- Pagination.

Selecting a row opens the user drawer with contact data, role, status, client count, balance and statement link for customers, credit score (admin viewing a customer), activity dates, and notes. The drawer also offers **Edit**, **Deactivate/Activate**, **Invite** (resend confirmation), and **Delete**.

## Create a user

Open **Users** and select **Add user**. The form has:

- **Personal information** — full name, identity, email, phone, RTN, address, and optional photo.
- **Account settings** — role (**User**, **Seller**, or **Admin**) and the creator.
- **Security** — optional password and confirmation.

If the password is left empty, the backend generates a temporary password and emails it to the user. When a password is entered, it must have at least **8 characters** and meet the strength checklist (uppercase, lowercase, number, special character). Identity must be 13 digits and RTN 14 digits.

## Edit a user

The edit form reuses the same sections. Leaving the password fields empty keeps the current password; entering a new password resets it. Admins can change the role; sellers can only edit their own profile and cannot change roles.

The **View profile** action opens the same user drawer in read-only mode.

## Roles

- **Admin** — full access, including approvals, project management, settings, and user administration.
- **Seller** — sales workspace: My day, My clients, Collections, Commissions, Documents. Cannot approve money movements or change settings.
- **User (client)** — customer account; uses the customer portal.

## Status

| Status | Meaning |
| --- | --- |
| Active | Can sign in. |
| Inactive | Cannot sign in. |

Use **Deactivate** instead of deleting when you may need the history later. Deleting a user with active contracts is blocked; the page explains the reason.

## Related

- [System overview and roles](/docs/overview-and-roles)
- [Profile and security](/docs/profile-and-security)
- [Customers and credit score](/docs/customers-and-credit-score)
