import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "../../api";
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
  ErrorState,
  Skeleton,
  Tabs,
} from "@/shared/ui";

function ProjectDetail() {
  const { t } = useLocale();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { settings: generalSettings } = useGeneralSettings();
  const currency = generalSettings.default_currency || getDefaultCurrency();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

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

  const isAdmin = user?.role === "admin";

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
    {
      label: t("projects.available"),
      value: Number(project.available_lots) || 0,
      tone: "bg-brand",
    },
    {
      label: t("projects.reserved"),
      value: Number(project.reserved_lots) || 0,
      tone: "bg-warning",
    },
    {
      label: t("projects.sold"),
      value: Number(project.sold_lots) || 0,
      tone: "bg-ink-3",
    },
  ];
  const totalLots = Number(project.lot_count) || 0;

  const formatMoney = (value) =>
    value
      ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`
      : "—";

  const formatPercent = (value) =>
    value ? `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}%` : "—";

  const ficha = [
    { label: t("projects.projectType"), value: project.project_type || "—" },
    { label: t("projects.measurementUnit"), value: project.measurement_unit || "—" },
    { label: t("projects.pricePerUnit"), value: formatMoney(project.price_per_square_unit) },
    { label: t("projects.interestRate"), value: formatPercent(project.interest_rate) },
    {
      label: t("projects.commissionRateDirect"),
      value: formatPercent(project.commission_rate_direct),
    },
    {
      label: t("projects.commissionRateBank"),
      value: formatPercent(project.commission_rate_bank),
    },
    {
      label: t("projects.commissionRateCash"),
      value: formatPercent(project.commission_rate_cash),
    },
    { label: t("projects.guid"), value: project.guid || "—" },
  ];

  return (
    <div className="space-y-6">
      <Card bodyClassName="flex flex-col gap-5 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {project.project_type && (
              <span className="mb-1 block text-micro font-bold uppercase tracking-wide text-brand-strong">
                {project.project_type}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-page font-bold tracking-tight text-ink">
                {project.name || "—"}
              </h2>
              {statusChip}
            </div>
            {(project.address || project.city) && (
              <p className="mt-2 text-body text-ink-2">
                {[project.address, project.city].filter(Boolean).join(" · ")}
              </p>
            )}
            {project.delivery_date && (
              <p className="mt-1 text-micro text-ink-3">
                {t("projects.deliveryDate")}: {project.delivery_date.slice(0, 10)}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/projects/${id}/payment-instructions`)}
              >
                {t("projects.paymentInstructions")}
              </Button>
              <Button onClick={() => navigate(`/projects/${id}/edit`)}>
                {t("projects.editProject")}
              </Button>
            </div>
          )}
        </div>

        {/* Facts strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: t("projects.code"), value: project.code || "—" },
            { label: t("projects.lotsCount"), value: totalLots },
            {
              label: t("projects.availableLots"),
              value: Number(project.available_lots) || 0,
            },
            {
              label: t("projects.deliveryDate"),
              value: project.delivery_date ? project.delivery_date.slice(0, 10) : "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-control border border-line bg-surface-2 p-3"
            >
              <p className="mb-1 text-micro font-bold uppercase tracking-wide text-ink-3">
                {item.label}
              </p>
              <p className="truncate text-body font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Tabs
        items={[
          { value: "overview", label: t("projects.tabOverview") },
          { value: "media", label: t("projects.tabMedia") },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title={t("projects.description")}>
            {project.description ? (
              <p className="whitespace-pre-line text-body leading-relaxed text-ink-2">
                {project.description}
              </p>
            ) : (
              <p className="text-body text-ink-3">{t("projects.enterDescription")}</p>
            )}
          </Card>

          <div className="flex flex-col gap-6">
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
                  {t("projects.viewLots")}
                </Button>
              </div>
            </Card>

            <Card title={t("projects.projectInfo")}>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ficha.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
                      {item.label}
                    </dt>
                    <dd className="truncate text-body font-semibold capitalize text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      )}

      {tab === "media" && (
        <div className="space-y-6">
          <ProjectDrawingsPanel projectId={id} canManage={isAdmin} />
          <ProjectPhotosPanel projectId={id} canManage={isAdmin} />
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
