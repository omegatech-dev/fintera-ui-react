---
trigger: always_on
---

# Internationalization Rule

When adding user-facing text, add a translation key instead of a hard-coded
string when practical.

- Use `useLocale()` from `src/contexts/LocaleContext` and `t("key")`.
- Add the key to both `src/locales/en.json` and `src/locales/es.json`.
- Reuse existing `common.*` keys when possible.
- Keep keys grouped by feature or domain.
- If a string is intentionally not localized, explain why in the change.

See `documentation/architecture/i18n.md` for details.
