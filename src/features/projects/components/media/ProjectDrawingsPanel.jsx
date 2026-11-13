import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import { Banner, Button, Input } from "@/shared/ui";
import { useEffect, useRef, useState } from "react";
import { projectsApi } from "../../api";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import MediaSection from "./MediaSection";
import DrawingList from "./DrawingList";
import { DRAWING_ACCEPT, validateDrawingFile } from "./mediaFiles";

export default function ProjectDrawingsPanel({ projectId, canManage }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [rejected, setRejected] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.listDrawings(projectId);
      setDrawings(data.drawings || data.data || []);
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

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const valid = [];
    const failures = [];
    for (const file of files) {
      const result = validateDrawingFile(file);
      if (result.ok) valid.push(file);
      else failures.push({ name: file.name, reason: result.reason });
    }
    setRejected(failures);
    if (valid.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      valid.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
        formData.append(`names[${index}]`, file.name.replace(/\.[^.]+$/, ""));
      });
      const response = await projectsApi.uploadDrawings(projectId, formData);
      const uploaded = response.drawings?.length || 0;
      if (response.errors?.length) {
        showToast(t("media.uploadPartial", { count: uploaded }), "error");
      } else {
        showToast(t("media.uploadSuccess", { count: uploaded }), "success");
      }
      await load();
    } catch (err) {
      showToast(err?.message || t("media.uploadError"), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (drawing) => {
    const confirmed = await confirmDialog({
      title: t("media.deleteConfirm", { name: drawing.name }),
      confirmLabel: t("common.delete"),
    });
    if (!confirmed) return;
    try {
      await projectsApi.deleteDrawing(drawing.id);
      showToast(t("media.deleteSuccess"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("media.deleteError"), "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await projectsApi.updateDrawing(editing.id, {
        name: editing.name,
        version: editing.version,
        note: editing.note,
      });
      setEditing(null);
      showToast(t("media.updateSuccess"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("media.updateError"), "error");
    }
  };

  return (
    <MediaSection
      title={t("media.drawingsTitle")}
      description={t("media.drawingsDescription")}
      hint={t("media.drawingsHint")}
      actions={
        canManage ? (
          <Button
            onClick={() => inputRef.current?.click()}
            loading={uploading}
          >
            {uploading ? t("media.uploading") : t("media.uploadDrawings")}
          </Button>
        ) : null
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept={DRAWING_ACCEPT}
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {rejected.length > 0 && (
        <Banner tone="danger">
          <ul className="space-y-1">
            {rejected.map((item) => (
              <li key={item.name}>
                {item.name}:{" "}
                {item.reason === "size"
                  ? t("media.errorSize", { size: "50 MB" })
                  : t("media.errorDrawingType")}
              </li>
            ))}
          </ul>
        </Banner>
      )}

      {editing && (
        <div className="grid gap-3 rounded-card border border-line bg-surface-2 p-4 sm:grid-cols-3">
          <Input
            value={editing.name}
            onChange={(event) => setEditing({ ...editing, name: event.target.value })}
            placeholder={t("media.name")}
          />
          <Input
            value={editing.version}
            onChange={(event) => setEditing({ ...editing, version: event.target.value })}
            placeholder={t("media.version")}
          />
          <Input
            value={editing.note}
            onChange={(event) => setEditing({ ...editing, note: event.target.value })}
            placeholder={t("media.note")}
          />
          <div className="flex gap-2 sm:col-span-3">
            <Button onClick={handleSaveEdit}>
              {t("common.save")}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      {loading && <p className="text-body font-semibold text-ink-3">{t("common.loading")}</p>}
      {error && !loading && (
        <Banner
          tone="danger"
          action={
            <Button variant="ghost" size="sm" onClick={load}>
              {t("common.retry")}
            </Button>
          }
        >
          {error}
        </Banner>
      )}
      {!loading && !error && (
        <DrawingList
          drawings={drawings}
          canManage={canManage}
          onEdit={(drawing) =>
            setEditing({
              id: drawing.id,
              name: drawing.name || "",
              version: drawing.version || "",
              note: drawing.note || "",
            })
          }
          onDelete={handleDelete}
        />
      )}
    </MediaSection>
  );
}
