import { useLocale } from "../../../contexts/LocaleContext";

function DocsSearch({ value, onChange }) {
  const { t } = useLocale();

  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bgray-400"
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
        className="w-full rounded-lg border border-bgray-200 bg-white py-2 pl-9 pr-3 text-sm text-bgray-900 placeholder:text-bgray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-white dark:placeholder:text-bgray-400"
      />
    </div>
  );
}

export default DocsSearch;
