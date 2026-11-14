import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { notificationsApi } from "@/shared/api/notifications";
import { sellerApi } from "@/features/seller/api";
import AssignmentCard from "@/features/seller/components/AssignmentCard";
import {
  normalizeAssignmentList,
  normalizeAssignmentStatus,
} from "@/features/seller/utils/assignment";

const timeAgo = (value, t) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.timeAgo.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.timeAgo.hours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("common.timeAgo.days", { count: days });
};

const isUnread = (item) => !item.read_at;

const notificationType = (item) =>
  String(
    item?.notification_type || item?.type || item?.data?.type || ""
  ).toLowerCase();

const assignmentNotificationId = (item) =>
  item?.assignment_id ??
  item?.data?.assignment_id ??
  item?.assignment?.id ??
  null;

const isAssignmentCreated = (type) =>
  type === "assignment_created" ||
  type === "assignment_pending" ||
  type === "assignment";

const isAssignmentExpired = (type) =>
  type === "assignment_expired" || type === "assignment_rejected";

function NotificationsBell() {
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);
  const retriedRef = useRef(false);

  const canSeeAssignments = user?.role === "seller";

  const load = useCallback(
    async (attempt = 0, silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [data, assignments] = await Promise.all([
          notificationsApi.list({}),
          canSeeAssignments
            ? sellerApi.listPendingAssignments().catch(() => null)
            : Promise.resolve(null),
        ]);
        setItems(data?.notifications || []);
        setPendingAssignments(normalizeAssignmentList(assignments));
      } catch (err) {
        // A request can fire before the API client receives the token on a
        // cold load; retry once shortly after hydration.
        if (err?.status === 401 && attempt < 1 && !retriedRef.current) {
          retriedRef.current = true;
          setTimeout(() => load(attempt + 1), 700);
          return;
        }
        if (!silent) setError("notifications.loadError");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, canSeeAssignments]
  );

  useEffect(() => {
    if (!authLoading && token) load();
  }, [authLoading, token, load]);

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

  const markAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      const now = new Date().toISOString();
      setItems((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at || now }))
      );
    } catch {
      setError("notifications.markAllError");
    }
  };

  const markOne = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      const now = new Date().toISOString();
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read_at: item.read_at || now } : item
        )
      );
    } catch {
      setError("notifications.markOneError");
    }
  };

  const resolveAssignment = (id, status) => {
    setPendingAssignments((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, status } : item
      )
    );
  };

  const assignmentEntries = useMemo(() => {
    const map = new Map();
    pendingAssignments.forEach((assignment) => {
      map.set(String(assignment.id), assignment);
    });

    items.forEach((item) => {
      if (!isAssignmentCreated(notificationType(item))) return;
      const id = assignmentNotificationId(item);
      if (!id || map.has(String(id))) {
        return;
      }
      const data = item.assignment || item.data || {};
      map.set(String(id), {
        ...data,
        id,
        status: data.status || item.status || "pending",
        accept_deadline_at:
          data.accept_deadline_at ||
          item.accept_deadline_at ||
          item.data?.accept_deadline_at,
        assigned_at: item.created_at,
      });
    });

    return [...map.values()].filter((assignment) =>
      ["pending", "accepted", "expired"].includes(
        normalizeAssignmentStatus(assignment.status)
      )
    );
  }, [pendingAssignments, items]);

  const assignmentIds = useMemo(
    () => new Set(assignmentEntries.map((assignment) => String(assignment.id))),
    [assignmentEntries]
  );

  const visibleNotifications = useMemo(
    () =>
      items.filter((item) => {
        if (!isAssignmentCreated(notificationType(item))) return true;
        const id = assignmentNotificationId(item);
        if (id) return !assignmentIds.has(String(id));
        return assignmentEntries.length === 0;
      }),
    [items, assignmentEntries, assignmentIds]
  );

  const unreadCount =
    visibleNotifications.filter(isUnread).length +
    Math.min(
      assignmentEntries.length,
      items.filter((item) => {
        if (!isAssignmentCreated(notificationType(item)) || !isUnread(item)) {
          return false;
        }
        const id = assignmentNotificationId(item);
        return id ? assignmentIds.has(String(id)) : assignmentEntries.length > 0;
      }).length
    );
  const visibleItems =
    filter === "unread"
      ? visibleNotifications.filter(isUnread)
      : visibleNotifications;
  const allCount = visibleNotifications.length + assignmentEntries.length;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={t("notifications.title")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-control border border-line bg-surface text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10.3 21a2 2 0 0 0 3.4 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("notifications.title")}
          className="fixed left-3 right-3 top-14 z-50 w-auto rounded-card border border-line bg-surface shadow-pop sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80 sm:max-w-[calc(100vw-1.5rem)]"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-body font-bold text-ink">
                {t("notifications.title")}
              </span>
              {unreadCount > 0 && (
                <span className="rounded-chip bg-danger-soft px-1.5 text-micro font-bold text-danger">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={markAll}
              disabled={unreadCount === 0}
              className="text-micro font-semibold text-brand disabled:opacity-50"
            >
              {t("notifications.markAllAsRead")}
            </button>
          </div>

          <div className="flex gap-1 border-b border-line px-3 py-2">
            {[
              {
                value: "all",
                label: t("notifications.allWithCount", { count: allCount }),
              },
              {
                value: "unread",
                label: t("notifications.unreadWithCount", { count: unreadCount }),
              },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                aria-pressed={filter === tab.value}
                className={`rounded-chip px-2 py-1 text-micro font-bold transition-colors ${
                  filter === tab.value
                    ? "bg-brand-soft text-brand-strong"
                    : "text-ink-3 hover:bg-surface-2"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-3 py-4 text-body text-ink-3">
                {t("notifications.loading")}
              </p>
            )}
            {!loading && error && (
              <div className="px-3 py-4 text-center">
                <p className="text-body text-danger">{t(error)}</p>
                <button
                  type="button"
                  onClick={() => load()}
                  className="mt-2 text-micro font-semibold text-brand"
                >
                  {t("common.retry")}
                </button>
              </div>
            )}
            {!loading &&
              !error &&
              assignmentEntries.map((assignment) => (
                <AssignmentCard
                  key={`assignment-${assignment.id}`}
                  assignment={assignment}
                  compact
                  onAccepted={() => resolveAssignment(assignment.id, "accepted")}
                  onRejected={() => resolveAssignment(assignment.id, "expired")}
                />
              ))}
            {!loading &&
              !error &&
              visibleItems.map((item) => {
                const type = notificationType(item);
                if (isAssignmentExpired(type)) {
                  return (
                    <div
                      key={item.id}
                      className="flex gap-2 border-b border-line/60 px-3 py-2.5 last:border-0"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-semibold text-ink">
                          {item.title || t("sellerAssignments.expiredTitle")}
                        </p>
                        <p className="truncate text-micro font-medium text-ink-3">
                          {timeAgo(item.created_at, t)}
                        </p>
                        <p className="mt-1 text-micro font-bold uppercase tracking-wide text-danger">
                          {t("sellerAssignments.expiredBadge")}
                        </p>
                        <p className="text-micro text-ink-3">
                          {item.message || t("sellerAssignments.expiredNote")}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex gap-2 border-b border-line/60 px-3 py-2.5 last:border-0 ${
                      isUnread(item) ? "bg-surface-2/60" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isUnread(item) ? "bg-brand" : "bg-line-strong"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="truncate text-micro text-ink-3">
                        {item.message}
                      </p>
                      <p className="text-micro text-ink-3">
                        {timeAgo(item.created_at, t)}
                      </p>
                    </div>
                    {isUnread(item) && (
                      <button
                        type="button"
                        onClick={() => markOne(item.id)}
                        className="shrink-0 self-start text-micro font-semibold text-brand"
                        aria-label={t("notifications.markOneAria", {
                          title: item.title,
                        })}
                      >
                        {t("notifications.readShort")}
                      </button>
                    )}
                  </div>
                );
              })}
            {!loading &&
              !error &&
              assignmentEntries.length === 0 &&
              visibleItems.length === 0 && (
                <p className="px-3 py-6 text-center text-body text-ink-3">
                  {filter === "unread"
                    ? t("notifications.emptyUnread")
                    : t("notifications.noNotifications")}
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
