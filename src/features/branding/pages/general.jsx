import AppNameForm from "../components/AppNameForm";
import GeneralSettingsForm from "../../settings/components/GeneralSettingsForm";
import LegalSettingsForm from "../../settings/components/LegalSettingsForm";
import NotificationSettingsForm from "../../settings/components/NotificationSettingsForm";
import RegionalSettingsForm from "../../settings/components/RegionalSettingsForm";

function General() {
  return (
    <div id="general" className="tab-pane active w-full">
      <div>
        <AppNameForm />
        <GeneralSettingsForm />
        <LegalSettingsForm />
        <NotificationSettingsForm />
        <RegionalSettingsForm />
      </div>
    </div>
  );
}

export default General;
