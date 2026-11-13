import { useContext, useEffect, useRef } from "react";
import SettingsSaveBarContext from "../components/settingsSaveBarContext";

export const useSettingsSaveBarRegistration = (
  id,
  { dirty, saving, onDiscard, onSubmit }
) => {
  const context = useContext(SettingsSaveBarContext);
  const actionsRef = useRef({ onDiscard, onSubmit });
  actionsRef.current = { onDiscard, onSubmit };

  useEffect(() => {
    if (!context) return undefined;
    return context.register(id, {
      dirty,
      saving,
      discard: () => actionsRef.current.onDiscard(),
      submit: () => actionsRef.current.onSubmit(),
    });
  }, [context, id, dirty, saving]);

  return Boolean(context);
};
