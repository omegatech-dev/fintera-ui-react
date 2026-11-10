import { useMemo, useState } from "react";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import MediaSection from "./MediaSection";
import PhotoDropzone from "./PhotoDropzone";
import { mediaUrl } from "./mediaFiles";

export default function PhotoGalleryManager({
  title,
  description,
  photos,
  canManage,
  loading,
  error,
  onRetry,
  onUpload,
  onUpdate,
  onDelete,
}) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [editingAlt, setEditingAlt] = useState(null);

  const orderedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      const positionA = a.position ?? Number.MAX_SAFE_INTEGER;
      const positionB = b.position ?? Number.MAX_SAFE_INTEGER;
      if (positionA !== positionB) return positionA - positionB;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [photos]);

  const handleUpload = async (files) => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`photos[${index}]`, file);
    });

    setUploading(true);
    try {
      await onUpload(formData);
      showToast(t("media.uploadSuccess", { count: files.length }), "success");
    } catch (err) {
      showToast(err?.message || t("media.uploadError"), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm(t("media.deletePhotoConfirm"))) return;
    try {
      await onDelete(photo.id);
      showToast(t("media.deleteSuccess"), "success");
    } catch (err) {
      showToast(err?.message || t("media.deleteError"), "error");
    }
  };

  const handleMove = async (photo, index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= orderedPhotos.length) return;
    try {
      await onUpdate(photo.id, { position: target });
    } catch (err) {
      showToast(err?.message || t("media.updateError"), "error");
    }
  };

  const handleCover = async (photo) => {
    try {
      await onUpdate(photo.id, { position: -1 });
    } catch (err) {
      showToast(err?.message || t("media.updateError"), "error");
    }
  };

  const handleSaveAlt = async () => {
    if (!editingAlt) return;
    try {
      await onUpdate(editingAlt.id, { alt: editingAlt.alt });
      setEditingAlt(null);
      showToast(t("media.updateSuccess"), "success");
    } catch (err) {
      showToast(err?.message || t("media.updateError"), "error");
    }
  };

  return (
    <MediaSection
      title={title}
      description={description}
      hint={t("media.photosHint")}
    >
      {loading && <p className="text-sm font-semibold text-bgray-500">{t("common.loading")}</p>}
      {error && !loading && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="text-xs font-bold text-indigo-600">
              {t("common.retry")}
            </button>
          )}
        </div>
      )}

      {!loading && !error && canManage && (
        <div className="mb-5">
          <PhotoDropzone onFiles={handleUpload} uploading={uploading} />
        </div>
      )}

      {!loading && !error && orderedPhotos.length === 0 && (
        <p className="rounded-2xl border border-dashed border-bgray-300 dark:border-darkblack-400 p-6 text-sm font-semibold text-bgray-500">
          {t("media.noPhotos")}
        </p>
      )}

      {!loading && !error && orderedPhotos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orderedPhotos.map((photo, index) => (
            <article
              key={photo.id || photo.url}
              className="overflow-hidden rounded-2xl border border-bgray-200 dark:border-darkblack-400"
            >
              <div className="relative h-36 bg-bgray-100 dark:bg-darkblack-500">
                <img
                  src={mediaUrl(photo.thumb_url || photo.url)}
                  alt={photo.alt || ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                    {t("media.cover")}
                  </span>
                )}
              </div>
              <div className="space-y-2 p-3">
                {editingAlt && photo.id != null && editingAlt.id === photo.id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={editingAlt.alt ?? ""}
                      onChange={(event) => setEditingAlt({ ...editingAlt, alt: event.target.value })}
                      placeholder={t("media.altText")}
                      className="min-w-0 flex-1 rounded-lg border border-bgray-200 px-2 py-1 text-xs dark:border-darkblack-400 dark:bg-darkblack-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAlt}
                      className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-black text-white"
                    >
                      {t("common.save")}
                    </button>
                  </div>
                ) : (
                  <p className="truncate text-xs font-semibold text-bgray-500">
                    {photo.alt || t("media.noAlt")}
                  </p>
                )}

                {canManage && photo.id != null && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCover(photo)}
                      disabled={index === 0}
                      className="rounded-lg border border-bgray-200 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-bgray-600 disabled:opacity-40 dark:border-darkblack-400 dark:text-bgray-300"
                    >
                      {t("media.setCover")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(photo, index, -1)}
                      disabled={index === 0}
                      className="rounded-lg border border-bgray-200 px-2 py-1 text-[9px] font-black text-bgray-600 disabled:opacity-40 dark:border-darkblack-400 dark:text-bgray-300"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(photo, index, 1)}
                      disabled={index === orderedPhotos.length - 1}
                      className="rounded-lg border border-bgray-200 px-2 py-1 text-[9px] font-black text-bgray-600 disabled:opacity-40 dark:border-darkblack-400 dark:text-bgray-300"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAlt({ id: photo.id, alt: photo.alt || "" })}
                      className="rounded-lg border border-bgray-200 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-bgray-600 dark:border-darkblack-400 dark:text-bgray-300"
                    >
                      Alt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(photo)}
                      className="rounded-lg border border-red-200 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-red-500"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </MediaSection>
  );
}
