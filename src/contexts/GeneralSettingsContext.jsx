import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { settingsApi } from "../features/settings/api";
import { setFormatSettings } from "../shared/utils/formatSettings";
import GeneralSettingsContext, {
  DEFAULT_GENERAL_SETTINGS,
  STORAGE_KEY,
  normalizeGeneralSettings,
} from "./generalSettings";

const readCachedSettings = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeGeneralSettings(JSON.parse(raw));
  } catch {
    return null;
  }
};

const cacheSettings = (settings) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable; settings still work in memory.
  }
};

export const GeneralSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(
    () => readCachedSettings() || DEFAULT_GENERAL_SETTINGS
  );
  const [loading, setLoading] = useState(true);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    setFormatSettings(settings);
  }, [settings]);

  const applySettings = useCallback((next) => {
    setSettings(next);
    cacheSettings(next);
    setFormatSettings(next);
    return next;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      const next = normalizeGeneralSettings(data?.settings || data);
      return applySettings(next);
    } catch (error) {
      // Keep cached/default settings; settings being unavailable must not break the UI.
      console.warn(
        "General settings unavailable, using defaults:",
        error?.message || error
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (partial) => {
      const snapshot = { ...settingsRef.current, ...partial };
      const data = await settingsApi.update(snapshot);
      const serverSettings = data?.settings || data || {};
      const next = normalizeGeneralSettings({
        ...snapshot,
        ...serverSettings,
      });
      return applySettings(next);
    },
    [applySettings]
  );

  const value = useMemo(
    () => ({ settings, loading, refresh, update }),
    [settings, loading, refresh, update]
  );

  return (
    <GeneralSettingsContext.Provider value={value}>
      {children}
    </GeneralSettingsContext.Provider>
  );
};

export default GeneralSettingsProvider;
