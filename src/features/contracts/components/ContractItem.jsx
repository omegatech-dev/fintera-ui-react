import { confirmDialog } from "@/shared/ui/ConfirmProvider";

import PropTypes from "prop-types";
import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";

import { contractsApi } from "../api";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { getStatusTheme } from "../../../shared/utils/statusUtils";
import { formatDate } from "../../../shared/utils/formatters";
import ContractMobileCard from "./ContractItem/ContractMobileCard";
import ContractTableRow from "./ContractItem/ContractTableRow";

// Translate financing type
const translateFinancingType = (type, t) => {
  switch (type?.toLowerCase()) {
    case "direct":
      return t("contracts.financingTypes.direct") || "Directo";
    case "cash":
      return "Contado";
    case "bank":
      return t("contracts.financingTypes.bank") || "Bancario";
    default:
      return "N/A";
  }
};

function ContractItem({
  contract,
  userRole,
  refreshContracts,
  isMobileCard = false,
}) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { t } = useLocale();

  // Navigation handlers
  const handleNavigateToClient = (e) => {
    e.stopPropagation();
    navigate("/users", {
      state: {
        selectedUserId: contract.applicant_identity,
        selectedUserName: contract.applicant_name,
        selectedUserPhone: contract.applicant_phone,
      },
    });
  };

  const handleNavigateToLot = (e) => {
    e.stopPropagation();
    if (contract.project_id) {
      navigate(`/projects/${contract.project_id}/lots`, {
        state: {
          selectedLotId: contract.lot_id,
          selectedLotName: contract.lot_name,
          selectedLotAddress: contract.lot_address,
        },
      });
    }
  };

  const handleApprove = async (e) => {
    e?.stopPropagation();
    if (!contract.id) return;
    setActionLoading(true);
    try {
      await contractsApi.approve(contract.project_id, contract.lot_id, contract.id);
      showToast("Contrato aprobado exitosamente.", "success");
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!contract.id) return;
    setActionLoading(true);
    try {
      await contractsApi.reject(contract.project_id, contract.lot_id, contract.id, reason);
      showToast("Contrato rechazado exitosamente.", "success");
      setShowRejectionModal(false);
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContract = async (e) => {
    e?.stopPropagation();
    if (!contract?.id) return;
    const confirmed = await confirmDialog({
      title: t("contractDetailsModal.deleteConfirm"),
      confirmLabel: t("common.delete") || "Eliminar",
    });
    if (!confirmed) return;
    setDeleteLoading(true);
    try {
      const data = await contractsApi.delete(contract.project_id, contract.lot_id, contract.id);
      showToast(data.message || t("contractDetailsModal.deletedSuccess"), "success");
      refreshContracts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const commonProps = {
    contract,
    userRole,
    refreshContracts,
    t,
    getStatusTheme,
    translateFinancingType,
    formatDate,

    handleNavigateToLot,
    handleNavigateToClient,
    handleApprove,
    handleReject,
    handleDeleteContract,
    actionLoading,
    deleteLoading,
    showSchedule,
    setShowSchedule,
    showRejectionModal,
    setShowRejectionModal,
    showDetailsModal,
    setShowDetailsModal
  };

  if (isMobileCard) {
    return <ContractMobileCard {...commonProps} />;
  }

  return <ContractTableRow {...commonProps} />;
}

ContractItem.propTypes = {
  contract: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    applicant_name: PropTypes.string,
    applicant_phone: PropTypes.string,
    applicant_identity: PropTypes.string,
    created_by: PropTypes.string,
    lot_name: PropTypes.string,
    project_name: PropTypes.string,
    financing_type: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rejection_reason: PropTypes.string,
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  refreshContracts: PropTypes.func.isRequired,
  isMobileCard: PropTypes.bool,
};

export default memo(ContractItem);
