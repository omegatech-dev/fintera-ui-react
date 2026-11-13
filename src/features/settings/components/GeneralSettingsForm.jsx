import { useState } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSection from "./SettingsSection";
import { useSettingsSaveBarRegistration } from "../hooks/useSettingsSaveBarRegistration";
import { useSettingsDraft } from "../hooks/useSettingsDraft";
import {
  settingsErrorClass,
  settingsGridClass,
  settingsGridWideClass,
  settingsHelperClass,
  settingsInputClass,
  settingsInputDefaultClass,
  settingsInputErrorClass,
  settingsLabelClass,
} from "./settingsFormStyles";

const FIELDS = [
  "support_whatsapp",
  "support_email",
  "reservation_hold_hours",
  "reservation_min_amount",
  "reservation_due_days",
  "down_payment_due_days",
  "down_payment_due_days_with_reservation",
];

const inputClass = (hasError) =>
  `${settingsInputClass} ${hasError ? settingsInputErrorClass : settingsInputDefaultClass}`;

const isValidWhatsApp = (value) =>
  value === "" || /^\+?[0-9]{8,20}$/.test(value);
const isValidEmail = (value) =>
  value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function GeneralSettingsForm() {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { draft, setField, reset, dirty, save, loading } = useSettingsDraft(FIELDS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleDiscard = () => {
    reset();
    setErrors({});
  };

  const submitDraft = async () => {
    const nextErrors = {};
    const whatsapp = String(draft.support_whatsapp || "").trim();
    const email = String(draft.support_email || "").trim();
    const holdHours = Number(draft.reservation_hold_hours);
    const minAmount = Number(draft.reservation_min_amount);
    const reservationDueDays = Number(draft.reservation_due_days);
    const downPaymentDueDays = Number(draft.down_payment_due_days);
    const downPaymentWithReservation = Number(
      draft.down_payment_due_days_with_reservation
    );

    if (!isValidWhatsApp(whatsapp)) {
      nextErrors.support_whatsapp = t("branding.supportReservations.errorWhatsApp");
    }
    if (!isValidEmail(email)) {
      nextErrors.support_email = t("branding.supportReservations.errorEmail");
    }
    if (!Number.isFinite(holdHours) || holdHours < 1 || holdHours > 720) {
      nextErrors.reservation_hold_hours = t(
        "branding.supportReservations.errorHoldHours"
      );
    }
    if (!Number.isFinite(minAmount) || minAmount < 0) {
      nextErrors.reservation_min_amount = t(
        "branding.supportReservations.errorMinAmount"
      );
    }
    if (
      !Number.isFinite(reservationDueDays) ||
      reservationDueDays < 1 ||
      reservationDueDays > 365
    ) {
      nextErrors.reservation_due_days = t(
        "branding.supportReservations.errorDueDays"
      );
    }
    if (
      !Number.isFinite(downPaymentDueDays) ||
      downPaymentDueDays < 1 ||
      downPaymentDueDays > 365
    ) {
      nextErrors.down_payment_due_days = t(
        "branding.supportReservations.errorDueDays"
      );
    } else if (
      Number.isFinite(reservationDueDays) &&
      downPaymentDueDays < reservationDueDays
    ) {
      nextErrors.down_payment_due_days = t(
        "branding.supportReservations.errorDueOrder"
      );
    }
    if (
      !Number.isFinite(downPaymentWithReservation) ||
      downPaymentWithReservation < 1 ||
      downPaymentWithReservation > 365
    ) {
      nextErrors.down_payment_due_days_with_reservation = t(
        "branding.supportReservations.errorDueDays"
      );
    } else if (
      Number.isFinite(downPaymentDueDays) &&
      downPaymentWithReservation < downPaymentDueDays
    ) {
      nextErrors.down_payment_due_days_with_reservation = t(
        "branding.supportReservations.errorDueOrder"
      );
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await save({
        support_whatsapp: whatsapp,
        support_email: email,
        reservation_hold_hours: Math.round(holdHours),
        reservation_min_amount: minAmount,
        reservation_due_days: Math.round(reservationDueDays),
        down_payment_due_days: Math.round(downPaymentDueDays),
        down_payment_due_days_with_reservation: Math.round(
          downPaymentWithReservation
        ),
      });
      showToast(t("branding.supportReservations.saved"), "success");
    } catch (requestError) {
      showToast(
        requestError?.message || t("branding.supportReservations.error"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitDraft();
  };

  const inShell = useSettingsSaveBarRegistration("general", {
    dirty,
    saving,
    onDiscard: handleDiscard,
    onSubmit: submitDraft,
  });

  return (
    <SettingsSection
      title={t("branding.supportReservations.title")}
      description={t("branding.supportReservations.subtitle")}
    >
      {loading ? (
        <div className="space-y-3" aria-live="polite">
          <div className="h-10 animate-pulse rounded-control bg-surface-2" />
          <div className="h-10 animate-pulse rounded-control bg-surface-2" />
          <div className="h-10 animate-pulse rounded-control bg-surface-2" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={settingsGridClass}>
            <div>
              <label htmlFor="support-whatsapp" className={settingsLabelClass}>
                {t("branding.supportReservations.whatsApp")}
              </label>
              <input
                id="support-whatsapp"
                className={inputClass(errors.support_whatsapp)}
                placeholder="+50499998888"
                value={draft.support_whatsapp || ""}
                onChange={(event) => {
                  setField("support_whatsapp", event.target.value);
                  if (errors.support_whatsapp) {
                    setErrors((previous) => ({ ...previous, support_whatsapp: "" }));
                  }
                }}
                aria-invalid={Boolean(errors.support_whatsapp)}
                aria-describedby="support-whatsapp-help support-whatsapp-error"
              />
              <p id="support-whatsapp-help" className={settingsHelperClass}>
                {t("branding.supportReservations.whatsAppHint")}
              </p>
              {errors.support_whatsapp && (
                <p id="support-whatsapp-error" role="alert" className={settingsErrorClass}>
                  {errors.support_whatsapp}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="support-email" className={settingsLabelClass}>
                {t("branding.supportReservations.email")}
              </label>
              <input
                id="support-email"
                type="email"
                className={inputClass(errors.support_email)}
                placeholder="soporte@fintera.com"
                value={draft.support_email || ""}
                onChange={(event) => {
                  setField("support_email", event.target.value);
                  if (errors.support_email) {
                    setErrors((previous) => ({ ...previous, support_email: "" }));
                  }
                }}
                aria-invalid={Boolean(errors.support_email)}
                aria-describedby="support-email-error"
              />
              {errors.support_email && (
                <p id="support-email-error" role="alert" className={settingsErrorClass}>
                  {errors.support_email}
                </p>
              )}
            </div>
          </div>

          <div className="mt-[18px] border-t border-line pt-[18px]">
            <h3 className="text-[15px] font-bold text-ink">
              {t("branding.supportReservations.reservationTitle")}
            </h3>
            <div className={`mt-2.5 ${settingsGridWideClass}`}>
              <div>
                <label htmlFor="reservation-min-amount" className={settingsLabelClass}>
                  {t("branding.supportReservations.minAmount")}
                </label>
                <input
                  id="reservation-min-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass(errors.reservation_min_amount)}
                  value={draft.reservation_min_amount ?? 0}
                  onChange={(event) => {
                    setField("reservation_min_amount", event.target.value);
                    if (errors.reservation_min_amount) {
                      setErrors((previous) => ({ ...previous, reservation_min_amount: "" }));
                    }
                  }}
                  aria-invalid={Boolean(errors.reservation_min_amount)}
                  aria-describedby="reservation-min-amount-help reservation-min-amount-error"
                />
                <p id="reservation-min-amount-help" className={settingsHelperClass}>
                  {t("branding.supportReservations.minAmountHint")}
                </p>
                {errors.reservation_min_amount && (
                  <p id="reservation-min-amount-error" role="alert" className={settingsErrorClass}>
                    {errors.reservation_min_amount}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-hold-hours" className={settingsLabelClass}>
                  {t("branding.supportReservations.holdHours")}
                </label>
                <input
                  id="reservation-hold-hours"
                  type="number"
                  min="1"
                  max="720"
                  className={inputClass(errors.reservation_hold_hours)}
                  value={draft.reservation_hold_hours ?? 48}
                  onChange={(event) => {
                    setField("reservation_hold_hours", event.target.value);
                    if (errors.reservation_hold_hours) {
                      setErrors((previous) => ({ ...previous, reservation_hold_hours: "" }));
                    }
                  }}
                  aria-invalid={Boolean(errors.reservation_hold_hours)}
                  aria-describedby="reservation-hold-hours-help reservation-hold-hours-error"
                />
                <p id="reservation-hold-hours-help" className={settingsHelperClass}>
                  {t("branding.supportReservations.holdHoursHint")}
                </p>
                {errors.reservation_hold_hours && (
                  <p id="reservation-hold-hours-error" role="alert" className={settingsErrorClass}>
                    {errors.reservation_hold_hours}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-due-days" className={settingsLabelClass}>
                  {t("branding.supportReservations.reservationDueDays")}
                </label>
                <input
                  id="reservation-due-days"
                  type="number"
                  min="1"
                  max="365"
                  className={inputClass(errors.reservation_due_days)}
                  value={draft.reservation_due_days ?? 7}
                  onChange={(event) => {
                    setField("reservation_due_days", event.target.value);
                    if (errors.reservation_due_days) {
                      setErrors((previous) => ({ ...previous, reservation_due_days: "" }));
                    }
                  }}
                  aria-invalid={Boolean(errors.reservation_due_days)}
                  aria-describedby="reservation-due-days-error"
                />
                {errors.reservation_due_days && (
                  <p id="reservation-due-days-error" role="alert" className={settingsErrorClass}>
                    {errors.reservation_due_days}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="down-payment-due-days" className={settingsLabelClass}>
                  {t("branding.supportReservations.downPaymentDueDays")}
                </label>
                <input
                  id="down-payment-due-days"
                  type="number"
                  min="1"
                  max="365"
                  className={inputClass(errors.down_payment_due_days)}
                  value={draft.down_payment_due_days ?? 14}
                  onChange={(event) => {
                    setField("down_payment_due_days", event.target.value);
                    if (errors.down_payment_due_days) {
                      setErrors((previous) => ({ ...previous, down_payment_due_days: "" }));
                    }
                  }}
                  aria-invalid={Boolean(errors.down_payment_due_days)}
                  aria-describedby="down-payment-due-days-error"
                />
                {errors.down_payment_due_days && (
                  <p id="down-payment-due-days-error" role="alert" className={settingsErrorClass}>
                    {errors.down_payment_due_days}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="down-payment-with-reservation" className={settingsLabelClass}>
                  {t("branding.supportReservations.downPaymentWithReservation")}
                </label>
                <input
                  id="down-payment-with-reservation"
                  type="number"
                  min="1"
                  max="365"
                  className={inputClass(errors.down_payment_due_days_with_reservation)}
                  value={draft.down_payment_due_days_with_reservation ?? 21}
                  onChange={(event) => {
                    setField("down_payment_due_days_with_reservation", event.target.value);
                    if (errors.down_payment_due_days_with_reservation) {
                      setErrors((previous) => ({
                        ...previous,
                        down_payment_due_days_with_reservation: "",
                      }));
                    }
                  }}
                  aria-invalid={Boolean(errors.down_payment_due_days_with_reservation)}
                  aria-describedby="down-payment-with-reservation-error"
                />
                {errors.down_payment_due_days_with_reservation && (
                  <p
                    id="down-payment-with-reservation-error"
                    role="alert"
                    className={settingsErrorClass}
                  >
                    {errors.down_payment_due_days_with_reservation}
                  </p>
                )}
              </div>
            </div>
          </div>

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

export default GeneralSettingsForm;
