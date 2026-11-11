import { useEffect, useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { settingsApi } from "../api";

const inputClass =
  "w-full rounded-xl border border-bgray-200 dark:border-darkblack-400 bg-white dark:bg-darkblack-500 px-3.5 py-2.5 text-sm font-semibold text-bgray-900 dark:text-white outline-none focus:border-indigo-500";
const labelClass =
  "mb-1 block text-xs font-bold text-bgray-700 dark:text-bgray-300";

function isValidWhatsApp(value) {
  return value === "" || /^\+?[0-9]{8,20}$/.test(value);
}

function isValidEmail(value) {
  return value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function GeneralSettingsForm() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [holdHours, setHoldHours] = useState(48);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    settingsApi
      .get()
      .then((data) => {
        if (!active) return;
        const settings = data?.settings || data || {};
        setWhatsapp(settings.support_whatsapp || "");
        setEmail(settings.support_email || "");
        setHoldHours(settings.reservation_hold_hours || 48);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidWhatsApp(whatsapp.trim())) {
      showToast(t("branding.errorWhatsApp"), "error");
      return;
    }
    if (!isValidEmail(email.trim())) {
      showToast(t("branding.errorEmail"), "error");
      return;
    }
    const hours = Number(holdHours);
    if (!Number.isFinite(hours) || hours < 1 || hours > 720) {
      showToast(t("branding.errorHoldHours"), "error");
      return;
    }

    setSaving(true);
    try {
      const data = await settingsApi.update({
        support_whatsapp: whatsapp.trim(),
        support_email: email.trim(),
        reservation_hold_hours: Math.round(hours),
      });
      const settings = data?.settings || data || {};
      setWhatsapp(settings.support_whatsapp || "");
      setEmail(settings.support_email || "");
      setHoldHours(settings.reservation_hold_hours || Math.round(hours));
      showToast(t("branding.generalSaved"), "success");
    } catch (err) {
      showToast(err?.message || t("branding.generalError"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-[2rem] border border-bgray-200 bg-white p-6 sm:p-8 shadow-sm dark:border-darkblack-400 dark:bg-darkblack-600">
      <header className="mb-5">
        <h3 className="text-lg font-black text-bgray-900 dark:text-white">
          {t("branding.generalTitle")}
        </h3>
        <p className="mt-1 text-xs font-semibold text-bgray-500">
          {t("branding.generalSubtitle")}
        </p>
      </header>

      {loading ? (
        <p className="text-sm font-semibold text-bgray-500">
          {t("common.loading")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>
                {t("branding.supportWhatsApp")}
              </span>
              <input
                aria-label={t("branding.supportWhatsApp")}
                className={inputClass}
                placeholder="+50499998888"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
              />
              <span className="mt-1 block text-[11px] text-bgray-500">
                {t("branding.supportWhatsAppHint")}
              </span>
            </label>

            <label className="block">
              <span className={labelClass}>{t("branding.supportEmail")}</span>
              <input
                aria-label={t("branding.supportEmail")}
                type="email"
                className={inputClass}
                placeholder="soporte@fintera.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className={labelClass}>{t("branding.holdHours")}</span>
              <input
                aria-label={t("branding.holdHours")}
                type="number"
                min="1"
                max="720"
                className={inputClass}
                value={holdHours}
                onChange={(event) => setHoldHours(event.target.value)}
              />
              <span className="mt-1 block text-[11px] text-bgray-500">
                {t("branding.holdHoursHint")}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? t("branding.saving") : t("branding.save")}
          </button>
        </form>
      )}
    </section>
  );
}
