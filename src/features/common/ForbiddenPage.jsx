import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/shared/ui";
import { CUSTOMER_PORTAL_URL } from "@config";

/**
 * 403 screen shown when an authenticated user lacks access to a route.
 * Customers (role `user`) are pointed at the customer portal instead of the
 * admin back-office.
 */
function ForbiddenPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user } = useContext(AuthContext);
  const portalUrl = CUSTOMER_PORTAL_URL;
  const isCustomer = user?.role === "user";

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-display font-bold leading-none text-brand">403</p>
        <h1 className="mt-3 text-page font-bold text-ink">
          {t("errors.forbiddenTitle")}
        </h1>
        <p className="mt-2 text-body text-ink-3">
          {t("errors.forbiddenDescription")}
        </p>

        {isCustomer && (
          <p className="mt-6 text-body text-ink-2">
            {t("errors.forbiddenPortalPrompt")}{" "}
            {portalUrl ? (
              <a
                href={portalUrl}
                className="font-semibold text-brand-strong underline"
              >
                {t("errors.forbiddenPortalLink")}
              </a>
            ) : (
              <span className="font-semibold">
                {t("errors.forbiddenPortalFallback")}
              </span>
            )}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t("common.goBack")}
          </Button>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-control bg-brand px-4 text-body-lg font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            {t("errors.backToHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ForbiddenPage;
