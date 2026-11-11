import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  evaluateLogoDimensions,
  formatFileSize,
  getImageTypeLabel,
} from "../logoRules";

const STATUS_STYLES = {
  good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  small: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ratio: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function LogoUploadCard({
  label,
  hint,
  savedSrc,
  fallbackSrc,
  pendingPreview,
  pendingFile,
  hasPendingFile,
  markedForRemoval,
  error,
  onSelect,
  onClear,
  labels,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [meta, setMeta] = useState({ width: 0, height: 0 });
  const reduceMotion = useReducedMotion();

  const displaySrc = hasPendingFile
    ? pendingPreview
    : markedForRemoval || !savedSrc
      ? fallbackSrc
      : savedSrc;

  const showUndo = hasPendingFile || markedForRemoval;
  const showRemove = !showUndo && Boolean(savedSrc);
  const showDetails = Boolean(pendingFile) || (Boolean(savedSrc) && !markedForRemoval);

  useEffect(() => {
    setMeta({ width: 0, height: 0 });
  }, [displaySrc]);

  const quality = evaluateLogoDimensions(meta.width, meta.height);
  const statusLabel =
    quality.status === "good"
      ? labels.qualityGood
      : quality.status === "small"
        ? labels.qualitySmall
        : quality.status === "ratio"
          ? labels.qualityRatio
          : "";

  const fileDetails = [
    meta.width && meta.height ? `${meta.width} × ${meta.height} px` : "",
    pendingFile ? formatFileSize(pendingFile.size) : "",
    pendingFile ? getImageTypeLabel(pendingFile.type) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div>
        <p className="mb-1 block text-sm font-semibold text-bgray-700 dark:text-bgray-300">
          {label}
        </p>
        {hint && (
          <p className="text-xs text-bgray-500 dark:text-bgray-400">{hint}</p>
        )}
      </div>

      <motion.button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        whileHover={reduceMotion ? undefined : { scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        className={`group relative flex min-h-[190px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblack-600 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
            : error
              ? "border-red-300 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/20"
              : "border-bgray-200 bg-bgray-50/70 hover:border-blue-300 hover:bg-blue-50/40 dark:border-darkblack-400 dark:bg-darkblack-500/40 dark:hover:border-blue-800"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={displaySrc}
            src={displaySrc}
            alt=""
            onLoad={(event) =>
              setMeta({
                width: event.currentTarget.naturalWidth || 0,
                height: event.currentTarget.naturalHeight || 0,
              })
            }
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="max-h-24 max-w-full object-contain"
          />
        </AnimatePresence>

        <span className="text-sm font-semibold text-bgray-700 dark:text-bgray-200">
          {isDragging ? labels.dropActive : labels.drop}
        </span>
        <span className="text-xs text-bgray-500 dark:text-bgray-400">
          {labels.dropHint}
        </span>
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept={labels.acceptedTypes}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = "";
        }}
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error === "size" ? labels.errorSize : labels.errorType}
        </p>
      )}

      {showDetails && (fileDetails || statusLabel) && (
        <div className="flex flex-wrap items-center gap-2">
          {fileDetails && (
            <span className="rounded-full bg-bgray-100 px-2.5 py-1 text-xs font-medium text-bgray-600 dark:bg-darkblack-500 dark:text-bgray-300">
              {fileDetails}
            </span>
          )}
          {statusLabel && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[quality.status]}`}
            >
              {statusLabel}
            </span>
          )}
        </div>
      )}

      {showUndo && (
        <button
          type="button"
          onClick={onClear}
          className="self-start rounded-lg border border-bgray-200 px-3.5 py-2 text-sm font-semibold text-bgray-700 transition-colors hover:bg-bgray-100 dark:border-darkblack-400 dark:text-bgray-200 dark:hover:bg-darkblack-500"
        >
          {labels.undo}
        </button>
      )}
      {showRemove && (
        <button
          type="button"
          onClick={onClear}
          className="self-start rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {labels.remove}
        </button>
      )}
    </div>
  );
}

LogoUploadCard.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  savedSrc: PropTypes.string,
  fallbackSrc: PropTypes.string,
  pendingPreview: PropTypes.string,
  pendingFile: PropTypes.instanceOf(File),
  hasPendingFile: PropTypes.bool,
  markedForRemoval: PropTypes.bool,
  error: PropTypes.oneOf(["type", "size", null]),
  onSelect: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    drop: PropTypes.string.isRequired,
    dropActive: PropTypes.string.isRequired,
    dropHint: PropTypes.string.isRequired,
    undo: PropTypes.string.isRequired,
    remove: PropTypes.string.isRequired,
    errorType: PropTypes.string.isRequired,
    errorSize: PropTypes.string.isRequired,
    qualityGood: PropTypes.string.isRequired,
    qualitySmall: PropTypes.string.isRequired,
    qualityRatio: PropTypes.string.isRequired,
    acceptedTypes: PropTypes.string.isRequired,
  }).isRequired,
};

export default LogoUploadCard;
