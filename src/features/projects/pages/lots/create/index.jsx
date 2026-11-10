import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../../../../contexts/AuthContext";
import { projectsApi } from "../../../api";
import { useLocale } from "../../../../../contexts/LocaleContext";
import { areaUnitLabel, linearUnitLabel } from "../../../../../shared/utils/units";
import { motion, AnimatePresence } from "framer-motion";

// ---- Area conversion factors (from m2) ----
const M2_TO_FT2_FACTOR = 10.7639;
const M2_TO_VARA2_FACTOR = 1.431;
const AREA_CONVERSION_FROM_M2 = {
  m2: 1,
  ft2: M2_TO_FT2_FACTOR,
  vara2: M2_TO_VARA2_FACTOR,
};

function CreateLot() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  const [name, setName] = useState("");
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [overridePrice, setOverridePrice] = useState(false);
  const [overridePriceValue, setOverridePriceValue] = useState("");
  const [overrideArea, setOverrideArea] = useState(false);
  const [overrideAreaValue, setOverrideAreaValue] = useState("");
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [note, setNote] = useState("");
  const [north, setNorth] = useState("");
  const [east, setEast] = useState("");
  const [west, setWest] = useState("");
  const [south, setSouth] = useState("");

  const [projectPricePerUnit, setProjectPricePerUnit] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await projectsApi.get(projectId);
        // Handle wrapped responses (e.g. { project: ... } or { data: ... })
        const pdata = data.project || data.data || data;
        setProjectName(pdata.name || "");
        setProjectPricePerUnit(pdata.price_per_square_unit || 0);
        setMeasurementUnit(pdata.measurement_unit || "m2");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId]);

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

  const calculatedPrice = useMemo(() => {
    return +(displayedArea * Number(projectPricePerUnit || 0)).toFixed(2);
  }, [displayedArea, projectPricePerUnit]);

  const effectivePricePreview = useMemo(() => {
    if (overridePrice && Number(overridePriceValue) > 0) return Number(overridePriceValue);
    return calculatedPrice;
  }, [overridePrice, overridePriceValue, calculatedPrice]);

  const fmtNum = (num) => new Intl.NumberFormat().format(num);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setServerErrors([]);
    setFieldErrors({});

    const fe = {};
    if (!name.trim()) fe.name = "Nombre requerido";
    if (!(Number(length) > 0)) fe.length = "Longitud debe ser > 0";
    if (!(Number(width) > 0)) fe.width = "Anchura debe ser > 0";
    if (overridePrice && overridePriceValue && !(Number(overridePriceValue) > 0)) {
      fe.override_price = "Precio override debe ser > 0";
    }
    if (overrideArea && overrideAreaValue && !(Number(overrideAreaValue) > 0)) {
      fe.override_area = "Área override debe ser > 0";
    }
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setSaving(false);
      return;
    }

    try {
      await projectsApi.createLot(projectId, {
        lot: {
          name,
          length: Number(length),
          width: Number(width),
          measurement_unit: measurementUnit,
          address: address || "",
          registration_number: registrationNumber || "",
          note: note || "",
          north: north || "",
          east: east || "",
          west: west || "",
          south: south || "",
          price: calculatedPrice,
          area: displayedArea,
          ...(overridePrice && overridePriceValue ? { override_price: Number(overridePriceValue) } : { override_price: null }),
          ...(overrideArea && overrideAreaValue ? { override_area: Number(overrideAreaValue) } : { override_area: null }),
        },
      });

      navigate(`/projects/${projectId}/lots`);
    } catch (err) {
      // Handle validation errors if they come in a specific format from apiClient (rejected promise with error object)
      if (err.status === 422 && err.errors) {
        setServerErrors(err.errors);
      } else {
        setError(err.message || "Error creating lot");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-darkblack-700">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-success-300 border-t-transparent" />
        <p className="text-bgray-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t("lots.loading")}</p>
      </div>
    </div>
  );

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-white dark:bg-darkblack-600 shadow-2xl rounded-[2.5rem] border border-bgray-200 dark:border-darkblack-400 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-success-300/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="p-8 lg:p-12 border-b border-bgray-100 dark:border-darkblack-400 bg-bgray-50/50 dark:bg-darkblack-500/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black text-bgray-900 dark:text-white tracking-tight mb-2"
                >
                  {t("header.pageTitle.createLot")}
                </motion.h2>
                <div className="flex items-center gap-2">
                  <span className="bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 px-3 py-1 rounded-full text-xs font-bold border border-success-100 dark:border-success-800">
                    {projectName}
                  </span>
                  <span className="text-bgray-400 dark:text-bgray-500 text-xs font-bold uppercase tracking-widest">
                    {t("lots.newLot")}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-xl border-2 border-bgray-200 dark:border-darkblack-400 text-bgray-600 dark:text-bgray-300 font-bold hover:bg-bgray-100 transition-all text-sm uppercase tracking-widest"
                >
                  {t("common.back")}
                </button>
                <button
                  type="submit"
                  disabled={saving || user?.role !== 'admin'}
                  className={`px-8 py-3 rounded-xl font-black text-white shadow-lg transition-all text-sm uppercase tracking-widest ${saving ? 'bg-bgray-400' : 'bg-success-300 hover:bg-success-400'}`}
                >
                  {saving ? t("common.creating") : t("header.pageTitle.createLot")}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 space-y-12">
            {/* ALERT BOXES */}
            <AnimatePresence>
              {(error || serverErrors.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 space-y-2"
                >
                  {error && <p className="text-red-500 font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                  </p>}
                  {serverErrors.map((err, i) => (
                    <p key={i} className="text-red-500 font-bold text-sm ml-7">• {err}</p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* SECTION: BASIC INFO */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-bgray-900 dark:text-white uppercase tracking-tight">{t("lots.basicInfo")}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.lotName")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:ring-0 transition-all font-bold text-bgray-900 dark:text-white"
                    placeholder="E.g. Lote 42"
                  />
                  {fieldErrors.name && <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.measurementUnit")}</label>
                  <div className="w-full bg-bgray-100 dark:bg-darkblack-700 p-4 rounded-2xl border-2 border-transparent font-bold text-bgray-500 dark:text-bgray-400 italic">
                    {areaUnitLabel(measurementUnit)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.address")}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:ring-0 transition-all font-bold text-bgray-900 dark:text-white"
                    placeholder={t("lots.optionalAddress")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.registrationNumber")}</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:ring-0 transition-all font-bold text-bgray-900 dark:text-white"
                    placeholder={t("lots.optionalRegistration")}
                  />
                </div>
              </div>
            </section>

            <hr className="border-bgray-100 dark:border-darkblack-400" />

            {/* SECTION: DIMENSIONS & PRICE */}
            <section className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/30 flex items-center justify-center text-success-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-xl font-bold text-bgray-900 dark:text-white uppercase tracking-tight">{t("lots.geometryPrice")}</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="space-y-6 md:col-span-1">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.length")} ({linearUnitLabel(measurementUnit)})</label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-2xl border-2 border-transparent focus:border-success-400 focus:ring-0 transition-all font-black text-xl text-bgray-900 dark:text-white"
                    />
                    {fieldErrors.length && <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider">{fieldErrors.length}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.width")} ({linearUnitLabel(measurementUnit)})</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-2xl border-2 border-transparent focus:border-success-400 focus:ring-0 transition-all font-black text-xl text-bgray-900 dark:text-white"
                    />
                    {fieldErrors.width && <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider">{fieldErrors.width}</p>}
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-bgray-50 dark:bg-darkblack-500 p-8 rounded-[2rem] border-2 border-bgray-100 dark:border-darkblack-400 relative overflow-hidden ring-1 ring-success-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success-300/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                  <div className={`space-y-1 transition-all duration-300 ${overrideArea ? 'opacity-100' : 'opacity-80'}`}>
                    <p className="text-[10px] font-black text-success-500 uppercase tracking-[0.2em] mb-2">{t("lots.calculatedArea")}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-bgray-900 dark:text-white">{fmtNum(displayedArea)}</span>
                      <span className="text-sm font-bold text-bgray-400">{areaUnitLabel(measurementUnit)}</span>
                    </div>
                    {overrideArea && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-[10px] text-white font-black rounded uppercase tracking-widest mt-2 shadow-lg shadow-blue-600/20"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        Manual Mode
                      </motion.span>
                    )}
                  </div>

                  <div className={`space-y-1 transition-all duration-300 ${overridePrice ? 'opacity-100' : 'opacity-80'}`}>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{t("lots.estimatedPrice")}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-bgray-900 dark:text-white">{fmtNum(effectivePricePreview)}</span>
                      <span className="text-sm font-bold text-bgray-400">HNL</span>
                    </div>
                    {overridePrice && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-[10px] text-white font-black rounded uppercase tracking-widest mt-2 shadow-lg shadow-blue-600/20"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        Manual Mode
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>

              {/* OVERRIDES DIVIDER */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="group p-6 rounded-3xl bg-white dark:bg-darkblack-600 border-2 border-bgray-100 dark:border-darkblack-400 hover:border-success-300 transition-all shadow-xs">
                  <label className="flex items-center gap-4 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideArea}
                      onChange={(e) => setOverrideArea(e.target.checked)}
                      className="w-6 h-6 rounded-lg text-success-300 focus:ring-success-300 bg-bgray-100 dark:bg-darkblack-500 border-0"
                    />
                    <span className="text-sm font-black text-bgray-900 dark:text-white uppercase tracking-widest">
                      {t("lots.overrideArea")}
                    </span>
                  </label>
                  <AnimatePresence>
                    {overrideArea && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <input
                          type="number"
                          value={overrideAreaValue}
                          onChange={(e) => setOverrideAreaValue(e.target.value)}
                          className="w-full bg-bgray-50 dark:bg-darkblack-700 p-4 rounded-xl border-2 border-success-100 dark:border-success-900 font-bold"
                          placeholder={t("lots.enterManualArea")}
                        />
                        {fieldErrors.override_area && <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider">{fieldErrors.override_area}</p>}
                        <p className="text-[10px] text-bgray-400 italic">{t("lots.areaOverrideWarning")}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="group p-6 rounded-3xl bg-white dark:bg-darkblack-600 border-2 border-bgray-100 dark:border-darkblack-400 hover:border-blue-300 transition-all shadow-xs">
                  <label className="flex items-center gap-4 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overridePrice}
                      onChange={(e) => setOverridePrice(e.target.checked)}
                      className="w-6 h-6 rounded-lg text-blue-500 focus:ring-blue-500 bg-bgray-100 dark:bg-darkblack-500 border-0"
                    />
                    <span className="text-sm font-black text-bgray-900 dark:text-white uppercase tracking-widest">
                      {t("lots.overridePrice")}
                    </span>
                  </label>
                  <AnimatePresence>
                    {overridePrice && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <input
                          type="number"
                          value={overridePriceValue}
                          onChange={(e) => setOverridePriceValue(e.target.value)}
                          className="w-full bg-bgray-50 dark:bg-darkblack-700 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900 font-bold"
                          placeholder={t("lots.enterManualPrice")}
                        />
                        {fieldErrors.override_price && <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider">{fieldErrors.override_price}</p>}
                        <p className="text-[10px] text-bgray-400 italic">{t("lots.priceOverrideWarning")}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            <hr className="border-bgray-100 dark:border-darkblack-400" />

            {/* SECTION: BOUNDARIES */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-bgray-900 dark:text-white uppercase tracking-tight">{t("lots.boundaryDescriptions")}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: t("lots.north"), value: north, setter: setNorth, icon: "⬆️" },
                  { label: t("lots.south"), value: south, setter: setSouth, icon: "⬇️" },
                  { label: t("lots.east"), value: east, setter: setEast, icon: "➡️" },
                  { label: t("lots.west"), value: west, setter: setWest, icon: "⬅️" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-[10px] font-black text-bgray-400 uppercase tracking-widest flex items-center gap-1">
                      <span className="opacity-50">{item.icon}</span> {item.label}
                    </label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full bg-bgray-50 dark:bg-darkblack-500 p-4 rounded-2xl border-2 border-transparent focus:border-orange-400 focus:ring-0 transition-all font-bold text-bgray-900 dark:text-white"
                      placeholder={`${t("lots.limitWith")}...`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION: NOTES */}
            <section className="space-y-4">
              <label className="text-xs font-black text-bgray-400 uppercase tracking-widest">{t("lots.notes")}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full bg-bgray-50 dark:bg-darkblack-500 p-6 rounded-[2rem] border-2 border-transparent focus:border-bgray-300 focus:ring-0 transition-all font-bold text-bgray-900 dark:text-white resize-none"
                placeholder={t("lots.additionalNotes")}
              />
            </section>
          </div>

          <div className="p-8 lg:p-12 bg-bgray-50/50 dark:bg-darkblack-500/50 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-10 py-5 rounded-2xl border-2 border-bgray-200 dark:border-darkblack-400 text-bgray-600 dark:text-bgray-300 font-black hover:bg-white transition-all text-xs uppercase tracking-[0.2em]"
            >
              {t("common.cancel")}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving || user?.role !== 'admin'}
              className={`px-12 py-5 rounded-2xl font-black text-white shadow-xl shadow-success-300/30 transition-all text-xs uppercase tracking-[0.2em] ${saving ? 'bg-bgray-400 cursor-not-allowed' : 'bg-success-300 hover:bg-success-400'}`}
            >
              {saving ? t("common.creating") : t("header.pageTitle.createLot")}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}

export default CreateLot;