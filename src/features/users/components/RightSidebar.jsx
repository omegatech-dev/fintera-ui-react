import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import { usersApi } from "@/features/users/api";
import { reportsApi } from "@/shared/api/reports";
import {
  getInitials,
  getAvatarColor,
  getFullImageUrl,
} from "@/shared/utils/avatarUtils";
import { formatDate } from "@/shared/utils/formatters";
import { Chip } from "@/shared/ui";
import SellerScoreSummary from "./SellerScoreSummary";

const FICO_MIN = 300;
const FICO_MAX = 850;

const creditScoreInfo = (score, t) => {
  const value = Number(score);
  if (Number.isNaN(value) || score === null || score === undefined) {
    return {
      scoreLabel: "N/A",
      descriptor: t ? t("creditScore.unknownDesc") : "Unknown",
    };
  }
  const fico = Math.max(FICO_MIN, Math.min(FICO_MAX, Math.round(value)));
  if (fico >= 750) {
    return {
      scoreLabel: String(fico),
      descriptor: t ? t("creditScore.excellentDesc") : "Excellent",
    };
  }
  if (fico >= 670) {
    return {
      scoreLabel: String(fico),
      descriptor: t ? t("creditScore.goodDesc") : "Good",
    };
  }
  if (fico >= 580) {
    return {
      scoreLabel: String(fico),
      descriptor: t ? t("creditScore.fairDesc") : "Fair",
    };
  }
  return {
    scoreLabel: String(fico),
    descriptor: t ? t("creditScore.poorDesc") : "Poor",
  };
};

const normalizeRole = (role) => {
  const value = String(role || "user").toLowerCase();
  return ["admin", "seller", "user"].includes(value) ? value : "user";
};

const ROLE_TONES = { admin: "violet", seller: "info", user: "neutral" };

const isActiveUser = (user) => {
  const raw = user?.status ?? user?.is_active;
  if (typeof raw === "boolean") return raw;
  return String(raw || "").toLowerCase() === "active";
};

const getLastAccess = (user) =>
  user?.last_sign_in_at ||
  user?.last_login_at ||
  user?.last_access_at ||
  user?.last_seen_at ||
  null;

function ContactRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-micro text-ink-3">{label}</dt>
      <dd className="min-w-0 truncate text-label font-semibold text-ink-2">
        {value || "—"}
      </dd>
    </div>
  );
}

function RightSidebar({
  user,
  onClose,
  onToggleStatus,
  onResend,
  onDelete,
  showActions = true,
}) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const { user: loggedUser } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    const userId = user?.id;
    if (!userId || user?.role === "admin" || user?.role === "seller") return;

    const fetchSummary = async () => {
      try {
        const data = await usersApi.getSummary(userId);
        setSummary(data);
      } catch (error) {
        console.error(error);
        setSummaryError(t("common.error"));
      }
    };

    fetchSummary();
  }, [user, user?.id, user?.role, t]);

  if (!user) return null;

  const role = normalizeRole(user.role);
  const roleLabel = t(`userFilter.${role === "user" ? "client" : role}`);
  const active = isActiveUser(user);
  const lastAccess = getLastAccess(user);
  const created = user.created_at ? formatDate(user.created_at) : null;
  const meta = created
    ? lastAccess
      ? t("users.profileSummary", {
          role: roleLabel,
          date: created,
          lastAccess: formatDate(lastAccess),
        })
      : t("users.profileSummaryNoAccess", { role: roleLabel, date: created })
    : roleLabel;

  const clientsCount =
    user.clients_count === null || user.clients_count === undefined
      ? "—"
      : String(user.clients_count);
  const credit = creditScoreInfo(user.credit_score, t);
  const hasCreditScore =
    loggedUser?.role === "admin" &&
    role === "user" &&
    user.credit_score !== null &&
    user.credit_score !== undefined;
  const hasPhoto = Boolean(user.profile_picture || user.profile_picture_thumb);

  const downloadUserBalancePDF = async () => {
    if (!user?.id) return;
    try {
      const blob = await reportsApi.downloadUserBalancePDF(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user_balance_${user.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showToast(t("common.downloadError"), "error");
    }
  };

  return (
    <aside className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto bg-surface">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <h2 className="text-label font-bold text-ink">
          {t("users.userDrawerTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="rounded-control p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 border-b border-line px-5 py-4 text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-section font-bold text-white ${
            hasPhoto ? "" : getAvatarColor(user.full_name)
          }`}
        >
          {hasPhoto ? (
            <img
              src={getFullImageUrl(
                user.profile_picture_thumb || user.profile_picture
              )}
              alt={user.full_name || ""}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user.full_name)
          )}
        </div>
        <h3 className="text-section font-bold text-ink">
          {user.full_name || "—"}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Chip tone={ROLE_TONES[role]}>{roleLabel}</Chip>
          <Chip tone={active ? "success" : "neutral"}>
            {t(active ? "common.active" : "common.inactive")}
          </Chip>
        </div>
        <p className="text-micro text-ink-3">{meta}</p>
      </div>

      <div className="space-y-5 px-5 py-4">
        <section>
          <h4 className="mb-2 text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.contactInformation")}
          </h4>
          <dl className="space-y-2.5">
            <ContactRow label={t("personalInfo.email")} value={user.email} />
            <ContactRow label={t("personalInfo.phone")} value={user.phone} />
            <ContactRow
              label={t("personalInfo.identity")}
              value={user.identity}
            />
            <ContactRow label={t("personalInfo.rtn")} value={user.rtn} />
            <ContactRow
              label={t("personalInfo.address")}
              value={user.address}
            />
            <ContactRow label={t("users.clientCount")} value={clientsCount} />
            {hasCreditScore && (
              <ContactRow
                label={t("users.creditScore")}
                value={`${credit.scoreLabel} · ${credit.descriptor}`}
              />
            )}
          </dl>
        </section>

        {role === "seller" && <SellerScoreSummary user={user} />}

        {role === "user" && (
          <section className="rounded-card border border-line bg-surface-2 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                  {t("contracts.balance")}
                </p>
                <p className="mt-1 text-title font-bold tabular-nums text-ink">
                  {summary
                    ? `${(Number(summary.balance) || 0).toLocaleString()} ${
                        summary.currency || ""
                      }`
                    : summaryError || "—"}
                </p>
              </div>
              <Link
                to={`/financing/user/${user.id}`}
                className="text-label font-semibold text-brand hover:underline"
              >
                {t("common.viewMore")}
              </Link>
            </div>
          </section>
        )}

        {role === "user" && (
          <section>
            <h4 className="mb-2 text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.documents")}
            </h4>
            <button
              type="button"
              onClick={downloadUserBalancePDF}
              className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-surface p-3 text-left transition-colors hover:bg-surface-2"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-danger-soft text-danger">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-label font-semibold text-ink">
                    Balance_{user.id}.pdf
                  </span>
                  <span className="block text-micro text-ink-3">
                    {t("contracts.accountStatement")}
                  </span>
                </span>
              </span>
              <svg
                className="h-4 w-4 shrink-0 text-ink-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("users.activityTitle")}
          </h4>
          {created || lastAccess || user.confirmed_at ? (
            <ul className="space-y-2.5">
              {lastAccess && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-label text-ink-2">
                    {t("users.lastAccess")}
                  </span>
                  <span className="text-micro text-ink-3">
                    {formatDate(lastAccess)}
                  </span>
                </li>
              )}
              {user.confirmed_at && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-label text-ink-2">
                    {t("personalInfo.lastConfirmed")}
                  </span>
                  <span className="text-micro text-ink-3">
                    {formatDate(user.confirmed_at)}
                  </span>
                </li>
              )}
              {created && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-label text-ink-2">
                    {t("personalInfo.memberSince")}
                  </span>
                  <span className="text-micro text-ink-3">{created}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-body text-ink-3">{t("users.noActivity")}</p>
          )}
        </section>

        {user.note && (
          <section className="rounded-card border border-warning/30 bg-warning-soft p-3.5">
            <p className="text-micro font-bold uppercase tracking-wide text-warning">
              {t("contracts.note")}
            </p>
            <p className="mt-1 text-label leading-relaxed text-warning">
              {user.note}
            </p>
          </section>
        )}
      </div>

      {showActions && (
        <div className="mt-auto space-y-2 border-t border-line p-4">
          <Link
            to={`/users/${user.id}/edit`}
            className="flex h-10 w-full items-center justify-center rounded-control bg-brand text-label font-bold text-white transition-colors hover:bg-brand-strong"
          >
            {t("users.editUser")}
          </Link>
          <Link
            to={`/settings/user/${user.id}/security`}
            className="flex h-10 w-full items-center justify-center rounded-control border border-line-strong bg-surface text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2"
          >
            {t("users.resetPassword")}
          </Link>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onToggleStatus?.(user)}
              className="text-label font-semibold text-ink-2 hover:underline"
            >
              {t(active ? "users.deactivate" : "users.activate")}
            </button>
            <span aria-hidden="true" className="text-ink-3">·</span>
            <button
              type="button"
              onClick={() => onResend?.(user)}
              className="text-label font-semibold text-ink-2 hover:underline"
            >
              {t("users.invite")}
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(user)}
              className="w-full py-1 text-label font-semibold text-danger hover:underline"
            >
              {t("common.delete")}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

export default RightSidebar;
