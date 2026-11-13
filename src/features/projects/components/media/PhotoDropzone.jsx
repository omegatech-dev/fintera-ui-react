import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faImage } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../../contexts/LocaleContext";
import { PHOTO_ACCEPT, validatePhotoFile } from "./mediaFiles";

export default function PhotoDropzone({ onFiles, uploading = false }) {
  const { t } = useLocale();
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [rejected, setRejected] = useState([]);

  const openPicker = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const processFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const valid = [];
    const failures = [];
    files.forEach((file) => {
      const result = validatePhotoFile(file);
      if (result.ok) valid.push(file);
      else failures.push({ name: file.name, reason: result.reason });
    });

    setRejected(failures);
    if (valid.length > 0) onFiles(valid);
  };

  const handleInput = (event) => {
    processFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (uploading) return;
    processFiles(event.dataTransfer?.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!uploading) setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="hidden"
        onChange={handleInput}
      />
      <div
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-disabled={uploading}
        aria-label={t("media.dropPhotos")}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border border-dashed p-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          dragActive
            ? "border-brand bg-brand-soft"
            : "border-line-strong bg-surface-2 hover:border-brand"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-xl text-brand-strong">
          <FontAwesomeIcon icon={uploading ? faImage : faCloudArrowUp} />
        </span>
        <p className="text-body-lg font-bold text-ink">
          {uploading
            ? t("media.uploading")
            : dragActive
              ? t("media.dropPhotosActive")
              : t("media.dropPhotos")}
        </p>
      </div>

      {rejected.length > 0 && (
        <ul className="space-y-1 rounded-card border border-danger/20 bg-danger-soft p-4 text-label font-semibold text-danger">
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
    </div>
  );
}
