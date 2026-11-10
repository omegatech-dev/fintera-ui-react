import { useRef, useState } from "react";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import MediaSection from "./MediaSection";
import { PHOTO_ACCEPT, mediaUrl, validatePhotoFile } from "./mediaFiles";

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
  const photoInput = useRef(null);
  const thumbInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [rejected, setRejected] = useState([]);
  const [editingAlt, setEditingAlt] = useState(null);

  const handleUpload = async () => {
    const files = Array.from(photoInput.current?.files || []);
    const thumbs = Array.from(thumbInput.current?.files || []);
    if (photoInput.current) photoInput.current.value = "";
    if (thumbInput.current) thumbInput.current.value = "";
    if (files.length === 0) return;

    const valid = [];
    const failures = [];
    files.forEach((file) => {
      const result = validatePhotoFile(file);
      if (result.ok) valid.push(file);
      else failures.push({ name: file.name, reason: result.reason });
    });
    setRejected(failures);
    if (valid.length === 0) return;

    const formData = new FormData();
    valid.forEach((file, index) => {
      formData.append(`photos[${index}]`, file);
      if (thumbs[index]) formData.append(`thumbs[${index}]`, thumbs[index]);
    });

    setUploading(true);
    try {
      await onUpload(formData);
      showToast(t("media.uploadSuccess", { count: valid.length }), "success");
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
    if (target < 0 || target >= photos.length) return;
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
      actions={
        canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
            >
              {t("media.uploadPhotos")}
            </button>
            <button
              type="button"
              onClick={() => thumbInput.current?.click()}
              className="rounded-xl border border-bgray-200 dark:border-darkblack-400 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-bgray-600 dark:text-bgray-300"
            >
              {t("media.thumbnails")}
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-xl bg-bgray-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 dark:bg-white dark:text-bgray-900"
            >
              {uploading ? t("media.uploading") : t("media.send")}
            </button>
          </div>
        ) : null
      }
    >
      <input
        ref={photoInput}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="hidden"
        onChange={() => setRejected([])}
      />
      <input
        ref={thumbInput}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="hidden"
      />

      {rejected.length > 0 && (
        <ul className="mb-4 space-y-1 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
          {rejected.map((item) => (
            <li key={item.name}>
              {item.name}:{" "}
              {item.reason === "size"
                ? t("media.errorSize", { size: "10 MB" })
                : t("media.errorPhotoType")}
            </li>
          ))}
        </ul>
      )}

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

      {!loading && !error && photos.length === 0 && (
        <p className="rounded-2xl border border-dashed border-bgray-300 dark:border-darkblack-400 p-6 text-sm font-semibold text-bgray-500">
          {t("media.noPhotos")}
        </p>
      )}

      {!loading && !error && photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo, index) => (
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
                {editingAlt?.id === photo.id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={editingAlt.alt}
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

                {canManage && (
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
                      disabled={index === photos.length - 1}
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
