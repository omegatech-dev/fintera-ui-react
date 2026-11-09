import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../../api";
import { useLocale } from "../../../../contexts/LocaleContext";
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
  faPlus,
  faCheckCircle,
  faFingerprint
} from "@fortawesome/free-solid-svg-icons";

function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lotCount, setLotCount] = useState(0);
  const [pricePerSquareUnit, setPricePerSquareUnit] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState("m2");
  const [interestRate, setInterestRate] = useState(0);
  const [commissionRateDirect, setCommissionRateDirect] = useState(4);
  const [commissionRateBank, setCommissionRateBank] = useState(6);
  const [commissionRateCash, setCommissionRateCash] = useState(7);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [projectType, setProjectType] = useState("residential");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await projectsApi.create({
        project: {
          name,
          description,
          address,
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
      navigate('/projects');
    } catch (error) {
      console.error('Error al conectar con el servidor', error);
      // Ideally show toast here too
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-bgray-200 dark:border-darkblack-400">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="text-lg font-bold text-bgray-900 dark:text-white uppercase tracking-wider text-sm">{title}</h3>
    </div>
  );

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
              className="flex items-center text-bgray-600 dark:text-bgray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-2 text-xs" />
              <span className="text-sm font-medium">{t('projectsPage.title') || 'Projects'}</span>
            </button>
            <h1 className="text-3xl font-extrabold text-bgray-900 dark:text-white sm:text-4xl">
              {t('projects.createNewProject')}
            </h1>
            <p className="mt-2 text-bgray-600 dark:text-bgray-400">
              {t('projects.fillProjectInfo')}
            </p>
          </div>
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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400">
                    <FontAwesomeIcon icon={faFingerprint} />
                  </span>
                  <input
                    type="text"
                    value={""}
                    readOnly
                    className="w-full h-12 pl-12 pr-4 bg-bgray-100 dark:bg-darkblack-400 border border-bgray-200 dark:border-darkblack-400 rounded-xl cursor-not-allowed opacity-70 font-mono text-xs dark:text-bgray-400"
                    placeholder={t('projects.guidAutoGenerated') || '(Auto-generado al crear)'}
                  />
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
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white appearance-none"
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
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                    required
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                    required
                    className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
                    placeholder={t('projects.enterAddress')}
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
                      onChange={(e) => setLotCount(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
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
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white appearance-none"
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
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                      onChange={(e) => setInterestRate(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                      onChange={(e) => setCommissionRateDirect(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                      onChange={(e) => setCommissionRateBank(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
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
                      onChange={(e) => setCommissionRateCash(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start">
                    <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5 mr-2" />
                    {t('reservations.calculationNote') || 'These rates will be applied to all new contracts within this project.'}
                  </p>
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
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full sm:w-auto px-12 py-3.5 rounded-xl font-bold text-white shadow-lg 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20'} 
                transition-all duration-300 flex items-center justify-center
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('projects.creating')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  {t('projects.createProject')}
                </>
              )}
            </button>
          </motion.div>
        </form >
      </motion.div >
    </main >
  );
}

export default CreateProject;