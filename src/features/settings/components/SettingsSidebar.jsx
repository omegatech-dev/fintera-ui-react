import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import SettingsNav from "./SettingsNav";

function SettingsSidebar() {
  const { user: loggedUser } = useContext(AuthContext);
  const { t } = useLocale();
  const isAdmin = loggedUser?.role === "admin";

  return (
    <aside className="flex min-w-0 flex-col gap-4 lg:w-[220px]">
      <SettingsNav showOrganization={isAdmin} ariaLabel={t("settings.admin.navLabel")} />
    </aside>
  );
}

export default SettingsSidebar;
