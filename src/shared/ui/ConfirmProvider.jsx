import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import ConfirmDialog from "./ConfirmDialog";

const ConfirmContext = createContext(null);

// Bridge so non-component modules can await a confirmation without a hook.
let externalHandler = null;

export function confirmDialog(options) {
  return externalHandler
    ? externalHandler(options)
    : Promise.resolve(false);
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (nextOptions = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions({
          tone: "danger",
          confirmLabel: "Confirmar",
          cancelLabel: "Cancelar",
          ...nextOptions,
        });
      }),
    []
  );

  useEffect(() => {
    externalHandler = confirm;
    return () => {
      externalHandler = null;
    };
  }, [confirm]);

  const close = (result) => {
    setOptions(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={Boolean(options)}
        title={options?.title}
        description={options?.description}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        tone={options?.tone}
        onClose={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

ConfirmProvider.propTypes = {
  children: PropTypes.node,
};
