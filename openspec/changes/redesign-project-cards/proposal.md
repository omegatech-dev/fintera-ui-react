## Why

Project cards currently give a 96px gradient header to the photo and most of the
space to technical identifiers. Photos are the strongest way to recognise a
project, and the existing card splits delivery, creation, code, and GUID into a
noisy vertical stack.

## What Changes

- Replace the small cover header with a 16:10 photo carousel that uses the full
  card width, gallery thumbnails, arrows, a counter, and swipe navigation.
- Put the project name, city, publication state, and project type over the photo
  so the image and identity read first.
- Reorganize the metadata into a scannable grid: delivery date and creation
  date as labeled values, a compact code chip, and a GUID details panel behind
  an info button.
- Keep the lot availability, price, total lots, and admin actions, with clearer
  spacing and the existing success/bgray/darkblack palette.
- Add accessible labels and locale keys for the carousel and metadata.
- Add component tests for the gallery carousel, metadata, and fallback states.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: project cards use a gallery carousel and reorganize project
  identity and metadata around the imagery.

## Impact

- `src/features/projects/components/index.jsx`
- New `src/features/projects/components/ProjectPhotoCarousel.jsx`
- `src/locales/en.json`, `src/locales/es.json`
- Project card tests under `src/features/projects/pages/__tests__/`
- `documentation/features/project-publishing.md` and a card design note
- Depends on FinteraAPI `expose-project-card-gallery` for the `photos` field.
