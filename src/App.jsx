import Router from "./Router";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ToastProvider } from "./contexts/ToastContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

import ErrorBoundary from "./shared/error/ErrorBoundary";

function App() {
  return (
    <>
      <LocaleProvider>
        <OnboardingProvider>
          <ToastProvider>
            <ErrorBoundary fallback={<div>Something went wrong.</div>}>

              <Router />
            </ErrorBoundary>
          </ToastProvider>
        </OnboardingProvider>
      </LocaleProvider>
    </>
  );
}

export default App;
