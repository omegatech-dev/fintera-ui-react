import { useLocale } from "../../../contexts/LocaleContext";
import SettingsNav from "./SettingsNav";

function AdminSettingsSidebar() {
  const { t } = useLocale();

  return <SettingsNav showOrganization ariaLabel={t("settings.admin.navLabel")} />;
}

export default AdminSettingsSidebar;
