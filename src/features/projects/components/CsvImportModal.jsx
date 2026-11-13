import { useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { projectsApi } from "../api";
import { Button, Dialog, FileUpload, Toggle } from "@/shared/ui";

function CsvImportModal({ open, onClose, onImported }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [files, setFiles] = useState([]);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);

  const close = () => {
    setFiles([]);
    onClose();
  };

  const handleSubmit = async () => {
    const file = files[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options[update_existing]", updateExisting ? "1" : "0");
      formData.append("options[skip_duplicates]", skipDuplicates ? "1" : "0");
      await projectsApi.import(formData);
      showToast(t("projectsPage.importCompleted"), "success");
      onImported?.();
      close();
    } catch (err) {
      showToast(`${t("projectsPage.importErrorPrefix")} ${err.message}`, "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("projectsPage.importCSV")}
      description={t("projectsPage.importOptions")}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={importing}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={importing} disabled={!files.length}>
            {t("projectsPage.importCSV")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FileUpload
          label={t("projectsPage.importCSV")}
          accept=".csv"
          multiple={false}
          files={files}
          onChange={setFiles}
        />

        <div className="space-y-2 rounded-control border border-line bg-surface-2 p-3">
          <div className="flex items-center gap-2">
            <Toggle
              checked={updateExisting}
              onChange={setUpdateExisting}
              label={t("projectsPage.updateExisting")}
            />
            <span className="text-body text-ink-2">
              {t("projectsPage.updateExisting")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Toggle
              checked={skipDuplicates}
              onChange={setSkipDuplicates}
              label={t("projectsPage.skipDuplicates")}
            />
            <span className="text-body text-ink-2">
              {t("projectsPage.skipDuplicates")}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

CsvImportModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onImported: PropTypes.func,
};

export default CsvImportModal;
