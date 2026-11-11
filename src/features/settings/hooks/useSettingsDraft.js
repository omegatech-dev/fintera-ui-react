import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGeneralSettings } from "../../../contexts/generalSettings";

const pickFields = (settings, fields) => {
  const next = {};
  fields.forEach((field) => {
    next[field] = settings[field];
  });
  return next;
};

export const useSettingsDraft = (fields) => {
  const { settings, loading, update } = useGeneralSettings();
  const fieldKey = fields.join("|");
  const fieldList = useMemo(() => fieldKey.split("|"), [fieldKey]);
  const [draft, setDraft] = useState(() => pickFields(settings, fieldList));
  const initialized = useRef(false);

  const currentSaved = useMemo(
    () => pickFields(settings, fieldList),
    [settings, fieldList]
  );

  useEffect(() => {
    if (!initialized.current && !loading) {
      setDraft(currentSaved);
      initialized.current = true;
    }
  }, [loading, currentSaved]);

  const dirty = fieldList.some(
    (field) => String(draft[field] ?? "") !== String(currentSaved[field] ?? "")
  );

  const setField = useCallback((field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setDraft(currentSaved);
  }, [currentSaved]);

  const save = useCallback(
    async (partial) => {
      const next = await update(partial);
      setDraft(pickFields(next, fieldList));
      initialized.current = true;
      return next;
    },
    [update, fieldList]
  );

  return {
    settings,
    loading,
    draft,
    setField,
    reset,
    dirty,
    save,
  };
};
