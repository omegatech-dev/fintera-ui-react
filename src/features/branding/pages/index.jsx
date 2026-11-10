import { motion } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";
import BrandingForm from "../components/BrandingForm";

function Branding() {
  const { t } = useLocale();

  return (
    <div id="branding" className="tab-pane active w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-bgray-900 dark:text-white mb-2">
            {t("branding.title")}
          </h2>
          <p className="text-bgray-500 dark:text-bgray-400 font-medium">
            {t("branding.subtitle")}
          </p>
        </div>

        <BrandingForm />
      </motion.div>
    </div>
  );
}

export default Branding;
