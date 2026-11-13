import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faImage,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import { projectsApi } from "../../api";
import ProjectForm from "../../components/ProjectForm";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { useGeneralSettings } from "@/contexts/generalSettings";
import { getDefaultCurrency } from "@/shared/utils/formatSettings";
import ProjectDrawingsPanel from "../../components/media/ProjectDrawingsPanel";
import ProjectPhotosPanel from "../../components/media/ProjectPhotosPanel";
import { Banner, Button, Card, Chip, SaveBar, Toggle } from "@/shared/ui";

const INITIAL_VALUES = {
  name: "",
  guid: "",
  code: "",
  description: "",
  address: "",
  city: "",
  lot_count: 0,
  price_per_square_unit: 0,
  measurement_unit: "m2",
  interest_rate: 0,
  commission_rate_direct: 0,
  commission_rate_bank: 0,
  commission_rate_cash: 0,
  delivery_date: "",
  project_type: "residential",
};

const hasText = (value) => String(value ?? "").trim().length > 0;
const hasNumber = (value) =>
  String(value ?? "").trim() !== "" && Number.isFinite(Number(value));

function EditProject() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);
  const { settings } = useGeneralSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const canManageMedia = user?.role === "admin";
  const currency = settings.default_currency || getDefaultCurrency();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [baseline, setBaseline] = useState(null);
  const [availableLots, setAvailableLots] = useState(0);
  const [reservedLots, setReservedLots] = useState(0);
  const [soldLots, setSoldLots] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [changingVisibility, setChangingVisibility] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoadingProject(false);
      return;
    }

    let cancelled = false;

    const fetchProject = async () => {
      setLoadingProject(true);
      setError(null);
      try {
        const data = await projectsApi.get(id);
        if (cancelled) return;

        const pdata = data.project || data.data || data;
        const rawDate = pdata.delivery_date || "";
        const nextValues = {
          ...INITIAL_VALUES,
          name: pdata.name || "",
          guid: pdata.guid || "",
          description: pdata.description || "",
          address: pdata.address || "",
          city: pdata.city || "",
          code: pdata.code || "",
          lot_count: pdata.lot_count || 0,
          price_per_square_unit: pdata.price_per_square_unit || 0,
          measurement_unit: pdata.measurement_unit || "m2",
          interest_rate: pdata.interest_rate || 0,
          commission_rate_direct: pdata.commission_rate_direct || 0,
          commission_rate_bank: pdata.commission_rate_bank || 0,
          commission_rate_cash: pdata.commission_rate_cash || 0,
          delivery_date: rawDate ? rawDate.slice(0, 10) : "",
          project_type: pdata.project_type || "residential",
        };

        setValues(nextValues);
        setBaseline(JSON.stringify(nextValues));
        setIsPublished(Boolean(pdata.is_published));
        setAvailableLots(pdata.available_lots || 0);
        setReservedLots(pdata.reserved_lots || 0);
        setSoldLots(pdata.sold_lots || 0);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoadingProject(false);
      }
    };

    fetchProject();

    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const dirty =
    baseline !== null && JSON.stringify(values) !== baseline;
  const lotCountLocked =
    Number(reservedLots) > 0 || Number(soldLots) > 0;
  const isValid =
    hasText(values.name) &&
    [
      values.lot_count,
      values.price_per_square_unit,
      values.interest_rate,
      values.commission_rate_direct,
      values.commission_rate_bank,
      values.commission_rate_cash,
    ].every(hasNumber);

  const handleChange = (field, value) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleMeasurementUnitChange = async (next) => {
    if (next === values.measurement_unit) return;
    const confirmed = await confirmDialog({
      title: t("projects.measurementUnitChangeWarning"),
      confirmLabel: t("common.continue") || "Continuar",
      tone: "primary",
    });
    if (confirmed) {
      handleChange("measurement_unit", next);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await projectsApi.update(id, {
        project: {
          name: values.name,
          guid: values.guid,
          description: values.description,
          address: values.address,
          city: values.city.trim() || null,
          code: values.code.trim() || null,
          lot_count: Number(values.lot_count),
          price_per_square_unit: Number(values.price_per_square_unit),
          measurement_unit: values.measurement_unit,
          interest_rate: Number(values.interest_rate),
          commission_rate_direct: Number(values.commission_rate_direct),
          commission_rate_bank: Number(values.commission_rate_bank),
          commission_rate_cash: Number(values.commission_rate_cash),
          delivery_date: values.delivery_date || null,
          project_type: values.project_type,
        },
      });

      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async () => {
    setChangingVisibility(true);
    try {
      const response = isPublished
        ? await projectsApi.unpublish(id)
        : await projectsApi.publish(id);
      const updated = response?.project || response?.data || response;
      setIsPublished(Boolean(updated?.is_published));
      showToast(
        isPublished
          ? t("projects.unpublishSuccess")
          : t("projects.publishSuccess"),
        "success"
      );
    } catch (err) {
      showToast(err?.message || t("projects.visibilityError"), "error");
    } finally {
      setChangingVisibility(false);
    }
  };

  const handleCopyGuid = () => {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(values.guid);
    showToast(
      t("common.copiedToClipboard") || "Copiado al portapapeles",
      "success"
    );
  };

  if (loadingProject) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-brand" />
          <p className="font-medium text-ink-3">
            {t("projects.loadingProject")}
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: t("projects.availableLots"),
      value: availableLots,
      className: "text-success-400",
    },
    {
      label: t("projects.reservedLots"),
      value: reservedLots,
      className: "text-warning",
    },
    {
      label: t("projects.soldLots"),
      value: soldLots,
      className: "text-ink-3",
    },
  ];

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell min-h-screen bg-bgray-50 dark:bg-darkblack-700">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
            {t("common.back")}
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("projects.editProject")}
            </h1>
            <Chip tone={isPublished ? "success" : "neutral"}>
              {isPublished
                ? t("projects.published")
                : t("projects.unpublished")}
            </Chip>
          </div>
          <p className="text-body text-ink-3">
            {t("projects.updateProjectInfo")}
          </p>
        </div>

        {error && <Banner tone="danger">{error}</Banner>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <ProjectForm
              formId="project-edit-form"
              mode="edit"
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onMeasurementUnitChange={handleMeasurementUnitChange}
              onCopyGuid={handleCopyGuid}
              currency={currency}
              lotCountLocked={lotCountLocked}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <Card title={t("projects.publishPanel")}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-body font-semibold text-ink">
                  {t("projects.visiblePortal")}
                </p>
                <Toggle
                  checked={isPublished}
                  onChange={handleVisibilityToggle}
                  label={t("projects.visiblePortal")}
                  disabled={changingVisibility}
                />
              </div>
              <p className="mt-2 text-micro text-ink-3">
                {t("projects.draftHint")}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
                onClick={handleVisibilityToggle}
                disabled={changingVisibility}
              >
                {isPublished
                  ? t("projects.unpublish")
                  : t("projects.publish")}
              </Button>
            </Card>

            <Card title={t("projects.coverPhoto")}>
              <div className="flex aspect-[4/3] items-center justify-center rounded-control border border-dashed border-line-strong bg-surface-2 text-ink-3">
                <FontAwesomeIcon icon={faImage} size="2x" aria-hidden="true" />
              </div>
              <p className="mt-3 text-micro text-ink-3">
                {t("projects.coverHint")}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={() => navigate(`/projects/${id}?tab=media`)}
              >
                {t("projects.manageMedia")}
              </Button>
            </Card>

            <Card title={t("projects.availability")}>
              <dl className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
                      {stat.label}
                    </dt>
                    <dd
                      className={`text-section font-black tabular-nums ${stat.className}`}
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title={t("paymentInstructions.title")}>
              <p className="text-micro text-ink-3">
                {t("paymentInstructions.description")}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={() =>
                  navigate(`/projects/${id}/payment-instructions`)
                }
              >
                <FontAwesomeIcon icon={faUniversity} aria-hidden="true" />
                {t("paymentInstructions.title")}
              </Button>
            </Card>
          </aside>
        </div>

        {id && (
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-section font-bold text-ink">
                {t("projects.tabMedia")}
              </h2>
              <p className="text-micro text-ink-3">
                {t("projects.manageMedia")}
              </p>
            </div>
            <ProjectDrawingsPanel
              projectId={id}
              canManage={canManageMedia}
            />
            <ProjectPhotosPanel projectId={id} canManage={canManageMedia} />
          </section>
        )}

        <SaveBar
          visible
          dirty={dirty}
          saving={loading}
          message={dirty ? t("projects.unsavedChanges") : ""}
          onDiscard={() => navigate(-1)}
          saveLabel={t("projects.saveChanges")}
          discardLabel={t("common.cancel")}
          saveType="submit"
          saveForm="project-edit-form"
          saveDisabled={!dirty || !isValid}
          className="mt-2"
        />
      </div>
    </main>
  );
}

export default EditProject;
