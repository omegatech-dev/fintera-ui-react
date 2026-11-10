# Project cards

Project cards on `/projects` lead with imagery and keep administrative actions
secondary.

## Layout

1. **Photo carousel** — 16:10 gallery preview across the full card width.
   - Swipe or use the previous/next buttons.
   - Counter shows the current photo and total.
   - Dot controls appear on wider cards.
   - One photo or `cover_photo_url` only shows the image without carousel
     controls.
   - No photos falls back to the success gradient with a home icon.
2. **Identity over the photo** — project name and city (or address), with the
   publication badge top-left and project type top-right.
3. **Metadata** — delivery date and creation date in a two-column grid, followed
   by a compact code chip and an info button. The info button expands a details
   panel with the full GUID and a copy action.
4. **Availability** — available/total lots, stacked sold/reserved/available bar,
   and legend.
5. **Metrics** — price per measurement unit and total lots.
6. **Actions** — publish/unpublish, payment instructions, edit, delete for
   admins, and the lots link for everyone.

## Data and fallbacks

The card reads `photos` from the project response. The API returns at most ten
photos ordered by position. If `photos` is absent, the card uses
`cover_photo_url`; if that is also absent, it renders the gradient placeholder.

All controls use the existing Tailwind palette (`success`, `bgray`, `darkblack`,
`warning`, `error`) and localized labels from `src/locales`.

## Accessibility

- Carousel controls are keyboard-focusable buttons with localized `aria-label`
  values.
- Inactive images are hidden from assistive technology.
- Swipe requires a 40px horizontal movement.
- No autoplay is used, so cards do not move without user input.
- Action buttons keep hover titles and 36px targets.
