import { useLocale } from "../../contexts/LocaleContext";
import { CUSTOMER_PORTAL_URL } from "@config";

/**
 * Customer accounts now live in the Omegatech customer portal. Admin/seller
 * users keep using this app; `user`-role accounts are redirected here.
 */
export default function CustomerPortalNotice() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bgray-50 px-4 dark:bg-darkblack-700">
      <div className="w-full max-w-lg rounded-[2rem] border border-bgray-200 bg-white p-8 text-center shadow-sm dark:border-darkblack-400 dark:bg-darkblack-600">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-2xl">
          👤
        </div>
        <h1 className="text-xl font-black text-bgray-900 dark:text-white">
          {t("customerPortal.title")}
        </h1>
        <p className="mt-2 text-sm font-medium text-bgray-500 dark:text-bgray-400">
          {t("customerPortal.description")}
        </p>
        <a
          href={CUSTOMER_PORTAL_URL}
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
        >
          {t("customerPortal.action")}
        </a>
      </div>
    </div>
  );
}
