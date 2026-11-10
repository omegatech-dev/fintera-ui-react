/**
 * Unit labels for lot measurements. The API stores the area unit as one of
 * `m2`, `ft2` or `vara2`; dimensions use the corresponding linear unit.
 */

const AREA_LABELS = {
  m2: "m²",
  ft2: "ft²",
  vara2: "varas²",
  varas2: "varas²",
};

const LINEAR_LABELS = {
  m2: "m",
  ft2: "ft",
  vara2: "varas",
  varas2: "varas",
};

export function normalizeMeasurementUnit(unit) {
  const normalized = String(unit || "").trim().toLowerCase();
  if (normalized === "" || normalized === "m²") return "m2";
  if (normalized === "ft²") return "ft2";
  if (normalized === "varas²" || normalized === "varas2") return "vara2";
  return normalized;
}

/** Area unit label: m², ft² or varas². */
export function areaUnitLabel(unit) {
  return AREA_LABELS[normalizeMeasurementUnit(unit)] || "m²";
}

/** Linear unit label: m, ft or varas. */
export function linearUnitLabel(unit) {
  return LINEAR_LABELS[normalizeMeasurementUnit(unit)] || "m";
}
