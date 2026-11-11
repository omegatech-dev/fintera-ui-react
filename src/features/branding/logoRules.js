export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const RECOMMENDED_LOGO = {
  width: 640,
  height: 160,
  ratio: 4,
};

export const MINIMUM_LOGO = {
  width: 320,
  height: 80,
};

const TYPE_LABELS = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(2).replace(/\.?0+$/, "")} MB`;
  }

  const kilobytes = bytes / 1024;
  return `${Math.max(1, Math.round(kilobytes))} KB`;
};

export const getImageTypeLabel = (type) => TYPE_LABELS[type] || type || "";

export const getFileValidationError = (file) => {
  if (!file) return "type";
  if (!ACCEPTED_TYPES.includes(file.type)) return "type";
  if (file.size > MAX_FILE_BYTES) return "size";
  return null;
};

export const evaluateLogoDimensions = (width, height) => {
  if (!width || !height) return { status: "unknown" };

  if (width < RECOMMENDED_LOGO.width || height < RECOMMENDED_LOGO.height) {
    return { status: "small" };
  }

  const ratio = width / height;
  if (ratio < 2 || ratio > 6) {
    return { status: "ratio" };
  }

  return { status: "good" };
};
