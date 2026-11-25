export const TARGET_FIELDS = [
  {
    key: "name",
    labelKey: "name",
    required: true,
    aliases: ["nombre", "proyecto", "project", "project_name", "nombre_proyecto"],
  },
  {
    key: "code",
    labelKey: "code",
    aliases: ["codigo", "clave", "project_code", "codigo_proyecto"],
  },
  {
    key: "guid",
    labelKey: "guid",
    aliases: ["id_publico", "public_id"],
  },
  {
    key: "address",
    labelKey: "address",
    required: true,
    aliases: ["direccion", "ubicacion", "location"],
  },
  {
    key: "city",
    labelKey: "city",
    aliases: ["ciudad", "zona", "zone", "municipio"],
  },
  {
    key: "price_per_square_unit",
    labelKey: "pricePerUnit",
    required: true,
    aliases: [
      "precio",
      "precio_m2",
      "precio_por_m2",
      "precio_por_metro_cuadrado",
      "precio_unidad",
      "precio_por_unidad",
      "price_per_unit",
    ],
  },
  {
    key: "lot_count",
    labelKey: "lotsCount",
    aliases: [
      "lotes",
      "lots",
      "lots_count",
      "cantidad_de_lotes",
      "cantidad_lotes",
      "numero_de_lotes",
      "num_lotes",
      "total_lotes",
    ],
  },
  {
    key: "measurement_unit",
    labelKey: "measurementUnit",
    aliases: ["unidad", "unidad_medida", "unidad_de_medida"],
  },
  {
    key: "project_type",
    labelKey: "projectType",
    aliases: ["tipo", "tipo_proyecto", "tipo_de_proyecto"],
  },
  {
    key: "delivery_date",
    labelKey: "deliveryDate",
    aliases: ["entrega", "fecha", "fecha_entrega", "fecha_de_entrega"],
  },
  {
    key: "description",
    labelKey: "description",
    aliases: ["descripcion", "detalles", "notas"],
  },
  {
    key: "interest_rate",
    labelKey: "interestRate",
    aliases: ["tasa_interes", "tasa_de_interes", "interes", "tasa"],
  },
  {
    key: "commission_rate",
    labelKey: "commissionRate",
    aliases: ["comision", "tasa_comision"],
  },
  {
    key: "commission_rate_direct",
    labelKey: "commissionRateDirect",
    aliases: ["comision_directa", "comision_directo", "comision_venta_directa"],
  },
  {
    key: "commission_rate_bank",
    labelKey: "commissionRateBank",
    aliases: ["comision_banco", "comision_bancaria"],
  },
  {
    key: "commission_rate_cash",
    labelKey: "commissionRateCash",
    aliases: ["comision_contado", "comision_efectivo"],
  },
];

export const REQUIRED_FIELDS = TARGET_FIELDS.filter((field) => field.required);

const FIELDS_BY_KEY = new Map(TARGET_FIELDS.map((field) => [field.key, field]));

// Keep these headers aligned with ProjectCSVCanonicalHeaders in FinteraAPI.
// Every header is an alias accepted by both parsers.
export const TEMPLATE_HEADERS = {
  es: [
    "nombre",
    "codigo",
    "direccion",
    "ciudad",
    "precio_m2",
    "lotes",
    "unidad",
    "tipo",
    "fecha_entrega",
    "descripcion",
    "tasa_interes",
    "comision_directa",
    "comision_banco",
    "comision_contado",
  ],
  en: [
    "name",
    "code",
    "address",
    "city",
    "price_per_square_unit",
    "lot_count",
    "measurement_unit",
    "project_type",
    "delivery_date",
    "description",
    "interest_rate",
    "commission_rate_direct",
    "commission_rate_bank",
    "commission_rate_cash",
  ],
};

const TEMPLATE_SAMPLE = {
  es: [
    "Proyecto Ejemplo",
    "EJ-001",
    "Calle 50, Ciudad de Panamá",
    "Ciudad de Panamá",
    "1200",
    "10",
    "m2",
    "residential",
    "2027-06-30",
    "Proyecto de ejemplo; reemplaza o elimina esta fila.",
    "0",
    "0",
    "0",
    "0",
  ],
  en: [
    "Example Project",
    "EX-001",
    "50th Street, Panama City",
    "Panama City",
    "1200",
    "10",
    "m2",
    "residential",
    "2027-06-30",
    "Example project; replace or delete this row.",
    "0",
    "0",
    "0",
    "0",
  ],
};

const MEASUREMENT_UNITS = new Set([
  "",
  "m2",
  "m²",
  "ft2",
  "ft²",
  "vara2",
  "varas2",
  "varas²",
]);

const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
const INTEGER_PATTERN = /^[+-]?\d+$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function normalizeHeader(header) {
  return String(header ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

const FIELD_BY_HEADER = new Map();
TARGET_FIELDS.forEach((field) => {
  FIELD_BY_HEADER.set(field.key, field);
  field.aliases.forEach((alias) => FIELD_BY_HEADER.set(normalizeHeader(alias), field));
});

export function parseCsvRows(text, delimiter = ",") {
  const source = String(text ?? "").replace(/^\uFEFF/, "");
  const separator = delimiter || ",";
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  const pushValue = () => {
    row.push(value);
    value = "";
  };
  const pushRow = () => {
    pushValue();
    rows.push(row);
    row = [];
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === '"') {
      if (quoted && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === separator) {
      pushValue();
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && source[index + 1] === "\n") {
        index += 1;
      }
      pushRow();
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows;
}

export function detectCsvDelimiter(text) {
  const candidates = [",", ";"].map((delimiter) => {
    const rows = parseCsvRows(text, delimiter);
    const headers = (rows[0] ?? []).map((header) => header.trim());
    const mapped = headers.filter((header) =>
      FIELD_BY_HEADER.has(normalizeHeader(header))
    ).length;
    return { delimiter, rows, mapped };
  });

  return candidates.reduce(
    (best, candidate) => (candidate.mapped > best.mapped ? candidate : best),
    candidates[0]
  );
}

const parseNumber = (value) => {
  const text = String(value ?? "").trim().replace(/%$/, "").trim();
  if (!NUMBER_PATTERN.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

const parseInteger = (value) => {
  const text = String(value ?? "").trim();
  if (!INTEGER_PATTERN.test(text)) return null;
  const number = Number(text);
  return Number.isSafeInteger(number) ? number : null;
};

// Keep these patterns aligned with the delivery date parser in FinteraAPI.
const CALENDAR_DATE_PATTERN = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
const YEAR_FIRST_DATE_PATTERN = /^(\d{4})[/-](\d{2})[/-](\d{2})$/;

const isValidUtcDate = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const pad2 = (value) => String(value).padStart(2, "0");

// Accepts YYYY-MM-DD plus the calendar formats the API parser accepts
// (DD/MM/YYYY, M/D/YYYY, DD-MM-YYYY, YYYY/MM/DD). Ambiguous day/month
// pairs read day-first, and a component over 12 forces the only possible
// reading. Returns the ISO YYYY-MM-DD string, or null when invalid.
export const normalizeDeliveryDate = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const iso = DATE_PATTERN.exec(text);
  if (iso) {
    const [, year, month, day] = iso;
    return isValidUtcDate(Number(year), Number(month), Number(day))
      ? text
      : null;
  }

  const yearFirst = YEAR_FIRST_DATE_PATTERN.exec(text);
  if (yearFirst) {
    const [, year, month, day] = yearFirst;
    return isValidUtcDate(Number(year), Number(month), Number(day))
      ? `${year}-${pad2(month)}-${pad2(day)}`
      : null;
  }

  const calendar = CALENDAR_DATE_PATTERN.exec(text);
  if (!calendar) return null;

  const [, first, second, year] = calendar;
  const a = Number(first);
  const b = Number(second);
  let day = a;
  let month = b;
  if (a <= 12 && b > 12) {
    day = b;
    month = a;
  }

  return isValidUtcDate(Number(year), month, day)
    ? `${year}-${pad2(month)}-${pad2(day)}`
    : null;
};

const issue = (code, reasonKey, field) => ({ code, reasonKey, field });

const validateRow = (cells, mapping) => {
  const indexes = new Map();
  mapping.forEach(({ field }, index) => {
    if (field) indexes.set(field.key, index);
  });

  const value = (key) => {
    const index = indexes.get(key);
    if (index === undefined) return "";
    return String(cells[index] ?? "").trim();
  };
  const has = (key) => indexes.has(key);

  const issues = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (has(field.key) && value(field.key) === "") {
      issues.push(issue("required", "projectsPage.rowIssueRequired", field));
    }
  });

  if (has("price_per_square_unit") && value("price_per_square_unit") !== "") {
    const price = parseNumber(value("price_per_square_unit"));
    if (price === null) {
      issues.push(
        issue("number", "projectsPage.rowIssueNumber", FIELDS_BY_KEY.get("price_per_square_unit"))
      );
    } else if (price < 0) {
      issues.push(
        issue("negative", "projectsPage.rowIssueNegative", FIELDS_BY_KEY.get("price_per_square_unit"))
      );
    }
  }

  if (has("lot_count") && value("lot_count") !== "") {
    const lots = parseInteger(value("lot_count"));
    if (lots === null) {
      issues.push(
        issue("integer", "projectsPage.rowIssueInteger", FIELDS_BY_KEY.get("lot_count"))
      );
    } else if (lots < 0) {
      issues.push(
        issue("negative", "projectsPage.rowIssueNegative", FIELDS_BY_KEY.get("lot_count"))
      );
    }
  }

  if (has("delivery_date") && value("delivery_date") !== "") {
    if (normalizeDeliveryDate(value("delivery_date")) === null) {
      issues.push(
        issue("date", "projectsPage.rowIssueDate", FIELDS_BY_KEY.get("delivery_date"))
      );
    }
  }

  if (has("measurement_unit") && value("measurement_unit") !== "") {
    if (!MEASUREMENT_UNITS.has(value("measurement_unit").toLowerCase())) {
      issues.push(
        issue("unit", "projectsPage.rowIssueUnit", FIELDS_BY_KEY.get("measurement_unit"))
      );
    }
  }

  [
    "interest_rate",
    "commission_rate",
    "commission_rate_direct",
    "commission_rate_bank",
    "commission_rate_cash",
  ].forEach((key) => {
    if (!has(key) || value(key) === "") return;
    const rate = parseNumber(value(key));
    if (rate === null) {
      issues.push(issue("number", "projectsPage.rowIssueNumber", FIELDS_BY_KEY.get(key)));
    } else if (rate < 0) {
      issues.push(issue("negative", "projectsPage.rowIssueNegative", FIELDS_BY_KEY.get(key)));
    }
  });

  return issues;
};

export function analyzeCsv(text, { delimiter } = {}) {
  const detected = delimiter
    ? { delimiter, rows: parseCsvRows(text, delimiter) }
    : detectCsvDelimiter(text);
  const { rows } = detected;
  const headers = (rows[0] ?? []).map((header) => header.trim());

  if (!headers.some(Boolean)) {
    throw new Error("empty-csv");
  }

  const mapping = headers.map((header) => ({
    header,
    field: FIELD_BY_HEADER.get(normalizeHeader(header)) ?? null,
  }));

  const mappedKeys = new Set(
    mapping.filter(({ field }) => field).map(({ field }) => field.key)
  );
  const missingRequired = REQUIRED_FIELDS.filter(
    (field) => !mappedKeys.has(field.key)
  );

  const mappedIndexes = mapping
    .map(({ field }, index) => (field ? index : -1))
    .filter((index) => index >= 0);

  const dataRows = rows
    .slice(1)
    .map((cells, index) => ({ cells, row: index + 2 }))
    .filter(({ cells }) => cells.some((cell) => cell.trim().length > 0))
    .filter(({ cells }) =>
      mappedIndexes.some((index) => String(cells[index] ?? "").trim().length > 0)
    );

  const rowIssues = [];
  dataRows.forEach(({ cells, row }) => {
    const issues = missingRequired.length > 0 ? [] : validateRow(cells, mapping);
    if (issues.length > 0) rowIssues.push({ row, issues });
  });

  return {
    delimiter: detected.delimiter,
    mapping,
    rowCount: dataRows.length,
    validRowCount: dataRows.length - rowIssues.length,
    rowIssues,
    missingRequired,
  };
}

export const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const toCsv = (rows) =>
  rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

export function buildProjectTemplate(locale = "es") {
  const language = TEMPLATE_HEADERS[locale] ? locale : "es";
  return `\uFEFF${toCsv([
    TEMPLATE_HEADERS[language],
    TEMPLATE_SAMPLE[language],
  ])}\n`;
}

const downloadTextFile = (filename, content) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadProjectTemplate = (locale = "es") => {
  downloadTextFile(
    locale === "en" ? "projects-template.csv" : "plantilla-proyectos.csv",
    buildProjectTemplate(locale)
  );
};

export const downloadProjectRowErrors = (errors, locale = "es") => {
  const rows = [
    locale === "en" ? ["row", "reason"] : ["fila", "motivo"],
    ...errors.map((error) => [error.row, error.message]),
  ];
  downloadTextFile(
    locale === "en"
      ? "project-import-errors.csv"
      : "errores-importacion-proyectos.csv",
    `\uFEFF${toCsv(rows)}\n`
  );
};

const readFileBuffer = (file) => {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export async function readCsvText(file) {
  if (typeof TextDecoder === "undefined") {
    return { text: await file.text(), encoding: "utf-8" };
  }

  const buffer = await readFileBuffer(file);
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let text = new TextDecoder("utf-8").decode(bytes);
  let encoding = "utf-8";

  if (text.includes("\uFFFD")) {
    try {
      text = new TextDecoder("windows-1252").decode(bytes);
      encoding = "windows-1252";
    } catch {
      // Keep the UTF-8 decoding when the legacy decoder is unavailable.
    }
  }

  return { text, encoding };
}

const deliveryDateColumnIndex = (rows) => {
  const headers = rows[0] ?? [];
  const field = FIELDS_BY_KEY.get("delivery_date");
  return headers.findIndex(
    (header) => FIELD_BY_HEADER.get(normalizeHeader(header)) === field
  );
};

const normalizeDeliveryDateCells = (rows) => {
  const index = deliveryDateColumnIndex(rows);
  if (index < 0) return rows;
  return rows.map((cells, rowIndex) => {
    if (rowIndex === 0) return cells;
    const cell = String(cells[index] ?? "").trim();
    if (!cell) return cells;
    const normalized = normalizeDeliveryDate(cell);
    if (normalized === null || normalized === cell) return cells;
    const next = [...cells];
    next[index] = normalized;
    return next;
  });
};

export function normalizeCsvFile(file, text, delimiter) {
  const rows = normalizeDeliveryDateCells(parseCsvRows(text, delimiter));
  const content = `\uFEFF${toCsv(rows)}\n`;
  return new File([content], file.name, { type: "text/csv" });
}

export const isCsvFile = (file) => {
  if (!file) return false;
  return /\.csv$/i.test(file.name) || file.type === "text/csv";
};
