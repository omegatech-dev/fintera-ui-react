import { useState, useContext, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usersApi } from "../../api";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../../contexts/AuthContext";
import { useLocale } from "../../../../contexts/LocaleContext";

function formatCedula(raw) {
  const d = raw.replace(/\D/g, "");
  const g1 = d.slice(0, 4);
  const g2 = d.slice(4, 8);
  const g3 = d.slice(8, 13);
  let out = g1;
  if (g2) out += `-${g2}`;
  if (g3) out += `-${g3}`;
  return out;
}

function formatRTN(raw) {
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

function CreateUser() {
  const navigate = useNavigate();
  const { user: creator } = useContext(AuthContext);
  const { t } = useLocale();

  const evaluatePasswordStrength = useCallback((pw) => {
    const criteria = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[^A-Za-z0-9]/.test(pw),
    };

    const score = Object.values(criteria).reduce((s, ok) => s + (ok ? 1 : 0), 0);
    let label;
    if (score <= 2) label = t('users.weak');
    else if (score <= 4) label = t('users.medium');
    else label = t('users.strong');

    return { label, score, criteria };
  }, [t]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    rtn: "",
    address: "",
    password: "",
    password_confirmation: "",
    role: "user",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const pwFeedback = useMemo(() => evaluatePasswordStrength(formData.password), [formData.password, evaluatePasswordStrength]);
  const pwMatch = useMemo(() => formData.password === formData.password_confirmation, [formData.password, formData.password_confirmation]);




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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('users.imageTooLarge') || 'Image size should be less than 5MB');
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
    setError(null);

    if (!formData.full_name.trim()) {
      setError(t('users.fullNameRequired'));
      return;
    }
    if (!(formData.identity.replace(/\D/g, "").length === 13)) {
      setError(t('users.invalidIdentity'));
      return;
    }
    if (!(formData.rtn.replace(/\D/g, "").length === 14)) {
      setError(t('users.invalidRTN'));
      return;
    }
    // Password optional: if empty, backend auto-generates 5-char temp and emails it
    if (formData.password !== "") {
      if (formData.password.length < 8) {
        setError(t('users.passwordMinLength'));
        return;
      }
      if (!pwMatch) {
        setError(t('users.passwordsDoNotMatch'));
        return;
      }
    }

    try {
      const safeRole = creator?.role === 'admin' ? formData.role : 'user';
      // Map to PascalCase for the backend validator (omit Password if empty - backend generates)
      const payload = {
        FullName: formData.full_name,
        Email: formData.email,
        Phone: formData.phone,
        Identity: formData.identity.replace(/\D/g, ""),
        RTN: formData.rtn.replace(/\D/g, ""),
        Address: formData.address,
        Role: safeRole,
        CreatedBy: creator?.id,
      };
      if (formData.password !== "") {
        payload.Password = formData.password;
      }

      const successBody = await usersApi.create(payload);
      const newUserId = successBody?.id || successBody?.user?.id || successBody?.data?.id;

      // Upload image if selected
      if (imageFile && newUserId) {
        const formDataImage = new FormData();
        formDataImage.append("image", imageFile);

        try {
          await usersApi.uploadPicture(newUserId, formDataImage);
        } catch (imgErr) {
          console.error("Failed to upload profile picture", imgErr);
          // Don't throw error here to allow user creation to succeed
        }
      }

      setSuccess(true);
      if (newUserId) {
        navigate(`/settings/user/${newUserId}`);
      } else {
        navigate("/users");
      }
    } catch (err) {
      setSuccess(false);
      // Handle apiClient error format vs direct fetch error format
      // apiClient throws errors, usually with a message property or structure
      // If validation error (422), it might be in err.errors
      const msg = err.errors ? err.errors.join(", ") : err.message || t('users.errorCreatingUser');
      setError(msg);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-extrabold text-bgray-900 dark:text-white mb-2 tracking-tight">
            {t('users.createUserTitle')}
          </h2>
          <p className="text-bgray-500 dark:text-bgray-400 font-medium">
            {t('users.subtitle') || 'Fill in the details to create a new user'}
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/70 dark:bg-darkblack-600/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10">
            {/* Alert Messages */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t('users.userCreatedSuccess')}</p>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-bgray-400 dark:text-bgray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('users.personalInfo') || 'Personal Information'}
                </h3>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-bgray-100 dark:bg-darkblack-500 border-4 border-white dark:border-darkblack-400 shadow-lg flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-bgray-300 dark:text-bgray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-all transform hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
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
                  <p className="mt-3 text-sm text-bgray-500 dark:text-bgray-400 font-medium">
                    {t('users.uploadPhoto') || 'Upload Profile Photo'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="full_name" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.fullName')}
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                  </motion.div>

                  {/* Phone */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.phone')}
                    </label>
                    <input
                      type="phone"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="email" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                  </motion.div>

                  {/* Identity */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="identity" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.identity')}
                    </label>
                    <input
                      type="text"
                      id="identity"
                      name="identity"
                      value={formData.identity}
                      onChange={handleChange}
                      placeholder={t('users.identityPlaceholder')}
                      required
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                  </motion.div>

                  {/* RTN */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="rtn" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.rtn')}
                    </label>
                    <input
                      type="text"
                      id="rtn"
                      name="rtn"
                      value={formData.rtn}
                      onChange={handleChange}
                      placeholder={t('users.rtnPlaceholder')}
                      required
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                  </motion.div>

                  {/* Address */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="address" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.address')}
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={t('users.addressOptional')}
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Security Section */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-bgray-200 dark:border-darkblack-400">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-bgray-400 dark:text-bgray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('users.security') || 'Security'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password - optional: leave empty to auto-generate and email */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="password" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.password')}
                      <span className="text-bgray-500 font-normal ml-1">({t('users.optional') || 'opcional - dejar vacío para generar y enviar por email'})</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />

                    {/* Password Strength Indicator */}
                    <div className="mt-4 p-4 rounded-xl bg-bgray-50 dark:bg-darkblack-500 border border-bgray-200 dark:border-darkblack-400">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-bgray-600 dark:text-bgray-400 uppercase tracking-wider">
                          {t('users.passwordStrength', { label: '' })}
                        </span>
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${pwFeedback.label === t('users.strong')
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : pwFeedback.label === t('users.medium')
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          }`}>
                          {pwFeedback.label || '—'}
                        </span>
                      </div>

                      {/* Strength Bar */}
                      <div className="flex gap-1.5 mb-4">
                        {[1, 2, 3, 4, 5].map((segment) => (
                          <motion.div
                            key={segment}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: segment <= pwFeedback.score ? 1 : 0 }}
                            transition={{ duration: 0.3, delay: segment * 0.05 }}
                            className={`h-2 flex-1 rounded-full ${segment <= pwFeedback.score
                              ? pwFeedback.score >= 5
                                ? 'bg-emerald-500'
                                : pwFeedback.score >= 3
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              : 'bg-bgray-200 dark:bg-darkblack-400'
                              }`}
                            style={{ transformOrigin: 'left' }}
                          />
                        ))}
                      </div>

                      {/* Criteria Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: 'length', label: t('users.minChars') },
                          { key: 'upper', label: t('users.uppercase') },
                          { key: 'lower', label: t('users.lowercase') },
                          { key: 'number', label: t('users.number') },
                          { key: 'symbol', label: t('users.symbol') }
                        ].map((criterion) => (
                          <motion.div
                            key={criterion.key}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              animate={{
                                scale: pwFeedback.criteria?.[criterion.key] ? [1, 1.2, 1] : 1,
                                backgroundColor: pwFeedback.criteria?.[criterion.key]
                                  ? 'rgb(16, 185, 129)'
                                  : 'rgb(229, 231, 235)'
                              }}
                              transition={{ duration: 0.3 }}
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                            >
                              {pwFeedback.criteria?.[criterion.key] && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </motion.div>
                            <span className="text-xs font-medium text-bgray-700 dark:text-bgray-300">
                              {criterion.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="password_confirmation" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                    />
                    <AnimatePresence mode="wait">
                      {formData.password_confirmation && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 mt-1"
                        >
                          {pwMatch ? (
                            <>
                              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {t('users.passwordsMatch')}
                              </span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                                {t('users.passwordsDoNotMatch')}
                              </span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>

              {/* Role & Creator Section */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-bgray-200 dark:border-darkblack-400">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-bgray-400 dark:text-bgray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('users.accountSettings') || 'Account Settings'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="role" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.roleLabel')}
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="bg-bgray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all outline-hidden"
                      disabled={creator?.role !== 'admin'}
                    >
                      <option value="user">{t('users.userRole')}</option>
                      {creator?.role === 'admin' && <option value="admin">{t('users.adminRole')}</option>}
                      {creator?.role === 'admin' && <option value="seller">{t('users.sellerRole')}</option>}
                    </select>
                    {creator?.role !== 'admin' && (
                      <p className="text-xs text-bgray-500 dark:text-bgray-400 mt-1">
                        {t('users.adminOnlyRoleNote')}
                      </p>
                    )}
                  </motion.div>

                  {/* Created By */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="created_by" className="text-sm font-bold text-bgray-700 dark:text-bgray-300">
                      {t('users.createdByLabel')}
                    </label>
                    <input
                      type="text"
                      id="created_by"
                      name="created_by"
                      value={creator?.full_name || ""}
                      readOnly
                      disabled
                      className="bg-bgray-100 dark:bg-darkblack-500 p-4 rounded-xl border border-bgray-200 dark:border-darkblack-400 text-bgray-600 dark:text-bgray-400 cursor-not-allowed"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-between gap-4 pt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02, x: -5 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 rounded-xl bg-bgray-100 dark:bg-darkblack-500 text-bgray-700 dark:text-white font-bold hover:bg-bgray-200 dark:hover:bg-darkblack-400 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('users.back')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('users.createUser')}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}

export default CreateUser;