import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import SettingsSaveBar from "./SettingsSaveBar";
import { useLocale } from "../../../contexts/LocaleContext";
import SettingsSaveBarContext from "./settingsSaveBarContext";

export function SettingsSaveBarProvider({ children }) {
  const { t } = useLocale();
  const entries = useRef(new Map());
  const contentRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const [, forceRender] = useState(0);

  const bump = useCallback(() => {
    forceRender((value) => value + 1);
  }, []);

  const register = useCallback(
    (id, entry) => {
      entries.current.set(id, entry);
      bump();
      return () => {
        entries.current.delete(id);
        bump();
      };
    },
    [bump]
  );

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return undefined;

    const updateBounds = () => {
      const rect = element.getBoundingClientRect();
      setBounds({ left: rect.left, width: rect.width });
    };

    updateBounds();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateBounds);
    observer?.observe(element);
    window.addEventListener("resize", updateBounds);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  const values = Array.from(entries.current.values());
  const dirty = values.some((entry) => entry.dirty);
  const saving = values.some((entry) => entry.saving);
  const value = useMemo(() => ({ register }), [register]);

  return (
    <SettingsSaveBarContext.Provider value={value}>
      <div ref={contentRef}>{children}</div>
      {bounds && (
        <div
          className="fixed bottom-[76px] z-30 md:bottom-4"
          style={{ left: bounds.left, width: bounds.width }}
        >
          <SettingsSaveBar
            visible={dirty}
            saving={saving}
            saveDisabled={saving}
            onSave={async () => {
              for (const entry of values.filter((item) => item.dirty)) {
                await entry.submit();
              }
            }}
            onDiscard={() => values.forEach((entry) => entry.discard())}
            labels={{
              unsaved: t("settings.saveBar.unsaved"),
              discard: t("settings.saveBar.discard"),
              save: t("settings.saveBar.save"),
              saving: t("settings.saveBar.saving"),
            }}
          />
        </div>
      )}
    </SettingsSaveBarContext.Provider>
  );
}

SettingsSaveBarProvider.propTypes = {
  children: PropTypes.node,
};

export default SettingsSaveBarProvider;
