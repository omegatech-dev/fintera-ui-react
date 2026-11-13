import { useId, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import Chip from "@/shared/ui/Chip";
import {
  formatAuditActionPast,
  formatAuditEntityPhrase,
  normalizeAuditAction,
} from "../modelLabels";
import { ACTION_TONES, getAuditActionMeta } from "./auditActions";
import { formatAuditTime } from "./auditDates";

const renderValue = (value, t) => {
  if (value === null || value === undefined) {
    return <span className="italic text-ink-3">{t("audits.empty")}</span>;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-micro text-ink-2">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  } catch {
    return String(value);
  }
};

function AuditTimelineItem({ audit }) {
  const { t, locale } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  const {
    action,
    entity,
    entity_id: entityId,
    user,
    details,
    created_at: createdAt,
    ip_address: ipAddress,
    user_agent: userAgent,
    parsed_changes: parsedChanges,
  } = audit;

  const meta = getAuditActionMeta(action);
  const showEntity = normalizeAuditAction(action) !== "login";
  const actor = user?.full_name || user?.email || t("audits.system");
  const actionLabel = formatAuditActionPast(action, t);
  const entityPhrase = formatAuditEntityPhrase(entity, t);
  const time = formatAuditTime(createdAt, locale, t);
  const changedKeys =
    parsedChanges && typeof parsedChanges === "object"
      ? Object.keys(parsedChanges)
      : [];
  const hasDetails = Boolean(
    changedKeys.length || details || ipAddress || userAgent
  );

  return (
    <li className="border-b border-slate-100 last:border-b-0 dark:border-line/60">
      <div className="flex min-h-[46px] items-center gap-2.5 py-1">
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${ACTION_TONES[meta.tone]}`}
        >
          <FontAwesomeIcon icon={meta.icon} className="text-[13px]" />
        </span>

        <div className="min-w-0 flex-1 text-label font-medium leading-5 text-ink-2">
          <span className="font-semibold text-ink">{actor}</span>{" "}
          <Chip tone={meta.tone} className="mx-0.5 align-middle">
            {actionLabel}
          </Chip>{" "}
          {showEntity && entityPhrase && <span>{entityPhrase}</span>}
          {showEntity && entityId != null && entityId !== "" && (
            <span className="ml-1 text-ink-3">#{entityId}</span>
          )}
        </div>

        <time
          dateTime={createdAt || undefined}
          className="shrink-0 text-micro font-medium tabular-nums text-ink-3"
        >
          {time}
        </time>

        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={
              expanded ? t("audits.hideDetails") : t("audits.showDetails")
            }
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`text-[11px] transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {expanded && hasDetails && (
        <div
          id={detailsId}
          className="mb-2 ml-8 rounded-control border border-line bg-surface-2 p-3"
        >
          {changedKeys.length > 0 ? (
            <dl className="grid gap-1.5 text-micro sm:grid-cols-[140px_1fr]">
              {changedKeys.map((key) => (
                <div key={key} className="contents">
                  <dt className="font-semibold text-ink-2">{key}</dt>
                  <dd className="min-w-0 break-words text-ink-3">
                    {renderValue(parsedChanges[key], t)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-micro italic text-ink-3">
              {details || t("audits.noDetails")}
            </p>
          )}

          {(ipAddress || userAgent) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2 text-micro text-ink-3">
              {ipAddress && (
                <span>
                  {t("audits.table.ipAddress")}: {ipAddress}
                </span>
              )}
              {userAgent && (
                <span className="min-w-0 truncate">
                  {t("audits.table.userAgent")}: {userAgent}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

AuditTimelineItem.propTypes = {
  audit: PropTypes.object.isRequired,
};

export default AuditTimelineItem;
