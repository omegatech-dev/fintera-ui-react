import { useCallback, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "@/contexts/AuthContext";
import { notificationsApi } from "@/shared/api/notifications";

const timeAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
};

const isUnread = (item) => !item.read_at;

function NotificationsBell() {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);
  const retriedRef = useRef(false);

  const load = useCallback(
    async (attempt = 0) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await notificationsApi.list({});
        setItems(data?.notifications || []);
      } catch (err) {
        // A request can fire before the API client receives the token on a
        // cold load; retry once shortly after hydration.
        if (err?.status === 401 && attempt < 1 && !retriedRef.current) {
          retriedRef.current = true;
          setTimeout(() => load(attempt + 1), 700);
          return;
        }
        setError("No pudimos cargar las notificaciones.");
      } finally {
        setLoading(false);
      }
    },
    [token]
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
      setError("No pudimos marcar las notificaciones.");
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
      setError("No pudimos marcar la notificación.");
    }
  };

  const unreadCount = items.filter(isUnread).length;
  const visibleItems = filter === "unread" ? items.filter(isUnread) : items;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Notificaciones"
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
          aria-label="Notificaciones"
          className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-card border border-line bg-surface shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-body font-bold text-ink">Notificaciones</span>
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
              Marcar leídas
            </button>
          </div>

          <div className="flex gap-1 border-b border-line px-3 py-2">
            {[
              { value: "all", label: `Todas ${items.length}` },
              { value: "unread", label: `No leídas ${unreadCount}` },
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
              <p className="px-3 py-4 text-body text-ink-3">Cargando…</p>
            )}
            {!loading && error && (
              <div className="px-3 py-4 text-center">
                <p className="text-body text-danger">{error}</p>
                <button
                  type="button"
                  onClick={() => load()}
                  className="mt-2 text-micro font-semibold text-brand"
                >
                  Reintentar
                </button>
              </div>
            )}
            {!loading && !error && visibleItems.length === 0 && (
              <p className="px-3 py-6 text-center text-body text-ink-3">
                {filter === "unread"
                  ? "No hay notificaciones sin leer."
                  : "No hay notificaciones."}
              </p>
            )}
            {!loading &&
              !error &&
              visibleItems.map((item) => (
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
                    <p className="truncate text-micro text-ink-3">{item.message}</p>
                    <p className="text-micro text-ink-3">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                  {isUnread(item) && (
                    <button
                      type="button"
                      onClick={() => markOne(item.id)}
                      className="shrink-0 self-start text-micro font-semibold text-brand"
                      aria-label={`Marcar como leída: ${item.title}`}
                    >
                      Leída
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
