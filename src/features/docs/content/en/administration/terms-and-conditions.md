# Terms and conditions

The **Terms and conditions** page is available from **Settings → Terms and conditions** and from the legal links in the sign-in flow.

## What the page shows

- A **Last updated** badge. It uses the configured **terms effective date** when set; otherwise it shows today's date.
- If the admin has written terms for the active language, the page renders that custom text instead of the standard sections. Blank lines separate paragraphs and line breaks inside a paragraph are preserved.
- If the custom text for the active language is empty, the page falls back to the standard localized terms: acceptance, description of services, account registration, use of the platform, fees and payments, notifications, privacy, limitation of liability, account suspension, amendments, and contact information.
- In both cases the page appends a contact information section from the organization settings: legal name, support email, support WhatsApp or phone, legal address, and website. Empty optional values are omitted instead of showing a broken value.

The sign-in legal modal follows the same rule: custom terms for the active language when present, otherwise the standard localized text.

## What admins configure

Admins edit the legal data in **Settings → General → Legal**:

- **Legal name** and **tax ID**.
- **Legal address**.
- **Website**.
- **Terms effective date**.
- **Terms and conditions (Spanish)** and **Terms and conditions (English)** — two text areas, up to 20,000 characters each. Leave a language empty to use the standard content for that language.
- **Support email** and **support WhatsApp** in **Support and reservations** feed the fallback contact block.

The terms are saved with the **Legal** section save bar and persisted through the settings API. They apply to the whole deployment.

## Related

- [General settings and branding](/docs/settings-and-branding)
- [Profile and security](/docs/profile-and-security)
- [System overview and roles](/docs/overview-and-roles)
