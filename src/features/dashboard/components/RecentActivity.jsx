import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { auditsApi } from "../../audits/api";
import { formatAuditEvent } from "../../audits/modelLabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPen,
  faTrash,
  faInfo,
  faBan,
  faUser,
  faFingerprint,
} from "@fortawesome/free-solid-svg-icons";

export const formatTimeAgo = (dateString, now, t) => {
  const date = new Date(dateString);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return t("common.justNow") || "Just now";
  if (minutes < 60) return t("common.timeAgo.minutes", { count: minutes });
  if (hours < 24) return t("common.timeAgo.hours", { count: hours });
  return t("common.timeAgo.days", { count: days });
};

export const resolveActivityUser = (activity, t) => {
  const nested =
    activity?.user && typeof activity.user === "object" ? activity.user : null;

  const name =
    activity?.user_full_name ||
    activity?.user_name ||
    nested?.full_name ||
    nested?.name;
  if (name) return name;

  const email = activity?.user_email || nested?.email;
  if (email) return email;

  const rawId = activity?.user_id ?? nested?.id;
  if (rawId !== undefined && rawId !== null && String(rawId).trim() !== "") {
    return t("dashboard.activityUserNumber", { id: rawId });
  }

  return t("audits.system");
};

const ACTION_STYLES = {
  create: { icon: faPlus, color: "text-brand" },
  update: { icon: faPen, color: "text-info" },
  delete: { icon: faTrash, color: "text-danger" },
  approve: { icon: faFingerprint, color: "text-brand" },
  reject: { icon: faBan, color: "text-warning" },
  login: { icon: faUser, color: "text-violet" },
  default: { icon: faInfo, color: "text-ink-3" },
};

const getActionStyle = (action) => {
  const value = String(action || "").toLowerCase();
  if (value.includes("create")) return ACTION_STYLES.create;
  if (value.includes("update") || value.includes("edit")) {
    return ACTION_STYLES.update;
  }
  if (value.includes("delete") || value.includes("destroy")) {
    return ACTION_STYLES.delete;
  }
  if (value.includes("approve")) return ACTION_STYLES.approve;
  if (value.includes("reject") || value.includes("cancel")) {
    return ACTION_STYLES.reject;
  }
  if (value.includes("login")) return ACTION_STYLES.login;
  return ACTION_STYLES.default;
};

function RecentActivity() {
  const { t } = useLocale();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await auditsApi.list({ page: 1, limit: 5 });
        const logs = data.audits || data.data || data || [];
        setActivities(logs.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recent activity", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const now = new Date();

  return (
    <section className="flex h-full flex-col rounded-card border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-title font-bold text-ink">
          {t("dashboard.recentActivity")}
        </h3>
        <Link
          to="/audits"
          className="text-label font-semibold text-brand hover:underline"
        >
          {t("dashboard.seeAll")}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-8 animate-pulse rounded-control bg-surface-2"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="py-6 text-center text-body text-ink-3">
          {t("dashboard.noActivity")}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {activities.map((activity, index) => {
            const style = getActionStyle(activity.action);
            const actor = resolveActivityUser(activity, t);
            const details = activity.details || activity.entity_type || "";
            return (
              <li
                key={activity.id || index}
                className="flex items-start gap-2.5"
              >
                <span className={`mt-0.5 shrink-0 ${style.color}`}>
                  <FontAwesomeIcon
                    icon={style.icon}
                    className="text-[13px]"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-label font-semibold text-ink"
                    title={actor}
                  >
                    {actor}
                  </p>
                  <p className="line-clamp-1 text-micro text-ink-3">
                    <span className="font-medium text-ink-2">
                      {formatAuditEvent(activity.action, t)}
                    </span>
                    {details ? ` · ${details}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-micro text-ink-3">
                  {formatTimeAgo(activity.created_at, now, t)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default RecentActivity;
