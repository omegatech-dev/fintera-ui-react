import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "../../api";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import ProjectDrawingsPanel from "../../components/media/ProjectDrawingsPanel";
import ProjectPhotosPanel from "../../components/media/ProjectPhotosPanel";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faProjectDiagram,
  faAlignLeft,
  faMapMarkerAlt,
  faCalendarAlt,
  faCubes,
  faRulerCombined,
  faTag,
  faPercentage,
  faBriefcase,
  faChevronLeft,
  faSave,
  faCheckCircle,
  faChartPie,
  faBoxOpen,
  faBookmark,
  faCheckDouble,
  faFingerprint,
  faCopy
} from "@fortawesome/free-solid-svg-icons";

function EditProject() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const canManageMedia = user?.role === "admin";

  const [name, setName] = useState("");
  const [guid, setGuid] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [code, setCode] = useState("");
  const [lotCount, setLotCount] = useState(0);
  const [pricePerSquareUnit, setPricePerSquareUnit] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [interestRate, setInterestRate] = useState(0);
  const [commissionRateDirect, setCommissionRateDirect] = useState(0);
  const [commissionRateBank, setCommissionRateBank] = useState(0);
  const [commissionRateCash, setCommissionRateCash] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [projectType, setProjectType] = useState("residential");
  const [availableLots, setAvailableLots] = useState(0);
  const [reservedLots, setReservedLots] = useState(0);
  const [soldLots, setSoldLots] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoadingProject(false);
      return;
    }
    const fetchProject = async () => {
      setLoadingProject(true);
      setError(null);
      try {
        const data = await projectsApi.get(id);
        // Handle wrapped responses (e.g. { project: ... } or { data: ... })
        const pdata = data.project || data.data || data;
        setName(pdata.name || "");
        setGuid(pdata.guid || "");
        setDescription(pdata.description || "");
        setAddress(pdata.address || "");
        setCity(pdata.city || "");
        setCode(pdata.code || "");
        setLotCount(pdata.lot_count || 0);
        setPricePerSquareUnit(pdata.price_per_square_unit || 0);
        setMeasurementUnit(pdata.measurement_unit || "m2");
        setInterestRate(pdata.interest_rate || 0);
        setCommissionRateDirect(pdata.commission_rate_direct || 0);
        setCommissionRateBank(pdata.commission_rate_bank || 0);
        setCommissionRateCash(pdata.commission_rate_cash || 0);
        // Normalize ISO date (e.g. 2028-01-01T00:00:00Z) to YYYY-MM-DD for input[type="date"]
        const rawDate = pdata.delivery_date || "";
        setDeliveryDate(rawDate ? rawDate.slice(0, 10) : "");
        setProjectType(pdata.project_type || "residential");
        setAvailableLots(pdata.available_lots || 0);
        setReservedLots(pdata.reserved_lots || 0);
        setSoldLots(pdata.sold_lots || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, [id, t]);

  const handleMeasurementUnitChange = (event) => {
    const next = event.target.value;
    if (next === measurementUnit) return;
    if (window.confirm(t("projects.measurementUnitChangeWarning"))) {
      setMeasurementUnit(next);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await projectsApi.update(id, {
        project: {
          name,
          guid,
          description,
          address,
          city: city.trim() || null,
          code: code.trim() || null,
          lot_count: Number(lotCount),
          price_per_square_unit: Number(pricePerSquareUnit),
          measurement_unit: measurementUnit,
          interest_rate: Number(interestRate),
          commission_rate_direct: Number(commissionRateDirect),
          commission_rate_bank: Number(commissionRateBank),
          commission_rate_cash: Number(commissionRateCash),
          delivery_date: deliveryDate || null,
          project_type: projectType,
        }
      });

      navigate("/projects");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-bgray-200 dark:border-darkblack-400">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="text-lg font-bold text-bgray-900 dark:text-white uppercase tracking-wider text-sm">{title}</h3>
    </div>
  );

  const StatBlock = ({ icon, label, value, colorClass, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-bgray-50 dark:bg-darkblack-500 p-5 rounded-2xl border border-bgray-200 dark:border-darkblack-400 flex items-center space-x-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <FontAwesomeIcon icon={icon} className="text-xl" />
      </div>
      <div>
        <span className="block text-xs font-semibold text-bgray-500 dark:text-bgray-400 uppercase tracking-tighter">{label}</span>
        <span className="text-2xl font-black text-bgray-900 dark:text-white tabular-nums">{value}</span>
      </div>
    </motion.div>
  );

  if (loadingProject) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-bgray-600 dark:text-bgray-400 font-medium">{t('projects.loadingProject')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] min-h-screen bg-bgray-50 dark:bg-darkblack-700">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-bgray-600 dark:text-bgray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-2 text-xs" />
              <span className="text-sm font-medium">{t('projectsPage.title') || 'Projects'}</span>
            </button>
            <h1 className="text-3xl font-extrabold text-bgray-900 dark:text-white sm:text-4xl">
              {t('projects.editProject')}
            </h1>
            <p className="mt-2 text-bgray-600 dark:text-bgray-400">
              {t('projects.updateProjectInfo')}
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 flex items-center"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mr-3 rotate-45" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatBlock
            icon={faBoxOpen}
            label={t('projects.availableLots')}
            value={availableLots}
            colorClass="text-success-300 bg-success-300/10"
            delay={0.1}
          />
          <StatBlock
            icon={faBookmark}
            label={t('projects.reservedLots')}
            value={reservedLots}
            colorClass="text-orange-500 bg-orange-500/10"
            delay={0.2}
          />
          <StatBlock
            icon={faCheckDouble}
            label={t('projects.soldLots')}
            value={soldLots}
            colorClass="text-red-500 bg-red-500/10"
            delay={0.3}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-darkblack-600 rounded-2xl p-8 shadow-xs border border-bgray-200 dark:border-darkblack-400">
            <SectionTitle icon={faProjectDiagram} title={t('dashboard.overview') || 'General Information'} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.guid') || 'Project ID'}
                </label>
                <div className="relative group/guid">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faFingerprint} />
                  </span>
                  <input
                    type="text"
                    value={guid}
                    readOnly
                    className="w-full h-12 pl-12 pr-12 bg-bgray-100 dark:bg-darkblack-400 border border-bgray-200 dark:border-darkblack-400 rounded-xl cursor-not-allowed opacity-70 font-mono text-xs dark:text-bgray-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(guid);
                      showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-bgray-400 hover:text-indigo-600 transition-colors"
                    title={t('common.copy') || 'Copy'}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.name')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faProjectDiagram} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    placeholder={t('projects.enterProjectName')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.projectType')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400 pointer-events-none">
                    <FontAwesomeIcon icon={faBriefcase} />
                  </span>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white appearance-none"
                  >
                    <option value="residential">{t('projects.residential')}</option>
                    <option value="commercial">{t('projects.commercial')}</option>
                    <option value="industrial">{t('projects.industrial')}</option>
                    <option value="mixed_use">{t('projects.mixedUse')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.deliveryDate')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </span>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.description')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-bgray-400">
                    <FontAwesomeIcon icon={faAlignLeft} />
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    placeholder={t('projects.enterDescription')}
                  ></textarea>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.address')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    placeholder={t('projects.enterAddress')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.city')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    placeholder={t('projects.enterCity')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                  {t('projects.code')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faFingerprint} />
                  </span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    placeholder={t('projects.enterCode')}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Configuration & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="bg-white dark:bg-darkblack-600 rounded-2xl p-8 shadow-xs border border-bgray-200 dark:border-darkblack-400">
              <SectionTitle icon={faCubes} title={t('projects.lots') || 'Structure'} />
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.lotsCount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                      <FontAwesomeIcon icon={faCubes} />
                    </span>
                    <input
                      type="number"
                      value={lotCount}
                      onChange={(e) => setLotCount(Number(e.target.value))}
                      required
                      disabled={reservedLots > 0 || soldLots > 0}
                      className={`w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white ${(reservedLots > 0 || soldLots > 0) ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {(reservedLots > 0 || soldLots > 0) && (
                    <p className="mt-1.5 text-sm text-bgray-500 dark:text-bgray-400">
                      {t('projects.lotsCountDisabledWhenReserved')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.measurementUnit')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400 pointer-events-none">
                      <FontAwesomeIcon icon={faRulerCombined} />
                    </span>
                    <select
                      value={measurementUnit}
                      onChange={handleMeasurementUnitChange}
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white appearance-none"
                    >
                      <option value="m2">{t('projects.squareMeters')}</option>
                      <option value="ft2">{t('projects.squareFeet')}</option>
                      <option value="vara2">{t('projects.squareVaras')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.pricePerUnit')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                      <FontAwesomeIcon icon={faTag} />
                    </span>
                    <input
                      type="number"
                      value={pricePerSquareUnit}
                      onChange={(e) => setPricePerSquareUnit(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-darkblack-600 rounded-2xl p-8 shadow-xs border border-bgray-200 dark:border-darkblack-400">
              <SectionTitle icon={faPercentage} title={t('projects.interestRate') || 'Rates'} />
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.interestRate')} (%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                      <FontAwesomeIcon icon={faPercentage} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.commissionRateDirect') || 'Commission (Direct)'} (%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                      <FontAwesomeIcon icon={faPercentage} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={commissionRateDirect}
                      onChange={(e) => setCommissionRateDirect(Number(e.target.value))}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.commissionRateBank') || 'Commission (Bank)'} (%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                      <FontAwesomeIcon icon={faPercentage} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={commissionRateBank}
                      onChange={(e) => setCommissionRateBank(Number(e.target.value))}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-bgray-700 dark:text-bgray-300 mb-2">
                    {t('projects.commissionRateCash') || 'Commission (Cash)'} (%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                      <FontAwesomeIcon icon={faPercentage} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={commissionRateCash}
                      onChange={(e) => setCommissionRateCash(Number(e.target.value))}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20 text-center">
                  <div className="flex items-center justify-center space-x-2 text-indigo-700 dark:text-indigo-300">
                    <FontAwesomeIcon icon={faChartPie} />
                    <span className="text-sm font-bold uppercase tracking-tight">{t('analytics.occupancyRate') || 'Overall Progress'}</span>
                  </div>
                  <div className="mt-3 h-3 w-full bg-bgray-200 dark:bg-darkblack-400 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(soldLots / lotCount) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-bgray-500 uppercase">
                    {Math.round((soldLots / lotCount) * 100)}% {t('projects.soldLots')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-bgray-700 dark:text-bgray-300 font-bold hover:bg-bgray-100 dark:hover:bg-darkblack-500 transition-all border border-bgray-200 dark:border-darkblack-400"
            >
              {t('common.back') || 'Back'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full sm:w-auto px-12 py-3.5 rounded-xl font-bold text-white shadow-lg 
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20'} 
                transition-all duration-300 flex items-center justify-center
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('projects.saving')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {t('projects.saveChanges')}
                </>
              )}
            </button>
          </motion.div>
        </form >
        {id && (
          <div className="mt-8 space-y-6">
            <ProjectDrawingsPanel projectId={id} canManage={canManageMedia} />
            <ProjectPhotosPanel projectId={id} canManage={canManageMedia} />
          </div>
        )}
      </motion.div >
    </main >
  );
}

export default EditProject;