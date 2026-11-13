export const CHORD_TIMEOUT_MS = 1200;

const TYPING_TAGS = new Set(["input", "textarea", "select"]);

export function isTypingTarget(target) {
  if (!target || typeof target !== "object") return false;
  if (target.isContentEditable) return true;
  return TYPING_TAGS.has(String(target.tagName || "").toLowerCase());
}

export function formatChord(keys = []) {
  return keys.join(" ");
}

export function hasOpenModal() {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector('[aria-modal="true"]'));
}
