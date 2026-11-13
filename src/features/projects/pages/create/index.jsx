import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { projectsApi } from "../../api";
import ProjectForm from "../../components/ProjectForm";
import { useLocale } from "@/contexts/LocaleContext";
import { useGeneralSettings } from "@/contexts/generalSettings";
import { getDefaultCurrency } from "@/shared/utils/formatSettings";
import { Button, Card, SaveBar } from "@/shared/ui";

const INITIAL_VALUES = {
  name: "",
  guid: "",
  code: "",
  description: "",
  address: "",
  city: "",
  lot_count: 0,
  price_per_square_unit: 0,
  measurement_unit: "m2",
  interest_rate: 0,
  commission_rate_direct: 4,
  commission_rate_bank: 6,
  commission_rate_cash: 7,
  delivery_date: "",
  project_type: "residential",
};

const hasText = (value) => String(value ?? "").trim().length > 0;
const hasNumber = (value) =>
  String(value ?? "").trim() !== "" && Number.isFinite(Number(value));

function CreateProject() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();
  const { settings } = useGeneralSettings();
  const currency = settings.default_currency || getDefaultCurrency();

  const dirty = JSON.stringify(values) !== JSON.stringify(INITIAL_VALUES);
  const isValid =
    hasText(values.name) &&
    hasText(values.description) &&
    hasText(values.address) &&
    [
      values.lot_count,
      values.price_per_square_unit,
      values.interest_rate,
      values.commission_rate_direct,
      values.commission_rate_bank,
      values.commission_rate_cash,
    ].every(hasNumber);

  const handleChange = (field, value) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await projectsApi.create({
        project: {
          name: values.name,
          description: values.description,
          address: values.address,
          city: values.city.trim() || null,
          code: values.code.trim() || null,
          lot_count: Number(values.lot_count),
          price_per_square_unit: Number(values.price_per_square_unit),
          measurement_unit: values.measurement_unit,
          interest_rate: Number(values.interest_rate),
          commission_rate_direct: Number(values.commission_rate_direct),
          commission_rate_bank: Number(values.commission_rate_bank),
          commission_rate_cash: Number(values.commission_rate_cash),
          delivery_date: values.delivery_date || null,
          project_type: values.project_type,
        },
      });
      navigate("/projects");
    } catch (error) {
      console.error("Error al conectar con el servidor", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell min-h-screen bg-bgray-50 dark:bg-darkblack-700">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("projects.createNewProject")}
            </h1>
            <p className="text-body text-ink-3">
              {t("projects.fillProjectInfo")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <ProjectForm
              formId="project-create-form"
              mode="create"
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              currency={currency}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <Card title={t("projects.coverPhoto")}>
              <div className="flex aspect-[4/3] items-center justify-center rounded-control border border-dashed border-line-strong bg-surface-2 text-ink-3">
                <FontAwesomeIcon icon={faImage} size="2x" aria-hidden="true" />
              </div>
              <p className="mt-3 text-micro text-ink-3">
                {t("projects.coverHint")}
              </p>
            </Card>
          </aside>
        </div>

        <SaveBar
          visible
          dirty={dirty}
          saving={loading}
          message={dirty ? t("projects.unsavedChanges") : ""}
          onDiscard={() => navigate(-1)}
          saveLabel={t("projects.createProject")}
          discardLabel={t("common.cancel")}
          saveType="submit"
          saveForm="project-create-form"
          saveDisabled={!dirty || !isValid}
          className="mt-2"
        />
      </div>
    </main>
  );
}

export default CreateProject;
