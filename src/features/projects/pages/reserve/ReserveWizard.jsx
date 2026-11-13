import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { usersApi } from "../../../users/api";
import MessageEditor from "@/shared/editor/MessageEditor";
import AuthContext from "@/contexts/AuthContext";
import debounce from "lodash.debounce";
import { useLocale } from "@/contexts/LocaleContext";
import CreditScoreCard from "../../../contracts/components/CreditScoreCard";
import { formatBytes } from "../../components/media/mediaFiles";
import { validateClient, validateReserveAmount } from "./reserveRules";
import {
  Banner,
  Button,
  Card,
  Chip,
  Field,
  Input,
  SegmentedControl,
  Stepper,
} from "@/shared/ui";

const STEPS = (t) => [
  t("reservations.stepClient"),
  t("reservations.stepFinancing"),
  t("reservations.stepConfirm"),
];

function ReserveWizard({
  lot,
  minReserveAmount,
  currency,
  submitting = false,
  submitError = null,
  onSubmit,
}) {
  const { t } = useLocale();
  const { user: currentUser } = useContext(AuthContext);

  const [step, setStep] = useState(0);

  // Client state
  const [userMode, setUserMode] = useState("search");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [rtn, setRtn] = useState("");
  const [email, setEmail] = useState("");

  // Financing state
  const [financingType, setFinancingType] = useState("direct");
  const [paymentTerm, setPaymentTerm] = useState(12);
  const [reserveAmount, setReserveAmount] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [maxPaymentDate, setMaxPaymentDate] = useState("");
  const [note, setNote] = useState("");
  const [documents, setDocuments] = useState([]);

  const [errors, setErrors] = useState({});

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Update defaults & visibility when financing type changes
  useEffect(() => {
    if (financingType === "bank") {
      setPaymentTerm(6); // default but hidden
      if (downPayment === "" || downPayment === null) setDownPayment("0");
    } else if (financingType === "cash") {
      setPaymentTerm(2); // default but hidden
      if (downPayment === "" || downPayment === null) setDownPayment("0");
      setMaxPaymentDate("");
    } else {
      // direct
      setPaymentTerm((pt) => (pt && pt > 0 ? pt : 12));
      if (downPayment === "" || downPayment === null) setDownPayment("");
      setMaxPaymentDate("");
    }
  }, [financingType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUserSearch = useCallback(async (query, page = 1) => {
    if (query.length > 2) {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search_term: query,
          role: "user",
          page,
          per_page: 10,
        });
        const data = await usersApi.list(params);

        const fetchedUsers = data.users || [];
        const pagination = data.pagination || {};

        if (page === 1) {
          setUserResults(fetchedUsers);
        } else {
          setUserResults((prevUsers) => [...prevUsers, ...fetchedUsers]);
        }

        setTotalPages(pagination.pages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUserResults([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  }, []);

  // Debounce the search function to limit API calls
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setCurrentPage(1);
        handleUserSearch(query, 1);
      }, 500),
    [handleUserSearch]
  );

  const handleQueryChange = (query) => {
    setUserQuery(query);
    if (query.length > 2) {
      debouncedSearch(query);
    } else {
      setUserResults([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      handleUserSearch(userQuery, nextPage);
    }
  };

  const handleUserSelect = (user) => {
    setFullName(user.full_name);
    setPhone(user.phone);
    setIdentity(user.identity);
    setRtn(user.rtn);
    setEmail(user.email);
    setSelectedUser(user);
    setUserResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    setUserMode("search");
  };

  const switchMode = (mode) => {
    setUserMode(mode);
    if (mode === "create") {
      setSelectedUser(null);
    }
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setFullName("");
    setPhone("");
    setIdentity("");
    setRtn("");
    setEmail("");
  };

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const removeDocument = (index) => {
    setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  // ===== Real-time financial calculations (derived) =====
  const {
    numericReserve,
    numericDownPayment,
    financedAmount,
    monthlyPayment,
    estimatedCommission,
  } = useMemo(() => {
    const price = Number(lot.price) || 0;
    const reserveNum = parseFloat(reserveAmount) || 0;
    const downNum = parseFloat(downPayment) || 0;
    const initial = reserveNum + downNum;

    const financed = price ? Math.max(price - initial, 0) : null;

    const months =
      parseInt(paymentTerm, 10) > 0 ? parseInt(paymentTerm, 10) : null;
    const monthly = financed !== null && months ? financed / months : null;

    const commissionRate =
      financingType === "direct"
        ? lot.commissionRates.direct
        : financingType === "bank"
          ? lot.commissionRates.bank
          : financingType === "cash"
            ? lot.commissionRates.cash
            : 0;

    return {
      numericReserve: reserveNum,
      numericDownPayment: downNum,
      financedAmount: financed,
      monthlyPayment: monthly,
      estimatedCommission: price ? (price * commissionRate) / 100 : 0,
    };
  }, [
    lot.price,
    lot.commissionRates,
    reserveAmount,
    downPayment,
    paymentTerm,
    financingType,
  ]);

  const formatCurrency = (v) => {
    if (v === null || v === undefined || isNaN(v)) return "—";
    return Number(v).toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (v) => {
    if (!v) return "—";
    try {
      return new Date(v).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return v;
    }
  };

  const validateClientFields = () => {
    const next = {};
    if (!selectedUser?.id && userMode === "create") {
      if (!fullName.trim()) next.fullName = t("reservations.clientRequired");
      if (!phone.trim()) next.phone = t("reservations.clientRequired");
      if (!identity.trim()) next.identity = t("reservations.clientRequired");
    }
    if (!selectedUser?.id && userMode === "search" && !fullName.trim()) {
      next.search = t("reservations.clientRequired");
    }
    return next;
  };

  const validateFinancingFields = () => {
    const next = {};
    const amountError = validateReserveAmount(
      reserveAmount,
      minReserveAmount,
      t,
      currency
    );
    if (amountError) next.reserveAmount = amountError;

    if (financingType === "direct") {
      if (!paymentTerm || Number(paymentTerm) <= 0) {
        next.paymentTerm = t("reservations.paymentTermRequired");
      }
      if (downPayment === "" || downPayment === null || Number(downPayment) < 0) {
        next.downPayment = t("reservations.downPaymentRequired");
      }
    } else if (financingType === "bank" || financingType === "cash") {
      if (!maxPaymentDate || !maxPaymentDate.trim()) {
        next.maxPaymentDate = t("reservations.maxPaymentDateRequired");
      }
    }
    return next;
  };

  const validateStep = (index) => {
    if (index === 0) {
      // Cross-check with the shared rule as a safety net
      const shared = validateClient(
        { selectedUser, fullName, phone, identity },
        t
      );
      const fields = validateClientFields();
      if (shared && !Object.keys(fields).length) {
        fields.search = shared;
      }
      return fields;
    }
    if (index === 1) return validateFinancingFields();
    return {};
  };

  const goNext = () => {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(s + 1, 2));
    }
  };

  const goBack = () => {
    setErrors({});
    if (step === 0) return;
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const clientErrors = validateStep(0);
    const financingErrors = validateStep(1);
    const all = { ...clientErrors, ...financingErrors };
    setErrors(all);
    if (Object.keys(all).length > 0) {
      setStep(clientErrors && Object.keys(clientErrors).length ? 0 : 1);
      return;
    }

    await onSubmit({
      paymentTerm,
      financingType,
      reserveAmount,
      downPayment: downPayment || "0",
      maxPaymentDate,
      note,
      applicantUserId: selectedUser?.id || "",
      user: { full_name: fullName, phone, identity, rtn, email },
      documents,
    });
  };

  const clientLabel = selectedUser?.full_name || fullName || "—";
  const financingLabel = {
    direct: t("reservations.direct"),
    bank: t("reservations.bank"),
    cash: t("reservations.cash"),
  }[financingType];

  const lotStatusKey = String(lot.status || "").toLowerCase();
  const lotStatusTone =
    {
      available: "success",
      reserved: "warning",
      financed: "info",
      fully_paid: "neutral",
      sold: "neutral",
    }[lotStatusKey] || "neutral";
  const lotStatusLabel = lotStatusKey
    ? t(`status.${lotStatusKey}`)
    : t("common.notAvailable");
  const lotMeta = [
    lot.dimensions,
    lot.area ? `${lot.area} ${lot.measurementUnit || "m²"}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="space-y-6">
      <Stepper steps={STEPS(t)} current={step} />

      {submitError && <Banner tone="danger">{submitError}</Banner>}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* ===== STEP 1: CLIENT ===== */}
          {step === 0 && (
            <Card title={t("reservations.clientInformation")}>
              <div className="space-y-5">
                {(lot.name || lot.projectName) && (
                  <div className="rounded-control border border-line bg-surface-2 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-body font-bold text-ink">
                          {lot.name || t("reservations.lot")}
                        </p>
                        {lot.projectName && (
                          <p className="truncate text-micro text-ink-3">
                            {lot.projectName}
                          </p>
                        )}
                        {lotMeta && (
                          <p className="mt-1 truncate text-micro text-ink-3">
                            {lotMeta}
                          </p>
                        )}
                      </div>
                      {lotStatusKey && (
                        <Chip tone={lotStatusTone}>{lotStatusLabel}</Chip>
                      )}
                    </div>
                  </div>
                )}

                <SegmentedControl
                  value={userMode}
                  onChange={switchMode}
                  options={[
                    { value: "search", label: t("reservations.search") },
                    { value: "create", label: t("reservations.new") },
                  ]}
                />

                {userMode === "search" ? (
                  <div className="space-y-3">
                    {!selectedUser ? (
                      <div className="relative">
                        <Field
                          label={t("reservations.searchExistingClient")}
                          error={errors.search}
                        >
                          <Input
                            type="text"
                            value={userQuery}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            placeholder={t("reservations.searchByNamePhoneEmail")}
                            invalid={!!errors.search}
                          />
                        </Field>

                        {userResults.length > 0 && (
                          <div className="max-h-80 overflow-y-auto rounded-card border border-line bg-surface shadow-pop">
                            {userResults.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleUserSelect(u)}
                                className="w-full border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-brand-soft"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-body font-bold text-ink">
                                      {u.full_name}
                                    </p>
                                    <p className="truncate text-micro text-ink-3">
                                      {u.email} · {u.phone}
                                    </p>
                                  </div>
                                  {(currentUser?.role === "admin" ||
                                    currentUser?.role === "seller") &&
                                    u.credit_score !== undefined &&
                                    (() => {
                                      const fico = Math.round(
                                        Math.max(300, Math.min(850, u.credit_score))
                                      );
                                      const isExcellent = fico >= 750;
                                      const isGood = fico >= 670 && fico < 750;
                                      return (
                                        <span
                                          className={`shrink-0 rounded-chip px-2 py-0.5 text-micro font-bold ${
                                            isExcellent
                                              ? "bg-brand-soft text-brand-strong"
                                              : isGood
                                                ? "bg-warning-soft text-warning"
                                                : "bg-danger-soft text-danger"
                                          }`}
                                        >
                                          FICO: {fico}
                                        </span>
                                      );
                                    })()}
                                </div>
                              </button>
                            ))}
                            {currentPage < totalPages && (
                              <button
                                type="button"
                                onClick={handleLoadMore}
                                className="w-full bg-surface-2 py-3 text-micro font-bold uppercase tracking-wide text-ink-3 transition-colors hover:bg-line disabled:opacity-50"
                                disabled={isLoading}
                              >
                                {isLoading
                                  ? t("reservations.loading")
                                  : t("reservations.loadMore")}
                              </button>
                            )}
                          </div>
                        )}

                        {userQuery.length > 0 && userQuery.length <= 2 && (
                          <p className="text-micro text-ink-3">
                            {t("reservations.searchMinChars")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-card border border-line bg-surface-2 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-body-lg font-bold text-ink">
                              {selectedUser.full_name}
                            </p>
                            <p className="truncate text-body text-ink-3">
                              {selectedUser.email}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearSelectedUser}
                          >
                            {t("reservations.remove")}
                          </Button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
                          <div>
                            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                              {t("reservations.identity")}
                            </p>
                            <p className="text-body font-semibold text-ink">
                              {selectedUser.identity || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                              {t("reservations.phone")}
                            </p>
                            <p className="text-body font-semibold text-ink">
                              {selectedUser.phone || "—"}
                            </p>
                          </div>
                        </div>

                        {(currentUser?.role === "admin" ||
                          currentUser?.role === "seller") && (
                          <div className="mt-4">
                            <CreditScoreCard creditScore={selectedUser.credit_score} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label={t("reservations.fullName")}
                      required
                      error={errors.fullName}
                    >
                      <Input
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          clearFieldError("fullName");
                        }}
                        invalid={!!errors.fullName}
                      />
                    </Field>

                    <Field
                      label={t("reservations.phone")}
                      required
                      error={errors.phone}
                    >
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearFieldError("phone");
                        }}
                        invalid={!!errors.phone}
                      />
                    </Field>

                    <Field
                      label={t("reservations.identity")}
                      required
                      error={errors.identity}
                    >
                      <Input
                        value={identity}
                        onChange={(e) => {
                          setIdentity(e.target.value);
                          clearFieldError("identity");
                        }}
                        invalid={!!errors.identity}
                      />
                    </Field>

                    <Field label={t("reservations.rtn")}>
                      <Input value={rtn} onChange={(e) => setRtn(e.target.value)} />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label={t("reservations.email")}>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ===== STEP 2: FINANCING ===== */}
          {step === 1 && (
            <Card title={t("reservations.financingPlan")}>
              <div className="space-y-5">
                <p className="-mt-1 text-body text-ink-3">
                  {t("reservations.financingDescription")}
                </p>

                <Field label={t("reservations.financingType")}>
                  <SegmentedControl
                    value={financingType}
                    onChange={setFinancingType}
                    options={[
                      { value: "direct", label: t("reservations.direct") },
                      { value: "bank", label: t("reservations.bank") },
                      { value: "cash", label: t("reservations.cash") },
                    ]}
                  />
                </Field>

                {financingType === "direct" && (
                  <Field
                    label={t("reservations.paymentTerm")}
                    required
                    error={errors.paymentTerm}
                    hint={t("reservations.estimatedInstallment")}
                  >
                    <Input
                      type="number"
                      value={paymentTerm}
                      onChange={(e) => {
                        setPaymentTerm(e.target.value);
                        clearFieldError("paymentTerm");
                      }}
                      required
                      min={1}
                      invalid={!!errors.paymentTerm}
                    />
                  </Field>
                )}

                {(financingType === "bank" || financingType === "cash") && (
                  <Field
                    label={t("reservations.maxPaymentDate")}
                    required
                    error={errors.maxPaymentDate}
                    hint={t("reservations.maxPaymentDateDescription")}
                  >
                    <Input
                      type="date"
                      value={maxPaymentDate}
                      onChange={(e) => {
                        setMaxPaymentDate(e.target.value);
                        clearFieldError("maxPaymentDate");
                      }}
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      invalid={!!errors.maxPaymentDate}
                    />
                  </Field>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label={t("reservations.reserveAmount")}
                    required
                    error={errors.reserveAmount}
                    hint={
                      minReserveAmount > 0
                        ? t("reservations.minReserveHint", {
                            amount: minReserveAmount,
                            currency,
                          })
                        : undefined
                    }
                  >
                    <Input
                      type="number"
                      value={reserveAmount}
                      onChange={(e) => {
                        setReserveAmount(e.target.value);
                        clearFieldError("reserveAmount");
                      }}
                      required
                      min={minReserveAmount || 1}
                      invalid={!!errors.reserveAmount}
                    />
                  </Field>

                  {financingType === "direct" && (
                    <Field
                      label={t("reservations.downPayment")}
                      required
                      error={errors.downPayment}
                    >
                      <Input
                        type="number"
                        value={downPayment}
                        onChange={(e) => {
                          setDownPayment(e.target.value);
                          clearFieldError("downPayment");
                        }}
                        placeholder={t("reservations.requiredForDirect")}
                        required
                        min={0}
                        invalid={!!errors.downPayment}
                      />
                    </Field>
                  )}
                </div>

                <Field label={t("reservations.notes")}>
                  <div className="overflow-hidden rounded-control border border-line-strong focus-within:border-brand">
                    <MessageEditor onTextChange={setNote} />
                  </div>
                </Field>
              </div>
            </Card>
          )}

          {/* ===== STEP 3: CONFIRM ===== */}
          {step === 2 && (
            <Card title={t("reservations.summary")}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-control border border-line bg-surface-2 p-4">
                    <p className="mb-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                      {t("reservations.clientInfo")}
                    </p>
                    <p className="text-body font-bold text-ink">{clientLabel}</p>
                    <p className="text-micro text-ink-3">
                      {identity || selectedUser?.identity || "—"} ·{" "}
                      {phone || selectedUser?.phone || "—"}
                    </p>
                  </div>
                  <div className="rounded-control border border-line bg-surface-2 p-4">
                    <p className="mb-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                      {t("reservations.financingType")}
                    </p>
                    <p className="text-body font-bold text-ink">{financingLabel}</p>
                    <p className="text-micro text-ink-3">
                      {t("reservations.reserveAmount")}:{" "}
                      {formatCurrency(Number(reserveAmount) || 0)}
                      {financingType === "direct" &&
                        ` · ${t("reservations.installments", {
                          count: paymentTerm,
                        })}`}
                    </p>
                  </div>
                </div>

                <Field label={t("reservations.documents")}>
                  <label className="group cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 rounded-control border border-dashed border-line-strong bg-surface-2 px-6 py-8 transition-colors group-hover:border-brand">
                      <span className="text-body font-semibold text-ink-2">
                        {documents.length > 0
                          ? t("reservations.filesSelected", {
                              count: documents.length,
                            })
                          : t("reservations.uploadDocuments")}
                      </span>
                    </div>
                  </label>
                </Field>

                {documents.length > 0 && (
                  <ul className="space-y-2">
                    {documents.map((document, index) => (
                      <li
                        key={`${document.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-label font-medium text-ink-2">
                          {document.name}
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="text-micro text-ink-3">
                            {formatBytes(document.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            aria-label={t("common.delete")}
                            title={t("common.delete")}
                            className="flex h-7 w-7 items-center justify-center rounded-chip text-ink-3 transition-colors hover:bg-danger-soft hover:text-danger"
                          >
                            ×
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}

          <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-5 md:flex-row">
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={goBack}
                disabled={submitting}
              >
                {t("common.back")}
              </Button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <Button type="button" onClick={goNext} disabled={submitting}>
                {step === 1
                  ? t("reservations.continueToDocuments")
                  : t("common.next")}
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} loading={submitting}>
                {submitting
                  ? t("reservations.creating")
                  : t("reservations.createRequest")}
              </Button>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card title={t("reservations.summary")} bodyClassName="space-y-4 p-[18px]">
            <div className="flex items-center justify-between gap-3 text-label">
              <span className="text-ink-3">{t("reservations.lotPrice")}</span>
              <span className="font-bold tabular-nums text-ink">
                {formatCurrency(lot.price)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-label">
              <span className="text-ink-3">{t("reservations.reservation")}</span>
              <span className="font-bold tabular-nums text-ink">
                {formatCurrency(numericReserve)}
              </span>
            </div>

            {financingType === "direct" && (
              <div className="flex items-center justify-between gap-3 text-label">
                <span className="text-ink-3">
                  {t("reservations.downPaymentLabel")}
                </span>
                <span className="font-bold tabular-nums text-ink">
                  {formatCurrency(numericDownPayment)}
                </span>
              </div>
            )}

            <div className="border-t border-line pt-3">
              <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                {financingType === "bank" || financingType === "cash"
                  ? t("reservations.balanceDueBy")
                  : t("reservations.financedAmount")}
              </p>
              {(financingType === "bank" || financingType === "cash") ? (
                <p className="mt-0.5 text-section font-bold tabular-nums text-ink">
                  {maxPaymentDate ? formatDate(maxPaymentDate) : "—"}
                </p>
              ) : (
                <p className="mt-0.5 text-section font-bold tabular-nums text-ink">
                  {formatCurrency(financedAmount)}
                </p>
              )}
            </div>

            {financingType === "direct" && monthlyPayment && (
              <div className="border-t border-line pt-3">
                <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                  {t("reservations.estimatedMonthly")}
                </p>
                <p className="mt-0.5 text-body-lg font-bold tabular-nums text-ink">
                  {formatCurrency(monthlyPayment)}
                </p>
                <p className="text-micro text-ink-3">
                  {t("reservations.installments", { count: paymentTerm })}
                </p>
              </div>
            )}

            {(financingType === "bank" || financingType === "cash") &&
              financedAmount != null && (
                <div className="border-t border-line pt-3">
                  <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
                    {t("reservations.remainingBalance")}
                  </p>
                  <p className="mt-0.5 text-body-lg font-bold tabular-nums text-ink">
                    {formatCurrency(financedAmount)}
                  </p>
                </div>
              )}

            <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-micro">
              <span className="text-ink-3">
                {t("reservations.estimatedCommission")}
              </span>
              <span className="font-mono font-semibold text-ink-2">
                {formatCurrency(estimatedCommission)}
              </span>
            </div>
          </Card>

          {(lot.name || lot.projectName) && (
            <Card title={t("reservations.selectedLot")} bodyClassName="p-[18px]">
              <p className="truncate text-body font-bold text-ink">
                {lot.name || t("reservations.lot")}
              </p>
              {lot.projectName && (
                <p className="truncate text-micro text-ink-3">
                  {lot.projectName}
                </p>
              )}
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="text-body-lg font-bold tabular-nums text-ink">
                  {formatCurrency(lot.price)}
                </span>
                {lotStatusKey && (
                  <Chip tone={lotStatusTone}>{lotStatusLabel}</Chip>
                )}
              </div>
              {lotMeta && (
                <p className="mt-2 text-micro text-ink-3">{lotMeta}</p>
              )}
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

ReserveWizard.propTypes = {
  lot: PropTypes.shape({
    name: PropTypes.string,
    projectName: PropTypes.string,
    status: PropTypes.string,
    dimensions: PropTypes.string,
    area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    measurementUnit: PropTypes.string,
    price: PropTypes.number,
    commissionRates: PropTypes.shape({
      direct: PropTypes.number,
      bank: PropTypes.number,
      cash: PropTypes.number,
    }),
  }).isRequired,
  minReserveAmount: PropTypes.number,
  currency: PropTypes.string,
  submitting: PropTypes.bool,
  submitError: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default ReserveWizard;
