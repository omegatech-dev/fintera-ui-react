import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import { Banner, Button, Chip, Input } from "@/shared/ui";
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
    const confirmed = await confirmDialog({
      title: t("media.deletePhotoConfirm"),
      confirmLabel: t("common.delete"),
    });
    if (!confirmed) return;
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
      {loading && <p className="text-body font-semibold text-ink-3">{t("common.loading")}</p>}
      {error && !loading && (
        <Banner
          tone="danger"
          action={
            onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry}>
                {t("common.retry")}
              </Button>
            )
          }
        >
          {error}
        </Banner>
      )}

      {!loading && !error && canManage && (
        <div className="mb-5">
          <PhotoDropzone onFiles={handleUpload} uploading={uploading} />
        </div>
      )}

      {!loading && !error && orderedPhotos.length === 0 && (
        <p className="rounded-control border border-dashed border-line-strong bg-surface-2 p-6 text-body font-semibold text-ink-3">
          {t("media.noPhotos")}
        </p>
      )}

      {!loading && !error && orderedPhotos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orderedPhotos.map((photo, index) => (
            <article
              key={photo.id || photo.url}
              className="overflow-hidden rounded-card border border-line"
            >
              <div className="relative h-36 bg-surface-2">
                <img
                  src={mediaUrl(photo.thumb_url || photo.url)}
                  alt={photo.alt || ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2">
                    <Chip tone="info">{t("media.cover")}</Chip>
                  </span>
                )}
              </div>
              <div className="space-y-2 p-3">
                {editingAlt && photo.id != null && editingAlt.id === photo.id ? (
                  <div className="flex items-start gap-2">
                    <Input
                      autoFocus
                      value={editingAlt.alt ?? ""}
                      onChange={(event) => setEditingAlt({ ...editingAlt, alt: event.target.value })}
                      placeholder={t("media.altText")}
                      className="min-w-0 flex-1"
                    />
                    <Button size="sm" onClick={handleSaveAlt}>
                      {t("common.save")}
                    </Button>
                  </div>
                ) : (
                  <p className="truncate text-micro font-semibold text-ink-3">
                    {photo.alt || t("media.noAlt")}
                  </p>
                )}

                {canManage && photo.id != null && (
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCover(photo)}
                      disabled={index === 0}
                    >
                      {t("media.setCover")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t("media.moveUp")}
                      onClick={() => handleMove(photo, index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t("media.moveDown")}
                      onClick={() => handleMove(photo, index, 1)}
                      disabled={index === orderedPhotos.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingAlt({ id: photo.id, alt: photo.alt || "" })}
                    >
                      Alt
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(photo)}
                    >
                      {t("common.delete")}
                    </Button>
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
