import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { projectsApi } from "../../api";
import { auditsApi } from "../../../audits/api";
import { formatAuditEvent } from "../../../audits/modelLabels";
import ProjectDrawingsPanel from "../../components/media/ProjectDrawingsPanel";
import ProjectPhotosPanel from "../../components/media/ProjectPhotosPanel";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useGeneralSettings } from "../../../../contexts/generalSettings";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
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
      setMediaCounts({
        plans:
          plans.status === "fulfilled"
            ? (plans.value.drawings || plans.value.data || []).length
            : 0,
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
    if (tab === "lots" && lots.length === 0) loadLots();
    if (tab === "instructions" && instructions.length === 0) loadInstructions();
    if (tab === "activity" && activity.length === 0) loadActivity();
  }, [tab, lots.length, instructions.length, activity.length, loadLots, loadInstructions, loadActivity]);

  const statusChip = useMemo(() => {
    if (!project) return null;
    return project.is_published ? (
      <Chip tone="success">{t("projects.published")}</Chip>
    ) : (
      <Chip tone="warning">{t("projects.draft")}</Chip>
    );
  }, [project, t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton rows={4} />
        <Skeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={t("common.error")}
        description={`${t("projects.failedToLoadProject")}: ${error}`}
        onRetry={() => navigate(0)}
      />
    );
  }

  if (!project) return null;

  const availabilityRows = [
    { label: t("projects.available"), value: Number(project.available_lots) || 0, tone: "bg-brand" },
    { label: t("projects.reserved"), value: Number(project.reserved_lots) || 0, tone: "bg-warning" },
    { label: t("projects.sold"), value: Number(project.sold_lots) || 0, tone: "bg-ink-3" },
  ];
  const totalLots = Number(project.lot_count) || 0;

  const formatMoney = (value) =>
    value
      ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`
      : "—";

  const formatPercent = (value) =>
    value ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}%` : "—";

  const ficha = [
    { label: t("projects.code"), value: project.code || "—" },
    { label: t("projects.projectType"), value: projectTypeLabel },
    { label: t("projects.measurementUnit"), value: project.measurement_unit || "—" },
    { label: t("projects.pricePerUnit"), value: formatMoney(project.price_per_square_unit) },
    { label: t("projects.currency") || "Currency", value: currency },
    { label: t("projects.status") || "Status", value: project.is_published ? t("projects.published") : t("projects.draft") },
    { label: t("projects.interestRate"), value: formatPercent(project.interest_rate) },
    { label: t("projects.guid"), value: project.guid || "—" },
  ];

  const tabs = [
    { value: "overview", label: t("projects.tabOverview") },
    { value: "lots", label: t("projects.tabLots") },
    { value: "media", label: t("projects.tabMedia") },
    { value: "instructions", label: t("projects.paymentInstructions") },
    { value: "activity", label: t("projects.tabActivity") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Link to="/projects" className="text-label font-semibold text-ink-3 hover:text-ink">
          ← {t("projects.manageProjects")}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-page font-bold tracking-tight text-ink">{project.name || "—"}</h1>
              {statusChip}
            </div>
            <p className="mt-1 text-body text-ink-3">
              {[project.city, project.address, projectTypeLabel, project.code]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate(`/projects/${id}/lots`)}>
              {t("projects.viewLots", { name: project.name })}
            </Button>
            {isAdmin && (
              <Button onClick={() => navigate(`/projects/${id}/edit`)}>
                {t("projects.editProject")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Facts strip */}
      <Card bodyClassName="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
        {[
          { label: t("projects.code"), value: project.code || "—" },
          {
            label: t("projects.city"),
            value: [project.city, project.address].filter(Boolean).join(", ") || "—",
          },
          {
            label: t("projects.deliveryDate"),
            value: project.delivery_date ? project.delivery_date.slice(0, 10) : "—",
          },
          {
            label: t("projects.lots"),
            value: `${totalLots} · ${Number(project.available_lots) || 0} ${t("projects.availableShort")}`,
          },
        ].map((item) => (
          <div key={item.label}>
            <p className="mb-1 text-micro font-bold uppercase tracking-wide text-ink-3">
              {item.label}
            </p>
            <p className="truncate text-body font-bold text-ink">{item.value}</p>
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
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-6">
            <Card title={t("projects.description")}>
              {project.description ? (
                <p className="whitespace-pre-line text-body leading-relaxed text-ink-2">
                  {project.description}
                </p>
              ) : (
                <p className="text-body text-ink-3">{t("projects.enterDescription")}</p>
              )}
              <p className="mt-3 text-micro text-ink-3">
                {[
                  `${t("projects.projectType")}: ${projectTypeLabel}`,
                  project.measurement_unit && `${t("projects.measurementUnit")}: ${project.measurement_unit}`,
                  `${t("projects.currency") || "Currency"}: ${currency}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Card>

            <Card title={t("projects.availability")}>
              <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-surface-2">
                {totalLots > 0 &&
                  availabilityRows.map((row) => (
                    <div
                      key={row.label}
                      className={`${row.tone} h-full`}
                      style={{ width: `${(row.value / totalLots) * 100}%` }}
                    />
                  ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {availabilityRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                      {row.label}
                    </p>
                    <p className="text-section font-black tabular-nums text-ink">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/projects/${id}/lots`)}
                  className="w-full"
                >
                  {t("projects.viewLots", { name: project.name })}
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card title={t("projects.projectInfo")}>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {ficha.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
                      {item.label}
                    </dt>
                    <dd className="truncate text-body font-semibold text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title={t("projects.documents") || "Documents"}>
              <div className="flex items-center justify-between text-body text-ink-2">
                <span>{t("projects.plans")}</span>
                <span className="font-bold text-ink">{mediaCounts.plans}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-body text-ink-2">
                <span>{t("projects.photos")}</span>
                <span className="font-bold text-ink">{mediaCounts.photos}</span>
              </div>
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={() => setTab("media")}>
                  {t("projects.manageMedia")} →
                </Button>
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
              {t("projects.viewLots", { name: project.name })} →
            </Button>
          }
        >
          {lotsLoading ? (
            <Skeleton rows={3} />
          ) : lots.length === 0 ? (
            <EmptyState
              variant="empty"
              title={t("projects.noLots") || "No lots yet"}
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
                    {lot.reserved_by || t("lots.noOwner") || "—"}
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/projects/${id}/lots`)}
                    >
                      {lot.status === "available"
                        ? t("lots.reserve") || "Reservar"
                        : t("common.view") || "Ver"}{" "}
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
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

export default ProjectDetail;
