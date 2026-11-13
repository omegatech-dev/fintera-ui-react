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

export function parseCsvRows(text) {
  const source = String(text ?? "").replace(/^\uFEFF/, "");
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

    if (!quoted && char === ",") {
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

export function analyzeCsv(text) {
  const rows = parseCsvRows(text);
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

  const rowCount = rows
    .slice(1)
    .filter((cells) => cells.some((cell) => cell.trim().length > 0)).length;

  return {
    mapping,
    rowCount,
    missingRequired,
  };
}
