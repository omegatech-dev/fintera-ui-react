import { useId, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { Input } from "@/shared/ui";
import { sellerName, sellerZone } from "../../../seller/utils/assignment";

const SUGGESTED_LIMIT = 3;

function SellerOption({ checked, title, meta, onSelect, name }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      name={name}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-control border px-3 py-2.5 text-left transition-colors ${
        checked
          ? "border-brand bg-brand-soft"
          : "border-line bg-surface hover:bg-surface-2"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-brand bg-brand" : "border-line-strong bg-surface"
        }`}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-label font-semibold text-ink">
          {title}
        </span>
        {meta && (
          <span className="block truncate text-micro font-medium text-ink-3">
            {meta}
          </span>
        )}
      </span>
    </button>
  );
}

SellerOption.propTypes = {
  checked: PropTypes.bool,
  title: PropTypes.node,
  meta: PropTypes.node,
  onSelect: PropTypes.func,
  name: PropTypes.string,
};

function SellerQuestion({
  sellers = [],
  loading = false,
  error = null,
  mode = "automatic",
  selectedSellerId = null,
  onModeChange,
  className = "",
}) {
  const { t } = useLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const groupId = useId();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sellers.slice(0, SUGGESTED_LIMIT);
    return sellers.filter((seller) =>
      [sellerName(seller), sellerZone(seller)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [sellers, search]);

  const sellerMeta = (seller) => {
    const zone = sellerZone(seller);
    const count = Number(seller.sales_count) || 0;
    return zone
      ? t("sellerAssignments.sellerMeta", { zone, count })
      : t("sellerAssignments.sellerMetaNoZone", { count });
  };

  const chooseSeller = (seller) => onModeChange?.("manual", seller);
  const chooseAutomatic = () => onModeChange?.("automatic", null);

  return (
    <section aria-labelledby={`${groupId}-title`} className={className}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p
          id={`${groupId}-title`}
          className="text-label font-semibold text-ink-2"
        >
          {t("sellerAssignments.questionTitle")}
        </p>
        <button
          type="button"
          onClick={() => setSearchOpen((value) => !value)}
          aria-expanded={searchOpen}
          className="text-micro font-semibold text-brand transition-colors hover:text-brand-strong"
        >
          {t("sellerAssignments.searchAnother")}
        </button>
      </div>

      {searchOpen && (
        <div className="mt-2">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("sellerAssignments.searchPlaceholder")}
            aria-label={t("sellerAssignments.searchPlaceholder")}
            className="h-[34px] text-label sm:text-label"
          />
        </div>
      )}

      {loading && (
        <p className="mt-3 text-micro font-medium text-ink-3">
          {t("sellerAssignments.loadingSellers")}
        </p>
      )}

      {!loading && error && (
        <p role="alert" className="mt-3 text-micro font-medium text-danger">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div
          role="radiogroup"
          aria-labelledby={`${groupId}-title`}
          className="mt-3 flex flex-col gap-2"
        >
          {filtered.map((seller) => (
            <SellerOption
              key={seller.id}
              name={groupId}
              checked={mode === "manual" && selectedSellerId === seller.id}
              title={sellerName(seller)}
              meta={sellerMeta(seller)}
              onSelect={() => chooseSeller(seller)}
            />
          ))}

          {search.trim() && filtered.length === 0 && sellers.length > 0 && (
            <p className="text-micro font-medium text-ink-3">
              {t("sellerAssignments.searchEmpty")}
            </p>
          )}

          {sellers.length === 0 && (
            <p className="text-micro font-medium text-ink-3">
              {t("sellerAssignments.noSellers")}
            </p>
          )}

          <SellerOption
            name={groupId}
            checked={mode === "automatic"}
            title={t("sellerAssignments.noOneTitle")}
            meta={t("sellerAssignments.noOneMeta")}
            onSelect={chooseAutomatic}
          />
        </div>
      )}

      <p className="mt-3 text-micro font-medium text-ink-3">
        {t("sellerAssignments.questionHint")}
      </p>
    </section>
  );
}

SellerQuestion.propTypes = {
  sellers: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.node,
  mode: PropTypes.oneOf(["manual", "automatic"]),
  selectedSellerId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onModeChange: PropTypes.func,
  className: PropTypes.string,
};

export default SellerQuestion;
