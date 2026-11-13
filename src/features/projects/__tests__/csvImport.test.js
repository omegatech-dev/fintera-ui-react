import { describe, expect, it } from "vitest";

import { analyzeCsv, normalizeHeader, parseCsvRows } from "../csvImport";

describe("csvImport", () => {
  it("normalizes headers with BOM, accents, spaces and dashes", () => {
    expect(normalizeHeader("\uFEFFCódigo")).toBe("codigo");
    expect(normalizeHeader("  Fecha de Entrega ")).toBe("fecha_de_entrega");
    expect(normalizeHeader("price-per-square-unit")).toBe("price_per_square_unit");
  });

  it("parses quoted commas, escaped quotes and multiline fields", () => {
    const rows = parseCsvRows(
      '\uFEFFnombre,descripcion\n"Altos, Norte","Primera línea\nSegunda ""línea"""\n'
    );

    expect(rows).toEqual([
      ["nombre", "descripcion"],
      ["Altos, Norte", 'Primera línea\nSegunda "línea"'],
    ]);
  });

  it("maps canonical headers and aliases and counts non-empty rows", () => {
    const analysis = analyzeCsv(
      "\uFEFFnombre,codigo,direccion,precio_m2,foo\n" +
        "Altos,ALT-1,Calle 1,1500,x\n" +
        "Bosques,ALT-2,Calle 2,1800,y\n" +
        "\n"
    );

    expect(analysis.rowCount).toBe(2);
    expect(analysis.missingRequired).toEqual([]);
    expect(analysis.mapping.map(({ field }) => field?.key)).toEqual([
      "name",
      "code",
      "address",
      "price_per_square_unit",
      undefined,
    ]);
    expect(analysis.mapping[0].field.required).toBe(true);
  });

  it("reports missing required columns", () => {
    const analysis = analyzeCsv("nombre,codigo\nAltos,ALT-1\n");

    expect(analysis.missingRequired.map(({ key }) => key)).toEqual([
      "address",
      "price_per_square_unit",
    ]);
  });

  it("rejects an empty CSV", () => {
    expect(() => analyzeCsv("\uFEFF\n")).toThrow("empty-csv");
  });
});
