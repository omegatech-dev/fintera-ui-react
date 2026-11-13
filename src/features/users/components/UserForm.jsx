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
  Select,
} from "@/shared/ui";

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
        setValidationError(t("users.imageTooLarge") || "Image size should be less than 5MB");
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
      // Submission errors surface through the `error` prop banner; local
      // validation errors stay here.
      if (validationError) setValidationError(null);
      throw err;
    }
  };

  const shownError = validationError || error;
  const isAdmin = creatorRole === "admin";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {shownError && (
        <Banner tone="danger">{shownError}</Banner>
      )}

      <Card title={t("users.personalInfo") || "Personal Information"}>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-10 w-10 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-brand p-2 text-white shadow-sm transition hover:bg-brand-strong"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input
              type="file"
              id="profile-picture"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="self-center text-body text-ink-3 sm:pt-2">
            {t("users.uploadPhoto") || "Upload Profile Photo"}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("users.fullName")} required>
            <Input
              name="full_name"
              value={formData.full_name}
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

          <div className="md:col-span-2">
            <Field label={t("users.email")} required>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

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
      </Card>

      <Card title={t("users.security") || "Security"}>
        <div className="space-y-4">
          <Field
            label={t("users.password")}
            hint={
              isEdit
                ? t("users.passwordEditHint")
                : t("users.optional") || "opcional - dejar vacío para generar y enviar por email"
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
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
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
        </div>
      </Card>

      <Card title={t("users.accountSettings") || "Account Settings"}>
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
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          {t("users.back")}
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? t("common.saveChanges") : t("users.createUser")}
        </Button>
      </div>
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
};

export default UserForm;
