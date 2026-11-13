export const TEMPLATE_HEADERS = [
  "nombre",
  "identidad",
  "proyecto",
  "lote",
  "area_m2",
  "precio",
  "fecha_venta",
  "telefono",
  "email",
  "forma_pago",
  "estado_venta",
];

const TEMPLATE_SAMPLE = [
  "María López",
  "0801-1990-12345",
  "Residencial Los Pinos",
  "Lote 12",
  "500",
  "750000",
  "2023-05-15",
  "9999-8888",
  "maria@example.com",
  "financiado",
  "en_cuotas",
];

export const CSV_FIELDS = [
  {
    key: "full_name",
    labelKey: "historical.fullName",
    required: true,
    aliases: [
      "nombre",
      "nombre completo",
      "nombre_completo",
      "cliente",
      "client",
      "name",
      "full_name",
    ],
  },
  {
    key: "identity",
    labelKey: "historical.identity",
    required: true,
    aliases: ["identidad", "dni", "identity", "cedula", "documento"],
  },
  {
    key: "project_name",
    labelKey: "historical.project",
    aliases: ["proyecto", "project", "project_name"],
  },
  {
    key: "sale_price",
    labelKey: "historical.salePrice",
    required: true,
    aliases: [
      "precio",
      "precio de venta",
      "precio_venta",
      "sale_price",
      "monto",
      "valor",
      "amount",
    ],
  },
  {
    key: "sale_date",
    labelKey: "historical.saleDate",
    required: true,
    aliases: ["fecha_venta", "fecha de venta", "fecha", "sale_date", "date"],
  },
];

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  while (
    rows.length > 0 &&
    !rows[rows.length - 1].some((cell) => String(cell).trim() !== "")
  ) {
    rows.pop();
  }

  return rows;
}

export function suggestMapping(headers) {
  const normalized = headers.map(normalizeText);
  return CSV_FIELDS.reduce((mapping, field) => {
    const index = normalized.findIndex((header) =>
      field.aliases.includes(header)
    );
    return { ...mapping, [field.key]: index >= 0 ? String(index) : "" };
  }, {});
}

const downloadCsv = (filename, content) => {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadHistoricalTemplate = () => {
  const content = [TEMPLATE_HEADERS, TEMPLATE_SAMPLE]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  downloadCsv("plantilla-clientes-historicos.csv", content);
};

export const readText = (file) =>
  typeof file.text === "function"
    ? file.text()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = reject;
        reader.readAsText(file);
      });

export const parseAmount = (value) => {
  const clean = String(value ?? "")
    .replace(/[^\d.,-]/g, "")
    .replace(/,/g, "");
  const amount = Number(clean);
  return Number.isFinite(amount) ? amount : null;
};

export const parseDate = (value) => {
  if (!String(value ?? "").trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
