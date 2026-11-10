# Project publishing

Admins control whether a project is visible in the customer portal. The API
stores two independent flags:

- `is_published` — whether the project is exposed in the public portal.
- `is_active` — whether the project is operationally active.

The public portal requires both to be `true`.

## Admin UI

Project cards in `/projects` show a **Publicado / No publicado** badge. Admin
cards include a visibility button that calls:

- `POST /api/v1/projects/:id/publish`
- `POST /api/v1/projects/:id/unpublish`

The same toggle is available on the project edit page. Publishing changes only
`is_published`; `is_active` is left untouched.

## Public portal link

`config.js` exposes `PUBLIC_PORTAL_URL` from `VITE_PUBLIC_PORTAL_URL`. When it is
configured, published cards link to:

```
${VITE_PUBLIC_PORTAL_URL}/projects/{guid}
```

If the variable is empty, the card keeps the existing GUID copy action and does
not render a broken link.

## Gallery preview

Project responses include `photos`, an ordered preview of up to ten gallery
photos, plus `cover_photo_url` matching the first preview photo. The project card
uses `photos` for its carousel, falls back to `cover_photo_url`, and finally to
the gradient placeholder. See [Project cards](project-cards.md) for the card
layout.
