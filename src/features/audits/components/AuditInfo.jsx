// src/components/listTab/audits/AuditInfo.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatAuditEvent, formatAuditModel } from "../modelLabels";

/**
 * Utility function to format event names
 * @param {string} event - The event type
 * @returns {string} - Formatted event name
 */
const formatEvent = (event, t) => formatAuditEvent(event, t);

/**
 * Utility function to format date strings
 * @param {string} dateStr - The date string
 * @returns {string} - Formatted date
 */
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

/**
 * Component to display individual audit log details
 * Supports both mobile card and desktop table rendering for GenericList
 * @param {object} props - Component props
 */
function AuditInfo({
  audit,
  _index,
  isMobileCard = false,
  onClick,
  _userRole,
}) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);

  // Extract audit properties
  const {
    action: event,
    entity: model,
    entity_id: itemId,
    user: userObj,
    details: changes,
    created_at: date,
    ip_address: ipAddress,
    user_agent: userAgent,
  } = audit;

  const user = userObj ? (userObj.full_name || userObj.email || t("audits.system")) : t("audits.system");

  const parsed = audit.parsed_changes;
  const changedKeys = parsed ? Object.keys(parsed) : [];

  const renderValue = (v) => {
    if (v === null || v === undefined) return t("audits.empty");
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  if (isMobileCard) {
    // Mobile Card View - return full card content
    return (
      <div className="bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer" onClick={onClick}>
        <div className="space-y-3">
          {/* Header with Event and Date */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {formatEvent(event, t)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatAuditModel(model, t)}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(date)}
            </span>
          </div>

          {/* User and Item Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {t("audits.table.user")}:
              </span>
              <span className="ml-1 text-gray-900 dark:text-white">
                {user}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {t("audits.table.itemId")}:
              </span>
              <span className="ml-1 text-gray-900 dark:text-white">
                {itemId}
              </span>
            </div>
          </div>

          {/* Changes */}
          <div>
            {changedKeys.length > 0 ? (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {changedKeys.slice(0, 3).join(", ")}
                {changedKeys.length > 3 && (
                  <span className="ml-2 text-xs text-gray-500">+{changedKeys.length - 3} more</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">N/A</div>
            )}

            {/* Expand / Details */}
            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {expanded ? t("audits.hideDetails") || "Hide details" : t("audits.showDetails") || "Show details"}
              </button>
              {expanded && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-darkblack-500 rounded">
                  {parsed ? (
                    <ul className="text-xs space-y-1">
                      {changedKeys.map((key) => (
                        <li key={key} className="break-words">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{renderValue(parsed[key])}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap">{changes || t("common.notAvailable")}</pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* IP and User Agent */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>
              <span className="font-medium">{t("audits.table.ipAddress")}:</span> {ipAddress || t("common.notAvailable")}
            </div>
            <div>
              <span className="font-medium">{t("audits.table.userAgent")}:</span> {userAgent || t("common.notAvailable")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Table Row View - return only td elements
  return (
    <>
      {/* Event */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {formatEvent(event, t)}
        </span>
      </td>

      {/* Model */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {formatAuditModel(model, t)}
        </span>
      </td>

      {/* Item ID */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {itemId}
        </span>
      </td>

      {/* User */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {user}
        </span>
      </td>

      {/* Changes */}
      <td className="px-6 py-4 align-top">
        {changedKeys.length > 0 ? (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {changedKeys.slice(0, 3).join(", ")}
            {changedKeys.length > 3 && (
              <span className="ml-2 text-xs text-gray-500">+{changedKeys.length - 3} more</span>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">N/A</div>
        )}

        <div className="mt-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? t("audits.hideDetails") || "Hide details" : t("audits.showDetails") || "Show details"}
          </button>
          {expanded && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-darkblack-500 rounded">
              {parsed ? (
                <ul className="text-xs space-y-1">
                  {changedKeys.map((key) => (
                    <li key={key} className="break-words">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                      <span className="ml-1 text-gray-900 dark:text-white">{renderValue(parsed[key])}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="text-xs whitespace-pre-wrap">{changes || t("common.notAvailable")}</pre>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {formatDate(date)}
        </span>
      </td>

      {/* IP Address */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {ipAddress || t("common.notAvailable")}
        </span>
      </td>

      {/* User Agent */}
      <td className="px-6 py-4">
        <span className="text-base font-medium text-bgray-900 dark:text-white">
          {userAgent || t("common.notAvailable")}
        </span>
      </td>
    </>
  );
}

AuditInfo.propTypes = {
  audit: PropTypes.object.isRequired,
  _index: PropTypes.number.isRequired,
  isMobileCard: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  _userRole: PropTypes.string,
};

export default AuditInfo;