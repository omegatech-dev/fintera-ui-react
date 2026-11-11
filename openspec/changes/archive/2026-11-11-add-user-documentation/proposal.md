## Why

Admins and sellers operate a domain-heavy back office (projects, lots, financing
types, contracts, payment schedules, overdue interest, credit scores) but have no
in-app explanation of what those terms mean or how the logic works. The only
documentation today is developer-oriented markdown under `documentation/`, which
operators never see. New staff must ask colleagues, and mistakes — for example
approving a payment without understanding overpayment handling or moratory
interest — cost real money.

## What Changes

- Add an in-app **User Guide** at `/docs`, available to admins and sellers only.
- Render bundled, bilingual (en/es) markdown articles with `react-markdown` and
  `remark-gfm`, grouped into sections.
- Filter the guide by role: sellers see only operations they can perform (view
  projects/lots, create reservations, view contracts/payments, view reports);
  admins see everything, including approval flows and settings.
- Provide search across visible articles, a per-article table of contents, and
  cross-links between terms.
- Explain domain terms and operation logic in plain language, including the
  precise overdue-interest formula and the payment-schedule generation rules.
- Add a **Glossary** article and a sidebar entry in both sidebar variants for
  admins and sellers, plus page titles and locale keys.

## Capabilities

### New Capabilities

- `user-documentation`: role-filtered, bilingual in-app guide explaining system
  terms and operations.

### Modified Capabilities

None. Existing behavior is unchanged; this is an additive read-only surface.

## Impact

- New `src/features/docs/` feature (pages, components, hooks, manifest, markdown
  content).
- `src/routes.jsx`, `src/shared/sidebar/Sidebar.jsx`,
  `src/shared/sidebar/SidebarV2.jsx`, `src/hooks/usePageTitle.js`,
  `src/locales/en.json`, `src/locales/es.json`.
- New dependencies: `react-markdown`, `remark-gfm`, `rehype-slug`, `fuse.js`.
- `documentation/features/user-documentation.md` plus index update.
- No API/backend changes; content ships with the app bundle.
