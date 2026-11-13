# FinteraUI Documentation

Technical documentation for the FinteraUI frontend.

> **Language note / Nota de idioma:** Technical documentation is written in
> English. The root `README.md` is kept in Spanish for end users. Spanish
> translation notes or `*.es.md` companions can be added next to a document
> when needed.

## Start here

| Document | What it covers |
| --- | --- |
| [Architecture overview](architecture/overview.md) | Feature modules, routing, state, and data flow |
| [API and auth](architecture/api-and-auth.md) | `apiClient`, AuthContext, roles, and route guards |
| [Internationalization](architecture/i18n.md) | LocaleContext, translation keys, and locale files |
| [Development guide](guides/development.md) | Setup, scripts, aliases, and workflow |
| [Testing guide](guides/testing.md) | Vitest, Testing Library, and test conventions |
| [Deployment guide](guides/deployment.md) | Build, PWA, environment, and hosting |

## Design

- [Redesign implementation map](design/implementation-map.md) — tokens,
  primitives, routes and migration order for the Pencil redesign.

## Features

- [GenericList](features/generic-list.md)
- [SearchFilterBar](features/search-filter-bar.md)
- [Payment schedule](features/payment-schedule.md)
- [Seller collections](features/seller-collections.md)
- [Pagination](features/pagination.md)
- [Bank/cash reservation](features/bank-cash-reservation.md)
- [Project media](features/project-media.md)
- [Project publishing](features/project-publishing.md)
- [Project cards](features/project-cards.md)
- [Admin settings and brand identity](features/branding-settings.md)
- [User documentation (in-app guide)](features/user-documentation.md)

## QA

- [Payment schedule QA scenarios](qa/payment-schedule-scenarios.md)

## History

Implementation summaries are kept for context and are marked as historical:

- [GenericList implementation](history/generic-list-implementation.md)
- [SearchFilterBar refactoring](history/search-filter-bar-refactoring.md)
- [Payment history pagination](history/payment-history-pagination.md)

## Relationship to OpenSpec

- `openspec/specs/<capability>/spec.md` is the **source of truth for
  observable behavior**.
- `documentation/` explains architecture, usage, development, and QA.
- When behavior changes, update the matching OpenSpec spec. When structure,
  conventions, or commands change, update the relevant guide here.

## Keeping docs current

- Update the relevant document in the same change that alters behavior.
- Prefer linking to source paths such as `src/shared/ui/GenericList.jsx`.
- Do not duplicate long API payloads; link to the feature `api.js` instead.
- Use the `/docs-sync` command to map a working-tree diff to affected docs and
  specs.
