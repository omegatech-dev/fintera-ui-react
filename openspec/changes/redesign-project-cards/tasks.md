## 1. Carousel component

- [x] 1.1 Add `src/features/projects/components/ProjectPhotoCarousel.jsx` with image stack, previous/next controls, counter, dots, and swipe.
- [x] 1.2 Add localized labels for carousel controls, metadata, and location fallback in `src/locales/en.json` and `src/locales/es.json`.
- [x] 1.3 Add `src/features/projects/components/ProjectPhotoCarousel.test.jsx`.

## 2. Card redesign

- [x] 2.1 Replace the cover header in `src/features/projects/components/index.jsx` with the carousel and over-photo identity.
- [x] 2.2 Reorganize delivery, creation, code, and GUID into the compact metadata area.
- [x] 2.3 Update card prop types and keep publish, payment instructions, edit, delete, and lots actions.
- [x] 2.4 Update `src/features/projects/pages/__tests__/Projects.test.jsx` for the carousel and metadata.

## 3. Docs and verification

- [x] 3.1 Document the card layout and fallback behavior in `documentation/features/project-cards.md`.
- [x] 3.2 Run `npm run verify` and `openspec validate redesign-project-cards --strict`.
