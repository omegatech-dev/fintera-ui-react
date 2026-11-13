export const TABS = [
  { value: "clientes", path: "/vendedor/clientes" },
  { value: "cobros", path: "/vendedor/cobros" },
  { value: "comisiones", path: "/vendedor/comisiones" },
  { value: "documentos", path: "/vendedor/documentos" },
];

export const tabFromPath = (pathname) =>
  TABS.find((tab) => pathname.startsWith(tab.path))?.value || "clientes";

export const ACTIVE_STATUSES = ["approved", "signed", "closed"];

export const STATUS_TONES = {
  approved: "success",
  signed: "success",
  closed: "neutral",
  submitted: "info",
  pending: "warning",
  rejected: "danger",
  cancelled: "neutral",
};

export const PER_PAGE = 20;

export const SEARCH_KEYS = {
  clientes: "seller.searchClients",
  cobros: "seller.searchCollections",
  comisiones: "seller.searchCommissions",
  documentos: "seller.searchDocuments",
};

export const GET_ROW_KEY = (row, tab) =>
  tab === "comisiones"
    ? `commission-${row.historical_sale_id || row.contract_id}-${row.seller || row.date || ""}`
    : row.key || row.guid || row.id;
