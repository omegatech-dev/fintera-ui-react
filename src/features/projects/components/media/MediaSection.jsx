import { useLocale } from "../../../../contexts/LocaleContext";

export default function MediaSection({ title, description, children, actions }) {
  const { t } = useLocale();

  return (
    <section className="bg-white dark:bg-darkblack-600 p-8 lg:p-10 rounded-[2.5rem] border border-bgray-200 dark:border-darkblack-400 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-bgray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-xs font-semibold text-bgray-500">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-bgray-400">
        {t("media.hint")}
      </p>
    </section>
  );
}
