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

function NotificationsBell() {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
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
        const data = await notificationsApi.list({ status: "unread" });
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
      setItems([]);
    } catch {
      setError("No pudimos marcar las notificaciones.");
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Notificaciones"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 items-center justify-center rounded-control text-ink-3 hover:bg-surface-2"
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
        {items.length > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="absolute right-0 top-12 z-50 w-80 rounded-card border border-line bg-surface shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <span className="text-body font-bold text-ink">
              Notificaciones
            </span>
            <button
              type="button"
              onClick={markAll}
              className="text-micro font-semibold text-brand"
            >
              Marcar leídas
            </button>
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
                  onClick={load}
                  className="mt-2 text-micro font-semibold text-brand"
                >
                  Reintentar
                </button>
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <p className="px-3 py-6 text-center text-body text-ink-3">
                No hay notificaciones pendientes.
              </p>
            )}
            {!loading &&
              !error &&
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 border-b border-line/60 px-3 py-2.5 last:border-0"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <div className="min-w-0">
                    <p className="truncate text-body font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="truncate text-micro text-ink-3">
                      {item.message}
                    </p>
                    <p className="text-micro text-ink-3">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
