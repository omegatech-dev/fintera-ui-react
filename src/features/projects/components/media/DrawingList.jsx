import { Button } from "@/shared/ui";
import { useLocale } from "../../../../contexts/LocaleContext";
import { formatBytes, mediaUrl } from "./mediaFiles";

export default function DrawingList({ drawings, canManage, onEdit, onDelete }) {
  const { t } = useLocale();

  if (drawings.length === 0) {
    return (
      <p className="rounded-control border border-dashed border-line-strong bg-surface-2 p-6 text-body font-semibold text-ink-3">
        {t("media.noDrawings")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {drawings.map((drawing) => (
        <article
          key={drawing.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line p-4"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-chip bg-surface-2 px-2 py-0.5 text-micro font-bold text-ink-2">
                {String(drawing.file_type || "").toUpperCase()}
              </span>
              <span className="truncate text-body font-bold text-ink">
                {drawing.name}
              </span>
              {drawing.version && (
                <span className="text-micro font-bold text-ink-3">
                  v{drawing.version}
                </span>
              )}
            </div>
            <p className="mt-1 text-micro font-semibold text-ink-3">
              {formatBytes(drawing.size_bytes)}
              {drawing.note ? ` · ${drawing.note}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={mediaUrl(drawing.download_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[34px] shrink-0 items-center rounded-control border border-line-strong px-3 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2"
            >
              {t("media.download")}
            </a>
            {canManage && (
              <>
                <Button size="sm" variant="secondary" onClick={() => onEdit(drawing)}>
                  {t("common.edit")}
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(drawing)}>
                  {t("common.delete")}
                </Button>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
