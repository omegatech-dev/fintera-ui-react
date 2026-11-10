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
    if (!window.confirm(t("media.deleteConfirm", { name: drawing.name }))) return;
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
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            {uploading ? t("media.uploading") : t("media.uploadDrawings")}
          </button>
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
        <ul className="mb-4 space-y-1 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
          {rejected.map((item) => (
            <li key={item.name}>
              {item.name}:{" "}
              {item.reason === "size"
                ? t("media.errorSize", { size: "50 MB" })
                : t("media.errorDrawingType")}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="mb-5 grid gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 sm:grid-cols-3">
          <input
            value={editing.name}
            onChange={(event) => setEditing({ ...editing, name: event.target.value })}
            placeholder={t("media.name")}
            className="rounded-xl border border-bgray-200 bg-white px-3 py-2 text-sm font-semibold dark:border-darkblack-400 dark:bg-darkblack-500"
          />
          <input
            value={editing.version}
            onChange={(event) => setEditing({ ...editing, version: event.target.value })}
            placeholder={t("media.version")}
            className="rounded-xl border border-bgray-200 bg-white px-3 py-2 text-sm font-semibold dark:border-darkblack-400 dark:bg-darkblack-500"
          />
          <input
            value={editing.note}
            onChange={(event) => setEditing({ ...editing, note: event.target.value })}
            placeholder={t("media.note")}
            className="rounded-xl border border-bgray-200 bg-white px-3 py-2 text-sm font-semibold dark:border-darkblack-400 dark:bg-darkblack-500"
          />
          <div className="flex gap-2 sm:col-span-3">
            <button
              type="button"
              onClick={handleSaveEdit}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
            >
              {t("common.save")}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-xl border border-bgray-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-bgray-600"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm font-semibold text-bgray-500">{t("common.loading")}</p>}
      {error && !loading && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button type="button" onClick={load} className="text-xs font-bold text-indigo-600">
            {t("common.retry")}
          </button>
        </div>
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
