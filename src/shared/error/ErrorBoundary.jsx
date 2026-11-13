import React from "react";
import PropTypes from "prop-types";
import { useRollbar } from "@rollbar/react";
import { useLocale } from "@/contexts/LocaleContext";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
    this.retryButtonRef = React.createRef();
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    try {
      if (this.props.rollbar) {
        this.props.rollbar.error(error, { errorInfo });
      }
    } catch {
      // swallow errors from Rollbar itself
      // but still mark that an error occurred
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // If the tree under this boundary changed, try resetting the error state.
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
      return;
    }

    // When entering the error state, autofocus the Retry button for accessibility
    if (this.state.hasError && !prevState.hasError) {
      try {
        this.retryButtonRef.current?.focus();
      } catch {
        // ignore focus errors
      }
    }
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  renderFallback() {
    const { t } = this.props.localeContext || { t: (key) => key };
    const fallback = this.props.fallback ?? (
      <div className="text-center">
        <p className="text-display font-bold leading-none text-brand">!</p>
        <h1 className="mt-3 text-page font-bold text-ink">
          {t("errors.unexpectedError")}
        </h1>
        <p className="mt-2 text-body text-ink-3">
          {t("errors.somethingWentWrong")}
        </p>
      </div>
    );

    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-canvas px-4 py-12">
        <div
          role="alert"
          aria-live="assertive"
          className="w-full max-w-lg rounded-card border border-line bg-surface p-8 shadow-pop"
        >
          {fallback}
          <div className="mt-6 flex justify-center">
            <button
              ref={this.retryButtonRef}
              type="button"
              onClick={this.handleRetry}
              className="inline-flex h-11 items-center justify-center rounded-control bg-brand px-4 text-body-lg font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    return this.props.children;
  }
}

ErrorBoundaryClass.propTypes = {
  fallback: PropTypes.node,
  children: PropTypes.node,
  rollbar: PropTypes.object,
  localeContext: PropTypes.shape({
    t: PropTypes.func.isRequired,
  }),
};

// Wrapper component to provide locale context and Rollbar instance to class component
const ErrorBoundaryWithLocale = (props) => {
  const localeContext = useLocale();
  const rollbar = useRollbar();
  return <ErrorBoundaryClass {...props} localeContext={localeContext} rollbar={rollbar} />;
};

export default ErrorBoundaryWithLocale;
