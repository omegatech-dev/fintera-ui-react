import { useEffect, useState } from "react";
import { projectsApi } from "../../api";
import { useLocale } from "../../../../contexts/LocaleContext";
import PhotoGalleryManager from "./PhotoGalleryManager";

export default function LotPhotosPanel({ projectId, lotId, canManage }) {
  const { t } = useLocale();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.listLotPhotos(projectId, lotId);
      setPhotos(data.photos || data.data || []);
    } catch (err) {
      setError(err?.message || t("media.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && lotId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, lotId]);

  const handleUpload = async (formData) => {
    await projectsApi.uploadLotPhotos(projectId, lotId, formData);
    await load();
  };

  const handleUpdate = async (photoId, data) => {
    await projectsApi.updateLotPhoto(photoId, data);
    await load();
  };

  const handleDelete = async (photoId) => {
    await projectsApi.deleteLotPhoto(photoId);
    await load();
  };

  return (
    <PhotoGalleryManager
      title={t("media.lotPhotosTitle")}
      description={t("media.lotPhotosDescription")}
      photos={photos}
      canManage={canManage}
      loading={loading}
      error={error}
      onRetry={load}
      onUpload={handleUpload}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
