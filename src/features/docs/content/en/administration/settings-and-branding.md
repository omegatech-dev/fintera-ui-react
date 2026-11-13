# General settings and branding

> **Admin only.** Sellers cannot open the Settings area.

The Settings area has two organization sections, **General** and **Brand identity**, plus the account sections **Profile**, **Security**, and **Terms and conditions**. Each section saves independently with its own save bar. There is no completion percentage; the page reflects the current values.

## General

### App name

The application name appears in the sidebar, the browser tab, and the sign-in screens. It is limited to 60 characters and shows a live preview while you edit.

### Support and reservations

- **Support WhatsApp** — the number customers see for help.
- **Support email** — the address customers see for help.
- **Minimum reservation amount** — the smallest reservation accepted by the reservation wizard.
- **Reservation hold hours** — how long a reservation holds a lot before it is released. Default `48`, valid range `1` to `720`.
- **Reservation due days** — when the reservation payment is due after approval. Default `7`, range `1` to `365`.
- **Down-payment due days** — when the down payment is due after approval. Default `14`.
- **Down-payment due days with reservation** — the down-payment date when a reservation also exists. Default `21`, and it cannot be earlier than the plain down-payment date.

Changing the hold affects new holds; it does not change the time already elapsed on existing reservations.

### Legal

- **Legal name**, **tax ID**, **legal address**, **website**, and **terms effective date**.
- **Terms and conditions (Spanish)** and **Terms and conditions (English)** — custom terms text, up to 20,000 characters per language. Leave a language empty to use the standard content for that language.

The legal fields, effective date, and custom terms feed the Terms and conditions page and the sign-in legal modal. See [Terms and conditions](/docs/terms-and-conditions).

### Notifications

- **Email notifications** toggle.
- **Overdue reminders** toggle.
- **Upcoming reminder days** — how many days before a due date the reminder is sent. Range `0` to `30`.

### Regional

- **Default currency** — `HNL`, `USD`, or `EUR`; a custom three-letter code can also be kept.
- **Default locale** — Spanish or English.
- **Timezone** — one of the supported time zones or a valid IANA time zone.

## Brand identity

The **Brand identity** section controls the logos:

- **Light logo** — used on light surfaces.
- **Dark logo** — optional; used on dark surfaces.

Recommended logo size is `640 × 160` (4:1), minimum `320 × 80`, maximum file size `2 MB`, in PNG, JPEG, or WebP. A transparent, horizontal wordmark works best. Without a custom logo, the app uses its bundled logo.

## Related

- [Profile and security](/docs/profile-and-security)
- [Terms and conditions](/docs/terms-and-conditions)
- [Reservations, down payments, and holds](/docs/reservations-and-holds)
