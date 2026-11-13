import { useState, memo } from "react";
import PropTypes from "prop-types";
import MessageEditor from "@/shared/editor/MessageEditor";
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml";
import { useToast } from "@/contexts/ToastContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/shared/ui";
import { contractsApi } from "../api";

const NOTE_TONES = {
  general: "border-line bg-surface",
  rejection: "border-danger/25 bg-danger-soft",
  cancellation: "border-warning/25 bg-warning-soft",
  special_conditions: "border-info/25 bg-info-soft",
};

function ContractNotesTab({ currentContract, onContractUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { t } = useLocale();

  const handleEditNotes = () => {
    setEditedNotes(currentContract?.note || "");
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!currentContract?.id || !currentContract?.project_id || !currentContract?.lot_id) {
      showToast(t("contractNotes.incompleteContract"), "error");
      return;
    }

    setSaving(true);
    try {
      await contractsApi.updateNotes(
        currentContract.project_id,
        currentContract.lot_id,
        currentContract.id,
        editedNotes.trim()
      );

      onContractUpdate?.({
        ...currentContract,
        note: editedNotes.trim(),
      });

      setEditingNotes(false);
      showToast(t("contractNotes.notesUpdated"), "success");
    } catch (error) {
      console.error("Error updating contract notes:", error);
      showToast(`${t("contractNotes.updateError")}: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(false);
    setEditedNotes("");
  };

  const notes = [
    {
      type: "general",
      title: t("contractNotes.generalNotes"),
      content: currentContract?.note || t("contractNotes.noGeneralNotes"),
      editable: true,
    },
    {
      type: "rejection",
      title: t("contractNotes.rejectionReason"),
      content: currentContract?.rejection_reason || t("contractNotes.notApplicable"),
      show:
        currentContract?.status?.toLowerCase() === "rejected" &&
        !!currentContract?.rejection_reason,
    },
    {
      type: "cancellation",
      title: t("contractNotes.cancellationNotes"),
      content: currentContract?.cancellation_notes || t("contractNotes.notApplicable"),
      show:
        (currentContract?.status?.toLowerCase() === "canceled" ||
          currentContract?.status?.toLowerCase() === "cancelled") &&
        !!currentContract?.cancellation_notes,
    },
    {
      type: "special_conditions",
      title: t("contractNotes.specialConditions"),
      content:
        currentContract?.special_conditions ||
        currentContract?.conditions ||
        t("contractNotes.noSpecialConditions"),
    },
  ].filter((note) => note.show !== false);

  return (
    <div className="space-y-3.5 py-4">
      {notes.map((note) => (
        <section
          key={note.type}
          className={`rounded-card border ${NOTE_TONES[note.type] || NOTE_TONES.general}`}
        >
          <header className="border-b border-line/60 px-4 py-2.5">
            <h4 className="text-body-lg font-bold text-ink">{note.title}</h4>
          </header>
          <div className="p-4">
            {note.editable && editingNotes ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-control border border-line">
                  <MessageEditor onTextChange={setEditedNotes} initialValue={editedNotes} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit} disabled={saving}>
                    {t("contractNotes.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    loading={saving}
                    disabled={editedNotes.trim() === (currentContract?.note || "")}
                  >
                    {t("contractNotes.save")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-body text-ink-2">
                  {note.content === t("contractNotes.noGeneralNotes") ||
                  note.content === t("contractNotes.notApplicable") ? (
                    <span className="whitespace-pre-wrap">{note.content}</span>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }} />
                  )}
                </div>
                {note.editable && (
                  <div className="mt-3 flex justify-end">
                    <Button variant="secondary" size="sm" onClick={handleEditNotes}>
                      {t("contractNotes.edit")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      ))}

      <div className="rounded-card border border-info/25 bg-info-soft p-4">
        <h4 className="text-body font-bold text-info">{t("contractNotes.additionalInfo")}</h4>
        <p className="mt-1 text-label text-ink-2">{t("contractNotes.contractNotesDescription")}</p>
      </div>
    </div>
  );
}

ContractNotesTab.propTypes = {
  currentContract: PropTypes.object,
  onContractUpdate: PropTypes.func,
};

export default memo(ContractNotesTab);
