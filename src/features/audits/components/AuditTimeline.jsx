import { useMemo } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import AuditTimelineItem from "./AuditTimelineItem";
import { formatAuditDateLabel, getAuditDateKey } from "./auditDates";

function AuditTimeline({ items }) {
  const { t, locale } = useLocale();

  const groups = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const key = getAuditDateKey(item.created_at) || "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([dateKey, groupItems]) => {
        const headingId = `audit-day-${dateKey}`;
        const label =
          formatAuditDateLabel(groupItems[0]?.created_at, locale) ||
          t("common.notAvailable");

        return (
          <section key={dateKey} aria-labelledby={headingId}>
            <h2
              id={headingId}
              className="pb-0.5 text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-ink-3"
            >
              {label}
            </h2>
            <ol className="m-0 list-none p-0">
              {groupItems.map((item, index) => (
                <AuditTimelineItem
                  key={item.id ?? `${dateKey}-${index}`}
                  audit={item}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

AuditTimeline.propTypes = {
  items: PropTypes.array.isRequired,
};

export default AuditTimeline;
