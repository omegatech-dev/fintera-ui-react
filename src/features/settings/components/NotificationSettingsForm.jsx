import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { SettingsSaveBar } from "../../../shared/ui";
import SettingsSection from "./SettingsSection";
import { useSettingsDraft } from "../hooks/useSettingsDraft";
import {
  settingsErrorClass,
  settingsHelperClass,
  settingsInputClass,
  settingsInputDefaultClass,
  settingsInputErrorClass,
  settingsLabelClass,
} from "./settingsFormStyles";

const FIELDS = [
  "email_notifications_enabled",
  "overdue_reminders_enabled",
  "upcoming_reminder_days",
];

function Toggle({ id, checked, onChange, label, description }) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="flex items-center justify-between gap-6 border-b border-bgray-100 py-4 last:border-b-0 dark:border-darkblack-400">
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-semibold text-bgray-800 dark:text-bgray-100"
        >
          {label}
        </label>
        {description && (
          <p
            id={descriptionId}
            className="mt-1 text-xs text-bgray-500 dark:text-bgray-400"
          >
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={descriptionId}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-darkblack-600 ${
          checked ? "bg-blue-600" : "bg-bgray-300 dark:bg-darkblack-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function NotificationSettingsForm() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { draft, setField, reset, dirty, save, loading } = useSettingsDraft(FIELDS);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleDiscard = () => {
    reset();
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const reminderDays = Number(draft.upcoming_reminder_days);
    if (
      !Number.isFinite(reminderDays) ||
      reminderDays < 0 ||
      reminderDays > 30
    ) {
      setError(t("branding.notifications.errorReminderDays"));
      return;
    }

    setError("");
    setSaving(true);
    try {
      await save({
        email_notifications_enabled: Boolean(draft.email_notifications_enabled),
        overdue_reminders_enabled: Boolean(draft.overdue_reminders_enabled),
        upcoming_reminder_days: Math.round(reminderDays),
      });
      showToast(t("branding.notifications.saved"), "success");
    } catch (requestError) {
      showToast(requestError?.message || t("branding.notifications.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title={t("branding.notifications.title")}
      description={t("branding.notifications.subtitle")}
    >
      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-bgray-100 dark:bg-darkblack-500" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Toggle
            id="email-notifications-enabled"
            checked={Boolean(draft.email_notifications_enabled)}
            onChange={(value) => setField("email_notifications_enabled", value)}
            label={t("branding.notifications.emailEnabled")}
            description={t("branding.notifications.emailEnabledHint")}
          />
          <Toggle
            id="overdue-reminders-enabled"
            checked={Boolean(draft.overdue_reminders_enabled)}
            onChange={(value) => setField("overdue_reminders_enabled", value)}
            label={t("branding.notifications.overdueEnabled")}
            description={t("branding.notifications.overdueEnabledHint")}
          />

          <div className="max-w-xs">
            <label htmlFor="upcoming-reminder-days" className={settingsLabelClass}>
              {t("branding.notifications.upcomingDays")}
            </label>
            <input
              id="upcoming-reminder-days"
              type="number"
              min="0"
              max="30"
              className={`${settingsInputClass} ${
                error ? settingsInputErrorClass : settingsInputDefaultClass
              }`}
              value={draft.upcoming_reminder_days ?? 1}
              onChange={(event) => {
                setField("upcoming_reminder_days", event.target.value);
                if (error) setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby="upcoming-reminder-days-help upcoming-reminder-days-error"
            />
            <p id="upcoming-reminder-days-help" className={settingsHelperClass}>
              {t("branding.notifications.upcomingDaysHint")}
            </p>
            {error && (
              <p id="upcoming-reminder-days-error" role="alert" className={settingsErrorClass}>
                {error}
              </p>
            )}
          </div>

          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
            {t("branding.notifications.deploymentHint")}
          </p>

          <SettingsSaveBar
            visible={dirty}
            saving={saving}
            disabled={saving || loading}
            onDiscard={handleDiscard}
            labels={{
              unsaved: t("branding.saveBar.unsaved"),
              discard: t("branding.saveBar.discard"),
              save: t("branding.save"),
              saving: t("branding.saving"),
            }}
          />
        </form>
      )}
    </SettingsSection>
  );
}

export default NotificationSettingsForm;
