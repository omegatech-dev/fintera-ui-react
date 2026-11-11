import AppNameForm from "../components/AppNameForm";
import GeneralSettingsForm from "../../settings/components/GeneralSettingsForm";

function General() {
  return (
    <div id="general" className="tab-pane active w-full">
      <AppNameForm />
      <GeneralSettingsForm />
    </div>
  );
}

export default General;
