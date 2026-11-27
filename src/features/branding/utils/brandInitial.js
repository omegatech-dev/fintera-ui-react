/**
 * First letter of the application name, used by monograms and favicons.
 * `Array.from` keeps surrogate pairs (emoji, non-BMP characters) from
 * splitting, and the fallback keeps the design's "F" for empty names.
 */
export function brandInitial(appName) {
  return Array.from((appName || "").trim())[0]?.toUpperCase() || "F";
}
