import AppNameForm from "../components/AppNameForm";
import GeneralSettingsForm from "../../settings/components/GeneralSettingsForm";
import LegalSettingsForm from "../../settings/components/LegalSettingsForm";
import NotificationSettingsForm from "../../settings/components/NotificationSettingsForm";
import RegionalSettingsForm from "../../settings/components/RegionalSettingsForm";
import { useLocale } from "../../../contexts/LocaleContext";

function General() {
  const { t } = useLocale();

  return (
    <div id="general" className="tab-pane active w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-bgray-900 dark:text-white">
          {t("settings.admin.general")}
        </h1>
        <p className="mt-1 font-medium text-bgray-500 dark:text-bgray-400">
          {t("settings.admin.generalDescription")}
        </p>
      </header>

      <AppNameForm />
      <GeneralSettingsForm />
      <LegalSettingsForm />
      <NotificationSettingsForm />
      <RegionalSettingsForm />
    </div>
  );
}

export default General;
