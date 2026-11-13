import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  evaluateLogoDimensions,
  formatFileSize,
  getImageTypeLabel,
} from "../logoRules";

const STATUS_STYLES = {
  good: "bg-brand-soft text-brand-strong",
  small: "bg-warning-soft text-warning",
  ratio: "bg-warning-soft text-warning",
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
        <p className="mb-1 block text-label font-semibold text-ink-2">
          {label}
        </p>
        {hint && <p className="text-label text-ink-3">{hint}</p>}
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
        whileHover={reduceMotion ? undefined : { scale: 1.005 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        className={`group relative flex min-h-[140px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[12px] border-2 border-dashed p-4 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
          isDragging
            ? "border-brand bg-brand-soft/50"
            : error
              ? "border-danger/60 bg-danger-soft/50"
              : "border-line-strong bg-surface-2 hover:border-brand/60 hover:bg-brand-soft/30"
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
            className="max-h-16 max-w-full object-contain"
          />
        </AnimatePresence>

        <span className="text-label font-semibold text-ink-2">
          {isDragging ? labels.dropActive : labels.drop}
        </span>
        <span className="text-micro text-ink-3">{labels.dropHint}</span>
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
        <p role="alert" className="text-label font-medium text-danger">
          {error === "size" ? labels.errorSize : labels.errorType}
        </p>
      )}

      {showDetails && (fileDetails || statusLabel) && (
        <div className="flex flex-wrap items-center gap-2">
          {fileDetails && (
            <span className="rounded-chip bg-surface-2 px-2.5 py-1 text-micro font-medium text-ink-3">
              {fileDetails}
            </span>
          )}
          {statusLabel && (
            <span
              className={`rounded-chip px-2.5 py-1 text-micro font-semibold ${STATUS_STYLES[quality.status]}`}
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
          className="self-start rounded-control border border-line-strong bg-surface px-3 py-1.5 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2"
        >
          {labels.undo}
        </button>
      )}
      {showRemove && (
        <button
          type="button"
          onClick={onClear}
          className="self-start rounded-control border border-danger/40 bg-surface px-3 py-1.5 text-label font-semibold text-danger transition-colors hover:bg-danger-soft"
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
