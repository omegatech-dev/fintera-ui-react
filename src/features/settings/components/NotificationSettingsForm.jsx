import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { Toggle as Switch } from "../../../shared/ui";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSection from "./SettingsSection";
import { useSettingsSaveBarRegistration } from "../hooks/useSettingsSaveBarRegistration";
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

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-3.5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-body-lg font-semibold text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-micro text-ink-3">{description}</p>
        )}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
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

  const submitDraft = async () => {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    submitDraft();
  };

  const inShell = useSettingsSaveBarRegistration("notifications", {
    dirty,
    saving,
    onDiscard: handleDiscard,
    onSubmit: submitDraft,
  });

  return (
    <SettingsSection
      title={t("branding.notifications.title")}
      description={t("branding.notifications.subtitle")}
    >
      {loading ? (
        <div className="h-24 animate-pulse rounded-control bg-surface-2" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Toggle
            checked={Boolean(draft.email_notifications_enabled)}
            onChange={(value) => setField("email_notifications_enabled", value)}
            label={t("branding.notifications.emailEnabled")}
            description={t("branding.notifications.emailEnabledHint")}
          />
          <Toggle
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

          <p className="rounded-control border border-warning-soft bg-warning-soft/60 p-3 text-micro text-warning">
            {t("branding.notifications.deploymentHint")}
          </p>

          {!inShell && (
            <SettingsSaveBar
              visible={dirty}
              saving={saving}
              saveDisabled={saving || loading}
              onDiscard={handleDiscard}
              onSave={submitDraft}
              labels={{
                unsaved: t("settings.saveBar.unsaved"),
                discard: t("settings.saveBar.discard"),
                save: t("settings.saveBar.save"),
                saving: t("settings.saveBar.saving"),
              }}
            />
          )}
        </form>
      )}
    </SettingsSection>
  );
}

export default NotificationSettingsForm;
