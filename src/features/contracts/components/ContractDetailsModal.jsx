// src/component/contracts/ContractDetailsModal.jsx
import { createPortal } from "react-dom";
import { useState, useContext, useEffect, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUser,
  faChartLine,
  faDollarSign,
  faStickyNote,
  faTimes,
  faEdit,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { contractsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";
import OverviewTab from "./ContractDetails/tabs/OverviewTab";
import LotProjectTab from "./ContractDetails/tabs/LotProjectTab";
import FinancialTab from "./ContractDetails/tabs/FinancialTab";
import ApplicantTab from "./ContractDetails/tabs/ApplicantTab";
import DocumentsTab from "./ContractDetails/tabs/DocumentsTab";
import ContractNotesTab from "./ContractNotesTab";
import DetailsSidebar from "./ContractDetails/DetailsSidebar";
import {
  getStatusTheme,
} from "../../../shared/utils/statusUtils";

// Contract Details Modal Component
const ContractDetailsModal = memo(function ContractDetailsModal({
  isOpen,
  onClose,
  contract,
  onContractUpdate,
  onContractDeleted,
}) {
  const { t } = useLocale();
  const { user, token } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const { showToast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [fullContract, setFullContract] = useState(null);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const statusTheme = useMemo(() => getStatusTheme(contract?.status), [contract?.status]);

  const tabs = useMemo(() => [
    { id: 'overview', label: t('common.overview') || 'Resumen', icon: faChartLine },
    { id: 'financial', label: t('contracts.financial') || 'Financiero', icon: faDollarSign },
    { id: 'lot_project', label: t('contracts.lotAndProject') || 'Lote y Proyecto', icon: faBuilding },
    { id: 'applicant', label: t('contracts.applicant') || 'Solicitante', icon: faUser },
    { id: 'notes', label: t('contracts.notes') || 'Notas', icon: faStickyNote, show: !!contract?.note || !!contract?.rejection_reason },
    { id: 'documents', label: t('contracts.documents') || 'Documentos', icon: faFileAlt },
  ], [t, contract?.note, contract?.rejection_reason]);

  const canEditSchedule = useMemo(() => {
    const s = contract?.status?.toLowerCase();
    return s === "pending" || s === "rejected" || s === "submitted";
  }, [contract?.status]);

  // Fetch full contract details (including payment schedule)
  useEffect(() => {
    const fetchFullContract = async () => {
      if (!contract?.id || !token) return;

      setIsLoadingFull(true);
      try {
        const data = await contractsApi.getDetails(
          contract.project_id,
          contract.lot_id,
          contract.id
        );
        setFullContract(data.contract || null);
      } catch (error) {
        console.error("Error fetching full contract details:", error);
      } finally {
        setIsLoadingFull(false);
      }
    };

    if (isOpen) {
      fetchFullContract();
    } else {
      setFullContract(null);
      setIsEditMode(false);
      setActiveTab("overview");
    }
  }, [isOpen, contract?.id, contract?.project_id, contract?.lot_id, token]);

  const handleDeleteContract = async () => {
    if (!contract?.id || !token) return;
    if (!window.confirm(t("contractDetailsModal.deleteConfirm"))) return;
    setIsDeleting(true);
    try {
      const data = await contractsApi.delete(
        contract.project_id,
        contract.lot_id,
        contract.id
      );

      showToast(data.message || t("contractDetailsModal.deletedSuccess"), "success");
      onContractDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting contract:", error);
      showToast(error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFinancialSaveSuccess = useCallback((updatedContract) => {
    setFullContract((prev) => (prev ? { ...prev, ...updatedContract } : updatedContract));
    onContractUpdate?.(updatedContract);
  }, [onContractUpdate]);

  if (!isOpen || !contract) return null;

  const displayContract = fullContract || contract;
  const paidAmount = displayContract?.total_paid ?? (Number(displayContract?.amount || 0) - Number(displayContract?.balance || 0));
  const progressPercent = Math.min(100, Math.max(0, (paidAmount / (Number(displayContract?.amount) || 1)) * 100));

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl h-full sm:h-[90vh] bg-white dark:bg-darkblack-600 sm:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20"
      >
        <DetailsSidebar
          contract={contract}
          displayContract={displayContract}
          statusTheme={statusTheme}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          isDeleting={isDeleting}
          handleDeleteContract={handleDeleteContract}
          onClose={onClose}
          t={t}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-darkblack-600 relative">
          <div className="h-20 shrink-0 flex items-center justify-between px-10 border-b border-gray-50 dark:border-darkblack-500">
            <h4 className="text-2xl font-black text-bgray-900 dark:text-white capitalize">
              {tabs.find(t => t.id === activeTab)?.label}
            </h4>
            <div className="flex items-center gap-3">
              {isAdmin && activeTab === 'financial' && canEditSchedule && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${isEditMode
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-gray-50 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                >
                  <FontAwesomeIcon icon={isEditMode ? faTimes : faEdit} />
                  {isEditMode ? t("common.cancel") : t("common.edit")}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'overview' && (
                  <OverviewTab
                    contract={contract}
                    displayContract={displayContract}
                    paidAmount={paidAmount}
                    progressPercent={progressPercent}
                  />
                )}
                {activeTab === 'lot_project' && (
                  <LotProjectTab contract={contract} />
                )}
                {activeTab === 'financial' && (
                  <FinancialTab
                    contract={contract}
                    displayContract={displayContract}
                    fullContract={fullContract}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    isLoadingFull={isLoadingFull}
                    onSaveSuccess={handleFinancialSaveSuccess}
                  />
                )}
                {activeTab === 'applicant' && (
                  <ApplicantTab contract={contract} />
                )}
                {activeTab === 'notes' && (
                  <ContractNotesTab
                    currentContract={displayContract}
                    onContractUpdate={onContractUpdate}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab contract={contract} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div >
    </div>,
    document.body
  );
});

export default ContractDetailsModal;
