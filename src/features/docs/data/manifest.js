export const SECTIONS = [
  {
    id: "getting-started",
    order: 1,
    title: { en: "Getting started", es: "Primeros pasos" },
  },
  {
    id: "projects-lots",
    order: 2,
    title: { en: "Projects & lots", es: "Proyectos y lotes" },
  },
  {
    id: "contracts",
    order: 3,
    title: { en: "Sales & contracts", es: "Ventas y contratos" },
  },
  {
    id: "payments",
    order: 4,
    title: { en: "Payments", es: "Pagos" },
  },
  {
    id: "customers-credit",
    order: 5,
    title: { en: "Customers & credit", es: "Clientes y crédito" },
  },
  {
    id: "reports",
    order: 6,
    title: { en: "Reports & analytics", es: "Reportes y analítica" },
  },
  {
    id: "administration",
    order: 7,
    title: { en: "Administration", es: "Administración" },
  },
  {
    id: "glossary",
    order: 8,
    title: { en: "Glossary", es: "Glosario" },
  },
];

// `audience` controls which staff role can read an article. Admins see every
// article; sellers only see articles that include `seller`.
export const ARTICLES = [
  {
    slug: "overview-and-roles",
    section: "getting-started",
    order: 1,
    audience: ["admin", "seller"],
    title: { en: "System overview and roles", es: "Descripción general y roles" },
  },
  {
    slug: "projects-and-pricing",
    section: "projects-lots",
    order: 2,
    audience: ["admin", "seller"],
    title: {
      en: "Projects, pricing, and measurement units",
      es: "Proyectos, precios y unidades de medida",
    },
  },
  {
    slug: "lots-and-statuses",
    section: "projects-lots",
    order: 3,
    audience: ["admin", "seller"],
    title: { en: "Lots and their statuses", es: "Lotes y sus estados" },
  },
  {
    slug: "managing-projects",
    section: "projects-lots",
    order: 4,
    audience: ["admin"],
    title: {
      en: "Creating and managing projects and lots",
      es: "Crear y administrar proyectos y lotes",
    },
  },
  {
    slug: "financing-types",
    section: "contracts",
    order: 5,
    audience: ["admin", "seller"],
    title: {
      en: "Financing types: direct, bank, and cash",
      es: "Tipos de financiamiento: directo, banco y efectivo",
    },
  },
  {
    slug: "reservations-and-holds",
    section: "contracts",
    order: 6,
    audience: ["admin", "seller"],
    title: {
      en: "Reservations, down payments, and holds",
      es: "Reservas, pago inicial y retenciones",
    },
  },
  {
    slug: "contract-lifecycle",
    section: "contracts",
    order: 7,
    audience: ["admin", "seller"],
    title: { en: "Contract lifecycle and statuses", es: "Ciclo de vida y estados del contrato" },
  },
  {
    slug: "approving-contracts",
    section: "contracts",
    order: 8,
    audience: ["admin"],
    title: {
      en: "Approving, rejecting, and reopening contracts",
      es: "Aprobar, rechazar y reabrir contratos",
    },
  },
  {
    slug: "payment-types-and-statuses",
    section: "payments",
    order: 9,
    audience: ["admin", "seller"],
    title: { en: "Payment types and statuses", es: "Tipos y estados de pago" },
  },
  {
    slug: "payment-schedule",
    section: "payments",
    order: 10,
    audience: ["admin", "seller"],
    title: {
      en: "How the payment schedule is generated",
      es: "Cómo se genera el calendario de pagos",
    },
  },
  {
    slug: "receipts",
    section: "payments",
    order: 11,
    audience: ["admin", "seller"],
    title: {
      en: "Uploading and reviewing payment receipts",
      es: "Subir y revisar comprobantes de pago",
    },
  },
  {
    slug: "approving-payments",
    section: "payments",
    order: 12,
    audience: ["admin"],
    title: {
      en: "Approving, rejecting, and undoing payments",
      es: "Aprobar, rechazar y deshacer pagos",
    },
  },
  {
    slug: "overdue-interest",
    section: "payments",
    order: 13,
    audience: ["admin", "seller"],
    title: { en: "Overdue (moratory) interest", es: "Interés por mora" },
  },
  {
    slug: "capital-repayments",
    section: "payments",
    order: 14,
    audience: ["admin", "seller"],
    title: { en: "Capital repayments and readjustments", es: "Abonos a capital y reajustes" },
  },
  {
    slug: "customers-and-credit-score",
    section: "customers-credit",
    order: 15,
    audience: ["admin", "seller"],
    title: { en: "Customers and credit score", es: "Clientes y puntaje de crédito" },
  },
  {
    slug: "reports-and-analytics",
    section: "reports",
    order: 16,
    audience: ["admin", "seller"],
    title: { en: "Reports and analytics", es: "Reportes y analítica" },
  },
  {
    slug: "users-management",
    section: "administration",
    order: 17,
    audience: ["admin", "seller"],
    title: { en: "Users and roles", es: "Usuarios y roles" },
  },
  {
    slug: "settings-and-branding",
    section: "administration",
    order: 18,
    audience: ["admin"],
    title: { en: "General settings and branding", es: "Configuración general e identidad de marca" },
  },
  {
    slug: "glossary",
    section: "glossary",
    order: 19,
    audience: ["admin", "seller"],
    title: { en: "Glossary", es: "Glosario" },
  },
];
