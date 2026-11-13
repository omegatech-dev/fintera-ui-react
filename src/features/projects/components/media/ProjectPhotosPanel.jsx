import { useEffect, useState } from "react";
import { projectsApi } from "../../api";
import { useLocale } from "../../../../contexts/LocaleContext";
import PhotoGalleryManager from "./PhotoGalleryManager";

export default function ProjectPhotosPanel({
  projectId,
  canManage,
  onPhotosChanged,
}) {
  const { t } = useLocale();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.listProjectPhotos(projectId);
      const nextPhotos = data.photos || data.data || [];
      setPhotos(nextPhotos);
      onPhotosChanged?.(nextPhotos);
    } catch (err) {
      setError(err?.message || t("media.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleUpload = async (formData) => {
    await projectsApi.uploadProjectPhotos(projectId, formData);
    await load();
  };

  const handleUpdate = async (photoId, data) => {
    await projectsApi.updateProjectPhoto(photoId, data);
    await load();
  };

  const handleDelete = async (photoId) => {
    await projectsApi.deleteProjectPhoto(photoId);
    await load();
  };

  return (
    <PhotoGalleryManager
      title={t("media.projectPhotosTitle")}
      description={t("media.projectPhotosDescription")}
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
