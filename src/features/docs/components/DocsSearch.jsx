import { useLocale } from "../../../contexts/LocaleContext";

function DocsSearch({ value, onChange }) {
  const { t } = useLocale();

  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("docs.searchPlaceholder")}
        aria-label={t("docs.searchPlaceholder")}
        className="h-9 w-full rounded-control border border-line-strong bg-surface py-2 pl-9 pr-3 text-body text-ink outline-none transition-shadow placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

export default DocsSearch;
