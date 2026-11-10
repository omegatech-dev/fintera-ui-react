import { useLocale } from "../../../../contexts/LocaleContext";
import { formatBytes, mediaUrl } from "./mediaFiles";

export default function DrawingList({ drawings, canManage, onEdit, onDelete }) {
  const { t } = useLocale();

  if (drawings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-bgray-300 dark:border-darkblack-400 p-6 text-sm font-semibold text-bgray-500">
        {t("media.noDrawings")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {drawings.map((drawing) => (
        <article
          key={drawing.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bgray-200 dark:border-darkblack-400 p-4"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-bgray-100 dark:bg-darkblack-500 px-2 py-0.5 text-[10px] font-black text-bgray-600 dark:text-bgray-300">
                {String(drawing.file_type || "").toUpperCase()}
              </span>
              <span className="font-bold text-bgray-900 dark:text-white truncate">
                {drawing.name}
              </span>
              {drawing.version && (
                <span className="text-[10px] font-bold text-bgray-400">
                  v{drawing.version}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] font-semibold text-bgray-500">
              {formatBytes(drawing.size_bytes)}
              {drawing.note ? ` · ${drawing.note}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={mediaUrl(drawing.download_url)}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-bgray-200 dark:border-darkblack-400 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-bgray-600 dark:text-bgray-300 hover:border-indigo-500 hover:text-indigo-600"
            >
              {t("media.download")}
            </a>
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(drawing)}
                  className="rounded-xl border border-bgray-200 dark:border-darkblack-400 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-bgray-600 dark:text-bgray-300 hover:border-indigo-500 hover:text-indigo-600"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(drawing)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50"
                >
                  {t("common.delete")}
                </button>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
