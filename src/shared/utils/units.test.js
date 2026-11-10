// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  areaUnitLabel,
  linearUnitLabel,
  normalizeMeasurementUnit,
} from "./units";

describe("measurement unit labels", () => {
  it("normalizes supported aliases", () => {
    expect(normalizeMeasurementUnit("")).toBe("m2");
    expect(normalizeMeasurementUnit("m²")).toBe("m2");
    expect(normalizeMeasurementUnit("ft²")).toBe("ft2");
    expect(normalizeMeasurementUnit("varas2")).toBe("vara2");
    expect(normalizeMeasurementUnit("varas²")).toBe("vara2");
  });

  it("returns area labels", () => {
    expect(areaUnitLabel("m2")).toBe("m²");
    expect(areaUnitLabel("ft2")).toBe("ft²");
    expect(areaUnitLabel("vara2")).toBe("varas²");
    expect(areaUnitLabel(undefined)).toBe("m²");
  });

  it("returns linear labels", () => {
    expect(linearUnitLabel("m2")).toBe("m");
    expect(linearUnitLabel("ft2")).toBe("ft");
    expect(linearUnitLabel("vara2")).toBe("varas");
    expect(linearUnitLabel(undefined)).toBe("m");
  });
});
