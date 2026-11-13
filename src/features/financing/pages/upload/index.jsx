import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { paymentsApi } from "../../../payments/api";
import { useLocale } from "../../../../contexts/LocaleContext";

function Upload() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!receiptFile) {
      setError(t('payments.selectFileToUpload'));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const data = await paymentsApi.uploadReceipt(paymentId, formData);

      if (data) {
        setSuccess(data.message || t('payments.paymentSuccessful'));
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(t('payments.uploadError'));
      }
    } catch (err) {
      setError(err.message || t('payments.networkError'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-card border border-line bg-surface p-6">
        <h1 className="text-page font-bold text-ink">{t('payments.uploadReceipt')}</h1>
        <p className="mt-1 text-body text-ink-3">
          {t('payments.uploadReceiptDescription')}
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-body text-danger">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="mt-4 rounded-control border border-brand/30 bg-brand-soft px-3 py-2 text-body text-brand-strong">
            {success}
          </p>
        )}

        <form onSubmit={handleUpload} className="mt-5">
          <div className="mb-4">
            <label htmlFor="receipt" className="mb-2 block text-label font-semibold text-ink-2">
              {t('payments.receiptFileLabel')}
            </label>
            <input
              type="file"
              id="receipt"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="block w-full rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-body text-ink-2 file:mr-3 file:rounded-chip file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-label file:font-semibold file:text-brand-strong"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full rounded-control bg-brand px-4 py-3 text-label font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? t('payments.uploading') : t('payments.uploadReceipt')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
