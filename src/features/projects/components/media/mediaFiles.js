import { API_URL } from "@config";

export const DRAWING_ACCEPT = ".svg,.png,.jpg,.jpeg,.pdf";
export const DRAWING_MAX_BYTES = 50 * 1024 * 1024;
export const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

const DRAWING_EXTENSIONS = ["svg", "png", "jpg", "jpeg", "pdf"];
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export function fileExtension(filename = "") {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function validateDrawingFile(file) {
  const ext = fileExtension(file.name);
  if (!DRAWING_EXTENSIONS.includes(ext)) {
    return { ok: false, reason: "type" };
  }
  if (file.size > DRAWING_MAX_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

export function validatePhotoFile(file) {
  const ext = fileExtension(file.name);
  if (!PHOTO_EXTENSIONS.includes(ext)) {
    return { ok: false, reason: "type" };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

const ORIGIN = String(API_URL || "")
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function drawingTypeLabel(type) {
  return String(type || "").toUpperCase();
}
