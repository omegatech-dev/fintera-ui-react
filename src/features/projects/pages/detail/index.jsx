import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faImages } from "@fortawesome/free-solid-svg-icons";
import { projectsApi } from "../../api";
import { auditsApi } from "../../../audits/api";
import { formatAuditEvent } from "../../../audits/modelLabels";
import ProjectDrawingsPanel from "../../components/media/ProjectDrawingsPanel";
import ProjectPhotosPanel from "../../components/media/ProjectPhotosPanel";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useGeneralSettings } from "../../../../contexts/generalSettings";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
import { formatDate } from "../../../../shared/utils/formatters";
import { formatBytes } from "../../components/media/mediaFiles";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
} from "@/shared/ui";

const LOT_TONES = {
  available: "success",
  reserved: "warning",
  financed: "info",
  fully_paid: "neutral",
  sold: "neutral",
};

function ProjectDetail() {
  const { t } = useLocale();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { settings: generalSettings } = useGeneralSettings();
  const currency = generalSettings.default_currency || getDefaultCurrency();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(() => {
    const requested = searchParams.get("tab");
    return ["overview", "lots", "media", "instructions", "activity"].includes(
      requested
    )
      ? requested
      : "overview";
  });
  const [mediaCounts, setMediaCounts] = useState({ plans: 0, photos: 0 });
  const [drawings, setDrawings] = useState([]);
  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const projectTypeLabel = project?.project_type
    ? (() => {
        const key = `projects.${project.project_type}`;
        const translated = t(key);
        return translated === key ? project.project_type : translated;
      })()
    : "—";
  const accountTypeLabel = (type) => {
    if (type === "checking") return t("paymentInstructions.typeChecking") || type;
    if (type === "savings") return t("paymentInstructions.typeSavings") || type;
    return type || "—";
  };

  useEffect(() => {
    let cancelled = false;
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await projectsApi.get(id);
        if (cancelled) return;
        setProject(data.project || data.data || data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProject();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const loadCounts = async () => {
      const [plans, photos] = await Promise.allSettled([
        projectsApi.listDrawings(id),
        projectsApi.listProjectPhotos(id),
      ]);
      if (cancelled) return;
      const drawingList =
        plans.status === "fulfilled"
          ? plans.value.drawings || plans.value.data || []
          : [];
      setDrawings(drawingList);
      setMediaCounts({
        plans: drawingList.length,
        photos:
          photos.status === "fulfilled"
            ? (photos.value.photos || photos.value.data || []).length
            : 0,
      });
    };
    if (id) loadCounts();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadLots = useCallback(async () => {
    setLotsLoading(true);
    try {
      const data = await projectsApi.listLots(id, {
        page: 1,
        per_page: 6,
        sort: "updated_at-asc",
      });
      setLots(data.lots || data.data || []);
    } catch {
      setLots([]);
    } finally {
      setLotsLoading(false);
    }
  }, [id]);

  const loadInstructions = useCallback(async () => {
    setInstructionsLoading(true);
    try {
      const data = await projectsApi.listPaymentInstructions(id);
      setInstructions(data.payment_instructions || data.data || []);
    } catch {
      setInstructions([]);
    } finally {
      setInstructionsLoading(false);
    }
  }, [id]);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await auditsApi.list({
        model: "Project",
        entity_id: id,
        page: 1,
        per_page: 20,
      });
      setActivity(data.audits || data.data || []);
    } catch {
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (tab === "lots" && lots.length === 0) loadLots();
    if (tab === "instructions" && instructions.length === 0) loadInstructions();
  }, [tab, lots.length, instructions.length, loadLots, loadInstructions]);

  const statusChip = useMemo(() => {
    if (!project) return null;
    return project.is_published ? (
      <Chip tone="success">{t("projects.published")}</Chip>
    ) : (
      <Chip tone="neutral">{t("projects.draft")}</Chip>
    );
  }, [project, t]);

  if (loading) {
    return (
      <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
        <div className="mx-auto w-full max-w-[1600px] space-y-6">
          <Skeleton rows={4} />
          <Skeleton rows={6} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
        <div className="mx-auto w-full max-w-[1600px]">
          <ErrorState
            title={t("common.error")}
            description={`${t("projects.failedToLoadProject")}: ${error}`}
            onRetry={() => navigate(0)}
          />
        </div>
      </main>
    );
  }

  if (!project) return null;

  const availabilityRows = [
    {
      label: t("projects.available"),
      value: Number(project.available_lots) || 0,
      tone: "bg-brand",
      text: "text-brand-strong",
    },
    {
      label: t("projects.reserved"),
      value: Number(project.reserved_lots) || 0,
      tone: "bg-warning",
      text: "text-warning",
    },
    {
      label: t("projects.sold"),
      value: Number(project.sold_lots) || 0,
      tone: "bg-ink-3",
      text: "text-ink-3",
    },
  ];
  const statusTotal = availabilityRows.reduce(
    (sum, row) => sum + row.value,
    0
  );
  const totalLots = statusTotal > 0 ? statusTotal : Number(project.lot_count) || 0;

  const formatMoney = (value) =>
    value
      ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`
      : "—";

  const formatPercent = (value) =>
    value
      ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
      : "—";

  const ficha = [
    { label: t("projects.code"), value: project.code || "—" },
    { label: t("projects.projectType"), value: projectTypeLabel },
    { label: t("projects.measurementUnit"), value: project.measurement_unit || "—" },
    { label: t("projects.pricePerUnit"), value: formatMoney(project.price_per_square_unit) },
    { label: t("projects.currency"), value: currency },
    {
      label: t("projects.status"),
      value: project.is_published ? t("projects.published") : t("projects.draft"),
    },
    { label: t("projects.interestRate"), value: formatPercent(project.interest_rate) },
  ];

  const tabs = [
    { value: "overview", label: t("projects.tabOverview") },
    { value: "lots", label: t("projects.tabLots") },
    { value: "media", label: t("projects.tabMedia") },
    { value: "instructions", label: t("projects.paymentInstructions") },
    { value: "activity", label: t("projects.tabActivity") },
  ];

  const recentActivity = activity.slice(0, 4);

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <div className="flex flex-col gap-1">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 text-label font-medium text-ink-3"
        >
          <Link to="/projects" className="transition-colors hover:text-ink">
            {t("projectsPage.title")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink-2">{project.name || "—"}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-page font-bold tracking-tight text-ink">
                {project.name || "—"}
              </h1>
              {statusChip}
            </div>
            <p className="mt-1 text-body font-medium text-ink-3">
              {[project.city, projectTypeLabel, project.code]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${id}/lots`)}
            >
              {t("projects.viewLotsShort")}
            </Button>
            {isAdmin && (
              <Button onClick={() => navigate(`/projects/${id}/edit`)}>
                {t("projects.editProject")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card bodyClassName="grid grid-cols-2 gap-5 px-[18px] py-[14px] md:grid-cols-4">
        {[
          { label: t("projects.code"), value: project.code || "—" },
          {
            label: t("projects.location") || t("projects.city"),
            value: [project.city, project.address].filter(Boolean).join(", ") || "—",
          },
          {
            label: t("projects.deliveryDate"),
            value: project.delivery_date ? formatDate(project.delivery_date) : "—",
          },
          {
            label: t("projects.lots"),
            value: `${totalLots} · ${Number(project.available_lots) || 0} ${t("projects.availableShort")}`,
          },
        ].map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-3">
              {item.label}
            </p>
            <p className="mt-0.5 truncate text-label font-semibold text-ink">
              {item.value}
            </p>
          </div>
        ))}
      </Card>

      <Tabs
        items={tabs}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setSearchParams(
            value === "overview" ? {} : { tab: value },
            { replace: true }
          );
        }}
      />

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <Card title={t("projects.description")} bodyClassName="p-[18px]">
              {project.description ? (
                <p className="whitespace-pre-line text-label leading-relaxed text-ink-2">
                  {project.description}
                </p>
              ) : (
                <p className="text-label text-ink-3">
                  {t("projects.enterDescription")}
                </p>
              )}
              <p className="mt-2 text-micro font-medium text-ink-3">
                {[
                  `${t("projects.projectType")}: ${projectTypeLabel}`,
                  project.measurement_unit &&
                    `${t("projects.measurementUnit")}: ${project.measurement_unit}`,
                  `${t("projects.currency")}: ${currency}`,
                  project.created_at &&
                    `${t("projects.created")}: ${formatDate(project.created_at)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Card>

            <Card title={t("projects.availability")} bodyClassName="p-[18px]">
              <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
                {totalLots > 0 &&
                  availabilityRows.map((row) => (
                    <div
                      key={row.label}
                      className={`${row.tone} h-full`}
                      style={{ width: `${(row.value / totalLots) * 100}%` }}
                    />
                  ))}
              </div>
              <div className="flex flex-col gap-2">
                {availabilityRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 text-label"
                  >
                    <span className="flex items-center gap-2 font-medium text-ink-2">
                      <span
                        className={`h-2 w-2 rounded-full ${row.tone}`}
                        aria-hidden="true"
                      />
                      {row.label}
                    </span>
                    <span className={`font-bold tabular-nums ${row.text}`}>
                      {row.value}
                      <span className="ml-1 text-ink-3">
                        {totalLots > 0
                          ? `${Math.round((row.value / totalLots) * 100)}%`
                          : "0%"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/projects/${id}/lots`)}
                  className="w-full"
                >
                  {t("projects.viewLotsShort")}
                </Button>
              </div>
            </Card>

            <Card title={t("projects.recentActivity")} bodyClassName="px-[18px] py-1">
              {activityLoading ? (
                <div className="py-4">
                  <Skeleton rows={2} />
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="py-4 text-label text-ink-3">
                  {t("projects.noActivity")}
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {recentActivity.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-label font-semibold text-ink">
                          {formatAuditEvent(event.action, t)}
                        </p>
                        <p className="truncate text-micro text-ink-3">
                          {event.user?.full_name ||
                            event.user?.email ||
                            t("audits.system")}
                        </p>
                      </div>
                      <span className="shrink-0 text-micro text-ink-3">
                        {formatDate(event.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-3.5">
            <Card title={t("projects.projectInfo")} bodyClassName="p-[18px]">
              <dl className="flex flex-col gap-2.5">
                {ficha.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="text-label text-ink-3">{item.label}</dt>
                    <dd className="min-w-0 truncate text-right text-label font-semibold text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title={t("projects.documents")} bodyClassName="p-[18px]">
              {drawings.length > 0 ? (
                <ul className="flex flex-col">
                  {drawings.slice(0, 2).map((drawing) => (
                    <li
                      key={drawing.id}
                      className="flex items-center justify-between gap-3 border-b border-line py-2 text-label first:pt-0"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-ink-2">
                        <FontAwesomeIcon
                          icon={faFileLines}
                          className="shrink-0 text-ink-3"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {drawing.name || t("projects.plans")}
                        </span>
                      </span>
                      <span className="shrink-0 text-micro text-ink-3">
                        {formatBytes(drawing.size_bytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-between gap-3 border-b border-line pb-2 text-label">
                  <span className="flex items-center gap-2 text-ink-2">
                    <FontAwesomeIcon
                      icon={faFileLines}
                      className="text-ink-3"
                      aria-hidden="true"
                    />
                    {t("projects.plans")}
                  </span>
                  <span className="font-bold text-ink">{mediaCounts.plans}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between gap-3 border-b border-line pb-3 text-label">
                <span className="flex items-center gap-2 text-ink-2">
                  <FontAwesomeIcon
                    icon={faImages}
                    className="text-ink-3"
                    aria-hidden="true"
                  />
                  {t("projects.photos")}
                </span>
                <span className="font-bold text-ink">{mediaCounts.photos}</span>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setTab("media");
                    setSearchParams({ tab: "media" }, { replace: true });
                  }}
                  className="text-label font-semibold text-brand-strong transition-colors hover:text-brand"
                >
                  {t("projects.manageMedia")} →
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "lots" && (
        <Card
          title={t("projects.tabLots")}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}/lots`)}>
              {t("projects.viewLotsShort")} →
            </Button>
          }
        >
          {lotsLoading ? (
            <Skeleton rows={3} />
          ) : lots.length === 0 ? (
            <EmptyState
              variant="empty"
              title={t("projects.noLots")}
              description={t("projects.lotsCount", { count: totalLots })}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lots.map((lot) => (
                <div key={lot.id} className="rounded-card border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-body font-bold text-ink">{lot.name}</p>
                    <Chip tone={LOT_TONES[lot.status] || "neutral"}>
                      {t(`status.${lot.status}`)}
                    </Chip>
                  </div>
                  <p className="mt-1 text-micro text-ink-3">
                    {lot.width && lot.length ? `${lot.width} × ${lot.length} · ` : ""}
                    {lot.area ? `${lot.area} ${lot.measurement_unit || "m²"}` : "—"}
                  </p>
                  <p className="mt-2 text-body-lg font-bold text-ink">
                    {formatMoney(lot.effective_price ?? lot.price)}
                  </p>
                  <p className="mt-1 truncate text-micro text-ink-3">
                    {lot.reserved_by || t("lots.noOwner")}
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/projects/${id}/lots`)}
                    >
                      {lot.status === "available"
                        ? t("lots.reserve")
                        : t("common.view")}{" "}
                      →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "media" && (
        <div className="space-y-6">
          <ProjectDrawingsPanel projectId={id} canManage={isAdmin} />
          <ProjectPhotosPanel projectId={id} canManage={isAdmin} />
        </div>
      )}

      {tab === "instructions" && (
        <Card
          title={t("projects.accounts")}
          action={
            isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/projects/${id}/payment-instructions`)}
              >
                {t("projects.manageInstructions")} →
              </Button>
            )
          }
        >
          {instructionsLoading ? (
            <Skeleton rows={2} />
          ) : instructions.length === 0 ? (
            <EmptyState
              variant="empty"
              title={t("projects.noAccounts")}
              action={
                isAdmin ? (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/projects/${id}/payment-instructions`)}
                  >
                    {t("projects.manageInstructions")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {instructions.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-surface-2 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-bold text-ink">
                        {account.bank_name || account.bank || "—"}
                      </span>
                      {account.is_default && (
                        <Chip tone="success">{t("projects.defaultAccount")}</Chip>
                      )}
                    </div>
                    <p className="text-micro text-ink-3">
                      {[accountTypeLabel(account.account_type || account.type), account.currency]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="font-mono text-body text-ink-2">
                    **** {String(account.account_number || "").slice(-4)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "activity" && (
        <Card title={t("projects.recentActivity")}>
          {activityLoading ? (
            <Skeleton rows={3} />
          ) : activity.length === 0 ? (
            <EmptyState variant="empty" title={t("projects.noActivity")} />
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink">
                      {formatAuditEvent(event.action, t)}
                    </p>
                    <p className="truncate text-micro text-ink-3">
                      {event.user?.full_name || event.user?.email || t("audits.system")}
                    </p>
                  </div>
                  <span className="shrink-0 text-micro text-ink-3">
                    {formatDate(event.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      </div>
    </main>
  );
}

export default ProjectDetail;
