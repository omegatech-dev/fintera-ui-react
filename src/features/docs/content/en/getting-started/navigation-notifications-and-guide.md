# Navigation, notifications, and the guide

## Header

The header is shared by every back-office page:

- **Search** looks up entries in your own menu and jumps to them.
- **Theme toggle** switches between light and dark mode.
- **Notifications bell** shows the latest notifications.
- **Profile menu** opens your profile, account settings, restarts the onboarding tour, and signs you out.

On narrow screens the sidebar becomes a drawer; use the menu button in the header to open it.

## Notifications

Open the bell to see notifications. The panel has two tabs:

- **All** — every notification.
- **Unread** — only notifications you have not read.

Each item shows a title, a short message and a relative time. Use **Read** on an item or **Mark all as read** to clear the unread badge. The bell loads the latest notifications; if the list cannot load, retry from the panel.

## The guide

The guide lives at `/docs`. Admins and sellers reach it from the **Guide** entry in the sidebar. It has:

- a **search box** that filters articles by title and body,
- **sections** grouped by theme,
- an **article count** for the current filter,
- a **table of contents** built from the article's second- and third-level headings.

The article list is filtered by role. If a seller opens an admin-only article URL, it is not shown in the guide navigation and the guide falls back to the first available article.

## Empty, loading and error states

Lists use skeletons while loading and keep a **Retry** action when a request fails. Empty results explain whether there is no data yet or the current filters are too narrow.

## Related

- [System overview and roles](/docs/overview-and-roles)
- [Keyboard shortcuts](/docs/keyboard-shortcuts)
- [Profile and security](/docs/profile-and-security)
