import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { projectsApi } from "../../api";
import { useLocale } from "../../../../contexts/LocaleContext";
import { useToast } from "../../../../contexts/ToastContext";
import PaymentInstructionsPanel from "../../components/paymentInstructions/PaymentInstructionsPanel";

export default function PaymentInstructionsPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const { showToast } = useToast();
  const [project, setProject] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectResponse, instructionsResponse] = await Promise.all([
        projectsApi.get(id),
        projectsApi.listPaymentInstructions(id),
      ]);
      setProject(projectResponse?.project || projectResponse || null);
      setInstructions(instructionsResponse?.payment_instructions || []);
    } catch (err) {
      setError(err?.message || t("paymentInstructions.loadError"));
    } finally {
      setLoading(false);
    }
    // `t` only provides the fallback message; adding it would refetch on every
    // locale render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (values) => {
    try {
      await projectsApi.createPaymentInstruction(id, values);
      showToast(t("paymentInstructions.createSuccess"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
      throw err;
    }
  };

  const handleUpdate = async (instructionId, values) => {
    try {
      await projectsApi.updatePaymentInstruction(id, instructionId, values);
      showToast(t("paymentInstructions.updateSuccess"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
      throw err;
    }
  };

  const handleDelete = async (account) => {
    const confirmed = await confirmDialog({
      title: t("paymentInstructions.confirmDelete", {
        account: account.account_number,
      }),
      confirmLabel: t("common.delete") || "Eliminar",
    });
    if (!confirmed) {
      return;
    }
    try {
      await projectsApi.deletePaymentInstruction(id, account.id);
      showToast(t("paymentInstructions.deleteSuccess"), "success");
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
    }
  };

  const handleMove = async (account, direction) => {
    const index = instructions.findIndex((item) => item.id === account.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const target = instructions[targetIndex];
    if (index < 0 || !target) return;
    try {
      await Promise.all([
        projectsApi.updatePaymentInstruction(id, account.id, {
          position: targetIndex,
        }),
        projectsApi.updatePaymentInstruction(id, target.id, {
          position: index,
        }),
      ]);
      await load();
    } catch (err) {
      showToast(err?.message || t("paymentInstructions.saveError"), "error");
    }
  };

  return (
    <main className="min-h-screen w-full bg-bgray-50 px-6 pb-6 pt-[100px] dark:bg-darkblack-700 sm:pt-[156px] xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-bold text-bgray-600 transition-colors hover:text-indigo-600 dark:text-bgray-400"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t("paymentInstructions.backToProjects")}
        </Link>

        <header className="rounded-[2.5rem] border border-bgray-200 bg-white p-8 shadow-sm dark:border-darkblack-400 dark:bg-darkblack-600 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
                <FontAwesomeIcon icon={faUniversity} />
              </div>
              <div>
                <h1 className="text-xl font-black text-bgray-900 dark:text-white">
                  {t("paymentInstructions.title")}
                </h1>
                <p className="text-sm font-semibold text-bgray-500">
                  {loading && !project
                    ? t("common.loading")
                    : project?.name || "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {project?.city && (
                <span className="rounded-full bg-bgray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-300">
                  {project.city}
                </span>
              )}
              {project?.code && (
                <span className="rounded-full bg-bgray-100 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-300">
                  {project.code}
                </span>
              )}
              {project && (
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    project.is_published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {project.is_published
                    ? t("paymentInstructions.published")
                    : t("paymentInstructions.draft")}
                </span>
              )}
              {project && (
                <Link
                  to={`/projects/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-bgray-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-bgray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-darkblack-400 dark:text-bgray-300"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  {t("paymentInstructions.viewProject")}
                </Link>
              )}
            </div>
          </div>
        </header>

        <PaymentInstructionsPanel
          instructions={instructions}
          loading={loading}
          error={error}
          onRetry={load}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onMove={handleMove}
          canManage
          publishedWarning={
            Boolean(project?.is_published) && instructions.length === 0
          }
        />
      </div>
    </main>
  );
}
