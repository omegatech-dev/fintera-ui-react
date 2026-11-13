import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../../contexts/LocaleContext";
import {
  Banner,
  Button,
  Card,
  Field,
  Input,
  SaveBar,
  Select,
} from "@/shared/ui";
import { formatDate } from "../../../shared/utils/formatters";
import {
  getAvatarColor,
  getFullImageUrl,
  getInitials,
} from "../../../shared/utils/avatarUtils";

export function formatCedula(raw) {
  const d = raw.replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  return out;
}

export function formatRTN(raw) {
  const d = raw.replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  const g4 = d.slice(13, 14);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  if (g4) out += `-${g4}`;
  return out;
}

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  email: "",
  identity: "",
  rtn: "",
  address: "",
  password: "",
  password_confirmation: "",
  role: "user",
};

const ROLE_PERMISSIONS = {
  admin: [
    "permissionsAdminManage",
    "permissionsAdminApprove",
    "permissionsAdminProjects",
  ],
  seller: [
    "permissionsSellerClients",
    "permissionsSellerCollect",
    "permissionsSellerProjects",
  ],
  user: ["permissionsClientContracts", "permissionsClientReceipts"],
};

function PermissionRow({ label, allowed }) {
  return (
    <li className="flex items-center gap-2">
      <svg
        className={`h-3.5 w-3.5 shrink-0 ${
          allowed ? "text-brand" : "text-ink-3"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {allowed ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.4}
            d="M5 13l4 4L19 7"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M6 18L18 6M6 6l12 12"
          />
        )}
      </svg>
      <span
        className={`text-label ${allowed ? "text-ink-2" : "text-ink-3"}`}
      >
        {label}
      </span>
    </li>
  );
}

PermissionRow.propTypes = {
  label: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
};

/**
 * Consolidated user form used by the create and edit user pages. Encapsulates
 * the personal info, security and account sections.
 */
function UserForm({
  onSubmit,
  error,
  submitting = false,
  creatorRole,
  creatorName,
  initialValues,
  mode = "create",
  user,
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState(() => ({
    ...EMPTY_FORM,
    ...(initialValues || {}),
  }));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const baseline = useMemo(
    () => ({ ...EMPTY_FORM, ...(initialValues || {}) }),
    [initialValues]
  );

  const dirty = useMemo(
    () =>
      isEdit &&
      (Boolean(imageFile) ||
        Object.keys(baseline).some(
          (key) => String(formData[key] ?? "") !== String(baseline[key] ?? "")
        )),
    [isEdit, imageFile, baseline, formData]
  );

  const pwFeedback = useMemo(() => {
    const pw = formData.password;
    const criteria = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[^A-Za-z0-9]/.test(pw),
    };
    const score = Object.values(criteria).reduce((s, ok) => s + (ok ? 1 : 0), 0);
    let label;
    if (score <= 2) label = t("users.weak");
    else if (score <= 4) label = t("users.medium");
    else label = t("users.strong");
    return { label, score, criteria };
  }, [formData.password, t]);

  const pwMatch = useMemo(
    () => formData.password === formData.password_confirmation,
    [formData.password, formData.password_confirmation]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "identity") {
      v = formatCedula(value);
    } else if (name === "rtn") {
      v = formatRTN(value);
    }
    setFormData({ ...formData, [name]: v });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError(
          t("users.imageTooLarge") || "Image size should be less than 5MB"
        );
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.full_name.trim()) {
      setValidationError(t("users.fullNameRequired"));
      return;
    }
    const identityDigits = formData.identity.replace(/\D/g, "");
    if ((!isEdit || identityDigits) && identityDigits.length !== 13) {
      setValidationError(t("users.invalidIdentity"));
      return;
    }
    const rtnDigits = formData.rtn.replace(/\D/g, "");
    if ((!isEdit || rtnDigits) && rtnDigits.length !== 14) {
      setValidationError(t("users.invalidRTN"));
      return;
    }
    // Password optional: if empty, backend auto-generates a temp password and emails it
    if (formData.password !== "") {
      if (formData.password.length < 8) {
        setValidationError(t("users.passwordMinLength"));
        return;
      }
      if (!pwMatch) {
        setValidationError(t("users.passwordsDoNotMatch"));
        return;
      }
    }

    try {
      await onSubmit(formData, imageFile);
    } catch (err) {
      if (validationError) setValidationError(null);
      throw err;
    }
  };

  const handleDiscard = () => {
    setFormData(baseline);
    setImageFile(null);
    setImagePreview(null);
    setValidationError(null);
    navigate(-1);
  };

  const shownError = validationError || error;
  const isAdmin = creatorRole === "admin";
  const role = ["admin", "seller", "user"].includes(formData.role)
    ? formData.role
    : "user";
  const roleLabel = t(
    `userFilter.${role === "user" ? "client" : role}`
  );
  const permissionRows = (ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user).map(
    (key) => ({ label: t(`users.${key}`), allowed: true })
  );
  if (role !== "admin") {
    permissionRows.push({
      label: t("users.permissionsNoApprove"),
      allowed: false,
    });
  }

  const currentPhoto =
    imagePreview ||
    (user?.profile_picture_thumb || user?.profile_picture
      ? getFullImageUrl(user.profile_picture_thumb || user.profile_picture)
      : null);

  const activityItems = [
    user?.last_sign_in_at && {
      label: t("users.lastAccess"),
      value: formatDate(user.last_sign_in_at),
    },
    user?.confirmed_at && {
      label: t("personalInfo.lastConfirmed"),
      value: formatDate(user.confirmed_at),
    },
    user?.created_at && {
      label: t("personalInfo.memberSince"),
      value: formatDate(user.created_at),
    },
  ].filter(Boolean);

  const photoBlock = (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-section font-bold text-white ${
          currentPhoto ? "" : getAvatarColor(formData.full_name)
        }`}
      >
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={formData.full_name || "Preview"}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(formData.full_name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-label font-bold text-ink">
          {formData.full_name || "—"}
        </p>
        <p className="text-micro text-ink-3">{roleLabel}</p>
      </div>
      <label
        htmlFor="profile-picture"
        className="cursor-pointer text-label font-semibold text-brand hover:underline"
      >
        {t("users.changePhoto")}
      </label>
      <input
        type="file"
        id="profile-picture"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );

  const personalSection = (
    <section className="space-y-4">
      <h3 className="text-title font-bold text-ink">
        {t("users.personalInfo")}
      </h3>

      {!isEdit && photoBlock}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label={t("users.fullName")} required>
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </Field>

        <Field
          label={t("users.identity")}
          required={!isEdit}
          hint={t("users.identityPlaceholder")}
          error={
            formData.identity &&
            formData.identity.replace(/\D/g, "").length !== 13
              ? t("users.invalidIdentity")
              : undefined
          }
        >
          <Input
            name="identity"
            value={formData.identity}
            onChange={handleChange}
            required={!isEdit}
            invalid={
              !!formData.identity &&
              formData.identity.replace(/\D/g, "").length !== 13
            }
          />
        </Field>

        <Field label={t("users.email")} required>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label={t("users.phone")} required>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </Field>

        <Field
          label={t("users.rtn")}
          required={!isEdit}
          hint={t("users.rtnPlaceholder")}
          error={
            formData.rtn && formData.rtn.replace(/\D/g, "").length !== 14
              ? t("users.invalidRTN")
              : undefined
          }
        >
          <Input
            name="rtn"
            value={formData.rtn}
            onChange={handleChange}
            required={!isEdit}
            invalid={
              !!formData.rtn && formData.rtn.replace(/\D/g, "").length !== 14
            }
          />
        </Field>

        <Field label={t("users.address")}>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Field>
      </div>
    </section>
  );

  const accessSection = (
    <section className="space-y-4 border-t border-line pt-4">
      <h3 className="text-title font-bold text-ink">
        {t("users.accountSettings")}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label={t("users.roleLabel")}
          hint={!isAdmin ? t("users.adminOnlyRoleNote") : undefined}
        >
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={!isAdmin}
          >
            <option value="user">{t("users.userRole")}</option>
            {isAdmin && <option value="admin">{t("users.adminRole")}</option>}
            {isAdmin && <option value="seller">{t("users.sellerRole")}</option>}
          </Select>
        </Field>

        <Field label={t("users.createdByLabel")}>
          <Input value={creatorName || ""} readOnly disabled />
        </Field>
      </div>
    </section>
  );

  const securitySection = (
    <section className="space-y-4 border-t border-line pt-4">
      <h3 className="text-title font-bold text-ink">{t("users.security")}</h3>

      <Field
        label={t("users.password")}
        hint={
          isEdit
            ? t("users.passwordEditHint")
            : t("users.optional") ||
              "opcional - dejar vacío para generar y enviar por email"
        }
      >
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
      </Field>

      {formData.password !== "" && (
        <div className="rounded-control border border-line bg-surface-2 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("users.passwordStrength", { label: "" })}
            </span>
            <span className="text-micro font-bold uppercase">
              {pwFeedback.label}
            </span>
          </div>
          <div className="mb-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((segment) => (
              <div
                key={segment}
                className={`h-1.5 flex-1 rounded-full ${
                  segment <= pwFeedback.score
                    ? pwFeedback.score >= 5
                      ? "bg-brand"
                      : pwFeedback.score >= 3
                        ? "bg-warning"
                        : "bg-danger"
                    : "bg-line"
                }`}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {[
              { key: "length", label: t("users.minChars") },
              { key: "upper", label: t("users.uppercase") },
              { key: "lower", label: t("users.lowercase") },
              { key: "number", label: t("users.number") },
              { key: "symbol", label: t("users.symbol") },
            ].map((criterion) => (
              <div key={criterion.key} className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    pwFeedback.criteria[criterion.key]
                      ? "bg-brand text-white"
                      : "bg-line"
                  }`}
                >
                  {pwFeedback.criteria[criterion.key] && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-micro text-ink-2">{criterion.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Field
        label={t("users.confirmPassword")}
        required={!isEdit || formData.password !== ""}
        error={
          formData.password_confirmation && !pwMatch
            ? t("users.passwordsDoNotMatch")
            : undefined
        }
      >
        <Input
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
          required={!isEdit || formData.password !== ""}
          invalid={!!formData.password_confirmation && !pwMatch}
          autoComplete="new-password"
        />
      </Field>
    </section>
  );

  return (
    <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
      {shownError && <Banner tone="danger">{shownError}</Banner>}

      <div
        className={
          isEdit
            ? "grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]"
            : "space-y-4"
        }
      >
        <Card bodyClassName="space-y-5 p-5">
          {personalSection}
          {accessSection}
          {securitySection}
        </Card>

        {isEdit && (
          <aside className="space-y-3">
            <Card title={t("users.photoTitle")} bodyClassName="p-4">
              {photoBlock}
            </Card>

            <Card title={t("users.permissionsTitle")} bodyClassName="p-4">
              <ul className="space-y-2">
                {permissionRows.map((permission) => (
                  <PermissionRow
                    key={permission.label}
                    label={permission.label}
                    allowed={permission.allowed}
                  />
                ))}
              </ul>
              <p className="mt-3 text-micro text-ink-3">
                {t("users.permissionsNote")}
              </p>
            </Card>

            <Card title={t("users.activityTitle")} bodyClassName="p-4">
              {activityItems.length === 0 ? (
                <p className="text-body text-ink-3">{t("users.noActivity")}</p>
              ) : (
                <ul className="space-y-2.5">
                  {activityItems.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-label text-ink-2">
                        {item.label}
                      </span>
                      <span className="text-micro text-ink-3">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        )}
      </div>

      {isEdit ? (
        <SaveBar
          dirty={dirty}
          saving={submitting}
          onDiscard={handleDiscard}
          saveType="submit"
          saveForm="user-form"
          saveLabel={t("common.saveChanges")}
          discardLabel={t("common.cancel")}
          message={t("users.unsavedChanges")}
        />
      ) : (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            {t("users.back")}
          </Button>
          <Button type="submit" loading={submitting}>
            {t("users.createUser")}
          </Button>
        </div>
      )}
    </form>
  );
}

UserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  submitting: PropTypes.bool,
  creatorRole: PropTypes.string,
  creatorName: PropTypes.string,
  initialValues: PropTypes.shape({
    full_name: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    identity: PropTypes.string,
    rtn: PropTypes.string,
    address: PropTypes.string,
    role: PropTypes.string,
  }),
  mode: PropTypes.oneOf(["create", "edit"]),
  user: PropTypes.object,
};

export default UserForm;
