import img from "@/assets/images/illustration/404.svg";
import { Link, useNavigate } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/shared/ui";

function NotFound() {
  const { t } = useLocale();
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-canvas px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <img
          src={img}
          alt=""
          aria-hidden="true"
          className="mx-auto w-full max-w-[280px]"
        />
        <p className="mt-6 text-display font-bold leading-none text-brand">404</p>
        <h1 className="mt-2 text-page font-bold text-ink">
          {t("errors.notFoundTitle")}
        </h1>
        <p className="mt-2 text-body text-ink-3">
          {t("errors.notFoundDescription")}
        </p>
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
    </section>
  );
}

export default NotFound;
