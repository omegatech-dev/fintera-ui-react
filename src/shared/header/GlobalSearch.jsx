import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AuthContext from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { getNavItems } from "../layout/nav";

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m16.5 16.5 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobalSearch({ compact = false }) {
  const { t } = useLocale();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      getNavItems(user).map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t, user]
  );

  const term = query.trim().toLowerCase();
  const matches = term
    ? items.filter((item) => item.label.toLowerCase().includes(term)).slice(0, 6)
    : [];

  useEffect(() => {
    setQuery("");
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (compact && open) inputRef.current?.focus();
  }, [compact, open]);

  const close = () => {
    setQuery("");
    setOpen(false);
  };

  const goTo = (item) => {
    close();
    navigate(item.resolvedTo);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key === "Enter" && matches[0]) {
      event.preventDefault();
      goTo(matches[0]);
    }
  };

  const results = open && term && (
    <div
      className={
        compact
          ? "mt-2 max-h-64 overflow-y-auto border-t border-line pt-1"
          : "absolute left-0 top-12 z-50 w-[300px] overflow-hidden rounded-card border border-line bg-surface p-1 shadow-pop"
      }
    >
      {matches.length === 0 ? (
        <p className="px-3 py-2.5 text-body text-ink-3">
          {t("header.searchNoResults")}
        </p>
      ) : (
        <ul role="listbox" aria-label={t("header.searchAria")}>
          {matches.map((item) => (
            <li key={item.labelKey}>
              <button
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => goTo(item)}
                className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-body font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="h-4 w-4 shrink-0 text-ink-3"
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="relative md:hidden" ref={rootRef}>
        <button
          type="button"
          aria-label={t("header.searchAria")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <SearchIcon />
        </button>
        {open && (
          <div className="fixed left-4 right-4 top-14 z-50 rounded-card border border-line bg-surface p-2 shadow-pop">
            <div className="flex h-10 items-center gap-2 rounded-control border border-line px-3 text-ink-3 focus-within:border-brand">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("header.searchPlaceholder")}
                aria-label={t("header.searchAria")}
                className="h-full w-full min-w-0 bg-transparent text-body text-ink placeholder:text-ink-3 focus:outline-none"
              />
            </div>
            {results}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative hidden md:block" ref={rootRef}>
      <div className="flex h-10 w-[240px] items-center gap-2 rounded-control border border-line bg-surface px-3 text-ink-3 focus-within:border-brand xl:w-[260px]">
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("header.searchPlaceholder")}
          aria-label={t("header.searchAria")}
          className="h-full w-full min-w-0 bg-transparent text-body text-ink placeholder:text-ink-3 focus:outline-none"
        />
      </div>
      {results}
    </div>
  );
}

export default GlobalSearch;
