## Context

See `proposal.md` — Why. `src/features/projects/components/index.jsx` owns the
card. The API will return up to ten ordered `photos` entries with `url` and
optional `thumb_url`. The card already receives `user`, `onDeleted`, and
`onVisibilityChanged`, and uses `mediaUrl` for uploads.

## Goals / Non-Goals

**Goals:**

- Make photos the dominant element without hiding the project identity.
- Provide a lightweight carousel with no new dependency.
- Keep delivery, creation, code, and GUID available but visually secondary.
- Reuse the existing success/bgray/darkblack palette.

**Non-Goals:**

- A full-screen lightbox.
- Autoplay that moves the card without user input.
- Changing the project list grid, filters, or pagination.
- Changing the media management UI.

## Decisions

### Small focused carousel component

Create `ProjectPhotoCarousel.jsx` with local index state, previous/next buttons,
photo counter, and touch swipe support. No autoplay keeps cards calm and avoids
motion on a page with many cards. The component uses `thumb_url || url` for the
image source and `url` for a fallback.

### Identity over the image

The carousel reserves the lower portion for a dark gradient and places the name
and city there. Publication state stays top-left and project type top-right.
This follows the natural reading order: visual recognition, identity, status.

### Dates in a two-column grid, identifiers behind info

Delivery and creation dates become labeled values with icons, which is easier to
scan than two lines prefixed with bold labels. The project code stays visible as
a compact chip. An info button expands a details panel with the full GUID and a
copy action, keeping the technical identifier available without dominating the
card.

### Accessible controls

Buttons use localized `aria-label` values, the active image is not hidden from
assistive technology while inactive images are, and swipe handles a 40px
threshold. The carousel does not require hover to expose controls.

## Risks / Trade-offs

- **Taller cards** → the photo adds visual weight but the metadata gets denser to
  compensate. The grid already supports several card widths.
- **API not deployed** → the card falls back to `cover_photo_url`, then the
  gradient placeholder, so older API responses still render.
- **No autoplay** → users must interact to see later photos. This is intentional
  for accessibility and multi-card scanning.
- **Rollback** → revert the card and carousel component; no data migration.
