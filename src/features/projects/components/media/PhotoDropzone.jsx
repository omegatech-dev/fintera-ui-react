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
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          dragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-bgray-300 bg-bgray-50 hover:border-indigo-400 dark:border-darkblack-400 dark:bg-darkblack-500"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-xl text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <FontAwesomeIcon icon={uploading ? faImage : faCloudArrowUp} />
        </span>
        <p className="text-sm font-black text-bgray-900 dark:text-white">
          {uploading
            ? t("media.uploading")
            : dragActive
              ? t("media.dropPhotosActive")
              : t("media.dropPhotos")}
        </p>
      </div>

      {rejected.length > 0 && (
        <ul className="space-y-1 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
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
