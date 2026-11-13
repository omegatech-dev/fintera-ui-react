import { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../../../../contexts/AuthContext";
import { projectsApi } from "../../../api";
import { useLocale } from "../../../../../contexts/LocaleContext";
import LotPhotosPanel from "../../../components/media/LotPhotosPanel";
import { areaUnitLabel, linearUnitLabel } from "../../../../../shared/utils/units";
import { getDefaultCurrency } from "../../../../../shared/utils/formatSettings";
import {
  Banner,
  Card,
  Chip,
  Field,
  Input,
  SaveBar,
  Skeleton,
} from "@/shared/ui";

// ---- Area conversion factors (from m2) ----
const M2_TO_FT2_FACTOR = 10.7639;
const M2_TO_VARA2_FACTOR = 1.431;
const AREA_CONVERSION_FROM_M2 = {
  m2: 1,
  ft2: M2_TO_FT2_FACTOR,
  vara2: M2_TO_VARA2_FACTOR,
};

const STATUS_TONES = {
  available: "success",
  reserved: "warning",
  financed: "info",
  fully_paid: "neutral",
  sold: "neutral",
};

function EditLot() {
  const { project_id, lot_id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  const [name, setName] = useState("");
  const [guid, setGuid] = useState("");
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [status, setStatus] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectPricePerUnit, setProjectPricePerUnit] = useState(0);
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [note, setNote] = useState("");
  const [north, setNorth] = useState("");
  const [east, setEast] = useState("");
  const [west, setWest] = useState("");
  const [south, setSouth] = useState("");
  const [overridePrice, setOverridePrice] = useState(false);
  const [overridePriceValue, setOverridePriceValue] = useState("");
  const [overrideArea, setOverrideArea] = useState(false);
  const [overrideAreaValue, setOverrideAreaValue] = useState("");
  const [_serverPrice_, setServerPrice] = useState(null);
  const [_serverArea_, setServerArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);

  useEffect(() => {
    const fetchLot = async () => {
      setLoading(true);
      setError(null);
      try {
        const rawData = await projectsApi.getLot(project_id, lot_id);
        const data = rawData.lot || rawData.data || rawData;

        setName(data.name || "");
        setGuid(data.guid || "");
        setLength(data.length ?? 0);
        setWidth(data.width ?? 0);
        setMeasurementUnit(data.measurement_unit || data.unit || "m2");
        setStatus(data.status || "");
        setAddress(data.address || "");
        setRegistrationNumber(data.registration_number || data.registrationNumber || "");
        setNote(data.note || "");
        setNorth(data.north || "");
        setEast(data.east || "");
        setWest(data.west || "");
        setSouth(data.south || "");
        if (data.price != null) setServerPrice(data.price);
        if (data.area != null) setServerArea(data.area);

        if (data.override_price != null && data.override_price > 0) {
          setOverridePriceValue(String(data.override_price));
          setOverridePrice(true);
        } else if (
          data.effective_price != null &&
          data.price != null &&
          Math.abs(data.effective_price - data.price) > 0.1
        ) {
          setOverridePriceValue(String(data.effective_price));
          setOverridePrice(true);
        }

        if (data.override_area != null && data.override_area > 0) {
          setOverrideAreaValue(String(data.override_area));
          setOverrideArea(true);
        } else if (data.area != null && data.length != null && data.width != null) {
          const calcArea = data.length * data.width;
          if (Math.abs(calcArea - data.area) > 0.1) {
            setOverrideAreaValue(String(data.area));
            setOverrideArea(true);
          }
        }

        try {
          const pRaw = await projectsApi.get(project_id);
          const pdata = pRaw.project || pRaw.data || pRaw;
          setProjectName(pdata.name || "");
          setProjectPricePerUnit(pdata.price_per_square_unit || 0);
          if (!data.measurement_unit && pdata.measurement_unit) {
            setMeasurementUnit(pdata.measurement_unit);
          }
        } catch (projectError) {
          console.error("Error fetching project info", projectError);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [project_id, lot_id]);

  const areaM2 = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return +(l * w).toFixed(2);
  }, [length, width]);

  const displayedArea = useMemo(() => {
    if (overrideArea && Number(overrideAreaValue) > 0) return Number(overrideAreaValue);
    const factor = AREA_CONVERSION_FROM_M2[measurementUnit] || 1;
    return +(areaM2 * factor).toFixed(2);
  }, [areaM2, measurementUnit, overrideArea, overrideAreaValue]);

  const calculatedPrice = useMemo(
    () => +(displayedArea * Number(projectPricePerUnit || 0)).toFixed(2),
    [displayedArea, projectPricePerUnit]
  );

  const effectivePricePreview = useMemo(() => {
    if (overridePrice && Number(overridePriceValue) > 0) return Number(overridePriceValue);
    return calculatedPrice;
  }, [overridePrice, overridePriceValue, calculatedPrice]);

  const fmtNum = (num) => new Intl.NumberFormat().format(num);
  const currency = getDefaultCurrency();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setServerErrors([]);
    setFieldErrors({});

    const fe = {};
    if (!name.trim()) fe.name = t("lots.errorNameRequired");
    if (!(Number(length) > 0)) fe.length = t("lots.errorLengthPositive");
    if (!(Number(width) > 0)) fe.width = t("lots.errorWidthPositive");
    if (overridePrice && overridePriceValue && !(Number(overridePriceValue) > 0)) {
      fe.override_price = t("lots.errorOverridePricePositive");
    }
    if (overrideArea && overrideAreaValue && !(Number(overrideAreaValue) > 0)) {
      fe.override_area = t("lots.errorOverrideAreaPositive");
    }
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setSaving(false);
      return;
    }
    try {
      await projectsApi.updateLot(project_id, lot_id, {
        lot: {
          name,
          guid,
          length: Number(length),
          width: Number(width),
          price: calculatedPrice,
          area: displayedArea,
          ...(overridePrice && overridePriceValue
            ? { override_price: Number(overridePriceValue) }
            : { override_price: null }),
          ...(overrideArea && overrideAreaValue
            ? { override_area: Number(overrideAreaValue) }
            : { override_area: null }),
          address: address || "",
          registration_number: registrationNumber || "",
          note: note || "",
          north: north || "",
          east: east || "",
          west: west || "",
          south: south || "",
        },
      });

      navigate(`/projects/${project_id}/lots`);
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setServerErrors(err.errors);
      } else {
        setError(err.message || t("lots.errorUpdateLot"));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
        <div className="mx-auto w-full max-w-[1600px]">
          <Skeleton rows={8} />
        </div>
      </main>
    );
  }

  const statusKey = String(status || "").toLowerCase();
  const translatedStatus = statusKey ? t(`status.${statusKey}`) : "";
  const statusLabel =
    translatedStatus && translatedStatus !== `status.${statusKey}`
      ? translatedStatus
      : status || "—";
  const boundaries = [
    { label: t("lots.north"), value: north, setter: setNorth },
    { label: t("lots.south"), value: south, setter: setSouth },
    { label: t("lots.east"), value: east, setter: setEast },
    { label: t("lots.west"), value: west, setter: setWest },
  ];

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <header className="flex flex-col gap-1">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-label font-medium text-ink-3"
          >
            <Link to="/projects" className="transition-colors hover:text-ink">
              {t("projectsPage.title")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/projects/${project_id}`}
              className="truncate transition-colors hover:text-ink"
            >
              {projectName || t("lotsTable.project")}
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/projects/${project_id}/lots`}
              className="transition-colors hover:text-ink"
            >
              {t("projects.lots")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-ink-2">{name || t("lots.editLot")}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("header.pageTitle.editLot")}
            </h1>
            {statusKey && (
              <Chip tone={STATUS_TONES[statusKey] || "neutral"}>
                {statusLabel}
              </Chip>
            )}
          </div>
          <p className="text-body font-medium text-ink-3">
            {t("lots.updateLotInfo")}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
          <form
            id="lot-edit-form"
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-col gap-4"
          >
            {(error || serverErrors.length > 0) && (
              <Banner tone="danger">
                {error && <p>{error}</p>}
                {serverErrors.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </Banner>
            )}

            <Card title={t("lots.basicInfo")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("lots.lotName")} error={fieldErrors.name}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("lots.lotNamePlaceholder")}
                    invalid={Boolean(fieldErrors.name)}
                    className="h-10 max-h-10"
                  />
                </Field>

                <Field label={t("lots.status")}>
                  <Input
                    value={statusLabel}
                    readOnly
                    disabled
                    className="h-10 max-h-10 bg-surface-2 text-ink-3"
                  />
                </Field>

                <Field label={t("lots.address")}>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("lots.optionalAddress")}
                    className="h-10 max-h-10"
                  />
                </Field>

                <Field label={t("lots.registrationNumber")}>
                  <Input
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder={t("lots.optionalRegistration")}
                    className="h-10 max-h-10"
                  />
                </Field>
              </div>
            </Card>

            <Card title={t("lots.geometryPrice")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={`${t("lots.length")} (${linearUnitLabel(measurementUnit)})`}
                  error={fieldErrors.length}
                >
                  <Input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    invalid={Boolean(fieldErrors.length)}
                    className="h-10 max-h-10"
                  />
                </Field>
                <Field
                  label={`${t("lots.width")} (${linearUnitLabel(measurementUnit)})`}
                  error={fieldErrors.width}
                >
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    invalid={Boolean(fieldErrors.width)}
                    className="h-10 max-h-10"
                  />
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-control border border-line bg-surface-2 p-4">
                  <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                    {t("lots.calculatedArea")}
                  </p>
                  <p className="mt-1 text-section font-bold text-ink">
                    {fmtNum(displayedArea)}{" "}
                    <span className="text-label font-medium text-ink-3">
                      {areaUnitLabel(measurementUnit)}
                    </span>
                  </p>
                  {overrideArea && (
                    <Chip tone="warning" className="mt-2">
                      {t("lots.manualMode")}
                    </Chip>
                  )}
                </div>

                <div className="rounded-control border border-line bg-surface-2 p-4">
                  <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                    {t("lots.estimatedPrice")}
                  </p>
                  <p className="mt-1 text-section font-bold text-ink">
                    {fmtNum(effectivePricePreview)}{" "}
                    <span className="text-label font-medium text-ink-3">
                      {currency}
                    </span>
                  </p>
                  {overridePrice && (
                    <Chip tone="warning" className="mt-2">
                      {t("lots.manualMode")}
                    </Chip>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-line p-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={overrideArea}
                      onChange={(e) => setOverrideArea(e.target.checked)}
                      className="h-4 w-4 rounded border-line-strong accent-brand"
                    />
                    <span className="text-label font-semibold text-ink-2">
                      {t("lots.overrideArea")}
                    </span>
                  </label>
                  {overrideArea && (
                    <div className="mt-3 space-y-2">
                      <Field error={fieldErrors.override_area}>
                        <Input
                          type="number"
                          value={overrideAreaValue}
                          onChange={(e) => setOverrideAreaValue(e.target.value)}
                          placeholder={t("lots.enterManualArea")}
                          invalid={Boolean(fieldErrors.override_area)}
                          className="h-10 max-h-10"
                        />
                      </Field>
                      <p className="text-micro text-ink-3">
                        {t("lots.areaOverrideWarning")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-card border border-line p-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={overridePrice}
                      onChange={(e) => setOverridePrice(e.target.checked)}
                      className="h-4 w-4 rounded border-line-strong accent-brand"
                    />
                    <span className="text-label font-semibold text-ink-2">
                      {t("lots.overridePrice")}
                    </span>
                  </label>
                  {overridePrice && (
                    <div className="mt-3 space-y-2">
                      <Field error={fieldErrors.override_price}>
                        <Input
                          type="number"
                          value={overridePriceValue}
                          onChange={(e) => setOverridePriceValue(e.target.value)}
                          placeholder={t("lots.enterManualPrice")}
                          invalid={Boolean(fieldErrors.override_price)}
                          className="h-10 max-h-10"
                        />
                      </Field>
                      <p className="text-micro text-ink-3">
                        {t("lots.priceOverrideWarning")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card title={t("lots.boundaryDescriptions")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {boundaries.map((item) => (
                  <Field key={item.label} label={item.label}>
                    <Input
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      placeholder={`${t("lots.limitWith")}...`}
                      className="h-10 max-h-10"
                    />
                  </Field>
                ))}
              </div>
            </Card>

            <Card title={t("lots.notes")}>
              <Field>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  aria-label={t("lots.notes")}
                  placeholder={t("lots.additionalNotes")}
                  className="min-h-24 w-full resize-none rounded-control border border-line-strong bg-surface px-3 py-2 text-[16px] text-ink outline-none sm:text-body-lg"
                />
              </Field>
            </Card>
          </form>

          <aside className="flex flex-col gap-4">
            <Card title={t("lots.formSummary")} bodyClassName="p-[18px]">
              <dl className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-label text-ink-3">
                    {t("lotsTable.project")}
                  </dt>
                  <dd className="min-w-0 truncate text-right text-label font-semibold text-ink">
                    {projectName || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-label text-ink-3">{t("lots.status")}</dt>
                  <dd className="text-label font-semibold text-ink">
                    {statusLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-label text-ink-3">
                    {t("lots.calculatedArea")}
                  </dt>
                  <dd className="text-label font-semibold text-ink">
                    {fmtNum(displayedArea)} {areaUnitLabel(measurementUnit)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
                  <dt className="text-label text-ink-3">
                    {t("lots.estimatedPrice")}
                  </dt>
                  <dd className="text-body font-bold text-ink">
                    {fmtNum(effectivePricePreview)} {currency}
                  </dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>

        {project_id && lot_id && (
          <LotPhotosPanel
            projectId={project_id}
            lotId={lot_id}
            canManage={user?.role === "admin"}
          />
        )}

        <SaveBar
          visible
          dirty
          saving={saving}
          message={t("lots.unsavedChanges")}
          onDiscard={() => navigate(-1)}
          saveLabel={t("common.saveChanges")}
          discardLabel={t("common.cancel")}
          saveType="submit"
          saveForm="lot-edit-form"
          saveDisabled={saving || user?.role !== "admin"}
        />
      </div>
    </main>
  );
}

export default EditLot;
