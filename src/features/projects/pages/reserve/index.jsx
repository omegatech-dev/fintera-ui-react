import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsApi } from "../../api";
import { usersApi } from "../../../users/api";
import MessageEditor from "@/shared/editor/MessageEditor";
import AuthContext from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import debounce from "lodash.debounce";
import { useLocale } from "@/contexts/LocaleContext";
import { motion, AnimatePresence } from "framer-motion";
import CreditScoreCard from "../../../contracts/components/CreditScoreCard";

function Reserve() {
  const { t } = useLocale();
  const { id, lot_id } = useParams();
  const [paymentTerm, setPaymentTerm] = useState(12);
  const [financingType, setFinancingType] = useState("direct");
  const [reserveAmount, setReserveAmount] = useState("");
  const [downPayment, setDownPayment] = useState(""); // prima
  const [maxPaymentDate, setMaxPaymentDate] = useState(""); // for bank: date by which rest will be paid
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [rtn, setRtn] = useState("");
  const [email, setEmail] = useState("");
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Global toast
  const { showToast } = useToast();

  // Contract notes state
  const [contractNotes, setContractNotes] = useState("");

  // User search states
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userMode, setUserMode] = useState("search"); // "search" | "create"

  // NEW state for richer header details
  const [lotName, setLotName] = useState(null);
  const [lotPrice, setLotPrice] = useState(0); // This will hold the EFFECTIVE price for calculations
  const [lotOriginalPrice, setLotOriginalPrice] = useState(0); // For display relative to discount
  const [lotLength, setLotLength] = useState(null);
  const [lotWidth, setLotWidth] = useState(null);
  const [lotArea, setLotArea] = useState(null);
  const [lotStatus, setLotStatus] = useState("");
  const [lotMeasurementUnit, setLotMeasurementUnit] = useState("m2");
  const [lotAddress, setLotAddress] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectInterestRate, setProjectInterestRate] = useState(null);
  const [projectType, setProjectType] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectDeliveryDate, setProjectDeliveryDate] = useState(null);
  const [projectCommissionRateDirect, setProjectCommissionRateDirect] = useState(0);
  const [projectCommissionRateBank, setProjectCommissionRateBank] = useState(0);
  const [projectCommissionRateCash, setProjectCommissionRateCash] = useState(0);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [generatedGuid, setGeneratedGuid] = useState("");

  useEffect(() => {
    setGeneratedGuid(crypto.randomUUID());
  }, []);

  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  // --- Fetch lot + project extra details (replaces earlier simple lot fetch if present) ---
  useEffect(() => {
    let cancelled = false;
    async function fetchHeader() {
      if (!id || !lot_id) return;
      setHeaderLoading(true);
      try {
        const [lotDataRaw, projDataRaw] = await Promise.all([
          projectsApi.getLot(id, lot_id),
          projectsApi.get(id),
        ]);

        if (cancelled) return;

        const lotData = lotDataRaw.lot || lotDataRaw.data || lotDataRaw || {};
        const projData = projDataRaw.project || projDataRaw.data || projDataRaw || {};

        setLotName(lotData.name || `Lote ${lot_id}`);
        // Use effective_price if available and > 0, otherwise normal price
        const effective = (lotData.effective_price && Number(lotData.effective_price) > 0)
          ? Number(lotData.effective_price)
          : Number(lotData.price);

        setLotPrice(effective);
        setLotOriginalPrice(Number(lotData.price));

        setLotLength(lotData.length);
        setLotWidth(lotData.width);
        setLotArea(lotData.area); // Capture explicit area from API
        setLotStatus(lotData.status || "");
        setLotAddress(lotData.address || "");
        setLotMeasurementUnit(
          lotData.measurement_unit ||
          lotData.unit ||
          projData.measurement_unit ||
          "m2"
        );

        setProjectName(projData.name || "");
        setProjectInterestRate(projData.interest_rate);
        setProjectType(projData.project_type || "");
        setProjectAddress(projData.address || "");
        setProjectDeliveryDate(projData.delivery_date);
        setProjectCommissionRateDirect(Number(projData.commission_rate_direct) || 0);
        setProjectCommissionRateBank(Number(projData.commission_rate_bank) || 0);
        setProjectCommissionRateCash(Number(projData.commission_rate_cash) || 0);
      } catch (e) {
        // silently keep old minimal header if failure
        console.error(e);
      } finally {
        if (!cancelled) setHeaderLoading(false);
      }
    }
    fetchHeader();
    return () => {
      cancelled = true;
    };
  }, [id, lot_id, t]);

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
          per_page: 10
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
        setError(err.message);
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
    () => debounce((query) => {
      setCurrentPage(1); // Reset to first page on new search
      handleUserSearch(query, 1);
    }, 500),
    [handleUserSearch] // include handleUserSearch as dependency
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);

    // Basic client-side validation per financing type
    const errors = [];
    if (!reserveAmount || Number(reserveAmount) <= 0) {
      errors.push(t("reservations.reserveAmountRequired"));
    }

    if (financingType === "direct") {
      if (!paymentTerm || Number(paymentTerm) <= 0) {
        errors.push(t("reservations.paymentTermRequired"));
      }
      if (!downPayment || Number(downPayment) < 0) {
        errors.push(t("reservations.downPaymentRequired"));
      }
    } else if (financingType === "bank" || financingType === "cash") {
      if (downPayment === "" || downPayment === null) setDownPayment("0");
      if (!maxPaymentDate || !maxPaymentDate.trim()) {
        errors.push(t("reservations.maxPaymentDateRequired"));
      }
    } else {
      if (downPayment === "" || downPayment === null) setDownPayment("0");
    }

    if (errors.length) {
      setError(errors.join(". "));
      setFormSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("contract[payment_term]", paymentTerm);
    formData.append("contract[financing_type]", financingType);
    formData.append("contract[reserve_amount]", reserveAmount);
    formData.append("contract[down_payment]", downPayment || "0");
    formData.append("contract[guid]", generatedGuid);
    if ((financingType === "bank" || financingType === "cash") && maxPaymentDate && maxPaymentDate.trim()) {
      formData.append("contract[max_payment_date]", maxPaymentDate.trim());
    }
    formData.append("contract[note]", contractNotes);
    formData.append("contract[applicant_user_id]", selectedUser?.id || ""); // Send empty string if creating a new user
    formData.append("user[full_name]", fullName);
    formData.append("user[phone]", phone);
    formData.append("user[identity]", identity);
    formData.append("user[rtn]", rtn);
    formData.append("user[email]", email);

    documents.forEach((doc, index) => {
      formData.append(`documents[${index}]`, doc);
    });

    try {
      await projectsApi.createContract(id, lot_id, formData);

      showToast(t("reservations.contractCreatedSuccess"), "success");
      // Navigate immediately - global toast will persist
      navigate(`/projects/${id}/lots`);
    } catch (err) {
      setError(err.message || t("reservations.errorCreatingContract"));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const switchMode = (mode) => {
    setUserMode(mode);
    if (mode === "create") {
      // Clean any selected existing user so fields are editable
      setSelectedUser(null);
      if (!fullName && !phone && !email) {
        // keep any already typed partial info
      }
    } else if (mode === "search") {
      // keep typed data but disable editing if a user gets selected later
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

  // Derived lot area (raw) for header only (do not interfere with existing form logic)
  const headerArea = useMemo(() => {
    if (!lotLength || !lotWidth) return null;
    return Number(lotLength) * Number(lotWidth);
  }, [lotLength, lotWidth]);

  // ===== Real-time financial calculations (derived) =====
  const {
    numericReserve,
    numericDownPayment,
    financedAmount,
    monthlyPayment,
    estimatedCommission,
  } = useMemo(() => {
    const lot = typeof lotPrice === "number" ? lotPrice : parseFloat(lotPrice);
    const reserveNum = parseFloat(reserveAmount) || 0;
    const downNum = parseFloat(downPayment) || 0;
    const initial = reserveNum + downNum;

    const financed = lot && !isNaN(lot) ? Math.max(lot - initial, 0) : null;

    const months =
      parseInt(paymentTerm, 10) > 0 ? parseInt(paymentTerm, 10) : null;
    const monthly = financed !== null && months ? financed / months : null;

    return {
      numericReserve: reserveNum,
      numericDownPayment: downNum,
      financedAmount: financed,

      monthlyPayment: monthly,
      estimatedCommission: lot && !isNaN(lot) ? lot * ((
        financingType === "direct" ? projectCommissionRateDirect :
          financingType === "bank" ? projectCommissionRateBank :
            financingType === "cash" ? projectCommissionRateCash : 0
      ) / 100) : 0,
    };
  }, [lotPrice, reserveAmount, downPayment, paymentTerm, financingType, projectCommissionRateDirect, projectCommissionRateBank, projectCommissionRateCash]);

  const formatCurrency = (v) => {
    if (v === null || v === undefined || isNaN(v)) return "—";
    return Number(v).toLocaleString(undefined, {
      style: "currency",
      currency: "HNL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper formatters
  const fmtNum = (v) =>
    v === null || v === undefined || v === ""
      ? "—"
      : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatDate = (v) => {
    if (!v || v === "TBD") return "TBD";
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

  const fmtPerc = (v) =>
    v === null || v === undefined
      ? "—"
      : `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
  const statusBadge = (s) => {
    const base = "px-2 py-0.5 rounded text-xs font-semibold";
    if (!s)
      return <span className={`${base} bg-gray-100 text-gray-600`}>—</span>;
    const normalized = s.toLowerCase();
    if (normalized === "available")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          {t("lots.available")}
        </span>
      );
    if (normalized === "reserved")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          {t("lots.reserved")}
        </span>
      );
    return <span className={`${base} bg-gray-100 text-gray-600`}>{s}</span>;
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white dark:bg-darkblack-600 p-8 lg:p-12 shadow-2xl rounded-[2.5rem] border border-bgray-200 dark:border-darkblack-400 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-success-300/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        {/* Enhanced Header */}
        <div className="mb-10 border-b border-bgray-100 dark:border-darkblack-400 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-extrabold text-bgray-900 dark:text-white tracking-tight"
              >
                {t("reservations.title")}
              </motion.h2>

              {!headerLoading && (
                <div className="space-y-4 mt-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div>
                        {projectType && (
                          <span className="text-success-600 dark:text-success-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
                            {projectType}
                          </span>
                        )}
                        <h3 className="text-2xl font-black text-bgray-900 dark:text-white leading-tight">
                          {projectName || "—"}
                        </h3>
                      </div>

                      {/* Project Address Display */}
                      {(projectAddress || lotAddress) && (
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-bgray-50 dark:bg-darkblack-500 border border-bgray-100 dark:border-darkblack-400 group transition-all duration-300 hover:border-success-300/50">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-darkblack-400 flex items-center justify-center shadow-xs text-bgray-400 group-hover:text-success-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-bgray-400 uppercase tracking-wider">{t("reservations.address")}</span>
                            <p className="text-sm font-semibold text-bgray-700 dark:text-bgray-300 leading-snug">
                              {lotAddress && (
                                <>
                                  <span className="text-bgray-900 dark:text-white">{lotAddress}</span>
                                  {projectAddress && <span className="mx-2 opacity-30">•</span>}
                                </>
                              )}
                              {projectAddress}
                            </p>
                          </div>
                        </div>
                      )}

                      {generatedGuid && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 bg-white dark:bg-darkblack-400/50 px-4 py-2 rounded-2xl border border-bgray-100 dark:border-darkblack-400 shadow-xs self-start"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-bgray-400 uppercase tracking-[0.2em]">{t("reservations.systemGuid") || "SYSTEM GUID"}</span>
                            <span className="text-[11px] font-mono font-bold text-bgray-500 dark:text-bgray-300">{generatedGuid}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedGuid);
                              showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                            }}
                            className="p-1.5 text-bgray-400 hover:text-blue-500 hover:bg-bgray-50 dark:hover:bg-darkblack-400 rounded-lg transition-all active:scale-90 border border-transparent hover:border-bgray-200 dark:hover:border-darkblack-300"
                            title={t("common.copy") || "Copiar"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                { label: t("reservations.lot"), value: lotName || `Lote ${lot_id}`, icon: "🏗️" },
                {
                  label: t("reservations.dimensions"),
                  value: (lotLength && lotWidth && lotLength > 0 && lotWidth > 0)
                    ? `${fmtNum(lotWidth)} × ${fmtNum(lotLength)} ${lotMeasurementUnit}`
                    : "—",
                  icon: "📏"
                },
                {
                  label: t("reservations.area"),
                  value: lotArea != null
                    ? `${fmtNum(lotArea)} ${lotMeasurementUnit}`
                    : (headerArea != null ? `${fmtNum(headerArea)} ${lotMeasurementUnit}` : "—"),
                  icon: "📐"
                },
                {
                  label: t("reservations.lotPrice"),
                  custom: (
                    <div className="flex flex-col">
                      {lotOriginalPrice > lotPrice && (
                        <span className="text-[10px] text-bgray-400 line-through">
                          {fmtNum(lotOriginalPrice)} HNL
                        </span>
                      )}
                      <span className={`font-bold text-sm tabular-nums tracking-tight ${lotOriginalPrice > lotPrice ? 'text-success-500' : 'text-bgray-900 dark:text-white'}`}>
                        {lotPrice != null ? `${fmtNum(lotPrice)} HNL` : "—"}
                      </span>
                    </div>
                  ),
                  icon: "💰"
                },
                {
                  label: t("reservations.status"),
                  custom: statusBadge(lotStatus),
                  icon: "⚡"
                },
                {
                  label: t("reservations.deliveryDate"),
                  value: formatDate(projectDeliveryDate),
                  icon: "📅"
                },
                {
                  label: t("reservations.interest"),
                  value: fmtPerc(projectInterestRate),
                  icon: "📈"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-2xl bg-bgray-50 dark:bg-darkblack-500 border border-bgray-100 dark:border-darkblack-400 shadow-xs group hover:border-success-300 transition-all duration-300"
                >
                  <p className="uppercase tracking-widest text-[9px] text-bgray-500 dark:text-bgray-400 font-extrabold mb-1 flex items-center">
                    <span className="mr-1 opacity-70">{item.icon}</span> {item.label}
                  </p>
                  {item.custom ? (
                    item.custom
                  ) : (
                    <p className="text-bgray-900 dark:text-white font-bold text-sm tracking-tight truncate">
                      {item.value}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-0">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* ------------ LEFT COLUMN: FINANCING ------------- */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-success-50 dark:bg-success-900/30 flex items-center justify-center text-success-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-bgray-900 dark:text-white tracking-tight">
                    {t("reservations.financingType")}
                  </h4>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm text-bgray-500 dark:text-bgray-400 font-bold uppercase tracking-wider">
                      {t("reservations.financingType")}
                    </label>
                    <select
                      value={financingType}
                      onChange={(e) => setFinancingType(e.target.value)}
                      className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-2xl h-16 border-2 border-transparent focus:border-success-300 focus:ring-0 transition-all font-semibold text-lg"
                    >
                      <option value="direct">{t("reservations.direct")}</option>
                      <option value="bank">{t("reservations.bank")}</option>
                      <option value="cash">{t("reservations.cash")}</option>
                    </select>
                    <p className="text-xs text-bgray-400 dark:text-bgray-500 italic">
                      {t("reservations.financingDescription")}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {financingType === "direct" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3"
                      >
                        <label className="text-sm text-bgray-500 dark:text-bgray-400 font-bold uppercase tracking-wider">
                          {t("reservations.paymentTerm")}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={paymentTerm}
                            onChange={(e) => setPaymentTerm(e.target.value)}
                            className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 pr-16 rounded-2xl h-16 w-full border-2 border-transparent focus:border-success-300 focus:ring-0 transition-all font-semibold text-lg"
                            required
                            min={1}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-bgray-400 font-bold uppercase text-xs">
                            Meses
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-bgray-500 dark:text-bgray-400 font-bold uppercase tracking-wider">
                        {t("reservations.reserveAmount")}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={reserveAmount}
                          onChange={(e) => setReserveAmount(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 pl-12 rounded-2xl h-16 w-full border-2 border-transparent focus:border-success-300 focus:ring-0 transition-all font-semibold text-lg"
                          required
                          min={1}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400 font-bold">L</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {financingType === "direct" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col gap-3"
                        >
                          <label className="text-sm text-bgray-500 dark:text-bgray-400 font-bold uppercase tracking-wider">
                            {t("reservations.downPayment")}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={downPayment}
                              onChange={(e) => setDownPayment(e.target.value)}
                              className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 pl-12 rounded-2xl h-16 w-full border-2 border-transparent focus:border-success-300 focus:ring-0 transition-all font-semibold text-lg"
                              placeholder={t("reservations.requiredForDirect")}
                              required
                              min={0}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bgray-400 font-bold">L</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {(financingType === "bank" || financingType === "cash") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3"
                      >
                        <label className="text-sm text-bgray-500 dark:text-bgray-400 font-bold uppercase tracking-wider">
                          {t("reservations.maxPaymentDate")}
                        </label>
                        <input
                          type="date"
                          value={maxPaymentDate}
                          onChange={(e) => setMaxPaymentDate(e.target.value)}
                          className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-2xl h-16 w-full border-2 border-transparent focus:border-success-300 focus:ring-0 transition-all font-semibold text-lg"
                          required={financingType === "bank" || financingType === "cash"}
                          min={new Date().toISOString().slice(0, 10)}
                        />
                        <p className="text-xs text-bgray-400 dark:text-bgray-500 italic">
                          {t("reservations.maxPaymentDateDescription")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm text-bgray-500 dark:text-bgray-400 font-bold uppercase tracking-wider">
                      {t("reservations.notes")}
                    </label>
                    <div className="rounded-2xl overflow-hidden border-2 border-bgray-100 dark:border-darkblack-400 focus-within:border-success-300 transition-all">
                      <MessageEditor onTextChange={setContractNotes} />
                    </div>
                  </div>

                  {/* ===== Real-time Balance Summary Card: PREMIUM DESIGN ===== */}
                  <motion.div
                    layout
                    className="mt-8 relative overflow-hidden bg-gradient-to-br from-bgray-900 to-bgray-800 dark:from-darkblack-800 dark:to-darkblack-900 rounded-[2rem] p-8 text-white shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-success-300/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <h5 className="text-xs font-black text-success-300 uppercase tracking-[0.2em] mb-6 opacity-80">
                      {t("reservations.financialSummary")}
                    </h5>

                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center group">
                        <span className="text-bgray-400 group-hover:text-white transition-colors">
                          {t("reservations.lotPrice")}
                        </span>
                        <span className="font-bold text-lg tabular-nums">
                          {formatCurrency(lotPrice)}
                        </span>
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs text-bgray-400 mb-1">{t("reservations.reservation")}</p>
                          <p className="font-bold tabular-nums">{formatCurrency(numericReserve)}</p>
                        </div>
                        {financingType === "direct" && (
                          <div>
                            <p className="text-xs text-bgray-400 mb-1">{t("reservations.downPaymentLabel")}</p>
                            <p className="font-bold tabular-nums">{formatCurrency(numericDownPayment)}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-end pt-4">
                        <div>
                          <p className="text-xs text-success-300/70 font-bold uppercase tracking-wider mb-1">
                            {(financingType === "bank" || financingType === "cash") ? t("reservations.balanceDueBy") : t("reservations.financedAmount")}
                          </p>
                          {(financingType === "bank" || financingType === "cash") ? (
                            <p className="text-3xl font-black tabular-nums tracking-tighter text-success-300">
                              {maxPaymentDate ? formatDate(maxPaymentDate) : "—"}
                            </p>
                          ) : (
                            <p className="text-3xl font-black tabular-nums tracking-tighter text-success-300">
                              {formatCurrency(financedAmount)}
                            </p>
                          )}
                        </div>
                        {financingType === "direct" && monthlyPayment && (
                          <div className="text-right">
                            <p className="text-[10px] text-bgray-400 font-bold uppercase mb-1">
                              {t("reservations.estimatedMonthly")}
                            </p>
                            <p className="text-xl font-bold tabular-nums">
                              {formatCurrency(monthlyPayment)}
                            </p>
                            <p className="text-[9px] text-bgray-500 italic">
                              {paymentTerm} cuotas
                            </p>
                          </div>
                        )}
                        {(financingType === "bank" || financingType === "cash") && financedAmount != null && (
                          <div className="text-right">
                            <p className="text-[10px] text-bgray-400 font-bold uppercase mb-1">
                              {t("reservations.remainingBalance")}
                            </p>
                            <p className="text-xl font-bold tabular-nums">
                              {formatCurrency(financedAmount)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="w-full pt-4 mt-4 border-t border-white/10 flex justify-between items-center text-xs text-bgray-400">
                        <span>{t('reservations.estimatedCommission') || 'Commission (Est.)'}</span>
                        <span className="font-mono text-bgray-300">
                          {formatCurrency(estimatedCommission)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ------------ RIGHT COLUMN: CUSTOMER INFO ------------- */}
              <div className="space-y-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-bgray-900 dark:text-white tracking-tight">
                      {t("reservations.clientInformation")}
                    </h4>
                  </div>

                  <div className="p-1 bg-bgray-100 dark:bg-darkblack-500 rounded-2xl flex gap-1">
                    <button
                      type="button"
                      onClick={() => switchMode("search")}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${userMode === "search"
                        ? "bg-white dark:bg-darkblack-400 text-bgray-900 dark:text-white shadow-lg scale-100"
                        : "text-bgray-500 hover:text-bgray-700 dark:hover:text-bgray-300 scale-95"
                        }`}
                    >
                      {t("reservations.search")}
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("create")}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${userMode === "create"
                        ? "bg-white dark:bg-darkblack-400 text-bgray-900 dark:text-white shadow-lg scale-100"
                        : "text-bgray-500 hover:text-bgray-700 dark:hover:text-bgray-300 scale-95"
                        }`}
                    >
                      {t("reservations.new")}
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {/* MODE: SEARCH EXISTING USER */}
                  {userMode === "search" ? (
                    <motion.div
                      key="search"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {!selectedUser ? (
                        <div className="space-y-4">
                          <div className="relative group">
                            <input
                              type="text"
                              value={userQuery}
                              onChange={(e) => handleQueryChange(e.target.value)}
                              className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white pl-14 pr-6 p-4 rounded-2xl h-16 w-full border-2 border-transparent focus:border-blue-400 focus:ring-0 transition-all font-medium"
                              placeholder={t("reservations.searchByNamePhoneEmail")}
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:scale-110 transition-transform">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>

                          <AnimatePresence>
                            {userResults.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-darkblack-500 border-2 border-bgray-100 dark:border-darkblack-400 rounded-3xl overflow-hidden shadow-2xl max-h-[400px] overflow-y-auto"
                              >
                                {userResults.map((u, idx) => (
                                  <motion.button
                                    key={u.id}
                                    type="button"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleUserSelect(u)}
                                    className="w-full text-left px-6 py-5 hover:bg-success-50 dark:hover:bg-success-900/10 border-b border-bgray-50 dark:border-darkblack-400 last:border-0 transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-bold text-bgray-900 dark:text-white capitalize">{u.full_name}</span>
                                      {(currentUser?.role === "admin" || currentUser?.role === "seller") && u.credit_score !== undefined && (() => {
                                        const fico = Math.round(Math.max(300, Math.min(850, u.credit_score)));
                                        const isExcellent = fico >= 750;
                                        const isGood = fico >= 670 && fico < 750;
                                        return (
                                          <div className="flex flex-col items-end">
                                            <div className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${isExcellent ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : isGood ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                                              FICO: {fico}
                                            </div>
                                            <p className={`text-[8px] font-bold uppercase mt-0.5 ${isExcellent ? "text-emerald-500" : isGood ? "text-amber-500" : "text-rose-500"}`}>
                                              {isExcellent ? t('creditScore.excellent') : isGood ? t('creditScore.good') : t('creditScore.needsImprovement')}
                                            </p>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    <div className="flex gap-4 text-xs text-bgray-500 dark:text-bgray-400 font-medium">
                                      <span className="flex items-center"><span className="mr-1">📧</span> {u.email}</span>
                                      <span className="flex items-center"><span className="mr-1">📞</span> {u.phone}</span>
                                    </div>
                                  </motion.button>
                                ))}
                                {currentPage < totalPages && (
                                  <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    className="w-full text-center text-xs font-bold py-4 bg-bgray-50 dark:bg-darkblack-400 hover:bg-bgray-100 text-bgray-500 uppercase tracking-widest transition-colors"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? t("reservations.loading") : t("reservations.loadMore")}
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {userQuery.length > 0 && userQuery.length <= 2 && (
                            <p className="text-xs text-center text-bgray-400 font-medium animate-pulse">
                              {t("reservations.typeAtLeast3Chars")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg relative"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-darkblack-600 shadow-md flex items-center justify-center text-3xl">
                              👤
                            </div>
                            <button
                              type="button"
                              onClick={clearSelectedUser}
                              className="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"
                              title={t("reservations.remove")}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-2xl font-black text-bgray-900 dark:text-white tracking-tight">{selectedUser.full_name}</p>
                              <p className="text-blue-600 dark:text-blue-400 font-bold tracking-wide text-xs uppercase">{selectedUser.email}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/30">
                              <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">DNI / ID</p>
                                <p className="text-sm font-bold text-bgray-700 dark:text-bgray-200">{selectedUser.identity || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Teléfono</p>
                                <p className="text-sm font-bold text-bgray-700 dark:text-bgray-200">{selectedUser.phone || "—"}</p>
                              </div>
                            </div>

                            {/* Credit Score Card Integration - Only visible for Admin and Seller */}
                            {(currentUser?.role === "admin" || currentUser?.role === "seller") && (
                              <div className="mt-6">
                                <CreditScoreCard creditScore={selectedUser.credit_score} />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    /* MODE: CREATE NEW USER INLINE */
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <p className="text-sm text-bgray-500 font-bold uppercase tracking-widest opacity-70">
                        {t("reservations.completeNewClientData")}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: t("reservations.fullName"), value: fullName, setter: setFullName, type: "text" },
                          { label: t("reservations.phone"), value: phone, setter: setPhone, type: "text" },
                          { label: t("reservations.identity"), value: identity, setter: setIdentity, type: "text" },
                          { label: t("reservations.rtn"), value: rtn, setter: setRtn, type: "text" },
                          { label: t("reservations.email"), value: email, setter: setEmail, type: "email", span: true }
                        ].map((field, idx) => (
                          <div key={idx} className={`flex flex-col gap-2 ${field.span ? 'md:col-span-2' : ''}`}>
                            <label className="text-xs font-bold text-bgray-500 dark:text-bgray-400 uppercase tracking-widest">
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              value={field.value}
                              onChange={(e) => field.setter(e.target.value)}
                              className="bg-bgray-50 dark:bg-darkblack-500 dark:text-white p-4 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:ring-0 transition-all font-semibold"
                              required
                            />
                          </div>
                        ))}

                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-xs font-bold text-bgray-500 dark:text-bgray-400 uppercase tracking-widest">
                            {t("reservations.documents")}
                          </label>
                          <label className="relative cursor-pointer group">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              multiple
                              className="hidden"
                            />
                            <div className="bg-bgray-50 dark:bg-darkblack-500 p-8 rounded-2xl border-2 border-dashed border-bgray-200 dark:border-darkblack-400 group-hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              <span className="text-sm font-bold text-bgray-600 dark:text-bgray-300">
                                {documents.length > 0 ? `${documents.length} archivos seleccionados` : t("reservations.uploadDocuments")}
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex gap-3 text-red-500 text-sm font-bold"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-16 pt-10 border-t border-bgray-100 dark:border-darkblack-400">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full md:w-auto px-8 py-4 rounded-2xl text-bgray-500 font-bold hover:bg-bgray-50 dark:hover:bg-darkblack-500 transition-colors uppercase tracking-[0.2em] text-xs"
              >
                {t("common.back")}
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={formSubmitting}
                className={`w-full md:w-auto px-12 py-5 rounded-3xl font-black text-white shadow-xl shadow-success-300/30 dark:shadow-none transition-all uppercase tracking-widest text-sm relative overflow-hidden ${formSubmitting
                  ? "bg-bgray-400 cursor-not-allowed opacity-70"
                  : "bg-success-300 hover:bg-success-400"
                  }`}
              >
                <span className="relative z-10">
                  {formSubmitting ? t("reservations.creating") : t("reservations.createRequest")}
                </span>
                {!formSubmitting && (
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-1 bg-white/20"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div >
    </main >
  );
}

export default Reserve;
