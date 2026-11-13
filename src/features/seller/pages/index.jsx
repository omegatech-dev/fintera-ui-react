import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { sellerApi } from "../api";
import { commissionsApi } from "@/features/commissions/api";
import { contractsApi } from "@/features/contracts/api";
import { paymentsApi } from "@/features/payments/api";
import { reportsApi } from "@/shared/api/reports";
import { formatStatus } from "@/shared/utils/formatStatus";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Tabs,
} from "@/shared/ui";
import {
  ACTIVE_STATUSES,
  GET_ROW_KEY,
  PER_PAGE,
  SEARCH_KEYS,
  STATUS_TONES,
  TABS,
  tabFromPath,
} from "../config";
import {
  formatDate,
  formatRate,
  isPaymentOverdue,
  money,
  nextPaymentOf,
  paymentTypeLabel,
} from "../utils/format";
import SellerKpis from "../components/SellerKpis";
import WorkspaceTableCard from "../components/WorkspaceTableCard";
import RegisterCollectionDialog from "../components/RegisterCollectionDialog";
import MobileCard from "../components/MobileCard";

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const monthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
};

const matchesSearch = (term, values) =>
  !term ||
  values.some(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      String(value).toLowerCase().includes(term)
  );

function SellerWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const tab = tabFromPath(location.pathname);
  const { showToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [collecting, setCollecting] = useState(null);
  const [collectTarget, setCollectTarget] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingStatement, setDownloadingStatement] = useState(null);
  const [submitted, setSubmitted] = useState(() => new Set());
  const [stats, setStats] = useState({ pending: 0, overdue: 0, collected: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [commissionsError, setCommissionsError] = useState(false);

  const loadContracts = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      const data = await sellerApi.contracts();
      setContracts(data?.contracts || []);
    } catch {
      setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await paymentsApi.getStats();
      setStats({
        pending: data?.pending_this_month || 0,
        overdue: data?.total_overdue || 0,
        collected: data?.collected_this_month || 0,
      });
    } catch {
      setStats({ pending: 0, overdue: 0, collected: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCommissions = async () => {
    setCommissionsLoading(true);
    setCommissionsError(false);
    try {
      const data = await commissionsApi.list(monthStart(), monthEnd());
      setCommissions(data?.commissions || []);
    } catch {
      setCommissionsError(true);
    } finally {
      setCommissionsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    loadStats();
    loadCommissions();
  }, []);

  useEffect(() => {
    setSearch("");
    setPage(1);
  }, [tab]);

  const openCollect = async (row) => {
    const payment = nextPaymentOf(row);
    if (payment) {
      setCollectTarget({ contract: row, row, payment });
      setReceipt(null);
      return;
    }

    // Older API payloads may not include next_payment; fall back to the
    // contract detail only in that case.
    setCollecting(row.guid);
    try {
      const response = await contractsApi.getByGuid(row.guid);
      const contract = response?.contract || response;
      const fallbackPayment =
        [...(contract.payment_schedule || [])]
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .find(
            (item) =>
              ["pending", "overdue", "submitted"].includes(
                String(item.status || "").toLowerCase()
              ) && !item.has_receipt
          ) || null;

      setCollectTarget({ contract, row, payment: fallbackPayment });
      setReceipt(null);
    } catch {
      showToast(t("seller.openContractError"), "error");
    } finally {
      setCollecting(null);
    }
  };

  const isReceiptSent = (row) => {
    const payment = nextPaymentOf(row);
    return Boolean(payment?.id && submitted.has(payment.id));
  };

  const submitCollection = async () => {
    const paymentId = collectTarget?.payment?.id;
    if (!paymentId || !receipt) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", receipt);
      await paymentsApi.uploadReceipt(paymentId, formData);

      setSubmitted((prev) => new Set(prev).add(paymentId));

      showToast(t("seller.collectionSubmitted"));
      setCollectTarget(null);
      setReceipt(null);

      await loadContracts({ silent: true });
      loadStats();
    } catch (err) {
      showToast(err?.message || t("seller.uploadReceiptError"), "error");
    } finally {
      setUploading(false);
    }
  };

  const clients = useMemo(() => {
    const unnamed = t("seller.unnamedClient");
    const map = new Map();
    for (const contract of contracts) {
      const key = contract.applicant_user_id || contract.applicant_name;
      if (!key) continue;
      const current = map.get(key) || {
        key,
        name: contract.applicant_name || unnamed,
        phone: contract.applicant_phone || "—",
        identity: contract.applicant_identity || "—",
        contracts: 0,
        active: 0,
        pending: false,
        amount: 0,
        last: contract.created_at,
      };
      current.contracts += 1;
      current.amount += Number(contract.amount || 0);
      if (ACTIVE_STATUSES.includes(contract.status)) current.active += 1;
      if (
        ACTIVE_STATUSES.includes(contract.status) &&
        (nextPaymentOf(contract) || Number(contract.balance || 0) !== 0)
      ) {
        current.pending = true;
      }
      if (new Date(contract.created_at) > new Date(current.last)) {
        current.last = contract.created_at;
      }
      map.set(key, current);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [contracts, t]);

  const searchTerm = search.trim().toLowerCase();

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        matchesSearch(searchTerm, [
          client.name,
          client.phone,
          client.identity,
        ])
      ),
    [clients, searchTerm]
  );

  const allCollections = useMemo(
    () =>
      contracts
        .filter(
          (contract) =>
            Number(contract.balance || 0) !== 0 &&
            ACTIVE_STATUSES.includes(contract.status)
        )
        .sort((a, b) => {
          const aDue = nextPaymentOf(a)?.due_date;
          const bDue = nextPaymentOf(b)?.due_date;
          if (aDue && bDue) {
            return new Date(aDue) - new Date(bDue);
          }
          if (aDue) return -1;
          if (bDue) return 1;
          return Math.abs(b.balance) - Math.abs(a.balance);
        }),
    [contracts]
  );

  const collections = useMemo(
    () =>
      allCollections.filter((contract) =>
        matchesSearch(searchTerm, [
          contract.applicant_name,
          contract.project_name,
          contract.lot_name,
        ])
      ),
    [allCollections, searchTerm]
  );

  const allDocuments = useMemo(
    () =>
      contracts.filter(
        (contract) =>
          ACTIVE_STATUSES.includes(contract.status) ||
          contract.status === "submitted"
      ),
    [contracts]
  );

  const documents = useMemo(
    () =>
      allDocuments.filter((contract) =>
        matchesSearch(searchTerm, [
          contract.id,
          contract.applicant_name,
          contract.project_name,
          contract.lot_name,
        ])
      ),
    [allDocuments, searchTerm]
  );

  const filteredCommissions = useMemo(
    () =>
      commissions.filter((row) =>
        matchesSearch(searchTerm, [
          row.client_name,
          row.project,
          row.lot,
          row.seller,
          row.contract_id != null ? `#${row.contract_id}` : "",
        ])
      ),
    [commissions, searchTerm]
  );

  const commissionTotals = useMemo(
    () =>
      commissions.reduce(
        (acc, item) => {
          const commission = Number(item.commission || 0);
          acc.total += commission;
          acc.amount += Number(item.amount || 0);
          if (item.commission_paid_at) {
            acc.paid += commission;
            acc.paidCount += 1;
          } else {
            acc.pending += commission;
          }
          return acc;
        },
        { total: 0, paid: 0, pending: 0, amount: 0, paidCount: 0 }
      ),
    [commissions]
  );

  const pendingClients = useMemo(
    () => clients.filter((client) => client.pending).length,
    [clients]
  );
  const activeClients = useMemo(
    () => clients.filter((client) => client.active > 0).length,
    [clients]
  );
  const portfolio = useMemo(
    () =>
      clients.reduce((sum, client) => sum + Number(client.amount || 0), 0),
    [clients]
  );
  const collectionsTotal = useMemo(
    () =>
      allCollections.reduce(
        (sum, contract) => sum + Number(nextPaymentOf(contract)?.amount || 0),
        0
      ),
    [allCollections]
  );
  const activeDocuments = useMemo(
    () =>
      allDocuments.filter((contract) =>
        ACTIVE_STATUSES.includes(contract.status)
      ).length,
    [allDocuments]
  );
  const documentsInReview = useMemo(
    () =>
      allDocuments.filter((contract) => contract.status === "submitted")
        .length,
    [allDocuments]
  );

  const commissionRate = commissionTotals.amount
    ? ((commissionTotals.total / commissionTotals.amount) * 100).toFixed(1)
    : "0.0";

  const kpis = {
    clientes: [
      {
        label: t("seller.kpiActiveClients"),
        value: activeClients,
        caption: t("seller.kpiActiveClientsCaption"),
      },
      {
        label: t("seller.kpiPendingClients"),
        value: pendingClients,
        caption: t("seller.kpiPendingClientsCaption"),
        tone: "warning",
      },
      {
        label: t("seller.kpiPortfolio"),
        value: money(portfolio),
        caption: t("seller.kpiPortfolioCaption"),
      },
    ],
    cobros: [
      {
        label: t("seller.kpiDueThisMonth"),
        value: money(stats.pending),
        caption: t("seller.kpiDueThisMonthCaption"),
      },
      {
        label: t("seller.kpiOverdue"),
        value: money(stats.overdue),
        caption: t("seller.kpiOverdueCaption"),
        tone: "danger",
      },
      {
        label: t("seller.kpiCollected"),
        value: money(stats.collected),
        caption: t("seller.kpiCollectedCaption"),
        tone: "success",
      },
    ],
    comisiones: [
      {
        label: t("seller.kpiMonthCommission"),
        value: money(commissionTotals.total),
        caption: t("seller.kpiMonthCommissionCaption"),
      },
      {
        label: t("seller.kpiPendingCommission"),
        value: money(commissionTotals.pending),
        caption: t("seller.kpiPendingCommissionCaption"),
        tone: "warning",
      },
      {
        label: t("seller.kpiPaidCommission"),
        value: money(commissionTotals.paid),
        caption: t("seller.kpiPaidCommissionCaption"),
        tone: "success",
      },
    ],
    documentos: [
      {
        label: t("seller.kpiDocumentContracts"),
        value: allDocuments.length,
        caption: t("seller.kpiDocumentContractsCaption"),
      },
      {
        label: t("seller.kpiActiveContracts"),
        value: activeDocuments,
        caption: t("seller.kpiActiveContractsCaption"),
      },
      {
        label: t("seller.kpiDocumentsInReview"),
        value: documentsInReview,
        caption: t("seller.kpiDocumentsInReviewCaption"),
        tone: "info",
      },
    ],
  }[tab];

  const kpisLoading =
    tab === "comisiones"
      ? commissionsLoading
      : tab === "cobros"
        ? statsLoading
        : loading;

  const tabLabel = (label, count) => (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <span className="rounded-chip bg-surface-2 px-1.5 text-micro font-bold text-ink-3">
        {count}
      </span>
    </span>
  );

  const tabItems = [
    {
      value: "clientes",
      label: tabLabel(t("seller.myClients"), clients.length),
      path: "/vendedor/clientes",
    },
    {
      value: "cobros",
      label: tabLabel(t("seller.collections"), allCollections.length),
      path: "/vendedor/cobros",
    },
    {
      value: "comisiones",
      label: tabLabel(t("seller.tabCommissions"), commissions.length),
      path: "/vendedor/comisiones",
    },
    {
      value: "documentos",
      label: tabLabel(t("seller.documents"), allDocuments.length),
      path: "/vendedor/documentos",
    },
  ];

  const statusChip = (row, { reviewable = false } = {}) => {
    if (reviewable && isReceiptSent(row)) {
      return <Chip tone="info">{t("seller.inReview")}</Chip>;
    }
    const key = String(row.status || "").toLowerCase();
    return (
      <Chip tone={STATUS_TONES[key] || "neutral"}>
        {formatStatus(key, t)}
      </Chip>
    );
  };

  const clientColumns = [
    {
      key: "name",
      header: t("seller.client"),
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{row.name}</p>
          <p className="text-micro text-ink-3">{row.identity}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: t("seller.phone"),
      render: (row) => <span className="text-ink-2">{row.phone}</span>,
    },
    {
      key: "contracts",
      header: t("seller.contracts"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums text-ink-2">
          {t("seller.contractsActiveOf", {
            active: row.active,
            total: row.contracts,
          })}
        </span>
      ),
    },
    {
      key: "amount",
      header: t("seller.amount"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums font-semibold text-ink">
          {money(row.amount)}
        </span>
      ),
    },
    {
      key: "last",
      header: t("seller.last"),
      render: (row) => (
        <span className="text-ink-2">{formatDate(row.last)}</span>
      ),
    },
  ];

  const collectionColumns = [
    {
      key: "contract",
      header: t("seller.client"),
      render: (row) => (
        <div className="min-w-0">
          <Link
            to={`/contracts/${row.guid}?tab=pagos`}
            className="font-semibold text-brand hover:underline"
          >
            {row.applicant_name || t("seller.unnamedClient")}
          </Link>
          <p className="truncate text-micro text-ink-3">
            #{row.id} · {row.project_name || "—"} · {row.lot_name || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "next_payment",
      header: t("seller.nextCollection"),
      align: "right",
      render: (row) => {
        const payment = nextPaymentOf(row);
        const overdue = isPaymentOverdue(payment);
        return (
          <div className="text-right">
            <p className="text-body font-bold tabular-nums text-ink">
              {payment ? money(payment.amount) : "—"}
            </p>
            <p
              className={`text-micro ${
                overdue ? "font-semibold text-danger" : "text-ink-3"
              }`}
            >
              {payment
                ? `${paymentTypeLabel(payment, t)} · ${formatDate(
                    payment.due_date
                  )}`
                : t("seller.noPendingInstallmentShort")}
              {overdue ? ` · ${t("seller.overduePayment")}` : ""}
            </p>
            <p className="text-micro text-ink-3">
              {t("seller.balanceSecondary", {
                amount: money(Math.abs(Number(row.balance || 0))),
              })}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("common.status"),
      render: (row) => statusChip(row, { reviewable: true }),
    },
    {
      key: "actions",
      header: t("seller.action"),
      align: "right",
      render: (row) => {
        const payment = nextPaymentOf(row);
        if (!payment) {
          return (
            <Button size="sm" variant="secondary" disabled>
              {t("seller.collect")}
            </Button>
          );
        }
        if (isReceiptSent(row)) {
          return (
            <span className="text-micro font-semibold text-ink-3">
              {t("seller.receiptSent")}
            </span>
          );
        }
        return (
          <Button
            size="sm"
            loading={collecting === row.guid}
            onClick={() => openCollect(row)}
          >
            {t("seller.collect")}
          </Button>
        );
      },
    },
  ];

  const downloadStatement = async (row) => {
    const userId = row.applicant_user_id;
    if (!userId) {
      showToast(t("seller.statementUnavailable"), "error");
      return;
    }
    setDownloadingStatement(row.id);
    try {
      const blob = await reportsApi.downloadUserBalancePDF(userId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `estado-cuenta-${row.applicant_name || row.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast(t("seller.statementDownloaded"), "success");
    } catch {
      showToast(t("seller.statementError"), "error");
    } finally {
      setDownloadingStatement(null);
    }
  };

  const documentColumns = [
    {
      key: "contract",
      header: t("seller.contract"),
      render: (row) => (
        <span className="font-semibold text-ink">#{row.id}</span>
      ),
    },
    {
      key: "client",
      header: t("seller.client"),
      render: (row) => (
        <span className="text-ink-2">
          {row.applicant_name || t("seller.unnamedClient")}
        </span>
      ),
    },
    {
      key: "project",
      header: t("seller.projectLot"),
      render: (row) => (
        <span className="text-ink-2">
          {row.project_name || "—"} · {row.lot_name || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (row) => statusChip(row),
    },
    {
      key: "actions",
      header: t("seller.action"),
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          loading={downloadingStatement === row.id}
          onClick={() => downloadStatement(row)}
        >
          {t("seller.downloadStatement")}
        </Button>
      ),
    },
  ];

  const commissionColumns = [
    {
      key: "contract_id",
      header: t("seller.contract"),
      render: (row) =>
        row.contract_guid ? (
          <Link
            to={`/contracts/${row.contract_guid}`}
            className="font-semibold text-brand hover:underline"
          >
            #{row.contract_id}
          </Link>
        ) : (
          <span className="font-semibold text-ink">#{row.contract_id}</span>
        ),
    },
    {
      key: "client_name",
      header: t("seller.client"),
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">
            {row.client_name || "—"}
          </p>
          <p className="truncate text-micro text-ink-3">
            {[row.project, row.lot].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: t("seller.saleValue"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums text-ink-2">{money(row.amount)}</span>
      ),
    },
    {
      key: "commission",
      header: t("seller.commission"),
      align: "right",
      render: (row) => (
        <div className="text-right">
          <p className="font-semibold tabular-nums text-ink">
            {money(row.commission)}
          </p>
          <p className="text-micro text-ink-3">
            {formatRate(row.commission, row.amount)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (row) =>
        row.commission_paid_at ? (
          <Chip tone="success">{t("seller.paid")}</Chip>
        ) : (
          <Chip tone="warning">{t("seller.pending")}</Chip>
        ),
    },
    {
      key: "date",
      header: t("seller.date"),
      render: (row) => (
        <span className="text-ink-2">{formatDate(row.date)}</span>
      ),
    },
  ];

  const columnsByTab = {
    clientes: clientColumns,
    cobros: collectionColumns,
    comisiones: commissionColumns,
    documentos: documentColumns,
  };

  const mobileCards = {
    clientes: (row) => (
      <MobileCard
        title={row.name}
        meta={`${row.phone} · ${row.identity}`}
        value={money(row.amount)}
        chip={
          row.pending ? (
            <Chip tone="warning">{t("seller.pendingPayment")}</Chip>
          ) : (
            <Chip tone="success">{t("seller.upToDate")}</Chip>
          )
        }
        caption={t("seller.contractsActiveOf", {
          active: row.active,
          total: row.contracts,
        })}
      />
    ),
    cobros: (row) => {
      const payment = nextPaymentOf(row);
      const overdue = isPaymentOverdue(payment);
      return (
        <MobileCard
          title={row.applicant_name || t("seller.unnamedClient")}
          meta={`#${row.id} · ${row.project_name || "—"} · ${
            row.lot_name || "—"
          }`}
          detail={
            payment ? (
              <span className={overdue ? "text-danger" : undefined}>
                {paymentTypeLabel(payment, t)} · {formatDate(payment.due_date)}
                {overdue ? ` · ${t("seller.overduePayment")}` : ""}
              </span>
            ) : (
              t("seller.noPendingInstallmentShort")
            )
          }
          value={payment ? money(payment.amount) : "—"}
          chip={statusChip(row, { reviewable: true })}
          caption={t("seller.balanceSecondary", {
            amount: money(Math.abs(Number(row.balance || 0))),
          })}
          action={
            !payment ? (
              <Button size="sm" variant="secondary" disabled>
                {t("seller.collect")}
              </Button>
            ) : isReceiptSent(row) ? (
              <span className="text-micro font-semibold text-ink-3">
                {t("seller.receiptSent")}
              </span>
            ) : (
              <Button
                size="sm"
                loading={collecting === row.guid}
                onClick={() => openCollect(row)}
              >
                {t("seller.collect")}
              </Button>
            )
          }
        />
      );
    },
    comisiones: (row) => (
      <MobileCard
        title={`#${row.contract_id} · ${row.client_name || "—"}`}
        meta={[row.project, row.lot].filter(Boolean).join(" · ") || "—"}
        detail={formatDate(row.date)}
        value={money(row.commission)}
        chip={
          row.commission_paid_at ? (
            <Chip tone="success">{t("seller.paid")}</Chip>
          ) : (
            <Chip tone="warning">{t("seller.pending")}</Chip>
          )
        }
        caption={formatRate(row.commission, row.amount)}
      />
    ),
    documentos: (row) => (
      <MobileCard
        title={`#${row.id} · ${
          row.applicant_name || t("seller.unnamedClient")
        }`}
        meta={`${row.project_name || "—"} · ${row.lot_name || "—"}`}
        chip={statusChip(row)}
        action={
          <Button
            size="sm"
            variant="secondary"
            loading={downloadingStatement === row.id}
            onClick={() => downloadStatement(row)}
          >
            {t("seller.downloadStatement")}
          </Button>
        }
      />
    ),
  };

  const rowsByTab = {
    clientes: filteredClients,
    cobros: collections,
    comisiones: filteredCommissions,
    documentos: documents,
  };

  const rows = rowsByTab[tab];
  const pageCount = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const emptyConfig = {
    clientes: {
      title: t("seller.emptyClientsTitle"),
      description: t("seller.emptyClientsDescription"),
    },
    cobros: {
      title: t("seller.emptyCollectionsTitle"),
      description: t("seller.emptyCollectionsDescription"),
    },
    comisiones: {
      title: t("seller.emptyCommissionsTitle"),
      description: t("seller.emptyCommissionsDescription"),
    },
    documentos: {
      title: t("seller.emptyDocumentsTitle"),
      description: t("seller.emptyDocumentsDescription"),
    },
  }[tab];

  const empty = (
    <div className="p-5">
      <EmptyState
        title={
          searchTerm ? t("seller.noResultsTitle") : emptyConfig.title
        }
        description={
          searchTerm
            ? t("seller.noResultsDescription")
            : emptyConfig.description
        }
      />
    </div>
  );

  const heading = {
    clientes: {
      title: t("seller.myClients"),
      subtitle: t("seller.clientsSubtitle", {
        active: activeClients,
        pending: pendingClients,
      }),
    },
    cobros: {
      title: t("seller.collections"),
      subtitle: t("seller.collectionsSubtitle", {
        count: allCollections.length,
        total: money(collectionsTotal),
      }),
    },
    comisiones: {
      title: t("seller.tabCommissions"),
      subtitle: t("seller.commissionsSubtitle", {
        count: commissions.length,
        rate: commissionRate,
      }),
    },
    documentos: {
      title: t("seller.documents"),
      subtitle: t("seller.documentsSubtitle", {
        count: allDocuments.length,
      }),
    },
  }[tab];

  const activeError =
    tab === "comisiones" ? commissionsError : error;
  const activeLoading =
    tab === "comisiones" ? commissionsLoading : loading;
  const searchPlaceholder = t(SEARCH_KEYS[tab]);

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <header>
          <h1 className="text-page font-bold tracking-tight text-ink">
            {heading.title}
          </h1>
          <p className="mt-1 text-body text-ink-3">{heading.subtitle}</p>
        </header>

        <SellerKpis items={kpis} loading={kpisLoading} />

        <Tabs
          items={tabItems.map(({ value, label }) => ({ value, label }))}
          value={tab}
          className="flex-wrap gap-y-1 overflow-y-hidden"
          onChange={(next) =>
            navigate(
              tabItems.find((item) => item.value === next)?.path ||
                TABS[0].path
            )
          }
        />

        <div className="relative w-full sm:max-w-xs">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-3"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>

        {activeError ? (
          <ErrorState
            title={
              tab === "comisiones"
                ? t("seller.loadCommissionsErrorTitle")
                : t("seller.loadErrorTitle")
            }
            description={
              tab === "comisiones"
                ? t("seller.loadCommissionsError")
                : t("seller.loadContractsError")
            }
            onRetry={
              tab === "comisiones" ? loadCommissions : () => loadContracts()
            }
          />
        ) : (
          <WorkspaceTableCard
            columns={columnsByTab[tab]}
            rows={visibleRows}
            getRowKey={(row) => GET_ROW_KEY(row, tab)}
            mobileCard={mobileCards[tab]}
            loading={activeLoading}
            empty={empty}
            page={currentPage}
            pageCount={pageCount}
            total={rows.length}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        )}
      </div>

      <RegisterCollectionDialog
        open={Boolean(collectTarget)}
        target={collectTarget}
        receipt={receipt}
        uploading={uploading}
        onReceiptChange={setReceipt}
        onClose={() => {
          if (!uploading) {
            setCollectTarget(null);
            setReceipt(null);
          }
        }}
        onSubmit={submitCollection}
      />
    </main>
  );
}

export default SellerWorkspace;
