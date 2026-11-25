import { describe, expect, it } from "vitest";

import {
  TEMPLATE_HEADERS,
  analyzeCsv,
  buildProjectTemplate,
  detectCsvDelimiter,
  isCsvFile,
  normalizeCsvFile,
  normalizeDeliveryDate,
  normalizeHeader,
  parseCsvRows,
  readCsvText,
} from "../csvImport";

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

  it("parses semicolon-delimited files", () => {
    expect(
      parseCsvRows('nombre;direccion\n"Altos, Norte";Calle 1\n', ";")
    ).toEqual([
      ["nombre", "direccion"],
      ["Altos, Norte", "Calle 1"],
    ]);
  });

  it("detects the delimiter from the mapped headers", () => {
    expect(
      detectCsvDelimiter("nombre;direccion;precio_m2\nAltos;Calle 1;1500\n")
        .delimiter
    ).toBe(";");
    expect(
      detectCsvDelimiter("nombre,direccion,precio_m2\nAltos,Calle 1,1500\n")
        .delimiter
    ).toBe(",");
  });

  it("maps canonical headers and aliases and counts mapped rows", () => {
    const analysis = analyzeCsv(
      "\uFEFFnombre,codigo,direccion,precio_m2,foo\n" +
        "Altos,ALT-1,Calle 1,1500,x\n" +
        "Bosques,ALT-2,Calle 2,1800,y\n" +
        "\n"
    );

    expect(analysis.rowCount).toBe(2);
    expect(analysis.validRowCount).toBe(2);
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

  it("ignores rows whose only values are in unmapped columns", () => {
    const analysis = analyzeCsv("nombre,foo\n,bar\nAltos,x\n");

    expect(analysis.rowCount).toBe(1);
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

  it("builds a Spanish template that the preview accepts", () => {
    const template = buildProjectTemplate("es");
    const rows = parseCsvRows(template);
    const analysis = analyzeCsv(template);

    expect(template.startsWith("\uFEFF")).toBe(true);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(TEMPLATE_HEADERS.es);
    expect(template).toContain('"Calle 50, Ciudad de Panamá"');
    expect(analysis.missingRequired).toEqual([]);
    expect(analysis.rowCount).toBe(1);
    expect(analysis.validRowCount).toBe(1);
    expect(analysis.rowIssues).toEqual([]);
  });

  it("builds an English template that the preview accepts", () => {
    const template = buildProjectTemplate("en");
    const rows = parseCsvRows(template);
    const analysis = analyzeCsv(template);

    expect(rows[0]).toEqual(TEMPLATE_HEADERS.en);
    expect(analysis.missingRequired).toEqual([]);
    expect(analysis.rowCount).toBe(1);
    expect(analysis.validRowCount).toBe(1);
  });

  it("validates required values and formats per row", () => {
    const analysis = analyzeCsv(
      "nombre,direccion,precio_m2,lotes,fecha_entrega,unidad,tasa_interes\n" +
        "Altos,Calle 1,abc,1.5,2027-02-30,metros,-1\n" +
        "Bosques,Calle 2,,\n"
    );

    expect(analysis.rowCount).toBe(2);
    expect(analysis.validRowCount).toBe(0);
    expect(analysis.rowIssues).toHaveLength(2);
    expect(analysis.rowIssues[0].row).toBe(2);
    expect(analysis.rowIssues[0].issues.map(({ code }) => code)).toEqual([
      "number",
      "integer",
      "date",
      "unit",
      "negative",
    ]);
    expect(analysis.rowIssues[1].issues.map(({ code }) => code)).toEqual([
      "required",
    ]);
  });

  it("normalizes delivery dates in every accepted format", () => {
    expect(normalizeDeliveryDate("2027-06-30")).toBe("2027-06-30");
    expect(normalizeDeliveryDate("30/06/2027")).toBe("2027-06-30");
    expect(normalizeDeliveryDate("6/30/2027")).toBe("2027-06-30");
    expect(normalizeDeliveryDate("05/06/2027")).toBe("2027-06-05");
    expect(normalizeDeliveryDate("30-06-2027")).toBe("2027-06-30");
    expect(normalizeDeliveryDate("2027/06/30")).toBe("2027-06-30");
  });

  it("rejects invalid delivery dates", () => {
    expect(normalizeDeliveryDate("31/02/2027")).toBeNull();
    expect(normalizeDeliveryDate("13/13/2027")).toBeNull();
    expect(normalizeDeliveryDate("6/30/27")).toBeNull();
    expect(normalizeDeliveryDate("no es fecha")).toBeNull();
    expect(normalizeDeliveryDate("")).toBeNull();
    expect(normalizeDeliveryDate("2027-02-30")).toBeNull();
  });

  it("accepts rows whose delivery date uses an alternate format", () => {
    const analysis = analyzeCsv(
      "nombre,direccion,precio_m2,fecha_entrega\n" +
        "Altos,Calle 1,1500,30/06/2027\n" +
        "Bosques,Calle 2,1800,6/30/2027\n"
    );

    expect(analysis.rowCount).toBe(2);
    expect(analysis.validRowCount).toBe(2);
    expect(analysis.rowIssues).toEqual([]);
  });

  it("rewrites delivery dates to ISO in the normalized upload file", async () => {
    const file = new File(
      [
        "nombre,direccion,precio_m2,fecha_entrega\n" +
          "Altos,Calle 1,1500,6/30/2027\n" +
          "Bosques,Calle 2,1800,30/06/2027\n",
      ],
      "projects.csv"
    );

    const normalized = normalizeCsvFile(file, await file.text(), ",");
    const content = await normalized.text();

    expect(content).toContain("2027-06-30");
    expect(content).not.toContain("6/30/2027");
    expect(content).not.toContain("30/06/2027");
  });

  it("decodes Windows-1252 files", async () => {
    const source = "nombre,ciudad\nAltos,Panam\u00e1\n";
    const bytes = Uint8Array.from(source, (char) => char.charCodeAt(0) & 0xff);
    const file = new File([bytes], "legacy.csv", { type: "text/csv" });

    const { text, encoding } = await readCsvText(file);

    expect(encoding).toBe("windows-1252");
    expect(text).toContain("Panamá");
  });

  it("normalizes delimited files for upload", async () => {
    const file = new File(
      ["nombre;direccion;precio_m2\nAltos, Norte;Calle 1;1500\n"],
      "projects.csv"
    );

    const normalized = normalizeCsvFile(
      file,
      await file.text(),
      ";"
    );
    const content = await normalized.text();

    expect(normalized.name).toBe("projects.csv");
    expect(content).toContain("nombre,direccion,precio_m2");
    expect(content).toContain('"Altos, Norte",Calle 1,1500');
  });

  it("checks the file extension and MIME type", () => {
    expect(isCsvFile(new File(["a"], "projects.csv"))).toBe(true);
    expect(
      isCsvFile(new File(["a"], "projects", { type: "text/csv" }))
    ).toBe(true);
    expect(isCsvFile(new File(["a"], "notes.txt", { type: "text/plain" }))).toBe(
      false
    );
  });
});
